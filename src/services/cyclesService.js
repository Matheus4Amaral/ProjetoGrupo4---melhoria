import { FunctionsHttpError } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";
import { mapCycleSummary, normalizeCyclePayload } from "@/services/cyclesUtils";

export {
  BUSINESS_TIME_ZONE,
  mapCycleSummary,
  normalizeCyclePayload,
  toBusinessDayEndIso,
} from "@/services/cyclesUtils";

function errorContains(error, token) {
  return [error?.message, error?.details, error?.hint]
    .filter(Boolean)
    .some((value) => value.includes(token));
}

function cycleServiceError(error, fallbackMessage) {
  if (error?.code === "42501" || errorContains(error, "CYCLE_PERMISSION_DENIED")) {
    return new Error("Você não tem permissão para gerenciar ciclos.");
  }
  if (error?.code === "P0002" || errorContains(error, "CYCLE_NOT_FOUND")) {
    return new Error("Ciclo não encontrado.");
  }
  if (errorContains(error, "CYCLE_NOT_DRAFT") || errorContains(error, "CYCLE_SCOPE_IMMUTABLE")) {
    return new Error("Este ciclo já foi aberto e sua configuração não pode mais ser alterada.");
  }
  if (errorContains(error, "CYCLE_NOT_ACTIVE")) {
    return new Error("Somente ciclos abertos podem ser encerrados.");
  }
  if (errorContains(error, "CYCLE_REQUIRES_TEAMS")) {
    return new Error("Selecione ao menos um time para o ciclo.");
  }
  if (errorContains(error, "CYCLE_TEMPLATE_NOT_FOUND")) {
    return new Error("O template selecionado não está mais disponível.");
  }
  if (errorContains(error, "CYCLE_TEAM_NOT_FOUND")) {
    return new Error("Um dos times selecionados não está mais disponível.");
  }
  if (error?.code === "22023" || errorContains(error, "CYCLE_INVALID")) {
    return new Error("Revise os dados e o intervalo de datas do ciclo.");
  }
  return new Error(fallbackMessage);
}

export async function listCycles() {
  const { data, error } = await supabase.rpc("listar_ciclos_avaliacao");

  if (error) {
    throw cycleServiceError(error, "Não foi possível carregar os ciclos.");
  }

  return (data || []).map(mapCycleSummary);
}

export async function listCycleOptions() {
  const [templatesResult, teamsResult] = await Promise.all([
    supabase
      .from("templates_competencia")
      .select("id, nome, eh_padrao")
      .order("eh_padrao", { ascending: false })
      .order("nome", { ascending: true }),
    supabase
      .from("times")
      .select("id, nome, descricao")
      .order("nome", { ascending: true }),
  ]);

  const error = templatesResult.error || teamsResult.error;
  if (error) {
    throw cycleServiceError(error, "Não foi possível carregar templates e times.");
  }

  return {
    templates: templatesResult.data || [],
    teams: teamsResult.data || [],
  };
}

export async function saveCycle(values, cycleId = null) {
  const { data, error } = await supabase.rpc(
    "salvar_ciclo_avaliacao",
    normalizeCyclePayload(values, cycleId),
  );

  if (error) {
    throw cycleServiceError(error, "Não foi possível salvar o ciclo.");
  }

  return data;
}

async function functionErrorPayload(error) {
  if (!(error instanceof FunctionsHttpError) || !error.context?.json) return null;
  try {
    return await error.context.json();
  } catch {
    return null;
  }
}

export async function generateCycleAssignments(cycleId) {
  const { data, error } = await supabase.functions.invoke("generate-cycle-assignments", {
    body: { cicloId: cycleId },
  });

  if (error) {
    const payload = await functionErrorPayload(error);
    const mappedError = new Error(
      payload?.error || "Não foi possível gerar as avaliações. Tente novamente.",
    );
    mappedError.code = payload?.code || "generation_failed";
    throw mappedError;
  }

  return data;
}

export async function closeCycle(cycleId) {
  const { data, error } = await supabase.rpc("fechar_ciclo_avaliacao", { p_ciclo_id: cycleId });
  if (error) {
    throw cycleServiceError(error, "Não foi possível encerrar o ciclo.");
  }
  return data;
}
