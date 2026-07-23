export const BUSINESS_TIME_ZONE = "America/Sao_Paulo";

const STATUS_PRESENTATION = {
  draft: "rascunho",
  active: "aberto",
  closed: "encerrado",
};

export function toBusinessDayEndIso(dateValue, timeZone = BUSINESS_TIME_ZONE) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateValue || "")) {
    throw new Error("Data-limite inválida.");
  }

  const [year, month, day] = dateValue.split("-").map(Number);
  const desiredWallTime = Date.UTC(year, month - 1, day, 23, 59, 59, 999);
  let utcGuess = desiredWallTime;
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  });

  for (let iteration = 0; iteration < 2; iteration += 1) {
    const parts = Object.fromEntries(
      formatter
        .formatToParts(new Date(utcGuess))
        .filter((part) => part.type !== "literal")
        .map((part) => [part.type, Number(part.value)]),
    );
    const representedWallTime = Date.UTC(
      parts.year,
      parts.month - 1,
      parts.day,
      parts.hour,
      parts.minute,
      parts.second,
      999,
    );
    utcGuess += desiredWallTime - representedWallTime;
  }

  return new Date(utcGuess).toISOString();
}

function formatDateOnly(dateValue) {
  if (!dateValue) return "—";
  const [year, month, day] = dateValue.split("-").map(Number);
  return new Intl.DateTimeFormat("pt-BR").format(new Date(year, month - 1, day));
}

function deadlineDateInBusinessZone(value) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: BUSINESS_TIME_ZONE,
  }).format(new Date(value));
}

export function mapCycleSummary(cycle) {
  const totalAssignments = Number(cycle.total_atribuicoes || 0);
  const completedAssignments = Number(cycle.atribuicoes_concluidas || 0);
  const teams = Array.isArray(cycle.times) ? cycle.times : [];

  return {
    id: cycle.id,
    nome: cycle.nome,
    templateId: cycle.template_id,
    template: cycle.template_nome,
    dataInicio: cycle.data_inicio,
    dataFim: cycle.data_limite
      ? new Intl.DateTimeFormat("en-CA", {
          timeZone: BUSINESS_TIME_ZONE,
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        }).format(new Date(cycle.data_limite))
      : "",
    dataLimite: cycle.data_limite,
    periodo: `${formatDateOnly(cycle.data_inicio)} – ${deadlineDateInBusinessZone(cycle.data_limite)}`,
    status: STATUS_PRESENTATION[cycle.status] || cycle.status,
    statusBanco: cycle.status,
    progresso: totalAssignments > 0
      ? Math.round((completedAssignments / totalAssignments) * 100)
      : null,
    totalAtribuicoes: totalAssignments,
    atribuicoesConcluidas: completedAssignments,
    times: teams,
    timeIds: teams.map((team) => team.id),
    criadoEm: cycle.criado_em,
  };
}

export function normalizeCyclePayload(values, cycleId = null) {
  return {
    p_ciclo_id: cycleId,
    p_nome: values.nome.trim(),
    p_template_id: values.templateId,
    p_data_inicio: values.dataInicio,
    p_data_limite: toBusinessDayEndIso(values.dataFim),
    p_time_ids: [...new Set(values.timeIds)],
  };
}
