import { useState, useEffect } from "react";
import { Users, MessageSquare, Star, ClipboardList } from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";
import FeedbackChart from "@/components/dashboard/FeedbackChart";
import { supabase } from "@/lib/supabaseClient";

function Dashboard() {
  const [stats, setStats] = useState({
    colaboradores: 0,
    feedbacks: 0,
    mediaGeral: "0.0",
    pendentes: 0,
  });
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardStats() {
      try {
        setLoading(true);

        const { count: totalColaboradores, error: errColab } = await supabase
          .from("perfis")
          .select("*", { count: "exact", head: true });

        if (errColab) console.error("Erro ao buscar colaboradores:", errColab);

        const { count: totalFeedbacks, error: errFeedbacks } = await supabase
          .from("atribuicoes_avaliacao")
          .select("*", { count: "exact", head: true })
          .eq("status", "completed");

        if (errFeedbacks) console.error("Erro ao buscar feedbacks:", errFeedbacks);

        const { count: totalPendentes, error: errPendentes } = await supabase
          .from("atribuicoes_avaliacao")
          .select("*", { count: "exact", head: true })
          .eq("status", "pending");

        if (errPendentes) console.error("Erro ao buscar pendentes:", errPendentes);

        const { data: notasData, error: errNotas } = await supabase
          .from("respostas_avaliacao")
          .select("nota");

        let mediaCalculada = "0.0";
        if (notasData && notasData.length > 0) {
          const somaNotas = notasData.reduce((acc, curr) => acc + curr.nota, 0);
          mediaCalculada = (somaNotas / notasData.length).toFixed(1);
        }

        if (errNotas) console.error("Erro ao calcular média:", errNotas);

        setStats({
          colaboradores: totalColaboradores || 0,
          feedbacks: totalFeedbacks || 0,
          mediaGeral: mediaCalculada,
          pendentes: totalPendentes || 0,
        });

      } catch (error) {
        console.error("Erro ao carregar dados do Dashboard:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardStats();
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Acompanhe os indicadores do Feedback 360°
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          icon={<Users size={22} />}
          title="Colaboradores"
          value={loading ? "..." : String(stats.colaboradores)}
          description="Usuários cadastrados"
          color="blue"
        />
        <StatCard
          icon={<MessageSquare size={22} />}
          title="Feedbacks"
          value={loading ? "..." : String(stats.feedbacks)}
          description="Avaliações realizadas"
          color="green"
        />
        <StatCard
          icon={<Star size={22} />}
          title="Média Geral"
          value={loading ? "..." : stats.mediaGeral}
          description="De 5 pontos"
          color="yellow"
        />
        <StatCard
          icon={<ClipboardList size={22} />}
          title="Pendentes"
          value={loading ? "..." : String(stats.pendentes)}
          description="Aguardando resposta"
          color="red"
        />
      </div>

      <FeedbackChart />
    </div>
  );
}

export default Dashboard;