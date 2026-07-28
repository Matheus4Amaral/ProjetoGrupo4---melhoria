import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";


// const data = [
//   { mes: "Jan", feedbacks: 20 },
//   { mes: "Fev", feedbacks: 35 },
//   { mes: "Mar", feedbacks: 42 },
//   { mes: "Abr", feedbacks: 56 },
//   { mes: "Mai", feedbacks: 68 },
// ];

function FeedbackChart() {

  const [data, setData] = useState([]);

  useEffect(() => {

    async function buscar() {

      const { data, error } = await supabase
        .rpc("feedbacks_por_mes");


      if (error) {
        console.error(error);
        return;
      }


      setData(
        data.map(item => ({
          mes: item.mes,
          feedbacks: Number(item.total)
        }))
      );

    }


    buscar();

  }, []);


  return (
    <Card>
      <CardHeader>
        <CardTitle>Evolução dos Feedbacks</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis
              dataKey="mes"
              tick={{ fontSize: 12 }}
              className="text-muted-foreground"
            />
            <YAxis tick={{ fontSize: 12 }} className="text-muted-foreground" />
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