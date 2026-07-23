import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle, Pencil, Plus, RefreshCw, Trash2, Users } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { teamSchema } from "@/lib/validationSchemas";
import {
  addTeamMember,
  createTeam,
  deleteTeam,
  listTeamStructure,
  removeTeamMember,
  updateTeam,
} from "@/services/teamsService";

const EMPTY_STRUCTURE = { teams: [], profiles: [], unassignedActiveProfiles: [] };
const CLOSED_MODAL = { type: null, teamId: null };

function initials(name = "") {
  return (
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "U"
  );
}

function TeamForm({ team, onSave, onCancel, submitLabel }) {
  const [submitError, setSubmitError] = useState("");
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm({
    resolver: zodResolver(teamSchema),
    defaultValues: { nome: team?.nome || "", descricao: team?.descricao || "" },
  });

  async function submit(values) {
    setSubmitError("");

    try {
      await onSave(values);
      reset({ nome: values.nome, descricao: values.descricao || "" });
    } catch (error) {
      setSubmitError(error.message);
    }
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-4" noValidate>
      <div className="space-y-1.5">
        <Label htmlFor={`team-name-${team?.id || "new"}`}>Nome do time</Label>
        <Input
          id={`team-name-${team?.id || "new"}`}
          placeholder="Ex.: Produto e Experiência"
          aria-invalid={Boolean(errors.nome)}
          autoFocus
          {...register("nome")}
        />
        {errors.nome && <p className="text-xs text-destructive">{errors.nome.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor={`team-description-${team?.id || "new"}`}>Descrição</Label>
        <Textarea
          id={`team-description-${team?.id || "new"}`}
          placeholder="Contexto, projeto ou responsabilidade principal do time"
          rows={3}
          {...register("descricao")}
        />
      </div>

      {submitError && (
        <div className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive" role="alert">
          {submitError}
        </div>
      )}

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting || (Boolean(team) && !isDirty)}>
          {isSubmitting ? "Salvando..." : submitLabel}
        </Button>
      </DialogFooter>
    </form>
  );
}

function EditTeamForm({ team, profiles, onSave, onCancel, externalError }) {
  const initialMemberIds = useMemo(
    () => new Set(team.members.map((member) => member.id)),
    [team.members],
  );
  const [selectedMemberIds, setSelectedMemberIds] = useState(
    () => new Set(team.members.map((member) => member.id)),
  );
  const [submitError, setSubmitError] = useState("");
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm({
    resolver: zodResolver(teamSchema),
    defaultValues: { nome: team.nome, descricao: team.descricao || "" },
  });

  const memberSelectionChanged =
    selectedMemberIds.size !== initialMemberIds.size ||
    [...selectedMemberIds].some((profileId) => !initialMemberIds.has(profileId));

  function toggleMember(profileId, checked) {
    setSelectedMemberIds((current) => {
      const next = new Set(current);
      if (checked) next.add(profileId);
      else next.delete(profileId);
      return next;
    });
  }

  async function submit(values) {
    setSubmitError("");

    try {
      await onSave(values, [...selectedMemberIds]);
      reset({ nome: values.nome, descricao: values.descricao || "" });
    } catch (error) {
      setSubmitError(error.message);
    }
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-5" noValidate>
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor={`team-name-${team.id}`}>Nome do time</Label>
          <Input
            id={`team-name-${team.id}`}
            aria-invalid={Boolean(errors.nome)}
            autoFocus
            {...register("nome")}
          />
          {errors.nome && <p className="text-xs text-destructive">{errors.nome.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor={`team-description-${team.id}`}>Descrição</Label>
          <Textarea id={`team-description-${team.id}`} rows={3} {...register("descricao")} />
        </div>
      </div>

      <fieldset className="border-t border-border pt-5" disabled={isSubmitting}>
        <legend className="sr-only">Membros do time</legend>
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Membros</h3>
            <p className="text-xs text-muted-foreground">Marque todas as pessoas que devem fazer parte deste time.</p>
          </div>
          <Badge variant="secondary">
            {selectedMemberIds.size} selecionado{selectedMemberIds.size === 1 ? "" : "s"}
          </Badge>
        </div>

        {profiles.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border py-7 text-center text-sm text-muted-foreground">
            Nenhuma pessoa disponível.
          </div>
        ) : (
          <div className="max-h-64 divide-y divide-border overflow-y-auto rounded-lg border border-border px-3">
            {profiles.map((profile) => {
              const checked = selectedMemberIds.has(profile.id);
              return (
                <label
                  key={profile.id}
                  className="flex cursor-pointer items-center gap-3 py-3 has-disabled:cursor-not-allowed has-disabled:opacity-60"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(event) => toggleMember(profile.id, event.target.checked)}
                    className="size-4 shrink-0 accent-primary"
                  />
                  <Avatar>
                    <AvatarFallback>{initials(profile.nome_completo)}</AvatarFallback>
                  </Avatar>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="truncate text-sm font-medium text-foreground">{profile.nome_completo}</span>
                      {!profile.ativo && <Badge variant="destructive">Inativo</Badge>}
                    </span>
                    <span className="block truncate text-xs text-muted-foreground">{profile.email}</span>
                  </span>
                </label>
              );
            })}
          </div>
        )}
      </fieldset>

      {(submitError || externalError) && (
        <div className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive" role="alert">
          {submitError || externalError}
        </div>
      )}

      <DialogFooter className="border-t border-border pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting || (!isDirty && !memberSelectionChanged)}>
          {isSubmitting ? "Salvando..." : "Salvar alterações"}
        </Button>
      </DialogFooter>
    </form>
  );
}

function TeamOverview({ team, onEdit, onDelete }) {
  const visibleMembers = team.members.slice(0, 4);
  const hiddenCount = team.memberCount - visibleMembers.length;

  return (
    <Card>
      <CardContent className="grid gap-4 py-1 sm:grid-cols-[minmax(10rem,0.8fr)_minmax(0,1.4fr)_auto] sm:items-center">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">{team.nome}</p>
        </div>

        <div className="min-w-0">
          {visibleMembers.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sem membros</p>
          ) : (
            <div className="flex flex-wrap items-center gap-1.5">
              {visibleMembers.map((member) => (
                <Badge key={member.id} variant="secondary" className="max-w-40 truncate">
                  {member.nome_completo}
                </Badge>
              ))}
              {hiddenCount > 0 && <Badge variant="outline">+{hiddenCount}</Badge>}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 sm:justify-end">
          <Button type="button" variant="outline" size="sm" onClick={() => onEdit(team.id)}>
            <Pencil />
            Editar
          </Button>
          <Button type="button" variant="destructive" size="sm" onClick={() => onDelete(team.id)}>
            <Trash2 />
            Excluir
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function Teams() {
  const [structure, setStructure] = useState(EMPTY_STRUCTURE);
  const [modal, setModal] = useState(CLOSED_MODAL);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [notice, setNotice] = useState("");
  const [modalError, setModalError] = useState("");
  const [busyAction, setBusyAction] = useState("");

  const loadStructure = useCallback(async ({ showLoading = true } = {}) => {
    if (showLoading) setLoading(true);
    setLoadError("");

    try {
      setStructure(await listTeamStructure());
      return true;
    } catch (error) {
      setLoadError(error.message);
      return false;
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;

    listTeamStructure()
      .then((nextStructure) => {
        if (active) setStructure(nextStructure);
      })
      .catch((error) => {
        if (active) setLoadError(error.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const modalTeam = useMemo(
    () => structure.teams.find((team) => team.id === modal.teamId) || null,
    [modal.teamId, structure.teams],
  );

  function openModal(type, teamId = null) {
    setNotice("");
    setModalError("");
    setBusyAction("");
    setModal({ type, teamId });
  }

  function closeModal() {
    if (busyAction) return;
    setModal(CLOSED_MODAL);
    setModalError("");
  }

  async function handleCreate(values) {
    setBusyAction("create");

    try {
      const created = await createTeam(values);
      setModal(CLOSED_MODAL);
      setNotice(`Time “${created.nome}” criado com sucesso.`);
      await loadStructure({ showLoading: false });
    } finally {
      setBusyAction("");
    }
  }

  async function handleUpdate(values, selectedMemberIds) {
    setBusyAction("update");
    setModalError("");

    try {
      const currentMemberIds = new Set(modalTeam.members.map((member) => member.id));
      const nextMemberIds = new Set(selectedMemberIds);
      const additions = selectedMemberIds.filter((profileId) => !currentMemberIds.has(profileId));
      const removals = [...currentMemberIds].filter((profileId) => !nextMemberIds.has(profileId));
      const updated = await updateTeam(modalTeam.id, values);

      const memberResults = await Promise.allSettled([
        ...additions.map((profileId) => addTeamMember(modalTeam.id, profileId)),
        ...removals.map((profileId) => removeTeamMember(modalTeam.id, profileId)),
      ]);
      const memberUpdateFailed = memberResults.some((result) => result.status === "rejected");

      if (memberUpdateFailed) {
        const message = "Algumas alterações de membros não foram concluídas. Revise a seleção e tente novamente.";
        setModalError(message);
        await loadStructure({ showLoading: false });
        throw new Error(message);
      }

      setModal(CLOSED_MODAL);
      setNotice(`Alterações de “${updated.nome}” salvas.`);
      await loadStructure({ showLoading: false });
    } finally {
      setBusyAction("");
    }
  }

  async function handleDelete() {
    if (!modalTeam) return;
    setBusyAction("delete");
    setModalError("");

    try {
      const name = modalTeam.nome;
      await deleteTeam(modalTeam.id);
      setModal(CLOSED_MODAL);
      setNotice(`Time “${name}” excluído com sucesso.`);
      await loadStructure({ showLoading: false });
    } catch (error) {
      setModalError(error.message);
      await loadStructure({ showLoading: false });
    } finally {
      setBusyAction("");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-primary">Estrutura organizacional</p>
          <h1 className="text-2xl font-bold text-foreground">Times</h1>
          <p className="mt-1 text-sm text-muted-foreground">Visualize os times e gerencie seus membros.</p>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={() => loadStructure()} disabled={loading}>
            <RefreshCw className={loading ? "animate-spin" : ""} />
            Atualizar
          </Button>
          <Button type="button" onClick={() => openModal("create")}>
            <Plus />
            Novo time
          </Button>
        </div>
      </div>

      {notice && (
        <div className="rounded-lg bg-chart-5/10 px-3 py-2 text-sm text-chart-5" role="status">{notice}</div>
      )}

      {loadError ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <AlertTriangle className="text-destructive" size={28} />
            <div>
              <p className="font-medium text-foreground">Não foi possível carregar os times</p>
              <p className="mt-1 text-sm text-muted-foreground">{loadError}</p>
            </div>
            <Button type="button" variant="outline" onClick={() => loadStructure()}>Tentar novamente</Button>
          </CardContent>
        </Card>
      ) : loading ? (
        <Card>
          <CardContent className="flex items-center justify-center gap-2 py-12 text-sm text-muted-foreground">
            <RefreshCw className="animate-spin" size={16} />
            Carregando times...
          </CardContent>
        </Card>
      ) : structure.teams.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-12 text-center">
            <Users className="mb-3 text-muted-foreground/50" size={32} />
            <p className="font-medium text-foreground">Nenhum time cadastrado</p>
            <p className="mt-1 text-sm text-muted-foreground">Crie o primeiro time para começar.</p>
            <Button type="button" className="mt-4" onClick={() => openModal("create")}>
              <Plus />
              Criar primeiro time
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          <div className="hidden px-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground sm:grid sm:grid-cols-[minmax(10rem,0.8fr)_minmax(0,1.4fr)_auto] sm:gap-4">
            <span>Time</span>
            <span>Membros</span>
            <span className="text-right">Ações</span>
          </div>
          {structure.teams.map((team) => (
            <TeamOverview key={team.id} team={team} onEdit={(id) => openModal("edit", id)} onDelete={(id) => openModal("delete", id)} />
          ))}
        </div>
      )}

      <Dialog open={Boolean(modal.type)} onOpenChange={(open) => !open && closeModal()}>
        {modal.type === "create" && (
          <DialogContent onClose={closeModal}>
            <DialogHeader>
              <DialogTitle>Novo time</DialogTitle>
              <DialogDescription>Preencha os dados para criar um time.</DialogDescription>
            </DialogHeader>
            <TeamForm key="new-team" onSave={handleCreate} onCancel={closeModal} submitLabel="Criar time" />
          </DialogContent>
        )}

        {modal.type === "edit" && modalTeam && (
          <DialogContent className="max-w-2xl" onClose={closeModal}>
            <DialogHeader>
              <DialogTitle>Editar time</DialogTitle>
              <DialogDescription>Atualize os dados e organize os membros de “{modalTeam.nome}”.</DialogDescription>
            </DialogHeader>
            <EditTeamForm
              key={`${modalTeam.id}:${modalTeam.nome}:${modalTeam.descricao || ""}:${modalTeam.members.map((member) => member.id).join(",")}`}
              team={modalTeam}
              profiles={structure.profiles}
              onSave={handleUpdate}
              onCancel={closeModal}
              externalError={modalError}
            />
          </DialogContent>
        )}

        {modal.type === "delete" && modalTeam && (
          <DialogContent onClose={closeModal}>
            <DialogHeader>
              <DialogTitle>Excluir “{modalTeam.nome}”?</DialogTitle>
              <DialogDescription>
                {modalTeam.memberCount === 0
                  ? "Este time não possui membros."
                  : `${modalTeam.memberCount} ${modalTeam.memberCount === 1 ? "membro será desvinculado" : "membros serão desvinculados"}.`}
                {" "}As pessoas cadastradas não serão excluídas.
              </DialogDescription>
            </DialogHeader>
            {modalError && (
              <div className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive" role="alert">{modalError}</div>
            )}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeModal} disabled={Boolean(busyAction)}>Cancelar</Button>
              <Button type="button" variant="destructive" onClick={handleDelete} disabled={Boolean(busyAction)}>
                {busyAction === "delete" ? "Excluindo..." : "Confirmar exclusão"}
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}

export default Teams;
