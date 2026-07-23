
import { createClient } from "npm:@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const appUrl = Deno.env.get("APP_URL");
const allowedOrigins = (Deno.env.get("ALLOWED_ORIGINS") || appUrl || "")
  .split(",")
  .map((origin) => origin.trim().replace(/\/$/, ""))
  .filter(Boolean);

function corsHeaders(origin) {
  const normalizedOrigin = origin?.replace(/\/$/, "");
  const selectedOrigin = allowedOrigins.includes(normalizedOrigin)
    ? normalizedOrigin
    : allowedOrigins[0];

  return {
    "Access-Control-Allow-Origin": selectedOrigin || "null",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json",
    Vary: "Origin",
  };
}

function jsonResponse(status, body, origin) {
  return new Response(JSON.stringify(body), {
    status,
    headers: corsHeaders(origin),
  });
}

function isAllowedOrigin(origin) {
  if (!origin) return true;
  return allowedOrigins.includes(origin.replace(/\/$/, ""));
}

function validateInput(input) {
  const nomeCompleto = typeof input?.nomeCompleto === "string"
    ? input.nomeCompleto.trim()
    : "";
  const email = typeof input?.email === "string"
    ? input.email.trim().toLowerCase()
    : "";
  const papel = input?.papel;
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (nomeCompleto.length < 3 || nomeCompleto.length > 255) {
    return { error: "Informe um nome completo válido." };
  }
  if (!emailPattern.test(email)) {
    return { error: "Informe um e-mail válido." };
  }
  if (!["rh", "colaborador"].includes(papel)) {
    return { error: "Papel solicitado inválido." };
  }

  return { data: { nomeCompleto, email, papel } };
}

function invitationError(error) {
  const message = error?.message?.toLowerCase() || "";

  if (error?.status === 422 || message.includes("already") || message.includes("registered")) {
    return { status: 409, message: "Este e-mail já possui uma conta ou convite." };
  }

  return { status: 502, message: "O Supabase não conseguiu enviar o convite." };
}

Deno.serve(async (request) => {
  const origin = request.headers.get("origin");

  if (!isAllowedOrigin(origin)) {
    return jsonResponse(403, { error: "Origem não autorizada." }, origin);
  }

  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders(origin) });
  }

  if (request.method !== "POST") {
    return jsonResponse(405, { error: "Método não permitido." }, origin);
  }

  if (!supabaseUrl || !anonKey || !serviceRoleKey || !appUrl) {
    return jsonResponse(500, { error: "A função não está configurada corretamente." }, origin);
  }

  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Bearer ")) {
    return jsonResponse(401, { error: "Autenticação necessária." }, origin);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return jsonResponse(400, { error: "Corpo JSON inválido." }, origin);
  }

  const validation = validateInput(body);
  if (validation.error) {
    return jsonResponse(400, { error: validation.error }, origin);
  }

  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authorization } },
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const {
    data: { user },
    error: userError,
  } = await userClient.auth.getUser();

  if (userError || !user) {
    return jsonResponse(401, { error: "Sessão inválida ou expirada." }, origin);
  }

  const { data: requesterProfile, error: profileError } = await userClient
    .from("perfis")
    .select("papel, ativo")
    .eq("id", user.id)
    .single();

  if (profileError || !requesterProfile || requesterProfile.ativo === false) {
    return jsonResponse(403, { error: "Perfil sem permissão para convidar." }, origin);
  }

  const { papel: requesterRole } = requesterProfile;
  const { nomeCompleto, email, papel } = validation.data;
  const canInvite = requesterRole === "admin"
    ? ["rh", "colaborador"].includes(papel)
    : requesterRole === "rh" && papel === "colaborador";

  if (!canInvite) {
    return jsonResponse(403, { error: "Seu papel não permite este tipo de convite." }, origin);
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
  const redirectTo = new URL("/definir-senha", appUrl).toString();
  const { data: invitation, error: inviteError } = await adminClient.auth.admin.inviteUserByEmail(
    email,
    {
      data: { nome_completo: nomeCompleto },
      redirectTo,
    }
  );

  if (inviteError || !invitation.user) {
    const mapped = invitationError(inviteError);
    return jsonResponse(mapped.status, { error: mapped.message }, origin);
  }

  if (papel === "rh") {
    const { error: roleError } = await adminClient
      .from("perfis")
      .update({ papel: "rh" })
      .eq("id", invitation.user.id);

    if (roleError) {
      await adminClient.auth.admin.deleteUser(invitation.user.id);
      return jsonResponse(
        500,
        { error: "Não foi possível concluir a atribuição do papel de RH." },
        origin
      );
    }
  }

  return jsonResponse(
    200,
    {
      message: "Convite enviado com sucesso.",
      userId: invitation.user.id,
    },
    origin
  );
});

