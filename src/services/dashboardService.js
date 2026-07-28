import { listCycles } from "@/services/cyclesService";
import { listTeamStructure } from "@/services/teamsService";
import { listEvaluationCycles } from "@/services/evaluationsService";
import { listClosedResults } from "@/services/resultsService";

export async function loadManagementOverview() {
  const [cycles, structure] = await Promise.all([listCycles(), listTeamStructure()]);

  const activeProfiles = structure.profiles.filter((profile) => profile.ativo);
  const openCycles = cycles.filter((cycle) => cycle.statusBanco === "active");
  const draftCycles = cycles.filter((cycle) => cycle.statusBanco === "draft");

  const assignments = openCycles.reduce(
    (totals, cycle) => ({
      total: totals.total + cycle.totalAtribuicoes,
      completed: totals.completed + cycle.atribuicoesConcluidas,
    }),
    { total: 0, completed: 0 },
  );


  const teamsWithoutActiveMembers = structure.teams.filter(
    (team) => !team.members.some((member) => member.ativo),
  );

  return {
    activeProfileCount: activeProfiles.length,
    inactiveProfileCount: structure.profiles.length - activeProfiles.length,
    teamCount: structure.teams.length,
    unassignedProfiles: structure.unassignedActiveProfiles,
    teamsWithoutActiveMembers,
    openCycleCount: openCycles.length,
    draftCycleCount: draftCycles.length,
    totalAssignments: assignments.total,
    completedAssignments: assignments.completed,
    completionRate: assignments.total > 0
      ? Math.round((assignments.completed / assignments.total) * 100)
      : null,
    cycles,
  };
}


export async function loadCollaboratorOverview() {
  const [cycles, results] = await Promise.all([listEvaluationCycles(), listClosedResults()]);

  const availableCycles = cycles.filter((cycle) => cycle.disponivel);
  const pendingAssignments = availableCycles.reduce(
    (total, cycle) => total + cycle.atribuicoes.length,
    0,
  );
  const pendingSelfAssessments = availableCycles.filter((cycle) =>
    cycle.atribuicoes.some((assignment) => assignment.autoavaliacao),
  ).length;

  const nextDeadline = availableCycles
    .map((cycle) => cycle.dataLimite)
    .filter(Boolean)
    .sort()[0] || null;

  return {
    pendingAssignments,
    pendingSelfAssessments,
    availableCycleCount: availableCycles.length,
    nextDeadline,
    availableResultCount: results.length,
  };
}
