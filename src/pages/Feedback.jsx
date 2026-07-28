import { useState, useEffect } from "react";
import { Plus, Diamond, Target, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { getTeamFeedbackBase } from "@/services/resultsService";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";

// Dados mockados — futuramente virão do Supabase

const RESUMO_MOCK_RESTANTE = {
  comparacao: "Comparação com ciclo anterior em breve",
  deficit: { nome: "Em cálculo", media: "-" },
  destaque: { iniciais: "--", nome: "Em cálculo", nota: "-" },
  atencao: { iniciais: "--", nome: "Em cálculo", nota: "-" },
};

function getNotaVariant(nota) {
  if (nota >= 4) return "text-chart-5";
  if (nota >= 3.5) return "text-chart-4";
  return "text-destructive";
}

export default function Feedback() {
  const navigate = useNavigate();

  const [cycles, setCycles] = useState([]);
  const [teams, setTeams] = useState([]);
  const [selectedCycleId, setSelectedCycleId] = useState("");
  const [selectedTeamId, setSelectedTeamId] = useState("");
  const { cycleId, teamId } = useParams();
  const [resumo, setResumo] = useState({ mediaGeral: null });
  const [criterios, setCriterios] = useState([]);
  const [membros, setMembros] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [selectedCycleName, setSelectedCycleName] = useState("");
  const [selectedTeamName, setSelectedTeamName] = useState("");

  useEffect(() => {
    if (!cycleId || !teamId) {
      setSelectedCycleName("");
      setSelectedTeamName("");
      return;
    }

    let isMounted = true;

    async function loadHeaderInfo() {
      try {
        const [cycleResponse, teamResponse] = await Promise.all([
          supabase
            .from("ciclos_avaliacao")
            .select("nome")
            .eq("id", cycleId)
            .maybeSingle(),
          supabase
            .from("times")
            .select("nome")
            .eq("id", teamId)
            .maybeSingle(),
        ]);

        const { data: cycleData, error: cycleError } = cycleResponse;
        const { data: teamData, error: teamError } = teamResponse;

        if (cycleError) throw cycleError;
        if (teamError) throw teamError;

        if (!isMounted) return;

        setSelectedCycleName(cycleData?.nome || "");
        setSelectedTeamName(teamData?.nome || "");
      } catch (error) {
        if (!isMounted) return;

        console.error("Erro ao carregar nomes do cabeçalho:", error);
        setSelectedCycleName("");
        setSelectedTeamName("");
      }
    }

    loadHeaderInfo();

    return () => {
      isMounted = false;
    };
  }, [cycleId, teamId]);

  useEffect(() => {
    if (cycleId && teamId) return;

    let isMounted = true;

    async function loadOptions() {
        try {
          setIsLoading(true);
          setLoadError("");

          const cyclesResponse = await supabase
            .from("ciclos_avaliacao")
            .select("id, nome")
            .order("nome");

          const teamsResponse = await supabase
            .from("times")
            .select("id, nome")
            .order("nome");

          const { data: cyclesData, error: cyclesError } = cyclesResponse;
          const { data: teamsData, error: teamsError } = teamsResponse;

          if (cyclesError) {
            console.error("Erro ao buscar ciclos:", cyclesError);
            throw cyclesError;
          }

          if (teamsError) {
            console.error("Erro ao buscar times:", teamsError);
            throw teamsError;
          }

          if (!isMounted) return;

          setCycles(cyclesData || []);
          setTeams(teamsData || []);
        } catch (error) {
          console.error("loadOptions error:", error);

          if (isMounted) {
            setLoadError(error.message || "Não foi possível carregar ciclos e times.");
          }
        } finally {
          if (isMounted) {
            setIsLoading(false);
          }
        }
      }

    loadOptions();

    return () => {
      isMounted = false;
    };
  }, [cycleId, teamId]);


  useEffect(() => {
    if (!cycleId || !teamId) {
      setResumo({ mediaGeral: null });
      setCriterios([]);
      setMembros([]);
      setLoadError("");
      setIsLoading(false);
      return;
    }
    let isMounted = true;

    async function loadFeedback() {
      try {
        setIsLoading(true);
        setLoadError("");

        const data = await getTeamFeedbackBase(cycleId, teamId);

        if (!isMounted) return;

        setResumo(data?.resumo ?? { mediaGeral: null });
        setCriterios(Array.isArray(data?.criterios) ? data.criterios : []);
        setMembros(Array.isArray(data?.membros) ? data.membros : []);
      } catch (error) {
        if (isMounted) {
          setLoadError(error.message || "Não foi possível carregar o feedback.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadFeedback();

    return () => {
      isMounted = false;
    };
  }, [cycleId, teamId]);

  function removerMembro(id) {
    setMembros((prev) => prev.filter((m) => m.id !== id));
  }

  const criterioComMaiorDeficit =
    criterios.length > 0
      ? [...criterios].sort((a, b) => Number(a.nota ?? 0) - Number(b.nota ?? 0))[0]
      : null;

  const membroDestaque =
    membros.length > 0
      ? [...membros].sort((a, b) => Number(b.media ?? 0) - Number(a.media ?? 0))[0]
      : null;

  const membroAtencao =
    membros.length > 0
      ? [...membros].sort((a, b) => Number(a.media ?? 0) - Number(b.media ?? 0))[0]
      : null;
  
  const criterioMaisForte =
    criterios.length > 0
      ? [...criterios].sort((a, b) => Number(b.nota ?? 0) - Number(a.nota ?? 0))[0]
      : null;

  if (isLoading) {
    return (
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-foreground">Equipe</h1>
        <p className="text-sm text-muted-foreground">Carregando feedback da equipe...</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
        {loadError}
      </div>
    );
  }

  if (!cycleId || !teamId) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Feedbacks</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Selecione um ciclo e um time para visualizar o feedback da equipe.
          </p>
        </div>

        <Card>
          <CardContent className="grid gap-4 p-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Ciclo</label>
              <select
                value={selectedCycleId}
                onChange={(e) => setSelectedCycleId(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Selecione um ciclo</option>
                {cycles.map((cycle) => (
                  <option key={cycle.id} value={cycle.id}>
                    {cycle.nome}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Time</label>
              <select
                value={selectedTeamId}
                onChange={(e) => setSelectedTeamId(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Selecione um time</option>
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.nome}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2 flex justify-end">
              <Button
                onClick={() => navigate(`/feedback/${selectedCycleId}/${selectedTeamId}`)}
                disabled={!selectedCycleId || !selectedTeamId}
              >
                Visualizar feedback
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Cabeçalho */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-1">
            {selectedCycleName || "Ciclo"}
          </p>
          <h1 className="text-2xl font-bold text-foreground">{selectedTeamName || "Equipe"}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {membros.length} colaboradores cadastrados
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/feedback")}
          >
            Trocar ciclo e time
          </Button>
          <Button>
            <Plus size={16} />
            Adicionar Colaborador
          </Button>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <Card className="border-t-2 border-t-primary">
          <CardContent className="p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Média Geral
            </p>
            <p className="text-4xl font-bold text-primary">{resumo.mediaGeral ?? "-"}</p>
            <p className="text-xs text-muted-foreground mt-1">{RESUMO_MOCK_RESTANTE.comparacao}</p>
          </CardContent>
        </Card>

        <Card className="border-t-2 border-t-destructive">
          <CardContent className="p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Déficit da Equipe
            </p>
            <p className="text-xl font-semibold text-destructive">{criterioComMaiorDeficit?.nome ?? "Em cálculo"}</p>
            <p className="text-xs text-muted-foreground mt-1">média {criterioComMaiorDeficit?.nota ?? "-"}</p>
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
                  {membroDestaque?.iniciais ?? "--"}
                </AvatarFallback>
              </Avatar>
              <p className="text-sm font-medium text-foreground">{membroDestaque?.nome ?? "Em cálculo"}</p>
            </div>
            <p className="text-4xl font-bold text-chart-5">{membroDestaque?.media ?? "-"}</p>
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
                  {membroAtencao?.iniciais ?? "--"}
                </AvatarFallback>
              </Avatar>
              <p className="text-sm font-medium text-foreground">{membroAtencao?.nome ?? "Em cálculo"}</p>
            </div>
            <p className="text-4xl font-bold text-chart-4">{membroAtencao?.media ?? "-"}</p>
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
                  <h3 className="text-sm font-bold text-foreground">{criterioComMaiorDeficit?.nome ?? "Em cálculo"}</h3>
                </div>
                <span className="text-sm font-bold text-chart-4">{criterioComMaiorDeficit?.nota ?? "-"}</span>
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
                  <h3 className="text-sm font-bold text-foreground">{criterioMaisForte?.nome ?? "Em cálculo"}</h3>
                </div>
                <span className="text-sm font-bold text-primary">{criterioMaisForte?.nota ?? "-"}</span>
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
                  {(membro.notas || []).map((nota, i) => (
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