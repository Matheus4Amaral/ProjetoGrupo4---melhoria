import { useCallback, useEffect, useState } from "react";
import { BarChart3, RefreshCcw } from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { listCycles } from "@/services/cyclesService";

const STATUS_CONFIG = {
  rascunho: { label: "Rascunho", dot: "bg-emerald-500", text: "text-emerald-600" },
  aberto: { label: "Aberto", dot: "bg-blue-500", text: "text-blue-600" },
  encerrado: { label: "Encerrado", dot: "bg-muted-foreground", text: "text-muted-foreground" },
};

function CycleStatus({ status }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.rascunho;
  return (
    <span className={`flex items-center gap-1.5 text-sm font-medium ${config.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} aria-hidden="true" />
      {config.label}
    </span>
  );
}

function CycleProgress({ cycle, compact = false }) {
  if (cycle.progresso === null) {
    return <span className="text-muted-foreground">—</span>;
  }

  return (
    <div className="flex items-center gap-2">
      <Progress
        value={cycle.progresso}
        className={compact ? "h-1.5 flex-1" : "h-1.5 w-24"}
        aria-label={`${cycle.atribuicoesConcluidas} de ${cycle.totalAtribuicoes} avaliações concluídas`}
      />
      <span className="w-9 text-right text-xs text-muted-foreground">{cycle.progresso}%</span>
    </div>
  );
}

export default function Reports() {
  const [cycles, setCycles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setCycles(await listCycles());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openCycles = cycles.filter((cycle) => cycle.status === "aberto");
  const closedCycles = cycles.filter((cycle) => cycle.status === "encerrado");
  const cyclesWithProgress = openCycles.filter((cycle) => cycle.progresso !== null);
  const averageProgress = cyclesWithProgress.length > 0
    ? Math.round(
        cyclesWithProgress.reduce((sum, cycle) => sum + cycle.progresso, 0) / cyclesWithProgress.length,
      )
    : null;

  return (
    <div className="max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Relatórios</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Acompanhe o andamento e a participação dos ciclos de avaliação.
        </p>
      </div>

      {error ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-8 text-center" role="alert">
          <p className="font-medium text-foreground">Não foi possível carregar os relatórios</p>
          <p className="mt-1 text-sm text-destructive">{error}</p>
          <Button variant="outline" className="mt-4 gap-2" onClick={load}>
            <RefreshCcw size={16} /> Tentar novamente
          </Button>
        </div>
      ) : loading ? (
        <div className="rounded-lg border border-border p-8 text-center text-sm text-muted-foreground" role="status">
          Carregando relatórios...
        </div>
      ) : cycles.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-16 text-center">
            <BarChart3 className="mb-3 h-10 w-10 text-muted-foreground" />
            <p className="font-medium">Nenhum ciclo cadastrado ainda</p>
            <p className="text-sm text-muted-foreground">
              Os relatórios aparecerão aqui assim que o primeiro ciclo for criado.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard
              icon={<BarChart3 size={22} />}
              title="Ciclos cadastrados"
              value={String(cycles.length)}
              description="No total"
              color="blue"
            />
            <StatCard
              icon={<BarChart3 size={22} />}
              title="Ciclos em andamento"
              value={String(openCycles.length)}
              description="Aceitando respostas"
              color="green"
            />
            <StatCard
              icon={<BarChart3 size={22} />}
              title="Conclusão média"
              value={averageProgress !== null ? `${averageProgress}%` : "—"}
              description={openCycles.length > 0 ? "Nos ciclos abertos" : "Nenhum ciclo aberto"}
              color="yellow"
            />
          </div>

          <div>
            <h2 className="mb-3 font-semibold text-foreground">Progresso por ciclo</h2>

            <div className="grid gap-4 md:hidden">
              {cycles.map((cycle) => (
                <Card key={cycle.id}>
                  <CardContent className="space-y-3 p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h4 className="font-medium text-foreground">{cycle.nome}</h4>
                        <p className="text-xs text-muted-foreground">{cycle.periodo}</p>
                      </div>
                      <CycleStatus status={cycle.status} />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {cycle.template} · {cycle.times.length} {cycle.times.length === 1 ? "time" : "times"}
                    </p>
                    <CycleProgress cycle={cycle} compact />
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="hidden overflow-hidden rounded-lg border bg-card md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ciclo</TableHead>
                    <TableHead>Template</TableHead>
                    <TableHead>Times</TableHead>
                    <TableHead>Período</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Progresso</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cycles.map((cycle) => (
                    <TableRow key={cycle.id}>
                      <TableCell className="font-medium">{cycle.nome}</TableCell>
                      <TableCell className="text-muted-foreground">{cycle.template}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {cycle.times.length === 0
                          ? "—"
                          : cycle.times.map((team) => team.nome).join(", ")}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{cycle.periodo}</TableCell>
                      <TableCell><CycleStatus status={cycle.status} /></TableCell>
                      <TableCell><CycleProgress cycle={cycle} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {closedCycles.length > 0 && (
            <p className="text-xs text-muted-foreground">
              {closedCycles.length} {closedCycles.length === 1 ? "ciclo encerrado" : "ciclos encerrados"} no
              histórico. Os resultados individuais consolidados ficam disponíveis em "Meus resultados" para cada
              colaborador.
            </p>
          )}
        </>
      )}
    </div>
  );
}