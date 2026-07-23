import { useState } from "react";
import { Plus, Diamond, Target, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

// Dados mockados — futuramente virão do Supabase
const RESUMO_CARDS = {
  mediaGeral: 4.2,
  comparacao: "↑ 0.3 vs. ciclo anterior",
  deficit: { nome: "Comunicação", media: 4.1 },
  destaque: { iniciais: "RS", nome: "Rafael", nota: 4.6 },
  atencao: { iniciais: "BT", nome: "Bianca", nota: 3.7 },
};

const DESEMPENHO_CRITERIOS = [
  { id: 1, nome: "Qualidade das Entregas", nota: 3.3 },
  { id: 2, nome: "Colaboração", nota: 4.2 },
  { id: 3, nome: "Postura Profissional", nota: 1.1 },
  { id: 4, nome: "Comunicação", nota: 4.1 },
];

const MEMBROS_INICIAIS = [
  { id: 1, iniciais: "JC", nome: "Juliana Costa", cargo: "Designer UX", notas: [3.8, 4.2, 4.5, 3.9], media: 4.1 },
  { id: 2, iniciais: "RS", nome: "Rafael Souza", cargo: "Product Manager", notas: [4.7, 4.6, 4.4, 4.8], media: 4.6 },
  { id: 3, iniciais: "CF", nome: "Carlos Ferreira", cargo: "Desenvolvedor Sênior", notas: [4.2, 4.5, 4.0, 4.1], media: 4.2 },
  { id: 4, iniciais: "ML", nome: "Mariana Lima", cargo: "Analista de Dados", notas: [4.0, 2, 4.3, 4.2], media: 3.6 },
  { id: 5, iniciais: "BT", nome: "Bianca Torres", cargo: "Desenvolvedora Frontend", notas: [3.4, 3.8, 4.1, 3], media: 3.5 },
  { id: 6, iniciais: "PA", nome: "Pedro Alves", cargo: "Engenheiro de Software", notas: [4.3, 4.1, 4.6, 4.2], media: 4.3 },
];

function getNotaVariant(nota) {
  if (nota >= 4) return "text-chart-5";
  if (nota >= 3.5) return "text-chart-4";
  return "text-destructive";
}

export default function Feedback() {
  const [membros, setMembros] = useState(MEMBROS_INICIAIS);

  function removerMembro(id) {
    setMembros((prev) => prev.filter((m) => m.id !== id));
  }

  return (
    <div className="space-y-8">
      {/* Cabeçalho */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-1">
            Ciclo Q3 — Julho 2026
          </p>
          <h1 className="text-2xl font-bold text-foreground">Equipe</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {membros.length} colaboradores cadastrados
          </p>
        </div>
        <Button>
          <Plus size={16} />
          Adicionar Colaborador
        </Button>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <Card className="border-t-2 border-t-primary">
          <CardContent className="p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Média Geral
            </p>
            <p className="text-4xl font-bold text-primary">{RESUMO_CARDS.mediaGeral}</p>
            <p className="text-xs text-muted-foreground mt-1">{RESUMO_CARDS.comparacao}</p>
          </CardContent>
        </Card>

        <Card className="border-t-2 border-t-destructive">
          <CardContent className="p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Déficit da Equipe
            </p>
            <p className="text-xl font-semibold text-destructive">{RESUMO_CARDS.deficit.nome}</p>
            <p className="text-xs text-muted-foreground mt-1">média {RESUMO_CARDS.deficit.media}</p>
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
                  {RESUMO_CARDS.destaque.iniciais}
                </AvatarFallback>
              </Avatar>
              <p className="text-sm font-medium text-foreground">{RESUMO_CARDS.destaque.nome}</p>
            </div>
            <p className="text-4xl font-bold text-chart-5">{RESUMO_CARDS.destaque.nota}</p>
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
                  {RESUMO_CARDS.atencao.iniciais}
                </AvatarFallback>
              </Avatar>
              <p className="text-sm font-medium text-foreground">{RESUMO_CARDS.atencao.nome}</p>
            </div>
            <p className="text-4xl font-bold text-chart-4">{RESUMO_CARDS.atencao.nota}</p>
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
            {DESEMPENHO_CRITERIOS.map((criterio) => {
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
                  <h3 className="text-sm font-bold text-foreground">Comunicação</h3>
                </div>
                <span className="text-sm font-bold text-chart-4">4.1</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Recomenda-se sessões de feedback individual e workshops focados nesta competência.
              </p>
            </CardContent>
          </Card>

          <Card className="border-primary/30">
            <CardContent className="p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-2">
                Ponto Forte da Equipe
              </p>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-primary" />
                  <h3 className="text-sm font-bold text-foreground">Qualidade das Entregas</h3>
                </div>
                <span className="text-sm font-bold text-primary">4.3</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Utilize esses colaboradores como referência em mentorias internas.
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
              {/* Esquerda: índice + avatar + info */}
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

              {/* Direita: micro-notas + média + remover */}
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