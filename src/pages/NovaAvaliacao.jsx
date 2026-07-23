import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CheckCircle2, Clock3, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { completeEvaluation, getEvaluationAssignment, listEvaluationCycles, saveEvaluationDraft } from "@/services/evaluationsService";

const NOTES = [1, 2, 3, 4, 5];
const MAX_CHARS = 1000;

function formatDeadline(value) {
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

export default function NovaAvaliacao() {
  const [cycles, setCycles] = useState([]);
  const [assignment, setAssignment] = useState(null);
  const [answers, setAnswers] = useState({});
  const [strengths, setStrengths] = useState("");
  const [improvements, setImprovements] = useState("");
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState("");
  const [saveState, setSaveState] = useState("idle");
  const [finalizing, setFinalizing] = useState(false);
  const saveChain = useRef(Promise.resolve());
  const debounce = useRef(null);

  const loadCycles = useCallback(async () => {
    setLoading(true); setError("");
    try { setCycles(await listEvaluationCycles()); }
    catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadCycles(); }, [loadCycles]);
  useEffect(() => () => clearTimeout(debounce.current), []);

  const openAssignment = async (id) => {
    clearTimeout(debounce.current); setFormLoading(true); setError(""); setSaveState("idle");
    try {
      const data = await getEvaluationAssignment(id);
      setAssignment(data);
      setAnswers(Object.fromEntries((data.perguntas || []).filter((q) => q.nota != null).map((q) => [q.id, q.nota])));
      setStrengths(data.pontosFortes || ""); setImprovements(data.pontosMelhoria || "");
    } catch (err) { setError(err.message); }
    finally { setFormLoading(false); }
  };

  const persistDraft = useCallback((nextAnswers, nextStrengths, nextImprovements) => {
    if (!assignment) return Promise.resolve();
    setSaveState("saving");
    const operation = () => saveEvaluationDraft(assignment.id, nextAnswers, nextStrengths, nextImprovements)
      .then(() => setSaveState("saved"))
      .catch((err) => { setSaveState("error"); setError(err.message); throw err; });
    saveChain.current = saveChain.current.catch(() => undefined).then(operation);
    return saveChain.current;
  }, [assignment]);

  const scheduleSave = (nextAnswers, nextStrengths, nextImprovements) => {
    clearTimeout(debounce.current);
    debounce.current = setTimeout(() => persistDraft(nextAnswers, nextStrengths, nextImprovements), 700);
  };

  const updateAnswer = (id, note) => {
    const next = { ...answers, [id]: note }; setAnswers(next); scheduleSave(next, strengths, improvements);
  };
  const updateStrengths = (value) => { setStrengths(value); scheduleSave(answers, value, improvements); };
  const updateImprovements = (value) => { setImprovements(value); scheduleSave(answers, strengths, value); };

  const answered = Object.keys(answers).length;
  const total = assignment?.perguntas?.length || 0;
  const complete = total > 0 && answered === total && strengths.length <= MAX_CHARS && improvements.length <= MAX_CHARS;

  const finalize = async () => {
    if (!complete || !window.confirm("Finalizar esta avaliação? Depois disso ela não poderá ser editada.")) return;
    clearTimeout(debounce.current); setFinalizing(true); setError("");
    try {
      await saveChain.current.catch(() => undefined);
      await completeEvaluation(assignment.id, answers, strengths, improvements);
      setAssignment(null); setSaveState("idle"); await loadCycles();
    } catch (err) { setError(err.message); }
    finally { setFinalizing(false); }
  };

  const actionable = useMemo(() => cycles.flatMap((cycle) => cycle.atribuicoes.map((item) => ({ ...item, cycle }))), [cycles]);

  if (loading) return <div className="py-16 text-center text-sm text-muted-foreground" role="status">Carregando avaliações...</div>;

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-12">
      <div><h1 className="text-2xl font-bold">Nova avaliação</h1><p className="mt-1 text-sm text-muted-foreground">Preencha suas avaliações pendentes. O rascunho é salvo automaticamente.</p></div>
      {error && <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive" role="alert"><span>{error}</span><Button size="sm" variant="outline" onClick={loadCycles}><RefreshCcw size={14} /> Tentar novamente</Button></div>}

      {cycles.length === 0 ? <Card><CardContent className="flex flex-col items-center py-16 text-center"><CheckCircle2 className="mb-3 h-10 w-10 text-primary"/><p className="font-medium">Nenhuma avaliação acionável</p><p className="text-sm text-muted-foreground">Você concluiu suas avaliações ou não há ciclo ativo no período.</p></CardContent></Card> : (
        <div className="grid gap-4 md:grid-cols-2">
          {cycles.map((cycle) => <Card key={cycle.id} className={!cycle.disponivel ? "opacity-70" : ""}><CardHeader><CardTitle className="text-base">{cycle.nome}</CardTitle><p className="flex items-center gap-1 text-xs text-muted-foreground"><Clock3 size={13}/> Até {formatDeadline(cycle.dataLimite)}</p></CardHeader><CardContent className="space-y-3"><p className="text-sm"><strong>{cycle.pendentesTerceiros}</strong> {cycle.pendentesTerceiros === 1 ? "colaborador" : "colaboradores"} para avaliar</p>{!cycle.disponivel && <p className="text-xs text-destructive">Período encerrado; aguardando fechamento do ciclo.</p>}<div className="flex flex-wrap gap-2">{cycle.atribuicoes.filter((item) => item.autoavaliacao).map((item) => <Button key={item.id} variant="outline" disabled={!cycle.disponivel} onClick={() => openAssignment(item.id)}>Minha autoavaliação</Button>)}{cycle.atribuicoes.filter((item) => !item.autoavaliacao).map((item) => <Button key={item.id} variant="secondary" disabled={!cycle.disponivel} onClick={() => openAssignment(item.id)}>{item.avaliadoNome}</Button>)}</div></CardContent></Card>)}
        </div>
      )}

      {formLoading && <div className="py-10 text-center text-sm text-muted-foreground">Carregando formulário...</div>}
      {assignment && !formLoading && <Card><CardHeader><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-wider text-primary">{assignment.cicloNome}</p><CardTitle>{assignment.autoavaliacao ? "Minha autoavaliação" : assignment.avaliadoNome}</CardTitle></div><span className={cn("text-xs", saveState === "error" ? "text-destructive" : "text-muted-foreground")}>{saveState === "saving" ? "Salvando..." : saveState === "saved" ? "Rascunho salvo" : saveState === "error" ? "Falha ao salvar" : ""}</span></div></CardHeader><CardContent className="space-y-7"><div><div className="mb-2 flex justify-between text-sm"><span>{answered} de {total} competências</span><span>{total ? Math.round(answered / total * 100) : 0}%</span></div><Progress value={total ? answered / total * 100 : 0}/></div>{assignment.perguntas.map((question) => <fieldset key={question.id} className="space-y-3 rounded-lg border p-4"><legend className="px-1 font-semibold">{question.competencia}</legend>{question.descricaoNiveis && <p className="text-sm text-muted-foreground">{question.descricaoNiveis}</p>}<div className="flex flex-wrap gap-2">{NOTES.map((note) => <button type="button" key={note} aria-label={`Nota ${note} em ${question.competencia}`} aria-pressed={answers[question.id] === note} onClick={() => updateAnswer(question.id, note)} className={cn("h-10 w-10 rounded-md border text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", answers[question.id] === note ? "border-primary bg-primary text-primary-foreground" : "hover:bg-muted")}>{note}</button>)}</div></fieldset>)}<div className="grid gap-5 md:grid-cols-2"><label className="space-y-2 text-sm font-medium">Pontos fortes<Textarea value={strengths} maxLength={MAX_CHARS} onChange={(e) => updateStrengths(e.target.value)} rows={5}/><span className="block text-right text-xs text-muted-foreground">{strengths.length}/{MAX_CHARS}</span></label><label className="space-y-2 text-sm font-medium">Pontos de melhoria<Textarea value={improvements} maxLength={MAX_CHARS} onChange={(e) => updateImprovements(e.target.value)} rows={5}/><span className="block text-right text-xs text-muted-foreground">{improvements.length}/{MAX_CHARS}</span></label></div><div className="flex flex-wrap justify-end gap-2"><Button variant="outline" onClick={() => setAssignment(null)}>Voltar</Button><Button disabled={!complete || finalizing || saveState === "saving"} onClick={finalize}>{finalizing ? "Finalizando..." : "Finalizar avaliação"}</Button></div></CardContent></Card>}
      <span className="sr-only">{actionable.length} avaliações acionáveis</span>
    </div>
  );
}
