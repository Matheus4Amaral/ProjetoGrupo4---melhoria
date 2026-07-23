import assert from "node:assert/strict";
import test from "node:test";
import { cycleSchema } from "../lib/validationSchemas.js";
import {
  mapCycleSummary,
  normalizeCyclePayload,
  toBusinessDayEndIso,
} from "./cyclesUtils.js";

const TEMPLATE_ID = "20000000-0000-4000-8000-000000000001";
const TEAM_ID = "30000000-0000-4000-8000-000000000001";

test("converte o fim do dia de São Paulo sem deslocar a data", () => {
  assert.equal(
    toBusinessDayEndIso("2026-08-31"),
    "2026-09-01T02:59:59.999Z",
  );
});

test("normaliza o payload e remove IDs de time repetidos", () => {
  assert.deepEqual(
    normalizeCyclePayload({
      nome: "  Ciclo Semestral  ",
      templateId: TEMPLATE_ID,
      dataInicio: "2026-08-01",
      dataFim: "2026-08-31",
      timeIds: [TEAM_ID, TEAM_ID],
    }),
    {
      p_ciclo_id: null,
      p_nome: "Ciclo Semestral",
      p_template_id: TEMPLATE_ID,
      p_data_inicio: "2026-08-01",
      p_data_limite: "2026-09-01T02:59:59.999Z",
      p_time_ids: [TEAM_ID],
    },
  );
});

test("mapeia status, times e progresso agregado", () => {
  const mapped = mapCycleSummary({
    id: "40000000-0000-4000-8000-000000000001",
    nome: "Ciclo Semestral",
    template_id: TEMPLATE_ID,
    template_nome: "Template padrão",
    data_inicio: "2026-08-01",
    data_limite: "2026-09-01T02:59:59.999Z",
    status: "active",
    criado_em: "2026-07-20T12:00:00Z",
    times: [{ id: TEAM_ID, nome: "Produto" }],
    total_atribuicoes: 8,
    atribuicoes_concluidas: 3,
  });

  assert.equal(mapped.status, "aberto");
  assert.equal(mapped.progresso, 38);
  assert.deepEqual(mapped.timeIds, [TEAM_ID]);
  assert.equal(mapped.dataFim, "2026-08-31");
});

test("validação exige time e intervalo de datas válido", () => {
  const noTeams = cycleSchema.safeParse({
    nome: "Ciclo",
    templateId: TEMPLATE_ID,
    dataInicio: "2026-08-01",
    dataFim: "2026-08-31",
    timeIds: [],
  });
  const invalidRange = cycleSchema.safeParse({
    nome: "Ciclo",
    templateId: TEMPLATE_ID,
    dataInicio: "2026-09-01",
    dataFim: "2026-08-31",
    timeIds: [TEAM_ID],
  });

  assert.equal(noTeams.success, false);
  assert.equal(invalidRange.success, false);
  assert.equal(invalidRange.error.issues[0].path[0], "dataFim");
});
