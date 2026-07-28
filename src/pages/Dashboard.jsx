import { Users, MessageSquare, ClipboardList } from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";
import FeedbackChart from "@/components/dashboard/FeedbackChart";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { listEvaluationCycles } from "@/services/evaluationsService";


function Dashboard() {

  const [totalFeedbacks, setTotalFeedbacks] = useState(0);
  // const [mediaGeral, setMediaGeral] = useState(0);
  const [ciclosAbertos, setCiclosAbertos] = useState(0);
  const [colaboradores, setColaboradores] = useState(0);
  const [pendentes, setPendentes] = useState(0);

  useEffect(() => {

    async function carregarDashboard() {

      const { data: { user } } = await supabase.auth.getUser();

      const { data: perfil } = await supabase
        .from("perfis")
        .select("papel")
        .eq("id", user.id)
        .single();


      
      const feedbackQuery = ["admin", "rh"].includes(perfil?.papel)
        ? supabase
          .from("atribuicoes_avaliacao")
          .select("id", { count: "exact", head: true })
          .eq("status", "completed")
        : supabase
          .from("respostas_avaliacao")
          .select("id", { count: "exact", head: true });

      const { count: feedbackCount } = await feedbackQuery;


      setTotalFeedbacks(feedbackCount || 0);



      // Média das notas
      // const { data: notas } = await supabase
      //   .from("respostas_avaliacao")
      //   .select("nota");


      // if (notas?.length) {

      //   const media =
      //     notas.reduce(
      //       (acc, item) => acc + item.nota,
      //       0
      //     ) / notas.length;


      //   setMediaGeral(media.toFixed(1));

      // }

      // Ciclos abertos
      if (perfil?.papel === "colaborador") {

        const { data: atribuicoes } = await supabase
          .from("atribuicoes_avaliacao")
          .select(`
      ciclo_id,
      ciclos_avaliacao!inner(status)
    `)
          .eq("avaliador_id", user.id)
          .eq("ciclos_avaliacao.status", "active");


        const ciclosUnicos = [
          ...new Set(atribuicoes.map(item => item.ciclo_id))
        ];


        setCiclosAbertos(ciclosUnicos.length);


      } else {

        // Admin vê todos os ciclos ativos
        const { count: ciclosCount } = await supabase
          .from("ciclos_avaliacao")
          .select("*", { count: "exact", head: true })
          .eq("status", "active");


        setCiclosAbertos(ciclosCount ?? 0);

      }



      // Colaboradores
      const { count: usuariosCount } = await supabase
        .from("perfis")
        .select("*", { count: "exact", head: true });


      setColaboradores(usuariosCount || 0);



      // Pendentes
      // const { count: pendentesCount } = await supabase
      //   .from("atribuicoes_avaliacao")
      //   .select("*", { count: "exact", head: true })
      //   .eq("status", "pending");


      // setPendentes(pendentesCount || 0);

      if (perfil.papel === "colaborador") {

        const ciclos = await listEvaluationCycles();

        const totalPendentes = ciclos.reduce(
          (acc, ciclo) => acc + ciclo.pendentesTerceiros,
          0
        );

        setPendentes(totalPendentes);

      } else {

        const { count: pendentesCount } = await supabase
          .from("atribuicoes_avaliacao")
          .select("id", { count: "exact", head: true })
          .eq("status", "pending");


        setPendentes(pendentesCount ?? 0);

      }


    }


    carregarDashboard();


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
          value={colaboradores}
          description="Usuários cadastrados"
          color="blue"
        />
        <StatCard
          icon={<MessageSquare size={22} />}
          title="Feedbacks"
          value={totalFeedbacks}
          description="Avaliações realizadas"
          color="green"
        />
        {/* <StatCard
          icon={<Star size={22} />}
          title="Média Geral"
          value={mediaGeral}
          description="De 5 pontos"
          color="yellow"
        /> */}

        <StatCard
          icon={<ClipboardList size={22} />}
          title="Ciclos Abertos"
          value={ciclosAbertos}
          description="Avaliações em andamento"
          color="yellow"
        />

        <StatCard
          icon={<ClipboardList size={22} />}
          title="Pendentes"
          value={pendentes}
          description="Aguardando resposta"
          color="red"
        />
      </div>

      <FeedbackChart />
    </div>
  );
}

export default Dashboard;
