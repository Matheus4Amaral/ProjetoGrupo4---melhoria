import {
  FunctionsFetchError,
  FunctionsHttpError,
  FunctionsRelayError,
} from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";

export async function listProfiles() {
  const { data, error } = await supabase
    .from("perfis")
    .select("id, nome_completo, email, papel, gestor_id, ativo, criado_em")
    .order("nome_completo", { ascending: true });

  if (error) {
    throw new Error("Não foi possível carregar a base de usuários.");
  }

  return data || [];
}

export async function inviteUser(payload) {
  const { data, error } = await supabase.functions.invoke("invite-collaborator", {
    body: payload,
  });

  if (!error) return data;

  let responsePayload = null;
  const status = error.context?.status;

  if (error instanceof FunctionsHttpError && error.context instanceof Response) {
    try {
      responsePayload = await error.context.clone().json();
    } catch {
      responsePayload = null;
    }
  }

  let message = responsePayload?.error || "Não foi possível enviar o convite agora.";

  if (status === 404) {
    message = "A função de convite ainda não foi publicada no Supabase.";
  } else if (error instanceof FunctionsFetchError) {
    message = "Não foi possível alcançar a função de convite. Verifique a publicação e o CORS.";
  } else if (error instanceof FunctionsRelayError) {
    message = "A função de convite está temporariamente indisponível.";
  }

  const invitationError = new Error(message);
  invitationError.status = status;
  throw invitationError;
}
