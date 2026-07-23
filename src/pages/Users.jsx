import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MailPlus, RefreshCw, UserRound } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { inviteUserSchema } from "@/lib/validationSchemas";
import { inviteUser, listProfiles } from "@/services/usersService";

const ROLE_LABELS = {
  admin: "Administrador",
  rh: "RH",
  colaborador: "Colaborador",
};

function initials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase() || "U";
}

function Users() {
  const { profile, isAdmin } = useAuth();
  const [profiles, setProfiles] = useState([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState("");
  const [notice, setNotice] = useState("");
  const [submitError, setSubmitError] = useState("");
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(inviteUserSchema),
    defaultValues: {
      nomeCompleto: "",
      email: "",
      papel: "colaborador",
    },
  });

  const loadProfiles = useCallback(async () => {
    setListLoading(true);
    setListError("");

    try {
      setProfiles(await listProfiles());
    } catch (error) {
      setListError(error.message);
    } finally {
      setListLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;

    listProfiles()
      .then((data) => {
        if (active) setProfiles(data);
      })
      .catch((error) => {
        if (active) setListError(error.message);
      })
      .finally(() => {
        if (active) setListLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  async function onSubmit(values) {
    setNotice("");
    setSubmitError("");

    const payload = {
      ...values,
      papel: isAdmin ? values.papel : "colaborador",
    };

    try {
      await inviteUser(payload);
      setNotice(`Convite enviado para ${payload.email}. O link é válido por 24 horas.`);
      reset({ nomeCompleto: "", email: "", papel: "colaborador" });
      await loadProfiles();
    } catch (error) {
      setSubmitError(error.message);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-1">
          Gestão de acesso
        </p>
        <h1 className="text-2xl font-bold text-foreground">Usuários</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Admin e RH compartilham a mesma base organizacional de membros.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <Card>
          <CardHeader className="flex flex-row items-start justify-between">
            <div>
              <CardTitle>Diretório de membros</CardTitle>
              <CardDescription>{profiles.length} perfis cadastrados</CardDescription>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={loadProfiles} disabled={listLoading}>
              <RefreshCw className={listLoading ? "animate-spin" : ""} />
              Atualizar
            </Button>
          </CardHeader>
          <CardContent>
            {listError && (
              <div className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive" role="alert">
                {listError}
              </div>
            )}

            {listLoading ? (
              <p className="py-10 text-center text-sm text-muted-foreground">Carregando usuários...</p>
            ) : profiles.length === 0 ? (
              <div className="flex flex-col items-center py-12 text-center">
                <UserRound className="mb-3 text-muted-foreground/50" size={32} />
                <p className="text-sm text-muted-foreground">Nenhum perfil encontrado.</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {profiles.map((member) => (
                  <div key={member.id} className="flex items-center justify-between gap-4 py-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <Avatar>
                        <AvatarFallback>{initials(member.nome_completo)}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-foreground">
                          {member.nome_completo}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">{member.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {member.ativo === false && <Badge variant="destructive">Inativo</Badge>}
                      <Badge variant="outline">{ROLE_LABELS[member.papel] || member.papel}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MailPlus size={18} />
              Convidar membro
            </CardTitle>
            <CardDescription>
              {isAdmin
                ? "Você pode convidar RH ou colaboradores."
                : "Você pode convidar colaboradores, inclusive futuros gestores vinculados."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="nomeCompleto">Nome completo</Label>
                <Input
                  id="nomeCompleto"
                  placeholder="Nome do colaborador"
                  aria-invalid={Boolean(errors.nomeCompleto)}
                  {...register("nomeCompleto")}
                />
                {errors.nomeCompleto && <p className="text-xs text-destructive">{errors.nomeCompleto.message}</p>}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="invite-email">E-mail</Label>
                <Input
                  id="invite-email"
                  type="email"
                  placeholder="pessoa@empresa.com"
                  aria-invalid={Boolean(errors.email)}
                  {...register("email")}
                />
                {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="papel">Papel inicial</Label>
                {isAdmin ? (
                  <select
                    id="papel"
                    className="h-8 w-full rounded-lg border border-input bg-background px-2.5 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                    {...register("papel")}
                  >
                    <option value="colaborador">Colaborador</option>
                    <option value="rh">RH</option>
                  </select>
                ) : (
                  <>
                    <Input value="Colaborador" disabled />
                    <input type="hidden" value="colaborador" {...register("papel")} />
                  </>
                )}
                {errors.papel && <p className="text-xs text-destructive">{errors.papel.message}</p>}
                <p className="text-xs text-muted-foreground">
                  Gestor é um colaborador que recebe vínculos de subordinados posteriormente.
                </p>
              </div>

              {notice && (
                <div className="rounded-lg bg-chart-5/10 px-3 py-2 text-sm text-chart-5" role="status">
                  {notice}
                </div>
              )}
              {submitError && (
                <div className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive" role="alert">
                  {submitError}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Enviando..." : "Enviar convite"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <p className="text-xs text-muted-foreground">Acesso atual: {profile?.email}</p>
    </div>
  );
}

export default Users;
