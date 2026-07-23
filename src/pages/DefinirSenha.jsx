import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Navigate, useNavigate } from "react-router-dom";
import { CheckCircle2, Link2Off } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { FIRST_ACCESS_INVITE_MARKER, supabase } from "@/lib/supabaseClient";
import { firstAccessSchema } from "@/lib/validationSchemas";
import { AuthLoadingScreen } from "@/routes/ProtectedRoute";

function DefinirSenha() {
  const navigate = useNavigate();
  const { session, profile, loading } = useAuth();
  const [hasInviteMarker] = useState(
    () => sessionStorage.getItem(FIRST_ACCESS_INVITE_MARKER) === "true"
  );
  const [submitError, setSubmitError] = useState("");
  const [updated, setUpdated] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(firstAccessSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  useEffect(() => {
    if (updated) {
      const timer = window.setTimeout(() => navigate("/dashboard", { replace: true }), 900);
      return () => window.clearTimeout(timer);
    }
  }, [navigate, updated]);

  useEffect(() => {
    if (!loading && hasInviteMarker && !session) {
      sessionStorage.removeItem(FIRST_ACCESS_INVITE_MARKER);
    }
  }, [hasInviteMarker, loading, session]);

  async function onSubmit({ password }) {
    setSubmitError("");
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setSubmitError(
        error.status === 401
          ? "Sua sessão expirou. Solicite um novo convite ao RH."
          : "Não foi possível definir a senha. Tente novamente."
      );
      return;
    }

    sessionStorage.removeItem(FIRST_ACCESS_INVITE_MARKER);
    setUpdated(true);
  }

  if (loading) return <AuthLoadingScreen />;

  if (updated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <Card className="w-full max-w-sm">
          <CardContent className="flex flex-col items-center py-10 text-center">
            <CheckCircle2 className="mb-4 text-chart-5" size={42} />
            <h1 className="text-xl font-bold text-foreground">Senha definida</h1>
            <p className="mt-2 text-sm text-muted-foreground">Abrindo seu dashboard...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!hasInviteMarker || !session || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <Card className="w-full max-w-sm">
          <CardContent className="flex flex-col items-center py-10 text-center">
            <Link2Off className="mb-4 text-destructive" size={42} />
            <h1 className="text-xl font-bold text-foreground">Convite inválido ou expirado</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Solicite um novo convite ao RH ou ao administrador da sua empresa.
            </p>
            <Button type="button" variant="outline" className="mt-6" onClick={() => navigate("/", { replace: true })}>
              Voltar ao login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!session.user) return <Navigate to="/" replace />;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-primary">Feedback 360°</CardTitle>
          <CardDescription>
            Olá, {profile.nome_completo}. Defina sua senha para concluir o primeiro acesso.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="new-password">Nova senha</Label>
              <Input
                id="new-password"
                type="password"
                autoComplete="new-password"
                placeholder="Mínimo de 8 caracteres"
                aria-invalid={Boolean(errors.password)}
                {...register("password")}
              />
              {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="confirm-password">Confirmar senha</Label>
              <Input
                id="confirm-password"
                type="password"
                autoComplete="new-password"
                placeholder="Repita a nova senha"
                aria-invalid={Boolean(errors.confirmPassword)}
                {...register("confirmPassword")}
              />
              {errors.confirmPassword && (
                <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
              )}
            </div>

            {submitError && (
              <div className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive" role="alert">
                {submitError}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Salvando..." : "Definir senha e continuar"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default DefinirSenha;
