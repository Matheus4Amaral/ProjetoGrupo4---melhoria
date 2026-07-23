import { supabase } from "@/lib/supabaseClient";

function teamServiceError(error, fallbackMessage) {
  if (error?.code === "23505") {
    return new Error("Este colaborador já pertence ao time.");
  }

  if (error?.code === "42501") {
    return new Error("Você não tem permissão para alterar a estrutura de times.");
  }

  return new Error(fallbackMessage);
}

export function buildTeamStructure(teams = [], memberships = [], profiles = []) {
  const profilesById = new Map(profiles.map((profile) => [profile.id, profile]));
  const membershipsByTeam = new Map();
  const linkedProfileIds = new Set();

  memberships.forEach((membership) => {
    linkedProfileIds.add(membership.perfil_id);

    const teamMemberships = membershipsByTeam.get(membership.time_id) || [];
    teamMemberships.push(membership);
    membershipsByTeam.set(membership.time_id, teamMemberships);
  });

  const structuredTeams = teams
    .map((team) => {
      const teamMemberships = membershipsByTeam.get(team.id) || [];
      const members = teamMemberships
        .map((membership) => {
          const profile = profilesById.get(membership.perfil_id);
          return profile ? { ...profile, membershipId: membership.id } : null;
        })
        .filter(Boolean)
        .sort((a, b) => a.nome_completo.localeCompare(b.nome_completo, "pt-BR"));

      return {
        ...team,
        members,
        memberCount: members.length,
      };
    })
    .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));

  const sortedProfiles = [...profiles].sort((a, b) =>
    a.nome_completo.localeCompare(b.nome_completo, "pt-BR"),
  );

  return {
    teams: structuredTeams,
    profiles: sortedProfiles,
    unassignedActiveProfiles: sortedProfiles.filter(
      (profile) => profile.ativo && !linkedProfileIds.has(profile.id),
    ),
  };
}

export async function listTeamStructure() {
  const [teamsResult, membershipsResult, profilesResult] = await Promise.all([
    supabase
      .from("times")
      .select("id, nome, descricao, criado_em")
      .order("nome", { ascending: true }),
    supabase
      .from("membros_time")
      .select("id, time_id, perfil_id, criado_em"),
    supabase
      .from("perfis")
      .select("id, nome_completo, email, papel, gestor_id, ativo, criado_em")
      .order("nome_completo", { ascending: true }),
  ]);

  const error = teamsResult.error || membershipsResult.error || profilesResult.error;
  if (error) {
    throw teamServiceError(error, "Não foi possível carregar a estrutura de times.");
  }

  return buildTeamStructure(
    teamsResult.data || [],
    membershipsResult.data || [],
    profilesResult.data || [],
  );
}

export async function createTeam(values) {
  const { data, error } = await supabase
    .from("times")
    .insert({ nome: values.nome, descricao: values.descricao })
    .select("id, nome, descricao, criado_em")
    .single();

  if (error) {
    throw teamServiceError(error, "Não foi possível criar o time.");
  }

  return data;
}

export async function updateTeam(teamId, values) {
  const { data, error } = await supabase
    .from("times")
    .update({ nome: values.nome, descricao: values.descricao })
    .eq("id", teamId)
    .select("id, nome, descricao, criado_em")
    .single();

  if (error) {
    throw teamServiceError(error, "Não foi possível atualizar o time.");
  }

  return data;
}

export async function deleteTeam(teamId) {
  const { data, error } = await supabase
    .from("times")
    .delete()
    .eq("id", teamId)
    .select("id")
    .single();

  if (error) {
    throw teamServiceError(error, "Não foi possível excluir o time.");
  }

  return data;
}

export async function addTeamMember(teamId, profileId) {
  const { data, error } = await supabase
    .from("membros_time")
    .insert({ time_id: teamId, perfil_id: profileId })
    .select("id, time_id, perfil_id, criado_em")
    .single();

  if (error) {
    throw teamServiceError(error, "Não foi possível adicionar o membro ao time.");
  }

  return data;
}

export async function removeTeamMember(teamId, profileId) {
  const { data, error } = await supabase
    .from("membros_time")
    .delete()
    .eq("time_id", teamId)
    .eq("perfil_id", profileId)
    .select("id")
    .single();

  if (error) {
    throw teamServiceError(error, "Não foi possível remover o membro do time.");
  }

  return data;
}
