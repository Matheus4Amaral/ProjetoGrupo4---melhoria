import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  CalendarClock,
  ClipboardList,
  FileCheck2,
  Network,
  RefreshCcw,
  RefreshCw,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import StatCard from "@/components/dashboard/StatCard";
import CycleProgressChart from "@/components/dashboard/CycleProgressChart";
import { useAuth } from "@/hooks/useAuth";
import { BUSINESS_TIME_ZONE } from "@/services/cyclesUtils";
import {
  loadCollaboratorOverview,
  loadManagementOverview,
} from "@/services/dashboardService";

function formatDeadline(value) {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: BUSINESS_TIME_ZONE,
    day: "2-digit",
    month: "short",
  }).format(new Date(value));
}

function daysUntil(value) {
  const diff = new Date(value).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / 86_400_000));
}

function pluralize(count, singular, plural) {
  return count === 1 ? singular : plural;
}

function DashboardError({ message, onRetry }) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-3 py-12 text-center" role="alert">
        <AlertTriangle className="text-destructive" size={28} />
        <div>
          <p className="font-medium text-foreground">Não foi possível carregar os indicadores</p>
          <p className="mt-1 text-sm text-muted-foreground">{message}</p>
        </div>
        <Button variant="outline" onClick={onRetry} className="gap-2">
          <RefreshCcw size={16} /> Tentar novamente
        </Button>
      </CardContent>
    </Card>
  );
}

function buildSetupWarnings(data) {
  if (!data) return [];

  const warnings = [];
  const unassigned = data.unassignedProfiles.length;
  const emptyTeams = data.teamsWithoutActiveMembers.length;

  if (unassigned > 0) {
    warnings.push(
      `${unassigned} ${pluralize(unassigned, "pessoa ativa não está", "pessoas ativas não estão")} em nenhum time`,
    );
  }

  if (emptyTeams > 0) {
    warnings.push(
      `${emptyTeams} ${pluralize(emptyTeams, "time não possui", "times não possuem")} membros ativos`,
    );
  }

  return warnings;
}

function ManagementDashboard({ data, loading }) {
  const navigate = useNavigate();
  const pendingSetup = buildSetupWarnings(data);

  return (
    <>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          loading={loading}
          icon={<Users size={22} />}
          title="Colaboradores ativos"
          value={data?.activeProfileCount ?? 0}
          description={
            data?.inactiveProfileCount
              ? `${data.inactiveProfileCount} ${pluralize(data.inactiveProfileCount, "inativo", "inativos")}`
              : "Todos os perfis estão ativos"
          }
          color="blue"
          actionLabel="Gerenciar usuários"
          onClick={() => navigate("/users")}
        />
        <StatCard
          loading={loading}
          icon={<Network size={22} />}
          title="Times"
          value={data?.teamCount ?? 0}
          description={
            data?.unassignedProfiles.length
              ? `${data.unassignedProfiles.length} sem time`
              : "Todos os ativos estão alocados"
          }
          color="green"
          actionLabel="Gerenciar times"
          onClick={() => navigate("/teams")}
        />
        <StatCard
          loading={loading}
          icon={<RefreshCw size={22} />}
          title="Ciclos abertos"
          value={data?.openCycleCount ?? 0}
          description={
            data?.draftCycleCount
              ? `${data.draftCycleCount} em rascunho`
              : "Nenhum rascunho pendente"
          }
          color="yellow"
          actionLabel="Ver ciclos"
          onClick={() => navigate("/ciclos")}
        />
        <StatCard
          loading={loading}
          icon={<FileCheck2 size={22} />}
          title="Avaliações concluídas"
          value={data?.completionRate !== null && data?.completionRate !== undefined
            ? `${data.completionRate}%`
            : "—"}
          description={
            data?.totalAssignments
              ? `${data.completedAssignments} de ${data.totalAssignments} nos ciclos abertos`
              : "Nenhum ciclo aberto no momento"
          }
          color="red"
          actionLabel="Acompanhar ciclos"
          onClick={() => navigate("/ciclos")}
        />
      </div>

      {pendingSetup.length > 0 && (
        <Card className="border-chart-4/40 bg-chart-4/5">
          <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-3">
              <AlertTriangle className="mt-0.5 shrink-0 text-chart-4" size={20} />
              <div>
                <p className="font-medium text-foreground">Pendências antes de abrir um ciclo</p>
                <ul className="mt-1 list-inside list-disc text-sm text-muted-foreground">
                  {pendingSetup.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
            <Button variant="outline" className="shrink-0" onClick={() => navigate("/teams")}>
              Revisar times
            </Button>
          </CardContent>
        </Card>
      )}

      <CycleProgressChart cycles={data?.cycles || []} loading={loading} />
    </>
  );
}

function CollaboratorDashboard({ data, loading }) {
  const navigate = useNavigate();
  const hasPending = Boolean(data?.pendingAssignments);

  return (
    <>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard
          loading={loading}
          icon={<ClipboardList size={22} />}
          title="Avaliações pendentes"
          value={data?.pendingAssignments ?? 0}
          description={
            data?.pendingSelfAssessments
              ? "Inclui sua autoavaliação"
              : hasPending
                ? "Aguardando seu preenchimento"
                : "Você está em dia"
          }
          color={hasPending ? "red" : "green"}
          actionLabel={hasPending ? "Preencher agora" : "Ver avaliações"}
          onClick={() => navigate("/nova-avaliacao")}
        />
        <StatCard
          loading={loading}
          icon={<CalendarClock size={22} />}
          title="Prazo mais próximo"
          value={data?.nextDeadline ? formatDeadline(data.nextDeadline) : "—"}
          description={
            data?.nextDeadline
              ? `Faltam ${daysUntil(data.nextDeadline)} ${pluralize(daysUntil(data.nextDeadline), "dia", "dias")}`
              : "Nenhum ciclo aberto no momento"
          }
          color="yellow"
        />
        <StatCard
          loading={loading}
          icon={<FileCheck2 size={22} />}
          title="Resultados disponíveis"
          value={data?.availableResultCount ?? 0}
          description={
            data?.availableResultCount
              ? "Ciclos encerrados com feedback"
              : "Aparecem quando um ciclo encerra"
          }
          color="blue"
          actionLabel="Ver meus resultados"
          onClick={() => navigate("/minhas-avaliacoes")}
        />
      </div>

      {!loading && !hasPending && (
        <Card>
          <CardContent className="flex flex-col items-center py-12 text-center">
            <FileCheck2 className="mb-3 h-10 w-10 text-chart-5" />
            <p className="font-medium text-foreground">Nenhuma avaliação pendente</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Assim que um novo ciclo for aberto, suas avaliações aparecerão aqui.
            </p>
          </CardContent>
        </Card>
      )}
    </>
  );
}

function Dashboard() {
  const { profile, canManageUsers } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!profile) return undefined;

    let active = true;
    const fetchOverview = canManageUsers ? loadManagementOverview : loadCollaboratorOverview;

    fetchOverview()
      .then((overview) => {
        if (active) setData(overview);
      })
      .catch((err) => {
        if (active) setError(err.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [canManageUsers, profile, reloadKey]);

  const reload = useCallback(() => {
    setLoading(true);
    setError("");
    setReloadKey((value) => value + 1);
  }, []);

  const firstName = profile?.nome_completo?.split(" ")[0];

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {firstName ? `Olá, ${firstName}` : "Dashboard"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {canManageUsers
              ? "Acompanhe a estrutura organizacional e o andamento dos ciclos."
              : "Acompanhe suas avaliações e resultados do Feedback 360°."}
          </p>
        </div>
        <Button variant="outline" onClick={reload} disabled={loading} className="gap-2">
          <RefreshCcw size={16} className={loading ? "animate-spin" : ""} />
          Atualizar
        </Button>
      </div>

      {error ? (
        <DashboardError message={error} onRetry={reload} />
      ) : canManageUsers ? (
        <ManagementDashboard data={data} loading={loading} />
      ) : (
        <CollaboratorDashboard data={data} loading={loading} />
      )}
    </div>
  );
}

export default Dashboard;
