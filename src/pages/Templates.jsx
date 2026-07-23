import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Copy, FileText, Pencil, Plus, RefreshCw, Settings, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { deleteTemplate, listTemplates } from "@/services/templatesService";

function pluralize(count, singular, plural) {
  return `${count} ${count === 1 ? singular : plural}`;
}

function TemplateListSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true" aria-label="Carregando templates">
      {[0, 1, 2].map((item) => (
        <Card key={item} className="space-y-4 p-6">
          <div className="flex justify-between">
            <Skeleton className="h-9 w-9" />
            <Skeleton className="h-5 w-16" />
          </div>
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-9 w-full" />
        </Card>
      ))}
    </div>
  );
}

export default function Templates() {
  const navigate = useNavigate();
  const location = useLocation();
  const [templates, setTemplates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [feedback, setFeedback] = useState(location.state?.feedback || "");
  const [deleteError, setDeleteError] = useState("");
  const [templateToDelete, setTemplateToDelete] = useState(null);
  const [templateInDetails, setTemplateInDetails] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadTemplates = useCallback(async () => {
    await Promise.resolve();
    setIsLoading(true);
    setLoadError("");

    try {
      setTemplates(await listTemplates());
    } catch (error) {
      setLoadError(error.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isCurrent = true;

    listTemplates()
      .then((items) => {
        if (isCurrent) setTemplates(items);
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
  }, []);

  useEffect(() => {
    if (location.state?.feedback) {
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location.pathname, location.state, navigate]);

  const openDeleteDialog = (template) => {
    setDeleteError("");
    setTemplateToDelete(template);
  };

  const closeDeleteDialog = () => {
    if (!isDeleting) {
      setTemplateToDelete(null);
      setDeleteError("");
    }
  };

  const confirmDelete = async () => {
    if (!templateToDelete || isDeleting) return;

    setIsDeleting(true);
    setDeleteError("");

    try {
      await deleteTemplate(templateToDelete.id);
      setTemplateToDelete(null);
      setFeedback("Template excluído com sucesso.");
      await loadTemplates();
    } catch (error) {
      setDeleteError(error.message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-6xl space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Templates de Competências</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Conjuntos de competências avaliadas na escala 1–5. Clone um existente ou crie um novo template.
          </p>
        </div>
        <Button onClick={() => navigate("/templates/novo")} className="gap-2">
          <Plus size={16} /> Novo template
        </Button>
      </div>

      <div className="sr-only" aria-live="polite">{feedback}</div>
      {feedback && (
        <div className="rounded-lg border border-primary/25 bg-primary/5 p-3 text-sm text-foreground" role="status">
          {feedback}
        </div>
      )}

      {isLoading ? (
        <TemplateListSkeleton />
      ) : loadError ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-8 text-center" role="alert">
          <h2 className="text-lg font-semibold text-foreground">Não foi possível carregar os templates</h2>
          <p className="mt-2 text-sm text-muted-foreground">{loadError}</p>
          <Button className="mt-5 gap-2" onClick={loadTemplates}>
            <RefreshCw size={16} /> Tentar novamente
          </Button>
        </div>
      ) : templates.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed bg-muted/20 p-12">
          <FileText className="mb-4 h-12 w-12 text-muted-foreground" />
          <h2 className="text-lg font-medium text-foreground">Nenhum template cadastrado</h2>
          <p className="mb-4 mt-1 text-center text-sm text-muted-foreground">
            Crie o primeiro conjunto de competências para começar.
          </p>
          <Button onClick={() => navigate("/templates/novo")}>Criar novo template</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => {
            const isEditable = !template.ehPadrao && template.cycleCount === 0;

            return (
              <Card key={template.id} className="flex flex-col">
                <button
                  type="button"
                  onClick={() => setTemplateInDetails(template)}
                  className="group flex flex-1 flex-col rounded-t-xl text-left outline-none transition-colors hover:bg-muted/30 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
                  aria-label={`Ver detalhes do template ${template.nome}`}
                >
                  <CardHeader className="w-full pb-3">
                    <div className="mb-2 flex items-center justify-between">
                      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
                        {template.ehPadrao ? (
                          <Settings size={16} className="text-primary" />
                        ) : (
                          <FileText size={16} className="text-muted-foreground" />
                        )}
                      </div>
                      {template.ehPadrao && (
                        <Badge variant="secondary" className="text-xs">Padrão</Badge>
                      )}
                    </div>
                    <CardTitle className="text-base">{template.nome}</CardTitle>
                    <CardDescription className="text-xs">
                      {pluralize(template.competencyCount, "competência", "competências")} cadastradas.
                    </CardDescription>
                    <span className="mt-2 text-xs font-medium text-primary group-hover:underline">
                      Ver detalhes
                    </span>
                  </CardHeader>
                </button>
                <CardFooter className="flex flex-col items-stretch gap-3 border-t pt-4">
                  <div className="flex justify-between gap-2 text-xs text-muted-foreground">
                    <span>{pluralize(template.cycleCount, "ciclo", "ciclos")}</span>
                    {template.cycleCount > 0 && <span>Somente clonagem</span>}
                  </div>
                  <div className="flex flex-wrap justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1"
                      onClick={() => navigate(`/templates/${template.id}/clonar`)}
                    >
                      <Copy size={14} /> Clonar
                    </Button>
                    {isEditable && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-1"
                          onClick={() => navigate(`/templates/${template.id}/editar`)}
                        >
                          <Pencil size={14} /> Editar
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-1 text-destructive hover:text-destructive"
                          onClick={() => openDeleteDialog(template)}
                        >
                          <Trash2 size={14} /> Excluir
                        </Button>
                      </>
                    )}
                  </div>
                </CardFooter>
              </Card>
            );
          })}

          <button
            type="button"
            onClick={() => navigate("/templates/novo")}
            className="flex min-h-52 flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-muted-foreground/25 p-6 text-center transition-colors hover:border-primary/50 hover:bg-muted/50"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <Plus className="text-primary" size={20} />
            </span>
            <span className="text-sm font-medium text-foreground">Criar novo template</span>
            <span className="text-xs text-muted-foreground">Comece pelas competências do padrão</span>
          </button>
        </div>
      )}

      <Dialog
        open={Boolean(templateInDetails)}
        onOpenChange={(open) => !open && setTemplateInDetails(null)}
      >
        <DialogContent
          className="max-w-2xl"
          onClose={() => setTemplateInDetails(null)}
        >
          <DialogHeader>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              {templateInDetails?.ehPadrao && <Badge variant="secondary">Padrão</Badge>}
              <span className="text-xs text-muted-foreground">
                {pluralize(templateInDetails?.cycleCount || 0, "ciclo vinculado", "ciclos vinculados")}
              </span>
            </div>
            <DialogTitle>{templateInDetails?.nome}</DialogTitle>
            <DialogDescription>
              {pluralize(templateInDetails?.competencyCount || 0, "competência cadastrada", "competências cadastradas")}
            </DialogDescription>
          </DialogHeader>

          <section aria-labelledby="template-competencies-title">
            <h3 id="template-competencies-title" className="mb-3 text-sm font-semibold text-foreground">
              Competências
            </h3>
            <ol className="max-h-[50vh] space-y-3 overflow-y-auto pr-1">
              {(templateInDetails?.competencias || []).map((competencia, index) => (
                <li key={competencia.id || `${competencia.nome}-${index}`} className="flex gap-3 rounded-lg border bg-muted/20 p-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                    {index + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="font-medium text-foreground">{competencia.nome}</p>
                    <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">
                      {competencia.descricao}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <DialogFooter>
            <Button variant="outline" onClick={() => setTemplateInDetails(null)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(templateToDelete)} onOpenChange={(open) => !open && closeDeleteDialog()}>
        <DialogContent onClose={closeDeleteDialog}>
          <DialogHeader>
            <DialogTitle>Excluir “{templateToDelete?.nome}”?</DialogTitle>
            <DialogDescription>
              Esta ação remove o template e suas competências. Ela não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          {deleteError && (
            <p className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive" role="alert">
              {deleteError}
            </p>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={closeDeleteDialog} disabled={isDeleting}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={isDeleting}>
              {isDeleting ? "Excluindo..." : "Excluir template"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
