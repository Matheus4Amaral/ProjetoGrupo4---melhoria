import { useCallback, useEffect, useMemo, useState } from "react";
import { LockKeyhole, Plus, RefreshCcw, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import CicloModal from "@/components/CicloModal";
import {
  generateCycleAssignments,
  closeCycle,
  listCycleOptions,
  listCycles,
  saveCycle,
} from "@/services/cyclesService";

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

export default function Ciclos() {
  const [cycles, setCycles] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [teams, setTeams] = useState([]);
  const [activeTab, setActiveTab] = useState("todos");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCycle, setSelectedCycle] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [cycleToGenerate, setCycleToGenerate] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [generationError, setGenerationError] = useState("");
  const [cycleToClose, setCycleToClose] = useState(null);
  const [closing, setClosing] = useState(false);
  const [closeError, setCloseError] = useState("");

  const refreshCycles = useCallback(async () => {
    const data = await listCycles();
    setCycles(data);
    return data;
  }, []);

  useEffect(() => {
    let ignore = false;

    Promise.all([listCycles(), listCycleOptions()])
      .then(([cycleData, options]) => {
        if (ignore) return;
        setCycles(cycleData);
        setTemplates(options.templates);
        setTeams(options.teams);
      })
      .catch((error) => {
        if (!ignore) setLoadError(error.message);
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [reloadKey]);

  const counts = useMemo(() => ({
    todos: cycles.length,
    rascunho: cycles.filter((cycle) => cycle.status === "rascunho").length,
    aberto: cycles.filter((cycle) => cycle.status === "aberto").length,
    encerrado: cycles.filter((cycle) => cycle.status === "encerrado").length,
  }), [cycles]);

  const filteredCycles = activeTab === "todos"
    ? cycles
    : cycles.filter((cycle) => cycle.status === activeTab);

  const openNewCycle = () => {
    setSelectedCycle(null);
    setSaveError("");
    setModalOpen(true);
  };

  const retryLoading = () => {
    setLoading(true);
    setLoadError("");
    setReloadKey((value) => value + 1);
  };

  const openCycleConfiguration = (cycle) => {
    setSelectedCycle(cycle);
    setSaveError("");
    setModalOpen(true);
  };

  const handleSave = async (values, cycleId) => {
    setSaving(true);
    setSaveError("");
    try {
      await saveCycle(values, cycleId);
      await refreshCycles();
      setModalOpen(false);
      setSelectedCycle(null);
    } catch (error) {
      setSaveError(error.message);
    } finally {
      setSaving(false);
    }
  };

  const requestGeneration = (cycle) => {
    setModalOpen(false);
    setGenerationError("");
    setCycleToGenerate(cycle);
  };

  const closeGenerationDialog = () => {
    if (generating) return;
    setCycleToGenerate(null);
    setGenerationError("");
  };

  const handleGenerate = async () => {
    if (!cycleToGenerate || generating) return;
    setGenerating(true);
    setGenerationError("");
    try {
      await generateCycleAssignments(cycleToGenerate.id);
      await refreshCycles();
      setCycleToGenerate(null);
    } catch (error) {
      setGenerationError(error.message);
    } finally {
      setGenerating(false);
    }
  };

  const handleCloseCycle = async () => {
    if (!cycleToClose || closing) return;
    setClosing(true);
    setCloseError("");
    try {
      await closeCycle(cycleToClose.id);
      await refreshCycles();
      setCycleToClose(null);
    } catch (error) {
      setCloseError(error.message);
    } finally {
      setClosing(false);
    }
  };

  return (
    <div className="max-w-6xl space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Ciclos de Avaliação</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Configure o período e os times, gere as atribuições e acompanhe o progresso.
          </p>
        </div>
        <Button onClick={openNewCycle} className="gap-2" disabled={loading || Boolean(loadError)}>
          <Plus size={16} /> Novo ciclo
        </Button>
      </div>

      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0 sm:pb-0">
        {["todos", "rascunho", "aberto", "encerrado"].map((tab) => (
          <Button
            key={tab}
            variant={activeTab === tab ? "default" : "outline"}
            className={activeTab === tab ? "border-primary bg-primary/10 text-primary hover:bg-primary/20" : "text-muted-foreground"}
            onClick={() => setActiveTab(tab)}
          >
            {tab === "todos" ? `Todos (${counts.todos})` : `${STATUS_CONFIG[tab].label} (${counts[tab]})`}
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="rounded-lg border border-border p-8 text-center text-sm text-muted-foreground" role="status">
          Carregando ciclos...
        </div>
      ) : loadError ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-8 text-center" role="alert">
          <p className="font-medium text-foreground">Não foi possível carregar os ciclos</p>
          <p className="mt-1 text-sm text-destructive">{loadError}</p>
          <Button variant="outline" className="mt-4 gap-2" onClick={retryLoading}>
            <RefreshCcw size={16} /> Tentar novamente
          </Button>
        </div>
      ) : filteredCycles.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed bg-muted/20 p-12">
          <Settings className="mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="text-lg font-medium text-foreground">Nenhum ciclo encontrado</h3>
          <p className="mb-4 text-center text-sm text-muted-foreground">
            {cycles.length === 0
              ? "Crie o primeiro ciclo para iniciar uma rodada de avaliações."
              : "Não há ciclos correspondentes ao filtro selecionado."}
          </p>
          {activeTab !== "todos" ? (
            <Button variant="outline" onClick={() => setActiveTab("todos")}>Limpar filtros</Button>
          ) : (
            <Button onClick={openNewCycle}>Criar ciclo</Button>
          )}
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:hidden">
            {filteredCycles.map((cycle) => (
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
                  <div className="flex justify-end gap-2 pt-2">
                    {cycle.status === "aberto" && (
                      <Button variant="outline" size="sm" className="gap-1" onClick={() => { setCloseError(""); setCycleToClose(cycle); }}>
                        <LockKeyhole size={14} /> Encerrar
                      </Button>
                    )}
                    <Button
                      variant="link"
                      size="sm"
                      className="h-auto p-0 text-primary"
                      onClick={cycle.status === "rascunho" ? () => openCycleConfiguration(cycle) : undefined}
                    >
                      {cycle.status === "rascunho" ? "Configurar" : cycle.status === "aberto" ? "Ver progresso" : "Ver resultados"}
                    </Button>
                  </div>
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
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCycles.map((cycle) => (
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
                    <TableCell className="space-x-2 text-right">
                      {cycle.status === "aberto" && (
                        <Button variant="outline" size="sm" className="gap-1" onClick={() => { setCloseError(""); setCycleToClose(cycle); }}>
                          <LockKeyhole size={14} /> Encerrar
                        </Button>
                      )}
                      <Button
                        variant="link"
                        size="sm"
                        className="h-auto p-0 text-primary"
                        onClick={cycle.status === "rascunho" ? () => openCycleConfiguration(cycle) : undefined}
                      >
                        {cycle.status === "rascunho" ? "Configurar" : cycle.status === "aberto" ? "Ver progresso" : "Ver resultados"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}

      <CicloModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        cycle={selectedCycle}
        templates={templates}
        teams={teams}
        loadingOptions={loading}
        saving={saving}
        error={saveError}
        onSave={handleSave}
        onGenerate={requestGeneration}
      />

      <Dialog open={Boolean(cycleToGenerate)} onOpenChange={(open) => !open && closeGenerationDialog()}>
        <DialogContent className="sm:max-w-md" onClose={closeGenerationDialog}>
          <DialogHeader>
            <DialogTitle>Gerar avaliações?</DialogTitle>
            <DialogDescription>
              Esta ação abrirá o ciclo e congelará participantes, times e relações hierárquicas. A configuração não poderá ser alterada depois.
            </DialogDescription>
          </DialogHeader>

          {cycleToGenerate && (
            <div className="rounded-lg border border-border bg-muted/30 p-3 text-sm">
              <p className="font-medium text-foreground">{cycleToGenerate.nome}</p>
              <p className="mt-1 text-muted-foreground">
                {cycleToGenerate.times.map((team) => team.nome).join(", ")}
              </p>
            </div>
          )}

          {generationError && (
            <p className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive" role="alert">
              {generationError}
            </p>
          )}

          <DialogFooter>
            <Button variant="outline" disabled={generating} onClick={closeGenerationDialog}>Cancelar</Button>
            <Button disabled={generating} onClick={handleGenerate}>
              {generating ? "Gerando avaliações..." : "Confirmar e abrir ciclo"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(cycleToClose)} onOpenChange={(open) => !open && !closing && setCycleToClose(null)}>
        <DialogContent className="sm:max-w-md" onClose={() => !closing && setCycleToClose(null)}>
          <DialogHeader>
            <DialogTitle>Encerrar ciclo antecipadamente?</DialogTitle>
            <DialogDescription>
              Novas submissões serão bloqueadas e os resultados serão liberados imediatamente. Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          {cycleToClose && <div className="rounded-lg border bg-muted/30 p-3 text-sm font-medium">{cycleToClose.nome}</div>}
          {closeError && <p className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive" role="alert">{closeError}</p>}
          <DialogFooter>
            <Button variant="outline" disabled={closing} onClick={() => setCycleToClose(null)}>Cancelar</Button>
            <Button variant="destructive" disabled={closing} onClick={handleCloseCycle}>{closing ? "Encerrando..." : "Confirmar encerramento"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
