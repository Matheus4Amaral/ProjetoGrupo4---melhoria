import { supabase } from "@/lib/supabaseClient";

function evaluationError(error, fallback) {
  const message = [error?.message, error?.details].filter(Boolean).join(" ");
  if (message.includes("EVALUATION_PERIOD_CLOSED")) return new Error("O período de avaliação terminou.");
  if (message.includes("EVALUATION_COMPLETED") || message.includes("EVALUATION_IMMUTABLE")) return new Error("Esta avaliação já foi concluída e não pode ser alterada.");
  if (message.includes("EVALUATION_INCOMPLETE")) return new Error("Responda todas as competências antes de finalizar.");
  if (error?.code === "42501" || message.includes("EVALUATION_PERMISSION_DENIED")) return new Error("Você não pode acessar esta avaliação.");
  return new Error(fallback);
}

export async function listEvaluationCycles() {
  const { data, error } = await supabase.rpc("listar_ciclos_avaliador");
  if (error) throw evaluationError(error, "Não foi possível carregar suas avaliações.");
  return (data || []).map((cycle) => ({
    id: cycle.ciclo_id,
    nome: cycle.nome,
    dataInicio: cycle.data_inicio,
    dataLimite: cycle.data_limite,
    disponivel: cycle.disponivel,
    pendentesTerceiros: Number(cycle.pendentes_terceiros || 0),
    autoavaliacao: cycle.autoavaliacao || null,
    atribuicoes: Array.isArray(cycle.atribuicoes) ? cycle.atribuicoes : [],
  }));
}

export async function getEvaluationAssignment(assignmentId) {
  const { data, error } = await supabase.rpc("obter_atribuicao_avaliacao", { p_atribuicao_id: assignmentId });
  if (error) throw evaluationError(error, "Não foi possível carregar a avaliação.");
  return data;
}

function payload(assignmentId, answers, strengths, improvements) {
  return {
    p_atribuicao_id: assignmentId,
    p_respostas: Object.entries(answers).map(([pergunta_id, nota]) => ({ pergunta_id, nota: Number(nota) })),
    p_pontos_fortes: strengths || null,
    p_pontos_melhoria: improvements || null,
  };
}

export async function saveEvaluationDraft(assignmentId, answers, strengths, improvements) {
  const { data, error } = await supabase.rpc("salvar_rascunho_avaliacao", payload(assignmentId, answers, strengths, improvements));
  if (error) throw evaluationError(error, "Não foi possível salvar o rascunho.");
  return data;
}

export async function completeEvaluation(assignmentId, answers, strengths, improvements) {
  const { data, error } = await supabase.rpc("finalizar_avaliacao", payload(assignmentId, answers, strengths, improvements));
  if (error) throw evaluationError(error, "Não foi possível finalizar a avaliação.");
  return data;
}

