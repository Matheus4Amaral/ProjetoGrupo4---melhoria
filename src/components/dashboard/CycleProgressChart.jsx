import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { BarChart3 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const STATUS_FILL = {
  active: "var(--chart-1)",
  closed: "var(--chart-4)",
};

function ChartTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;

  const cycle = payload[0].payload;

  return (
    <div className="rounded-lg border border-border bg-card p-3 text-sm shadow-md">
      <p className="font-medium text-card-foreground">{cycle.nome}</p>
      <p className="mt-1 text-muted-foreground">
        {cycle.atribuicoesConcluidas} de {cycle.totalAtribuicoes} avaliações concluídas
      </p>
      <p className="text-muted-foreground">{cycle.periodo}</p>
    </div>
  );
}

export default function CycleProgressChart({ cycles = [], loading = false }) {
  // Ciclos em rascunho ainda não geraram atribuições, logo não têm progresso.
  const data = cycles
    .filter((cycle) => cycle.progresso !== null)
    .slice(0, 8)
    .map((cycle) => ({
      nome: cycle.nome,
      curto: cycle.nome.length > 18 ? `${cycle.nome.slice(0, 17)}…` : cycle.nome,
      progresso: cycle.progresso,
      status: cycle.statusBanco,
      periodo: cycle.periodo,
      totalAtribuicoes: cycle.totalAtribuicoes,
      atribuicoesConcluidas: cycle.atribuicoesConcluidas,
    }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Progresso por ciclo</CardTitle>
        <CardDescription>
          Percentual de avaliações concluídas nos ciclos que já geraram atribuições.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-[300px] w-full" />
        ) : data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <BarChart3 className="mb-3 h-10 w-10 text-muted-foreground/50" />
            <p className="font-medium text-foreground">Nenhum ciclo com avaliações geradas</p>
            <p className="mt-1 text-sm text-muted-foreground">
              O progresso aparece aqui assim que um ciclo for aberto.
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data} margin={{ top: 8, right: 8, bottom: 8, left: -16 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
              <XAxis dataKey="curto" tick={{ fontSize: 12 }} className="text-muted-foreground" />
              <YAxis
                domain={[0, 100]}
                tickFormatter={(value) => `${value}%`}
                tick={{ fontSize: 12 }}
                className="text-muted-foreground"
              />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: "var(--muted)", opacity: 0.4 }} />
              <Bar dataKey="progresso" radius={[4, 4, 0, 0]} maxBarSize={64}>
                {data.map((cycle) => (
                  <Cell key={cycle.nome} fill={STATUS_FILL[cycle.status] || "var(--chart-1)"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
