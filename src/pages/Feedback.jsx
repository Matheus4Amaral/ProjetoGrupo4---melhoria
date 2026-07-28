import { useState, useEffect } from "react";
import { Diamond, Target, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
// Importação do cliente Supabase já configurado na aplicação
import { supabase } from "@/lib/supabaseClient";

// Função utilitária para definir a cor da nota com base nos limites definidos
function getNotaVariant(nota) {
  if (nota >= 4) return "text-chart-5";
  if (nota >= 3.5) return "text-chart-4";
  return "text-destructive";
}

export default function Feedback() {
  // Estado para armazenar a lista dinâmica de membros da equipe
  const [membros, setMembros] = useState([]);
  
  // Estado para armazenar os dados consolidados do resumo superior
  const [resumo, setResumo] = useState({
    mediaGeral: "0.0",
    comparacao: "Ciclo Atual",
    deficit: { nome: "-", media: "0.0" },
    destaque: { iniciais: "--", nome: "-", nota: "0.0" },
    atencao: { iniciais: "--", nome: "-", nota: "0.0" },
  });

  // Estado para armazenar o desempenho calculado por cada critério/competência
  const [criterios, setCriterios] = useState([]);

  // Estado de controle para feedback visual durante o carregamento dos dados
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function carregarDadosFeedback() {
      try {
        setLoading(true);

        // 1. BUSCA DE MEMBROS E NOTAS INDIVIDUAIS
        const { data: perfisData, error: errPerfis } = await supabase
          .from("perfis")
          .select(`
            id,
            nome_completo,
            papel,
            atribuicoes_como_avaliado:atribuicoes_avaliacao!avaliado_id (
              id,
              status,
              respostas:respostas_avaliacao (
                nota,
                pergunta:perguntas_template (
                  competencia
                )
              )
            )
          `);

        if (errPerfis) console.error("Erro ao carregar perfis:", errPerfis);

        // Processa os perfis retornados formatando a lista de membros
        const membrosFormatados = (perfisData || []).map((p) => {
          const todasNotas = p.atribuicoes_como_avaliado
            ?.flatMap((a) => a.respostas?.map((r) => r.nota) || []) || [];

          const soma = todasNotas.reduce((acc, curr) => acc + curr, 0);
          const media = todasNotas.length > 0 ? (soma / todasNotas.length).toFixed(1) : "0.0";

          const nomes = p.nome_completo.split(" ");
          const iniciais = nomes.length > 1 
            ? `${nomes[0][0]}${nomes[nomes.length - 1][0]}`.toUpperCase()
            : p.nome_completo.substring(0, 2).toUpperCase();

          return {
            id: p.id,
            iniciais,
            nome: p.nome_completo,
            cargo: p.papel || "Colaborador",
            notas: todasNotas.slice(0, 4),
            media: parseFloat(media),
          };
        });

        setMembros(membrosFormatados);

        // 2. BUSCA E AGRUPAMENTO POR CRITÉRIOS (COMPETÊNCIAS)
        const { data: respostasData, error: errRespostas } = await supabase
          .from("respostas_avaliacao")
          .select(`
            nota,
            pergunta:perguntas_template (
              competencia
            )
          `);

        if (errRespostas) console.error("Erro ao carregar respostas:", errRespostas);

        const agrupadoPorCompetencia = {};
        (respostasData || []).forEach((r) => {
          const compNome = r.pergunta?.competencia || "Geral";
          if (!agrupadoPorCompetencia[compNome]) {
            agrupadoPorCompetencia[compNome] = { soma: 0, total: 0 };
          }
          agrupadoPorCompetencia[compNome].soma += r.nota;
          agrupadoPorCompetencia[compNome].total += 1;
        });

        const criteriosFormatados = Object.keys(agrupadoPorCompetencia).map((nome, index) => {
          const item = agrupadoPorCompetencia[nome];
          const notaMedia = (item.soma / item.total).toFixed(1);
          return {
            id: index + 1,
            nome,
            nota: parseFloat(notaMedia),
          };
        });

        setCriterios(criteriosFormatados);

        // 3. CÁLCULO DOS CARDS RESUMO
        if (membrosFormatados.length > 0) {
          const somaMedias = membrosFormatados.reduce((acc, m) => acc + m.media, 0);
          const mediaGeralCalculada = (somaMedias / membrosFormatados.length).toFixed(1);

          const ordenados = [...membrosFormatados].sort((a, b) => b.media - a.media);
          const destaqueMembro = ordenados[0];
          const atencaoMembro = ordenados[ordenados.length - 1];

          const criteriosOrdenados = [...criteriosFormatados].sort((a, b) => a.nota - b.nota);
          const menorCriterio = criteriosOrdenados[0] || { nome: "N/A", nota: "0.0" };

          setResumo({
            mediaGeral: mediaGeralCalculada,
            comparacao: "Média atual da equipe",
            deficit: { nome: menorCriterio.nome, media: menorCriterio.nota },
            destaque: {
              iniciais: destaqueMembro?.iniciais || "--",
              nome: destaqueMembro?.nome || "-",
              nota: destaqueMembro?.media || "0.0",
            },
            atencao: {
              iniciais: atencaoMembro?.iniciais || "--",
              nome: atencaoMembro?.nome || "-",
              nota: atencaoMembro?.media || "0.0",
            },
          });
        }
      } catch (error) {
        console.error("Erro inesperado ao buscar dados:", error);
      } finally {
        setLoading(false);
      }
    }

    carregarDadosFeedback();
  }, []);

  // Remoção local na lista de membros
  function removerMembro(id) {
    setMembros((prev) => prev.filter((m) => m.id !== id));
  }

  if (loading) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Carregando informações da equipe...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Cabeçalho simplificado (sem o botão) */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-1">
          Ciclo Ativo
        </p>
        <h1 className="text-2xl font-bold text-foreground">Equipe</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {membros.length} colaboradores cadastrados
        </p>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <Card className="border-t-2 border-t-primary">
          <CardContent className="p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Média Geral
            </p>
            <p className="text-4xl font-bold text-primary">{resumo.mediaGeral}</p>
            <p className="text-xs text-muted-foreground mt-1">{resumo.comparacao}</p>
          </CardContent>
        </Card>

        <Card className="border-t-2 border-t-destructive">
          <CardContent className="p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Déficit da Equipe
            </p>
            <p className="text-xl font-semibold text-destructive">{resumo.deficit.nome}</p>
            <p className="text-xs text-muted-foreground mt-1">média {resumo.deficit.media}</p>
          </CardContent>
        </Card>

        <Card className="border-t-2 border-t-chart-5">
          <CardContent className="p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Destaque
            </p>
            <div className="flex items-center gap-2 mb-3">
              <Avatar className="w-7 h-7">
                <AvatarFallback className="text-xs bg-chart-5/20 text-chart-5">
                  {resumo.destaque.iniciais}
                </AvatarFallback>
              </Avatar>
              <p className="text-sm font-medium text-foreground">{resumo.destaque.nome}</p>
            </div>
            <p className="text-4xl font-bold text-chart-5">{resumo.destaque.nota}</p>
          </CardContent>
        </Card>

        <Card className="border-t-2 border-t-chart-4">
          <CardContent className="p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Requer Atenção
            </p>
            <div className="flex items-center gap-2 mb-3">
              <Avatar className="w-7 h-7">
                <AvatarFallback className="text-xs bg-chart-4/20 text-chart-4">
                  {resumo.atencao.iniciais}
                </AvatarFallback>
              </Avatar>
              <p className="text-sm font-medium text-foreground">{resumo.atencao.nome}</p>
            </div>
            <p className="text-4xl font-bold text-chart-4">{resumo.atencao.nota}</p>
          </CardContent>
        </Card>
      </div>

      {/* Meio: Critérios + Pontos de Melhoria */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Desempenho por Critério */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Desempenho por Critério</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            {criterios.map((criterio) => {
              const progresso = (criterio.nota / 5) * 100;
              return (
                <div key={criterio.id}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <Diamond className="w-3.5 h-3.5 text-primary" />
                      <span className="text-sm text-foreground">{criterio.nome}</span>
                    </div>
                    <span className="text-sm font-bold text-primary">{criterio.nota}</span>
                  </div>
                  <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-700",
                        progresso >= 75 ? "bg-chart-5" : progresso >= 50 ? "bg-chart-4" : "bg-destructive"
                      )}
                      style={{ width: `${progresso}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Pontos a Melhorar */}
        <div className="flex flex-col gap-4">
          <h2 className="text-base font-semibold text-foreground">Pontos a Melhorar</h2>

          <Card className="border-chart-4/30">
            <CardContent className="p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-chart-4 mb-2">
                Critério com Maior Déficit
              </p>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <Diamond className="w-4 h-4 text-chart-4" />
                  <h3 className="text-sm font-bold text-foreground">{resumo.deficit.nome}</h3>
                </div>
                <span className="text-sm font-bold text-chart-4">{resumo.deficit.media}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Recomenda-se sessões de feedback individual e workshops focados nesta competência.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Membros da Equipe */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Membros da Equipe</CardTitle>
          <span className="text-xs text-muted-foreground">{membros.length} cadastrados</span>
        </CardHeader>
        <CardContent className="flex flex-col divide-y divide-border">
          {membros.map((membro, index) => (
            <div
              key={membro.id}
              className="flex items-center justify-between py-3 hover:bg-muted/40 px-2 rounded-lg transition-colors"
            >
              <div className="flex items-center gap-4 w-1/2">
                <span className="text-xs text-muted-foreground w-4 shrink-0">{index + 1}</span>
                <Avatar className="w-9 h-9 shrink-0">
                  <AvatarFallback className="text-xs font-bold">
                    {membro.iniciais}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-semibold text-foreground">{membro.nome}</p>
                  <p className="text-xs text-muted-foreground">{membro.cargo}</p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="flex items-center gap-3">
                  {membro.notas.map((nota, i) => (
                    <div key={i} className="flex flex-col items-center gap-0.5">
                      <Diamond className="w-2.5 h-2.5 text-muted-foreground/40" />
                      <span className={cn("text-xs font-medium", getNotaVariant(nota))}>{nota}</span>
                    </div>
                  ))}
                </div>

                <Badge
                  variant="outline"
                  className={cn("w-12 justify-center font-bold", getNotaVariant(membro.media))}
                >
                  {membro.media}
                </Badge>

                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => removerMembro(membro.id)}
                  className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  aria-label={`Remover ${membro.nome}`}
                >
                  <X size={14} />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}