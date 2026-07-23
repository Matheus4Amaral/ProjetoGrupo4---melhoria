import { createClient } from "npm:@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
const allowedOrigins = (Deno.env.get("ALLOWED_ORIGINS") || Deno.env.get("APP_URL") || "")
  .split(",")
  .map((origin) => origin.trim().replace(/\/$/, ""))
  .filter(Boolean);

function corsHeaders(origin: string | null) {
  const normalizedOrigin = origin?.replace(/\/$/, "");
  const selectedOrigin = normalizedOrigin && allowedOrigins.includes(normalizedOrigin)
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

function jsonResponse(status: number, body: Record<string, unknown>, origin: string | null) {
  return new Response(JSON.stringify(body), {
    status,
    headers: corsHeaders(origin),
  });
}

function isAllowedOrigin(origin: string | null) {
  if (!origin) return true;
  return allowedOrigins.includes(origin.replace(/\/$/, ""));
}

function mapGenerationError(error: { code?: string; message?: string } | null) {
  const message = error?.message || "";

  if (error?.code === "42501" || message.includes("CYCLE_PERMISSION_DENIED")) {
    return { status: 403, code: "permission_denied", error: "Você não tem permissão para gerar avaliações." };
  }
  if (error?.code === "P0002" || message.includes("CYCLE_NOT_FOUND")) {
    return { status: 404, code: "cycle_not_found", error: "Ciclo não encontrado." };
  }
  if (message.includes("CYCLE_NOT_DRAFT") || message.includes("CYCLE_ASSIGNMENTS_EXIST")) {
    return { status: 409, code: "cycle_not_draft", error: "Este ciclo já foi aberto e não pode gerar novas atribuições." };
  }
  if (message.includes("CYCLE_REQUIRES_TEAMS")) {
    return { status: 422, code: "cycle_requires_teams", error: "Selecione ao menos um time antes de gerar as avaliações." };
  }
  if (message.includes("CYCLE_TEAM_WITHOUT_ACTIVE_MEMBERS")) {
    const teams = message.split("CYCLE_TEAM_WITHOUT_ACTIVE_MEMBERS:")[1]?.trim();
    return {
      status: 422,
      code: "team_without_active_members",
      error: teams
        ? `Os seguintes times não possuem membros ativos: ${teams}.`
        : "Há time selecionado sem membros ativos.",
    };
  }
  if (error?.code === "22023" || message.includes("CYCLE_INVALID")) {
    return { status: 422, code: "invalid_cycle", error: "Revise a configuração e as datas do ciclo." };
  }

  return { status: 500, code: "generation_failed", error: "Não foi possível gerar as avaliações." };
}

Deno.serve(async (request) => {
  const origin = request.headers.get("origin");

  if (!isAllowedOrigin(origin)) {
    return jsonResponse(403, { code: "origin_denied", error: "Origem não autorizada." }, origin);
  }
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders(origin) });
  }
  if (request.method !== "POST") {
    return jsonResponse(405, { code: "method_not_allowed", error: "Método não permitido." }, origin);
  }
  if (!supabaseUrl || !anonKey) {
    return jsonResponse(500, { code: "not_configured", error: "A função não está configurada corretamente." }, origin);
  }

  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Bearer ")) {
    return jsonResponse(401, { code: "authentication_required", error: "Autenticação necessária." }, origin);
  }

  let body: { cicloId?: unknown };
  try {
    body = await request.json();
  } catch {
    return jsonResponse(400, { code: "invalid_json", error: "Corpo JSON inválido." }, origin);
  }

  const cicloId = typeof body?.cicloId === "string" ? body.cicloId.trim() : "";
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(cicloId)) {
    return jsonResponse(400, { code: "invalid_cycle_id", error: "Identificador do ciclo inválido." }, origin);
  }

  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authorization } },
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: authData, error: authError } = await userClient.auth.getUser();
  if (authError || !authData.user) {
    return jsonResponse(401, { code: "invalid_session", error: "Sessão inválida ou expirada." }, origin);
  }

  const { data, error } = await userClient.rpc("gerar_atribuicoes_ciclo", {
    p_ciclo_id: cicloId,
  });

  if (error) {
    const mapped = mapGenerationError(error);
    return jsonResponse(mapped.status, mapped, origin);
  }

  return jsonResponse(200, data, origin);
});
