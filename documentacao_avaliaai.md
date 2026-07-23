# Avalia.ai — Documentação Técnica

 
**Stack de referência:** React + Tailwind + shadcn/ui + react-hook-form + Zod (frontend) | Supabase/PostgREST + PostgreSQL RLS + JWT (backend)


# Sistema de Design: Identidade Visual

## 🖋 Tipografia

| Variável CSS | Família |
| :--- | :--- |
| `--font-sans` | **Inter** |
| `--font-serif` | **Source Serif 4** |
| `--font-mono` | **JetBrains Mono** |

---

## 🎨 Paleta de Cores (Tokens)

### 1. Cores Base

| Variável | Tema Claro (Light) | Tema Escuro (Dark) |
| :--- | :--- | :--- |
| `--background` | `oklch(1.0000 0 0)` | `oklch(0.2046 0 0)` |
| `--foreground` | `oklch(0.3211 0 0)` | `oklch(0.9219 0 0)` |

### 2. Superfícies

| Variável | Tema Claro (Light) | Tema Escuro (Dark) |
| :--- | :--- | :--- |
| `--card` | `oklch(1.0000 0 0)` | `oklch(0.2686 0 0)` |
| `--card-foreground` | `oklch(0.3211 0 0)` | `oklch(0.9219 0 0)` |
| `--popover` | `oklch(1.0000 0 0)` | `oklch(0.2686 0 0)` |
| `--popover-foreground` | `oklch(0.3211 0 0)` | `oklch(0.9219 0 0)` |

### 3. Cores de Marca e Interação

| Variável | Tema Claro (Light) | Tema Escuro (Dark) |
| :--- | :--- | :--- |
| `--primary` | `oklch(0.6231 0.1880 259.8145)` | `oklch(0.6231 0.1880 259.8145)` |
| `--primary-foreground`| `oklch(1.0000 0 0)` | `oklch(1.0000 0 0)` |
| `--secondary` | `oklch(0.9670 0.0029 264.5419)` | `oklch(0.2686 0 0)` |
| `--secondary-foreground`| `oklch(0.4461 0.0263 256.8018)` | `oklch(0.9219 0 0)` |
| `--accent` | `oklch(0.9514 0.0250 236.8242)` | `oklch(0.3791 0.1378 265.5222)` |
| `--accent-foreground` | `oklch(0.3791 0.1378 265.5222)` | `oklch(0.8823 0.0571 254.1284)` |
| `--destructive` | `oklch(0.6368 0.2078 25.3313)` | `oklch(0.6368 0.2078 25.3313)` |
| `--muted` | `oklch(0.9846 0.0017 247.8389)` | `oklch(0.2393 0 0)` |

### 4. Componentes Estruturais

| Variável | Tema Claro (Light) | Tema Escuro (Dark) |
| :--- | :--- | :--- |
| `--border` | `oklch(0.9276 0.0058 264.5313)` | `oklch(0.3715 0 0)` |
| `--input` | `oklch(0.9276 0.0058 264.5313)` | `oklch(0.3715 0 0)` |
| `--ring` | `oklch(0.6231 0.1880 259.8145)` | `oklch(0.6231 0.1880 259.8145)` |

### 5. Sidebar

| Variável | Tema Claro (Light) | Tema Escuro (Dark) |
| :--- | :--- | :--- |
| `--sidebar` | `oklch(0.9846 0.0017 247.8389)` | `oklch(0.2046 0 0)` |
| `--sidebar-border` | `oklch(0.9276 0.0058 264.5313)` | `oklch(0.3715 0 0)` |
| `--sidebar-primary` | `oklch(0.6231 0.1880 259.8145)` | `oklch(0.6231 0.1880 259.8145)` |
| `--sidebar-accent` | `oklch(0.9514 0.0250 236.8242)` | `oklch(0.3791 0.1378 265.5222)` |

### 6. Visualização de Dados

| Variável | Tema Claro (Light) | Tema Escuro (Dark) |
| :--- | :--- | :--- |
| `--chart-1` | `oklch(0.6231 0.1880 259.8145)` | `oklch(0.7137 0.1434 254.6240)` |
| `--chart-2` | `oklch(0.5461 0.2152 262.8809)` | `oklch(0.6231 0.1880 259.8145)` |
| `--chart-3` | `oklch(0.4882 0.2172 264.3763)` | `oklch(0.5461 0.2152 262.8809)` |
| `--chart-4` | `oklch(0.4244 0.1809 265.6377)` | `oklch(0.4882 0.2172 264.3763)` |
| `--chart-5` | `oklch(0.3791 0.1378 265.5222)` | `oklch(0.4244 0.1809 265.6377)` |

---

## 📐 Formas e Efeitos

### Arredondamento (Border Radius)

| Variável | Cálculo / Valor |
| :--- | :--- |
| `--radius` | `0.375rem` |
| `--radius-sm` | `calc(var(--radius) - 4px)` |
| `--radius-md` | `calc(var(--radius) - 2px)` |
| `--radius-lg` | `var(--radius)` |
| `--radius-xl` | `calc(var(--radius) + 4px)` |

### Sombras (Shadows)

| Variável | Valor |
| :--- | :--- |
| `--shadow-color` | `oklch(0 0 0)` |
| `--shadow-opacity` | `0.1` |
| `--shadow-2xs` | `0 1px 3px 0px hsl(0 0% 0% / 0.05)` |
| `--shadow-xs` | `0 1px 3px 0px hsl(0 0% 0% / 0.05)` |
| `--shadow-sm` | `0 1px 3px 0px hsl(0 0% 0% / 0.10), 0 1px 2px -1px hsl(0 0% 0% / 0.10)` |
| `--shadow` | `0 1px 3px 0px hsl(0 0% 0% / 0.10), 0 1px 2px -1px hsl(0 0% 0% / 0.10)` |
| `--shadow-md` | `0 1px 3px 0px hsl(0 0% 0% / 0.10), 0 2px 4px -1px hsl(0 0% 0% / 0.10)` |
| `--shadow-lg` | `0 1px 3px 0px hsl(0 0% 0% / 0.10), 0 4px 6px -1px hsl(0 0% 0% / 0.10)` |
| `--shadow-xl` | `0 1px 3px 0px hsl(0 0% 0% / 0.10), 0 8px 10px -1px hsl(0 0% 0% / 0.10)` |
| `--shadow-2xl` | `0 1px 3px 0px hsl(0 0% 0% / 0.25)` |

---

## 1. Visão Geral e Escopo

### 1.1 Resumo Executivo
Avalia.ai é uma plataforma web para condução de **ciclos de avaliação de desempenho 360°**. O sistema resolve um problema recorrente em empresas que ultrapassam uma estrutura hierárquica simples: a perda de visibilidade sobre desempenho real quando a avaliação depende exclusivamente do julgamento unilateral do gestor.

O produto endereça duas falhas comuns de processos 360° tradicionais:
- **Fadiga de formulário** — resolvida ao eliminar comentários por competência, restringindo o feedback textual a duas perguntas abertas globais no fim do formulário.
- **Medo de retaliação** — resolvido via **anonimato estrutural**: nenhum papel operacional da aplicação (incluindo RH) consegue, pela interface, cruzar uma nota ou comentário com a identidade de quem avaliou. Rastreabilidade só existe fora da aplicação, via acesso SQL direto por um Sysadmin, para fins de auditoria formal.

### 1.2 Escopo do MVP
Dentro do escopo:
- Definição de estrutura de times/projetos como fonte única de verdade para gerar avaliações.
- Geração automática de atribuições de avaliação (`atribuicoes_avaliacao`) com base nessa estrutura, no momento da abertura do ciclo (snapshot imutável).
- Formulário de avaliação com notas 1–5 por competência + 2 perguntas abertas globais.
- Cálculo automático de resultado consolidado (Autoavaliação vs. Média Externa) no encerramento do ciclo, com liberação simultânea da visualização.
- Dashboards agregados/anônimos para colaborador, gestor e RH.



---

## 2. Mapeamento de Atores

| Ator | Tipo | Natureza do Acesso | Observações |
|---|---|---|---|
| **Admin** | Usuário interno (papel de aplicação) | Interface web autenticada (JWT) | Configuração estrutural (organizações, usuários, templates). Sem acesso a notas/comentários individuais. |
| **RH** | Usuário interno (papel de aplicação) | Interface web autenticada (JWT) | Administra ciclos, times e templates. Consome apenas visões agregadas/anônimas, idênticas às do gestor. |
| **Gestor** | Papel contextual/dinâmico (não é um `papel` estático) | Interface web autenticada (JWT) | Inferido via `perfis.gestor_id`. Avalia e é avaliado (ascendente) **apenas** por liderados que também compartilham um `time` com ele (RN01, RN03, RN04) — gestor_id sozinho não gera avaliação. Visualiza resultado agregado apenas dos liderados dentro desse escopo (RN17), sem privilégio extra de identificação. |
| **Colaborador** | Usuário interno (papel de aplicação, papel-base de todos) | Interface web autenticada (JWT) | Realiza autoavaliação e avalia pares do seu círculo de proximidade (times compartilhados). Recebe seu próprio resultado consolidado. |
| **Sysadmin** | Ator técnico/operacional, **não é papel da aplicação web** | Acesso direto ao banco (console/SQL), fora da aplicação | Usado exclusivamente em investigações formais de compliance/auditoria (ex.: denúncias em campo de texto livre). |
| **Edge Function (Gerador de Atribuições)** | Sistema externo/serverless | Server-side, disparado por ação do RH | Único componente autorizado a criar `atribuicoes_avaliacao`. Responsável por gerar o snapshot congelado no momento da abertura do ciclo. |
| **Motor de RLS (PostgreSQL Row-Level Security)** | Sistema externo (infraestrutura) | Camada de dados | Garante em nível de banco que `avaliador_id` nunca seja exposto em consultas de roles operacionais, reforçando o anonimato estrutural independentemente de bugs na camada de aplicação. |



---

## 3. Especificação de Casos de Uso

### UC01 — Geração Automática de Atribuições de Avaliação

| Campo | Descrição |
|---|---|
| **Ator Principal** | RH |
| **Atores Secundários** | Edge Function (Gerador de Atribuições) |
| **Pré-condições** | (1) Ciclo criado com status inicial (`draft`); (2) template de competências e período válidos; (3) ao menos um vínculo em `ciclos_times`; (4) cada time selecionado possui ao menos um membro ativo. |
| **Pós-condições (sucesso)** | Conjunto completo e imutável de `atribuicoes_avaliacao` criado para os membros ativos dos times selecionados, cobrindo autoavaliação, pares e relações gestor–liderado dentro do escopo compartilhado. O status transita para `active` na mesma transação e as atribuições passam a ser o snapshot definitivo do ciclo. |
| **Fluxo Principal** | 1. RH/admin cria ou configura o ciclo `draft`, define período, template e times. <br> 2. RH/admin confirma "Gerar avaliações". <br> 3. A Edge Function valida JWT e invoca `gerar_atribuicoes_ciclo` no contexto autenticado. <br> 4. A RPC bloqueia a linha do ciclo, valida configuração e membros ativos dos times selecionados. <br> 5. Para cada participante elegível, cria `autoavaliacao`. <br> 6. Para cada par ordenado que compartilha time selecionado, cria `gestor`, `subordinado` ou `pares`, com precedência hierárquica e deduplicação entre times sobrepostos. <br> 7. A RPC persiste todo o snapshot e atualiza o status para `active` em uma única transação. <br> 8. A interface recarrega status e progresso agregado, sem consultar identidades de avaliadores. |
| **Fluxos de Exceção** | **E1 — Ciclo sem times:** bloqueio com `CYCLE_REQUIRES_TEAMS`. <br> **E2 — Time sem membro ativo:** bloqueio com `CYCLE_TEAM_WITHOUT_ACTIVE_MEMBERS` e identificação dos times pendentes. <br> **E3 — Falha transacional:** rollback completo; ciclo permanece `draft`. <br> **E4 — Ciclo já aberto ou geração concorrente:** a tentativa posterior recebe `CYCLE_NOT_DRAFT` e não duplica atribuições. <br> **E5 — Papel sem permissão:** a operação recebe `CYCLE_PERMISSION_DENIED` sem alterar dados. |

---

### UC02 — Preenchimento e Submissão do Formulário de Avaliação

| Campo | Descrição |
|---|---|
| **Ator Principal** | Colaborador (em qualquer um de seus papéis contextuais: autoavaliação, par, gestor avaliando liderado, ou liderado avaliando gestor) |
| **Atores Secundários** | — |
| **Pré-condições** | (1) Existe uma `atribuicao_avaliacao` com `status = 'pending'` atribuída ao usuário autenticado como `avaliador_id`; (2) Ciclo está com status `open` e dentro do período entre `data_inicio` e `data_limite`. |
| **Pós-condições (sucesso)** | Uma nota (1–5) registrada em `respostas_avaliacao` para cada `pergunta_template` do template do ciclo; um registro em `feedback_aberto_avaliacao` com `pontos_fortes` e `pontos_melhoria`; `atribuicao_avaliacao.status` transita para `submitted`; o registro torna-se imutável (sem edição posterior pela aplicação). |
| **Fluxo Principal** | 1. Colaborador acessa lista de avaliações pendentes (apenas as suas, sem visibilidade de quem mais está avaliando quem). <br> 2. Colaborador seleciona uma atribuição pendente. <br> 3. Sistema renderiza formulário com uma pergunta de escala 1–5 por competência do template (com tooltip de descrição por nível — RN08). <br> 4. Colaborador preenche as notas; sistema salva rascunho automaticamente a cada alteração (persistência incremental, sem submissão). <br> 5. Ao final, colaborador preenche os dois campos abertos globais (`pontos_fortes`, `pontos_melhoria`), respeitando limite de caracteres (ex.: 1000) com sanitização básica de entrada. <br> 6. Colaborador confirma o envio final. <br> 7. Sistema valida completude (todas as competências pontuadas) e grava a submissão como imutável (RN09), atualizando `status = 'submitted'`. |
| **Fluxos de Exceção** | **E1 — Envio incompleto:** validação client-side (Zod) e server-side bloqueia submissão se alguma competência não tiver nota; rascunho permanece salvo. <br> **E2 — Prazo expirado (`data_limite` atingida):** sistema bloqueia novos envios e edições de rascunho; atribuições ainda `pending` permanecem assim e não compõem o cálculo de resultado (RN06). <br> **E3 — Tentativa de reenvio após `status = 'submitted'`:** bloqueado — submissão é imutável por definição de regra de negócio (RN09). <br> **E4 — Texto livre excede limite de caracteres:** truncamento/bloqueio no client, com feedback visual antes do envio. <br> **E5 — Colaborador avaliador ou avaliado é desativado (`ativo = false`) durante o ciclo aberto:** a atribuição pendente permanece inalterada no banco; o colaborador desativado apenas perde acesso à aplicação e não consegue mais preencher as suas próprias atribuições pendentes (RN10). |

---

### UC03 — Encerramento do Ciclo com Cálculo e Liberação Automática de Resultados

| Campo | Descrição |
|---|---|
| **Ator Principal** | Sistema (gatilho automático por `data_limite`, disparado via `pg_cron` chamando a Edge Function de fechamento — RN11) ou RH (fechamento manual antecipado) |
| **Atores Secundários** | Colaborador, Gestor, RH (consumidores do resultado) |
| **Pré-condições** | Ciclo está com status `open`. |
| **Pós-condições (sucesso)** | Status do ciclo transita para `closed`. Novos envios são bloqueados permanentemente. Para cada colaborador com ao menos uma atribuição no ciclo, o sistema calcula e persiste (ou materializa em view) o comparativo Autoavaliação vs. Média Externa por competência (RN13, RN14). **A visualização dos resultados é liberada automaticamente e simultaneamente ao fechamento — não há etapa de publicação manual separada** (RN15). Colaborador, Gestor e RH passam a enxergar, cada um dentro do seu escopo de visão (RN17 para o Gestor), os dados agregados/anônimos imediatamente. |
| **Fluxo Principal** | 1. Data-limite (`data_limite`) é atingida via `pg_cron` **ou** RH aciona fechamento manual (RN11). <br> 2. Sistema trava a criação de novas respostas/rascunhos para o ciclo. <br> 3. Sistema itera sobre todas as `atribuicoes_avaliacao` com `status = 'submitted'` do ciclo. <br> 4. Para cada `avaliado_id`, sistema calcula, por competência: nota de autoavaliação (`tipo_relacionamento = 'self'`) e média aritmética simples, com peso igual entre os tipos (RN14), das notas recebidas de terceiros (`tipo_relacionamento IN ('peer','manager','subordinate')`), **excluindo explicitamente a autoavaliação desse cálculo** (RN13). <br> 5. Sistema consolida a lista de comentários abertos recebidos pelo colaborador, sem qualquer metadado de autoria. <br> 6. Sistema atualiza `ciclos_avaliacao.status = 'closed'`. <br> 7. Sistema libera imediatamente as telas de resultado para Colaborador, Gestor e RH, cada um em seu escopo de visão. |
| **Fluxos de Exceção** | **E1 — Colaborador sem nenhuma avaliação recebida de terceiros:** Média Externa é exibida como indisponível/nula para aquela competência, sem travar o fechamento do ciclo (RN06). <br> **E2 — Atribuições ainda `pending` no momento do fechamento:** essas atribuições simplesmente não entram no cálculo; não bloqueiam o encerramento. <br> **E3 — Fechamento manual concorrente com o gatilho automático de `data_limite`:** operação deve ser idempotente — segunda tentativa de fechamento é uma no-op segura, sem recálculo duplicado (RN12). |

---

## 4. Épicos e Histórias de Usuário

### Épico 1 — Estrutura Organizacional (Times e Projetos)
Base de dados que serve como fonte única de verdade para geração de avaliações.

- **US1.1** — Como um **RH**, eu quero criar e editar times/projetos (`times`) para que a estrutura organizacional reflita a realidade de convivência de trabalho.
- **US1.2** — Como um **RH**, eu quero vincular colaboradores a um ou mais times (`membros_time`) para que o sistema saiba automaticamente quem deve avaliar quem.
- **US1.3** — Como um **RH**, eu quero que a estrutura de times seja reaproveitada entre ciclos para que eu não precise recriá-la manualmente a cada nova avaliação.

### Épico 2 — Templates de Competências
Configuração do conteúdo avaliado.

- **US2.1** — Como um **RH**, eu quero usar um Template Padrão pré-configurado (seed) para que eu não precise criar competências do zero em todo ciclo.
- **US2.2** — Como um **RH**, eu quero clonar e ajustar o template padrão para um ciclo específico para que eu possa adaptar as competências avaliadas sem alterar o padrão global.

### Épico 3 — Gestão do Ciclo de Avaliação
Ciclo de vida completo: criação, geração, execução e encerramento.

- **US3.1** — Como um **RH**, eu quero criar um ciclo de avaliação com nome, datas e template vinculado para que eu possa iniciar um novo processo de avaliação.
- **US3.2** — Como um **RH**, eu quero acionar a geração automática de atribuições de avaliação (`atribuicoes_avaliacao`), respeitando o time como escopo e a hierarquia gestor-liderado como precedência sobre pares (RN01, RN03, RN04), para que eu não precise definir manualmente "quem avalia quem".
- **US3.3** — Como um **RH**, eu quero acompanhar o percentual de formulários concluídos, sem ver quem avaliou quem, para que eu possa monitorar o progresso do ciclo sem comprometer o anonimato.
- **US3.4** — Como um **Sistema**, eu quero encerrar o ciclo automaticamente na data-limite (ou por ação manual do RH) para que os resultados sejam calculados e liberados sem depender de uma etapa manual adicional.

### Épico 4 — Execução da Avaliação
Preenchimento do formulário pelo colaborador.

- **US4.1** — Como um **Colaborador**, eu quero preencher minha autoavaliação e as avaliações dos membros do meu time para que eu contribua com o ciclo de forma completa.
- **US4.2** — Como um **Colaborador**, eu quero que meu rascunho seja salvo automaticamente para que eu não perca meu progresso caso feche o formulário antes de concluir.
- **US4.3** — Como um **Colaborador**, eu quero registrar feedback textual apenas em duas perguntas globais (não por competência) para que o processo seja rápido e menos cansativo.
- **US4.4** — Como um **Gestor**, eu quero avaliar cada um dos meus liderados diretos que também fazem parte de um time comigo (RN04) para que meu julgamento componha a Média Externa deles.
- **US4.5** — Como um **Colaborador**, eu quero poder avaliar meu gestor (avaliação ascendente), desde que ele também esteja no meu time (RN04), para que a liderança também receba feedback estruturado do time.

### Épico 5 — Resultados e Anonimato
Consolidação, visualização e garantias de privacidade.

- **US5.1** — Como um **Colaborador**, eu quero visualizar minha Autoavaliação comparada à Média Externa por competência para que eu entenda como sou percebido pelos colegas.
- **US5.2** — Como um **Colaborador**, eu quero ler os comentários abertos recebidos sem identificação de autoria para que eu tenha o benefício do feedback sem risco de retaliação a quem o escreveu.
- **US5.3** — Como um **Gestor**, eu quero visualizar o comparativo de cada liderado que compartilha time comigo (RN17), de forma agregada e anônima, para que eu possa apoiar o desenvolvimento do time sem acessar dados individuais de autoria.
- **US5.4** — Como um **RH**, eu quero visualizar resultados agregados por time/organização, no mesmo nível de anonimato do gestor, para que eu tenha visão estratégica sem privilégio de identificação indevido.
- **US5.5** — Como um **Sysadmin**, eu quero acessar dados brutos exclusivamente via SQL direto no banco para que investigações formais de compliance sejam possíveis sem expor essa capacidade dentro da aplicação.



## 5. Regras de Negócio (RN)

> Consolidado a partir da sessão de validação da documentação técnica para preparação de change proposals no OpenSpec. Substitui as citações soltas de "RN 5.x" que existiam sem definição formal nas versões anteriores deste documento.

### 5.1 Estrutura Organizacional (Times)

**RN01 — Time selecionado como escopo fechado de avaliação.**
Um ciclo só gera atribuições para membros ativos dos times vinculados em `ciclos_times` e apenas entre pessoas que compartilham pelo menos um desses times. Não existe avaliação entre pessoas que não dividem um time selecionado, independentemente de outro vínculo (ex.: hierárquico).

**RN02 — Todo time selecionado precisa de membro ativo.**
O ciclo deve possuir ao menos um time e cada time selecionado deve conter ao menos um perfil com `ativo = true` no momento da geração. Um time vazio ou composto somente por perfis inativos bloqueia a transação inteira e é identificado para correção pelo RH/admin.

### 5.2 Geração de Atribuições de Avaliação (UC01)

**RN03 — Precedência hierárquica sobre relação de pares.**
Para cada par ordenado `(A, B)` de colaboradores ativos que compartilham time:
- Se `B = A.gestor_id` → `tipo_relacionamento = 'subordinado'`
- Senão, se `A = B.gestor_id` → `tipo_relacionamento = 'gestor'`
- Senão → `tipo_relacionamento = 'pares'`

A relação hierárquica **substitui** a relação de pares para aquele par específico — nunca coexistem. Isso garante que a chave única `(ciclo_id, avaliador_id, avaliado_id)` nunca seja violada por sobreposição.

**RN04 — Gestor fora do time não gera avaliação com o liderado.**
Se o gestor de um colaborador não pertence a nenhum time selecionado em comum com ele, nenhuma atribuição (`gestor` nem `subordinado`) é gerada entre os dois. O vínculo `gestor_id` só produz avaliação quando reforçado pelo escopo do ciclo (RN01).

**RN05 — Snapshot imutável.**
O conjunto de `atribuicoes_avaliacao` gerado no momento da abertura do ciclo é definitivo. Alterações posteriores em `membros_time` ou `gestor_id` não afetam ciclos já abertos.

**RN06 — Sem bloqueio por volume.**
A ausência de pares ou gestor no time não impede a geração. No mínimo, uma `autoavaliacao` é gerada para cada membro ativo pertencente ao escopo selecionado.

**RN06.1 — Período usa o fuso de negócio.**
A data-limite escolhida é inclusiva até `23:59:59.999` em `America/Sao_Paulo` e é persistida como `timestamptz`; `data_inicio` permanece uma data civil (`date`).

### 5.3 Templates de Competência

**RN07 — Templates são compartilháveis entre ciclos.**
`templates_competencia` não possui vínculo de clonagem por ciclo. Múltiplos `ciclos_avaliacao` podem referenciar o mesmo `template_id` livremente. A criação de um "novo template a partir do padrão" é uma ação manual do RH na interface (nova linha, sem rastro de origem no banco), não um mecanismo automático de cópia.

### 5.4 Preenchimento e Submissão (UC02)

**RN08 — Escala e tooltip por nível.**
Cada competência do template exibe uma escala de 1 a 5 com descrição/tooltip por nível (`perguntas_template.descricao_niveis`).

**RN09 — Imutabilidade da submissão.**
Após `atribuicao_avaliacao.status = 'submitted'`, o registro não pode ser editado pela aplicação — nem pelo próprio colaborador, nem por RH/Admin.

**RN10 — Acesso permanece ativo mesmo após desativação do colaborador.**
Se um colaborador é desativado (`ativo = false`) no meio de um ciclo aberto, suas atribuições pendentes (como avaliador e como avaliado) **permanecem no banco sem alteração** — outros colaboradores continuam vendo-o como alvo de avaliação normalmente. A única mudança é que o colaborador desativado perde acesso à aplicação e não consegue mais preencher suas próprias atribuições pendentes, que ficam `pending` indefinidamente e são simplesmente excluídas do cálculo no encerramento (RN06).

### 5.5 Encerramento e Cálculo de Resultado (UC03)

**RN11 — Fechamento automático via job agendado.**
O encerramento do ciclo na `data_limite` é disparado por `pg_cron` (Supabase) chamando uma Edge Function no horário definido — não depende de um usuário estar logado ou acessar a aplicação no momento exato do prazo.

**RN12 — Idempotência do fechamento.**
Fechamento manual (RH) concorrente com o gatilho automático do `pg_cron` deve ser seguro: uma segunda tentativa de fechar um ciclo já `closed` é uma operação sem efeito (no-op), sem recálculo duplicado.

**RN13 — Exclusão da autoavaliação da Média Externa.**
No cálculo por competência, a nota de autoavaliação (`self`) nunca entra no cálculo da Média Externa — só é usada para exibir o comparativo Autoavaliação vs. Média Externa.

**RN14 — Peso igual entre peer, manager e subordinate.**
A Média Externa é uma média aritmética simples entre todas as notas recebidas de terceiros (`peer`, `manager`, `subordinate`), sem ponderação diferenciada — a nota do gestor pesa o mesmo que a de um par.

**RN15 — Liberação simultânea ao fechamento.**
Não existe etapa de publicação manual separada: no instante em que o ciclo transita para `closed`, os resultados agregados/anônimos ficam disponíveis imediatamente para Colaborador, Gestor e RH, cada um no seu escopo.

### 5.6 Anonimato e Visibilidade

**RN16 — Anonimato estrutural via RLS.**
Nenhum papel operacional da aplicação (incluindo RH) consegue, pela interface, associar uma nota ou comentário ao `avaliador_id` de terceiros. A política de RLS permite que um colaborador veja `avaliador_id = auth.uid()` apenas nas suas próprias atribuições (para saber o que ainda precisa preencher) — nunca em consultas agregadas ou de outros colaboradores.

**RN17 — Escopo de visão do gestor é limitado pelo time.**
O gestor só visualiza o resultado agregado/anônimo de liderados que dividem pelo menos um time com ele — consistente com RN01/RN04. Liderados diretos (via `gestor_id`) sem time em comum não aparecem no dashboard do gestor, pois não geram avaliação nenhuma entre os dois.

**RN18 — Rastreabilidade só existe fora da aplicação.**
A única forma de associar `avaliador_id` a uma resposta específica é via acesso SQL direto por um Sysadmin, fora da interface web, exclusivamente para investigações formais de compliance/auditoria.

### 5.7 Pendências técnicas de implementação

Estes pontos não bloqueiam a escrita de specs no OpenSpec, mas precisam virar tarefas técnicas explícitas antes da implementação:
- `respostas_avaliacao.nota` precisa de `CHECK (nota BETWEEN 1 AND 5)` formal (ver seção 6, já incorporado ao DBML abaixo).
- RN09 (imutabilidade) precisa de mecanismo explícito no banco: recomendação é uma política de RLS negando `UPDATE`/`DELETE` em `respostas_avaliacao` e `feedback_aberto_avaliacao` quando a `atribuicao_avaliacao` correspondente já está `submitted` — sem precisar de trigger, dado que tudo será configurado manualmente via SQL Editor do dashboard Supabase.
- RN02 (validação impeditiva) deve rodar em dois pontos: client-side (desabilitando o botão "Gerar Avaliações" com a lista de pendências visível) e novamente server-side na Edge Function (fonte da verdade, contra bypass de UI).

---

## 6. ESTRUTURA DO BANCO DE DADOS
Project avalia_ai {
  database_type: 'PostgreSQL'
  Note: 'Avalia.ai - Plataforma de ciclos de avaliacao de desempenho 360. Escopo: empresa unica, resultado consolidado calculado via view (nao persistido), gestor inferido dinamicamente via gestor_id. Geracao de atribuicoes restrita ao escopo do time (RN01): gestor so avalia/e avaliado por liderado que tambem compartilha time (RN03, RN04) - relacao hierarquica sempre substitui peer, nunca coexiste, garantindo a unicidade de (ciclo_id, avaliador_id, avaliado_id).'
}

Enum papel_perfil {
  admin
  rh
  colaborador
}

Enum status_ciclo {
  draft
  open
  closed
}

Enum tipo_relacionamento_avaliacao {
  self
  peer
  manager
  subordinate
}

Enum status_atribuicao {
  pending
  submitted
}

Table perfis {
  id UUID [pk, default: `gen_random_uuid()`]
  nome_completo varchar(255) [not null]
  email varchar(255) [not null, unique]
  papel papel_perfil [not null, default: 'colaborador']
  gestor_id UUID [ref: > perfis.id, note: 'Auto-relacionamento. Papel "gestor" é inferido dinamicamente por esta coluna, não é um valor de papel.']
  ativo boolean [not null, default: true]
  criado_em timestamptz [not null, default: `now()`]

  Note: 'Usuários do sistema (papel-base colaborador; admin/rh são papéis estáticos).'
}

Table times {
  id UUID [pk, default: `gen_random_uuid()`]
  nome varchar(255) [not null]
  descricao text
  criado_em timestamptz [not null, default: `now()`]

  Note: 'Estrutura organizacional - fonte única de verdade para gerar avaliações.'
}

Table membros_time {
  id UUID [pk, default: `gen_random_uuid()`]
  time_id UUID [not null, ref: > times.id]
  perfil_id UUID [not null, ref: > perfis.id]
  criado_em timestamptz [not null, default: `now()`]

  indexes {
    (time_id, perfil_id) [unique]
  }

  Note: 'Vínculo N:N entre perfis e times. RN02: todo perfil com ativo=true deve ter ao menos uma linha aqui antes da geração de atribuicoes_avaliacao — validado na Edge Function, sem constraint de banco (não dá pra expressar "min. 1 linha por FK" via CHECK simples).'
}

Table templates_competencia {
  id UUID [pk, default: `gen_random_uuid()`]
  nome varchar(255) [not null]
  eh_padrao boolean [not null, default: false]
  criado_em timestamptz [not null, default: `now()`]

  Note: 'Templates de competências (padrão/seed ou clonado por ciclo).'
}

Table perguntas_template {
  id UUID [pk, default: `gen_random_uuid()`]
  template_id UUID [not null, ref: > templates_competencia.id]
  competencia varchar(255) [not null]
  descricao_niveis text [note: 'Descrição/tooltip da escala 1-5 (campo único simplificado).']
  ordem integer [not null, default: 0]
  criado_em timestamptz [not null, default: `now()`]

  Note: 'Competências avaliadas dentro de um template.'
}

Table ciclos_avaliacao {
  id UUID [pk, default: `gen_random_uuid()`]
  nome varchar(255) [not null]
  template_id UUID [not null, ref: > templates_competencia.id]
  status status_ciclo [not null, default: 'draft']
  data_inicio date [not null]
  data_limite timestamptz [not null]
  criado_em timestamptz [not null, default: `now()`]

  Note: 'Ciclo de avaliação 360°.'
}

Table atribuicoes_avaliacao {
  id UUID [pk, default: `gen_random_uuid()`]
  ciclo_id UUID [not null, ref: > ciclos_avaliacao.id]
  avaliador_id UUID [not null, ref: > perfis.id]
  avaliado_id UUID [not null, ref: > perfis.id]
  tipo_relacionamento tipo_relacionamento_avaliacao [not null]
  status status_atribuicao [not null, default: 'pending']
  criado_em timestamptz [not null, default: `now()`]

  indexes {
    (ciclo_id, avaliador_id, avaliado_id) [unique]
  }

  Note: 'Snapshot imutável de "quem avalia quem", gerado no momento da abertura do ciclo.'
}

Table respostas_avaliacao {
  id UUID [pk, default: `gen_random_uuid()`]
  atribuicao_id UUID [not null, ref: > atribuicoes_avaliacao.id]
  pergunta_id UUID [not null, ref: > perguntas_template.id]
  nota int16 [not null, note: 'Escala 1-5. CHECK constraint a ser aplicado manualmente via SQL Editor do Supabase: ALTER TABLE respostas_avaliacao ADD CONSTRAINT chk_nota_escala CHECK (nota BETWEEN 1 AND 5); — ver RN08, seção 5.7.']
  criado_em timestamptz [not null, default: `now()`]

  indexes {
    (atribuicao_id, pergunta_id) [unique]
  }

  Note: 'Nota (1-5) por competência.'
}

Table feedback_aberto_avaliacao {
  id UUID [pk, default: `gen_random_uuid()`]
  atribuicao_id UUID [not null, unique, ref: > atribuicoes_avaliacao.id]
  pontos_fortes varchar(1000)
  pontos_melhoria varchar(1000)
  criado_em timestamptz [not null, default: `now()`]

  Note: 'As duas perguntas abertas globais (não há comentário por competência).'
}

Table ciclos_times {
  id UUID [pk, default: `gen_random_uuid()`]
  ciclo_id UUID [not null, ref: > ciclos_avaliacao.id]
  time_id UUID [not null, ref: > times.id]
  criado_em timestamptz [not null, default: `now()`]

  indexes {
    (ciclo_id, time_id) [unique]
    time_id
  }

  Note: 'Escopo explícito de times do ciclo. Pode ser alterado somente enquanto o ciclo está draft e permanece como contexto histórico do snapshot.'
}
