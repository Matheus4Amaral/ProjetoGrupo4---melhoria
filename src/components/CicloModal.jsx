import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cycleSchema } from "@/lib/validationSchemas";

const EMPTY_VALUES = {
  nome: "",
  templateId: "",
  dataInicio: "",
  dataFim: "",
  timeIds: [],
};

export default function CicloModal({
  open,
  onOpenChange,
  cycle = null,
  templates = [],
  teams = [],
  loadingOptions = false,
  saving = false,
  error = "",
  onSave,
  onGenerate,
}) {
  const form = useForm({
    resolver: zodResolver(cycleSchema),
    defaultValues: EMPTY_VALUES,
  });

  useEffect(() => {
    if (!open) return;
    form.reset(
      cycle
        ? {
            nome: cycle.nome,
            templateId: cycle.templateId,
            dataInicio: cycle.dataInicio,
            dataFim: cycle.dataFim,
            timeIds: cycle.timeIds,
          }
        : EMPTY_VALUES,
    );
  }, [cycle, form, open]);

  const handleOpenChange = (nextOpen) => {
    if (!saving) onOpenChange(nextOpen);
  };

  const handleSubmit = form.handleSubmit((values) => onSave(values, cycle?.id || null));
  const hasUnsavedChanges = form.formState.isDirty;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-xl" onClose={() => handleOpenChange(false)}>
        <DialogHeader>
          <DialogTitle>{cycle ? "Configurar ciclo" : "Novo ciclo"}</DialogTitle>
          <DialogDescription>
            {cycle
              ? "Revise o período, template e times antes de gerar as avaliações."
              : "O ciclo será salvo como rascunho até que as avaliações sejam geradas."}
          </DialogDescription>
        </DialogHeader>

        <form id="ciclo-form" onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome do ciclo</Label>
            <Input
              id="nome"
              placeholder="Ex: Ciclo 2026.1 — Engenharia"
              disabled={saving}
              aria-invalid={Boolean(form.formState.errors.nome)}
              {...form.register("nome")}
            />
            {form.formState.errors.nome && (
              <p className="text-sm text-destructive">{form.formState.errors.nome.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="templateId">Template base</Label>
            <select
              id="templateId"
              disabled={saving || loadingOptions}
              aria-invalid={Boolean(form.formState.errors.templateId)}
              className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
              {...form.register("templateId")}
            >
              <option value="">
                {loadingOptions ? "Carregando templates..." : "Selecione um template..."}
              </option>
              {templates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.nome}{template.eh_padrao ? " (padrão)" : ""}
                </option>
              ))}
            </select>
            {form.formState.errors.templateId && (
              <p className="text-sm text-destructive">{form.formState.errors.templateId.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="dataInicio">Data de início</Label>
              <Input
                id="dataInicio"
                type="date"
                disabled={saving}
                aria-invalid={Boolean(form.formState.errors.dataInicio)}
                {...form.register("dataInicio")}
              />
              {form.formState.errors.dataInicio && (
                <p className="text-sm text-destructive">{form.formState.errors.dataInicio.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="dataFim">Data-limite</Label>
              <Input
                id="dataFim"
                type="date"
                disabled={saving}
                aria-invalid={Boolean(form.formState.errors.dataFim)}
                {...form.register("dataFim")}
              />
              {form.formState.errors.dataFim && (
                <p className="text-sm text-destructive">{form.formState.errors.dataFim.message}</p>
              )}
            </div>
          </div>

          <fieldset className="space-y-2">
            <legend className="text-sm font-medium text-foreground">Times participantes</legend>
            <p className="text-xs text-muted-foreground">
              Somente pessoas que compartilham um time selecionado avaliarão umas às outras.
            </p>
            <div className="max-h-44 space-y-2 overflow-y-auto rounded-lg border border-border p-3">
              {loadingOptions ? (
                <p className="text-sm text-muted-foreground">Carregando times...</p>
              ) : teams.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Nenhum time disponível. Crie e configure um time antes de continuar.
                </p>
              ) : (
                teams.map((team) => (
                  <label key={team.id} className="flex cursor-pointer items-start gap-3 rounded-md p-2 hover:bg-muted/50">
                    <input
                      type="checkbox"
                      value={team.id}
                      disabled={saving}
                      className="mt-0.5 h-4 w-4 rounded border-input accent-primary"
                      {...form.register("timeIds")}
                    />
                    <span>
                      <span className="block text-sm font-medium text-foreground">{team.nome}</span>
                      {team.descricao && (
                        <span className="block text-xs text-muted-foreground">{team.descricao}</span>
                      )}
                    </span>
                  </label>
                ))
              )}
            </div>
            {form.formState.errors.timeIds && (
              <p className="text-sm text-destructive">{form.formState.errors.timeIds.message}</p>
            )}
          </fieldset>

          {cycle && hasUnsavedChanges && (
            <p className="rounded-lg bg-amber-500/10 p-3 text-sm text-amber-700 dark:text-amber-300" role="status">
              Salve as alterações antes de gerar as avaliações.
            </p>
          )}

          {error && (
            <p className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
        </form>

        <DialogFooter className="sm:justify-between">
          <div>
            {cycle && (
              <Button
                type="button"
                variant="outline"
                disabled={saving || hasUnsavedChanges}
                title={hasUnsavedChanges ? "Salve as alterações antes de gerar" : undefined}
                onClick={() => onGenerate(cycle)}
              >
                Gerar avaliações
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" disabled={saving} onClick={() => handleOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" form="ciclo-form" disabled={saving || loadingOptions || teams.length === 0}>
              {saving ? "Salvando..." : cycle ? "Salvar alterações" : "Criar ciclo"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
