export const TEMPLATES_MOCK = [
  {
    id: 1,
    nome: "Template Padrão 360°",
    descricao:
      "8 competências — Comunicação, Colaboração, Execução, Liderança e outras.",
    tipo: "padrao",
    usadoEm: 4,
    competencias: [
      { id: "comunicacao", titulo: "Comunicação", desc: "Clareza, objetividade e assertividade na troca de informações com a equipe." },
      { id: "colaboracao", titulo: "Colaboração", desc: "Disponibilidade para apoiar colegas, trabalho em equipe e espírito colaborativo." },
      { id: "qualidade-entrega", titulo: "Qualidade das Entregas", desc: "Precisão, atenção a detalhes e nível de excelência nos resultados entregues." },
      { id: "postura-profissional", titulo: "Postura Profissional", desc: "Comprometimento, ética, proatividade e resiliência em situações de pressão." },
      { id: "qualidade-tecnica", titulo: "Qualidade Técnica", desc: "Domínio de ferramentas, aplicação de boas práticas e eficiência na resolução de problemas." },
    ]
  },
  {
    id: 2,
    nome: "Ciclo 2026.1 — Engenharia",
    descricao: "Clonado do padrão, com 2 competências técnicas adicionadas.",
    tipo: "clonado",
    usadoEm: 1,
    competencias: []
  },
];

export const CICLOS_MOCK = [
  {
    id: 1,
    nome: "Ciclo 2026.2 — Semestral",
    template: "Template Padrão 360°",
    periodo: "a definir",
    status: "rascunho",
    progresso: null,
  },
  {
    id: 2,
    nome: "Ciclo 2026.1 — Engenharia",
    template: "Ciclo 2026.1 — Engenharia (clonado)",
    periodo: "01 jun – 30 jun 2026",
    status: "aberto",
    progresso: 62,
  },
  {
    id: 3,
    nome: "Ciclo 2025.4 — Anual",
    template: "Template Padrão 360°",
    periodo: "01 nov – 15 dez 2025",
    status: "encerrado",
    progresso: 100,
  },
  {
    id: 4,
    nome: "Ciclo 2025.3 — Comercial",
    template: "Template Padrão 360°",
    periodo: "01 ago – 30 ago 2025",
    status: "encerrado",
    progresso: 100,
  },
  {
    id: 5,
    nome: "Ciclo 2025.2 — Semestral",
    template: "Template Padrão 360°",
    periodo: "01 jun – 30 jun 2025",
    status: "encerrado",
    progresso: 100,
  },
];

export const COLABORADORES_PENDENTES_MOCK = [
  { id: "JC", nome: "Juliana Costa Rezende" },
  { id: "RS", nome: "Rafael Souza" },
];

export const CRITERIOS_MOCK = [
  {
    id: "comunicacao",
    titulo: "Comunicação",
    desc: "Clareza, objetividade e assertividade na troca de informações com a equipe.",
  },
  {
    id: "colaboracao",
    titulo: "Colaboração",
    desc: "Disponibilidade para apoiar colegas, trabalho em equipe e espírito colaborativo.",
  },
  {
    id: "qualidade-entrega",
    titulo: "Qualidade das Entregas",
    desc: "Precisão, atenção a detalhes e nível de excelência nos resultados entregues.",
  },
  {
    id: "postura-profissional",
    titulo: "Postura Profissional",
    desc: "Comprometimento, ética, proatividade e resiliência em situações de pressão.",
  },
  {
    id: "qualidade-tecnica",
    titulo: "Qualidade Técnica",
    desc: "Domínio de ferramentas, aplicação de boas práticas e eficiência na resolução de problemas.",
  },
];
