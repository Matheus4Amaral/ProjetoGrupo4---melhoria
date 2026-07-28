import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function FeedbackChart() {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchChartData() {
      try {
        setLoading(true);

        // Busca a data de criação das avaliações concluídas
        const { data, error } = await supabase
          .from("atribuicoes_avaliacao")
          .select("criado_em")
          .eq("status", "completed");

        if (error) {
          console.error("Erro ao buscar atribuições de avaliação:", error);
          return;
        }

        const meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
        const contagemPorMes = {};

        // Agrupa os registros por mês
        data.forEach((item) => {
          const dataCriacao = new Date(item.criado_em);
          const nomeMes = meses[dataCriacao.getMonth()];
          contagemPorMes[nomeMes] = (contagemPorMes[nomeMes] || 0) + 1;
        });

        // Formata os dados no padrão aceito pelo Recharts
        const dadosFormatados = meses.map((mes) => ({
          mes,
          feedbacks: contagemPorMes[mes] || 0,
        }));

        setChartData(dadosFormatados);
      } catch (err) {
        console.error("Erro inesperado:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchChartData();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 text-muted-foreground">
          Carregando dados de avaliação...
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Evolução dos Feedbacks</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey="mes" className="text-muted-foreground" />
            <YAxis className="text-muted-foreground" />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius)",
                color: "var(--foreground)",
              }}
            />
            <Line
              type="monotone"
              dataKey="feedbacks"
              stroke="var(--primary)"
              strokeWidth={2.5}
              dot={{ fill: "var(--primary)", strokeWidth: 0, r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export default FeedbackChart;