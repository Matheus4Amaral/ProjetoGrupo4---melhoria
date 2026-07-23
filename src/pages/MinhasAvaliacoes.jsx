import { useCallback, useEffect, useState } from "react";
import { ChevronDown, ChevronUp, MessageSquare, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatAverage, getClosedResult, listClosedResults } from "@/services/resultsService";

function formatPeriod(cycle) {
  const fmt = new Intl.DateTimeFormat("pt-BR");
  return `${fmt.format(new Date(`${cycle.dataInicio}T12:00:00`))} – ${fmt.format(new Date(cycle.dataLimite))}`;
}

export default function MinhasAvaliacoes() {
  const [cycles, setCycles] = useState([]);
  const [opened, setOpened] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => { setLoading(true); setError(""); try { setCycles(await listClosedResults()); } catch (err) { setError(err.message); } finally { setLoading(false); } }, []);
  useEffect(() => { load(); }, [load]);

  const toggle = async (id) => {
    if (opened === id) { setOpened(null); setResult(null); return; }
    setOpened(id); setResult(null); setDetailLoading(true); setError("");
    try { setResult(await getClosedResult(id)); } catch (err) { setError(err.message); }
    finally { setDetailLoading(false); }
  };

  return <div className="mx-auto max-w-5xl space-y-6 pb-12">
    <div><h1 className="text-2xl font-bold">Meus resultados</h1><p className="mt-1 text-sm text-muted-foreground">Consulte os ciclos encerrados e seus feedbacks anônimos.</p></div>
    {error && <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive" role="alert"><span>{error}</span><Button size="sm" variant="outline" onClick={load}><RefreshCcw size={14}/> Tentar novamente</Button></div>}
    {loading ? <div className="py-16 text-center text-sm text-muted-foreground" role="status">Carregando resultados...</div> : cycles.length === 0 ? <Card><CardContent className="flex flex-col items-center py-16 text-center"><MessageSquare className="mb-3 h-10 w-10 text-muted-foreground"/><p className="font-medium">Nenhum resultado disponível</p><p className="text-sm text-muted-foreground">Seus resultados aparecerão aqui quando um ciclo for encerrado.</p></CardContent></Card> : <div className="space-y-3">{cycles.map((cycle) => <Card key={cycle.id}><button className="flex w-full items-center justify-between gap-4 rounded-xl p-5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" onClick={() => toggle(cycle.id)} aria-expanded={opened === cycle.id}><span><strong className="block">{cycle.nome}</strong><span className="text-sm text-muted-foreground">{formatPeriod(cycle)}</span></span>{opened === cycle.id ? <ChevronUp/> : <ChevronDown/>}</button>{opened === cycle.id && <CardContent className="border-t pt-5">{detailLoading ? <p className="py-8 text-center text-sm text-muted-foreground">Carregando relatório...</p> : result && <div className="space-y-6"><div className="grid gap-4 sm:grid-cols-2"><Card><CardHeader><CardTitle className="text-sm">Como você se avaliou</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold text-primary">{formatAverage(result.mediaAutoavaliacao)}</p></CardContent></Card><Card><CardHeader><CardTitle className="text-sm">Média de como avaliaram você</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold text-primary">{formatAverage(result.mediaExterna)}</p></CardContent></Card></div><section aria-labelledby={`feedback-${cycle.id}`}><h2 id={`feedback-${cycle.id}`} className="mb-3 font-semibold">Contribuições anônimas</h2>{result.feedbacks.length === 0 ? <p className="text-sm text-muted-foreground">Nenhum feedback textual foi enviado.</p> : <div className="grid gap-3 md:grid-cols-2">{result.feedbacks.map((feedback, index) => <article key={index} className="rounded-lg border bg-muted/20 p-4"><div className="mb-3 flex items-center gap-2 font-medium"><MessageSquare className="h-4 w-4 text-primary"/> Feedback anônimo</div>{feedback.pontosFortes && <div className="mb-3"><h3 className="text-xs font-bold uppercase text-muted-foreground">Pontos fortes</h3><p className="mt-1 whitespace-pre-wrap text-sm">{feedback.pontosFortes}</p></div>}{feedback.pontosMelhoria && <div><h3 className="text-xs font-bold uppercase text-muted-foreground">Pontos de melhoria</h3><p className="mt-1 whitespace-pre-wrap text-sm">{feedback.pontosMelhoria}</p></div>}</article>)}</div>}</section></div>}</CardContent>}</Card>)}</div>}
  </div>;
}
