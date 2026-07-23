import { Users, MessageSquare, Star, ClipboardList } from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";
import FeedbackChart from "@/components/dashboard/FeedbackChart";

function Dashboard() {
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
          value="18"
          description="Usuários cadastrados"
          color="blue"
        />
        <StatCard
          icon={<MessageSquare size={22} />}
          title="Feedbacks"
          value="56"
          description="Avaliações realizadas"
          color="green"
        />
        <StatCard
          icon={<Star size={22} />}
          title="Média Geral"
          value="4.8"
          description="De 5 pontos"
          color="yellow"
        />
        <StatCard
          icon={<ClipboardList size={22} />}
          title="Pendentes"
          value="12"
          description="Aguardando resposta"
          color="red"
        />
      </div>

      <FeedbackChart />
    </div>
  );
}

export default Dashboard;