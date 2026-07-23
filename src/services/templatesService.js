import { supabase } from "@/lib/supabaseClient";

const TEMPLATE_DETAIL_SELECT = `
  id,
  nome,
  eh_padrao,
  criado_em,
  perguntas_template (
    id,
    competencia,
    descricao_niveis,
    ordem,
    criado_em
  ),
  ciclos_avaliacao (id)
`;

function errorContains(error, token) {
  return [error?.message, error?.details, error?.hint]
    .filter(Boolean)
    .some((value) => value.includes(token));
}

function templateServiceError(error, fallbackMessage) {
  if (error?.code === "42501" || errorContains(error, "TEMPLATE_PERMISSION_DENIED")) {
    return new Error("Você não tem permissão para alterar templates.");
  }

  if (errorContains(error, "DEFAULT_TEMPLATE_PROTECTED")) {
    return new Error("O template padrão é protegido e só pode ser clonado.");
  }

  if (error?.code === "23503" || errorContains(error, "TEMPLATE_IN_USE")) {
    return new Error("Este template já está em uso por um ciclo e só pode ser clonado.");
  }

  if (error?.code === "P0002" || error?.code === "PGRST116") {
    return new Error("Template não encontrado.");
  }

  if (error?.code === "22023") {
    return new Error("Revise o nome e as competências antes de salvar.");
  }

  return new Error(fallbackMessage);
}

function sortedCompetencies(questions = []) {
  return [...questions]
    .sort((a, b) => a.ordem - b.ordem)
    .map((question) => ({
      id: question.id,
      nome: question.competencia,
      descricao: question.descricao_niveis || "",
      ordem: question.ordem,
    }));
}

export function mapTemplateSummary(template) {
  const competencies = sortedCompetencies(template.perguntas_template);
  const cycleCount = Array.isArray(template.ciclos_avaliacao)
    ? template.ciclos_avaliacao.length
    : 0;

  return {
    id: template.id,
    nome: template.nome,
    ehPadrao: template.eh_padrao,
    criadoEm: template.criado_em,
    competencyCount: competencies.length,
    cycleCount,
    competencias: competencies,
  };
}

export function normalizeTemplatePayload(values) {
  return {
    nome: values.nome.trim(),
    competencias: values.competencias.map((competencia, ordem) => ({
      nome: competencia.nome.trim(),
      descricao: competencia.descricao.trim(),
      ordem,
    })),
  };
}

async function fetchSingleTemplate(query, fallbackMessage) {
  const { data, error } = await query;

  if (error) {
    throw templateServiceError(error, fallbackMessage);
  }

  return data ? mapTemplateSummary(data) : null;
}

export async function listTemplates() {
  const { data, error } = await supabase
    .from("templates_competencia")
    .select(TEMPLATE_DETAIL_SELECT)
    .order("eh_padrao", { ascending: false })
    .order("nome", { ascending: true })
    .order("ordem", { referencedTable: "perguntas_template", ascending: true });

  if (error) {
    throw templateServiceError(error, "Não foi possível carregar os templates.");
  }

  return (data || []).map(mapTemplateSummary);
}

export async function getTemplate(templateId) {
  return fetchSingleTemplate(
    supabase
      .from("templates_competencia")
      .select(TEMPLATE_DETAIL_SELECT)
      .eq("id", templateId)
      .order("ordem", { referencedTable: "perguntas_template", ascending: true })
      .single(),
    "Não foi possível carregar o template.",
  );
}

export async function getDefaultTemplate() {
  return fetchSingleTemplate(
    supabase
      .from("templates_competencia")
      .select(TEMPLATE_DETAIL_SELECT)
      .eq("eh_padrao", true)
      .order("ordem", { referencedTable: "perguntas_template", ascending: true })
      .maybeSingle(),
    "Não foi possível carregar o template padrão.",
  );
}

async function saveTemplate(templateId, values) {
  const payload = normalizeTemplatePayload(values);
  const { data, error } = await supabase.rpc("salvar_template_competencia", {
    p_template_id: templateId,
    p_nome: payload.nome,
    p_competencias: payload.competencias,
  });

  if (error) {
    throw templateServiceError(error, "Não foi possível salvar o template.");
  }

  return data;
}

export function createTemplate(values) {
  return saveTemplate(null, values);
}

export function updateTemplate(templateId, values) {
  return saveTemplate(templateId, values);
}

export async function deleteTemplate(templateId) {
  const { data, error } = await supabase
    .from("templates_competencia")
    .delete()
    .eq("id", templateId)
    .select("id")
    .single();

  if (error) {
    throw templateServiceError(error, "Não foi possível excluir o template.");
  }

  return data;
}

