import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowDown, ArrowUp, Info, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { competencyTemplateSchema } from "@/lib/validationSchemas";
import {
  createTemplate,
  getDefaultTemplate,
  getTemplate,
  updateTemplate,
} from "@/services/templatesService";

const EMPTY_COMPETENCY = { nome: "", descricao: "" };

function editorTitle(mode, sourceName) {
  if (mode === "edit") return sourceName ? `Editar ${sourceName}` : "Editar template";
  if (mode === "clone") return sourceName ? `Clonar ${sourceName}` : "Clonar template";
  return "Novo template";
}

export default function TemplateEditor({ mode }) {
  const navigate = useNavigate();
  const { templateId } = useParams();
  const [sourceName, setSourceName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [saveError, setSaveError] = useState("");

  const form = useForm({
    resolver: zodResolver(competencyTemplateSchema),
    defaultValues: {
      nome: "",
      competencias: [],
    },
  });

  const { fields, append, move, remove } = useFieldArray({
    control: form.control,
    name: "competencias",
  });

  const loadTemplate = useCallback(async () => {
    await Promise.resolve();
    setIsLoading(true);
    setLoadError("");
    setSaveError("");

    try {
      const source = mode === "create"
        ? await getDefaultTemplate()
        : await getTemplate(templateId);

      if (mode === "edit" && (source.ehPadrao || source.cycleCount > 0)) {
        throw new Error("Este template é protegido e só pode ser clonado.");
      }

      setSourceName(source?.nome || "");
      form.reset({
        nome: mode === "edit"
          ? source.nome
          : source
            ? `${source.nome} (clonado)`
            : "Novo template",
        competencias: source?.competencias?.length
          ? source.competencias.map(({ nome, descricao }) => ({ nome, descricao }))
          : [{ ...EMPTY_COMPETENCY }],
      });
    } catch (error) {
      setLoadError(error.message);
    } finally {
      setIsLoading(false);
    }
  }, [form, mode, templateId]);

  useEffect(() => {
    let isCurrent = true;
    const request = mode === "create"
      ? getDefaultTemplate()
      : getTemplate(templateId);

    request
      .then((source) => {
        if (!isCurrent) return;

        if (mode === "edit" && (source.ehPadrao || source.cycleCount > 0)) {
          throw new Error("Este template é protegido e só pode ser clonado.");
        }

        setSourceName(source?.nome || "");
        form.reset({
          nome: mode === "edit"
            ? source.nome
            : source
              ? `${source.nome} (clonado)`
              : "Novo template",
          competencias: source?.competencias?.length
            ? source.competencias.map(({ nome, descricao }) => ({ nome, descricao }))
            : [{ ...EMPTY_COMPETENCY }],
        });
      })
      .catch((error) => {
        if (isCurrent) setLoadError(error.message);
      })
      .finally(() => {
        if (isCurrent) setIsLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [form, mode, templateId]);

  const onSubmit = async (values) => {
    setSaveError("");

    try {
      if (mode === "edit") {
        await updateTemplate(templateId, values);
      } else {
        await createTemplate(values);
      }

      navigate("/templates", {
        replace: true,
        state: {
          feedback: mode === "edit"
            ? "Template atualizado com sucesso."
            : "Template criado com sucesso.",
        },
      });
    } catch (error) {
      setSaveError(error.message);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl space-y-6" aria-busy="true" aria-label="Carregando template">
        <Skeleton className="h-20 w-full" />
        <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-36 w-full" />
            <Skeleton className="h-36 w-full" />
          </div>
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="max-w-xl rounded-xl border border-destructive/30 bg-destructive/5 p-6" role="alert">
        <h1 className="text-lg font-semibold text-foreground">Não foi possível abrir o editor</h1>
        <p className="mt-2 text-sm text-muted-foreground">{loadError}</p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Button onClick={loadTemplate}>Tentar novamente</Button>
          <Button variant="outline" onClick={() => navigate("/templates")}>Voltar à lista</Button>
        </div>
      </div>
    );
  }

  return (
    <form className="max-w-5xl space-y-6" onSubmit={form.handleSubmit(onSubmit)} noValidate>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-primary">
            Templates / {mode === "edit" ? "Editar" : mode === "clone" ? "Clonar" : "Novo"}
          </p>
          <h1 className="text-2xl font-bold text-foreground">{editorTitle(mode, sourceName)}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {mode === "edit"
              ? "Atualize o nome e as competências deste template."
              : "Ajuste a cópia local antes de criar um template independente."}
          </p>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={() => navigate("/templates")}>
            Cancelar
          </Button>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Salvando..." : "Salvar template"}
          </Button>
        </div>
      </div>

      {saveError && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive" role="alert">
          {saveError}
        </div>
      )}

      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="flex-1 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome do template</Label>
            <Input
              id="nome"
              {...form.register("nome")}
              placeholder="Ex: Ciclo 2026.1 - Engenharia"
              aria-invalid={Boolean(form.formState.errors.nome)}
            />
            {form.formState.errors.nome && (
              <p className="text-sm text-destructive">{form.formState.errors.nome.message}</p>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <Label className="text-base">Competências</Label>
              {form.formState.errors.competencias?.root && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.competencias.root.message}
                </p>
              )}
            </div>

            {fields.map((field, index) => (
              <div
                key={field.id}
                className="flex items-start gap-3 rounded-lg border bg-card p-4 text-card-foreground shadow-sm"
              >
                <div className="flex shrink-0 flex-col gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => move(index, index - 1)}
                    disabled={index === 0}
                    aria-label={`Mover competência ${index + 1} para cima`}
                  >
                    <ArrowUp />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => move(index, index + 1)}
                    disabled={index === fields.length - 1}
                    aria-label={`Mover competência ${index + 1} para baixo`}
                  >
                    <ArrowDown />
                  </Button>
                </div>
                <div className="flex-1 space-y-3">
                  <div>
                    <Input
                      {...form.register(`competencias.${index}.nome`)}
                      placeholder="Nome da competência"
                      className="h-auto rounded-none border-x-0 border-t-0 bg-transparent px-0 font-medium shadow-none focus-visible:ring-0"
                      aria-label={`Nome da competência ${index + 1}`}
                      aria-invalid={Boolean(form.formState.errors.competencias?.[index]?.nome)}
                    />
                    {form.formState.errors.competencias?.[index]?.nome && (
                      <p className="mt-1 text-xs text-destructive">
                        {form.formState.errors.competencias[index].nome.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Input
                      {...form.register(`competencias.${index}.descricao`)}
                      placeholder="Descrição da competência"
                      className="h-auto rounded-none border-x-0 border-t-0 bg-transparent px-0 text-sm text-muted-foreground shadow-none focus-visible:ring-0"
                      aria-label={`Descrição da competência ${index + 1}`}
                      aria-invalid={Boolean(form.formState.errors.competencias?.[index]?.descricao)}
                    />
                    {form.formState.errors.competencias?.[index]?.descricao && (
                      <p className="mt-1 text-xs text-destructive">
                        {form.formState.errors.competencias[index].descricao.message}
                      </p>
                    )}
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => remove(index)}
                  className="text-muted-foreground hover:text-destructive"
                  aria-label={`Remover competência ${index + 1}`}
                >
                  <Trash2 size={18} />
                </Button>
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              className="w-full border-dashed"
              onClick={() => append({ ...EMPTY_COMPETENCY })}
            >
              <Plus size={16} className="mr-2" />
              Adicionar competência
            </Button>
          </div>
        </div>

        <div className="w-full space-y-4 lg:w-80">
          <Card className="bg-muted/30">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Info size={16} className="text-primary" />
                Sobre a escala 1–5
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground">
              Cada competência recebe uma única nota de 1 a 5. O feedback textual fica nas perguntas abertas do fim da avaliação.
            </CardContent>
          </Card>

          <Card className="bg-muted/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Informações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs text-muted-foreground">
              {mode === "edit" ? (
                <p>As alterações serão salvas neste template.</p>
              ) : (
                <>
                  <p>Ao salvar, será criado um template independente.</p>
                  <p>O template de origem não será alterado.</p>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
