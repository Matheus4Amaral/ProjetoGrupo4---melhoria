import { supabase } from "@/lib/supabaseClient";

function resultError(error, fallback) {
  const message = [error?.message, error?.details].filter(Boolean).join(" ");
  if (error?.code === "42501" || message.includes("RESULT_PERMISSION_DENIED")) return new Error("Este resultado não está disponível para você.");
  return new Error(fallback);
}

export function formatAverage(value) {
  if (value === null || value === undefined) return "Não disponível";
  return Number(value).toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 2 });
}

export async function listClosedResults() {
  const { data, error } = await supabase.rpc("listar_resultados_colaborador");
  if (error) throw resultError(error, "Não foi possível carregar seus resultados.");
  return (data || []).map((row) => ({ id: row.ciclo_id, nome: row.nome, dataInicio: row.data_inicio, dataLimite: row.data_limite }));
}

export async function getClosedResult(cycleId) {
  const { data, error } = await supabase.rpc("obter_resultado_colaborador", { p_ciclo_id: cycleId });
  if (error) throw resultError(error, "Não foi possível carregar este resultado.");
  return {
    mediaAutoavaliacao: data?.mediaAutoavaliacao ?? null,
    mediaExterna: data?.mediaExterna ?? null,
    feedbacks: Array.isArray(data?.feedbacks) ? data.feedbacks.map((item) => ({
      pontosFortes: item.pontosFortes || "",
      pontosMelhoria: item.pontosMelhoria || "",
    })) : [],
  };
}
