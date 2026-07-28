import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import {Eye, EyeOff} from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { loginSchema } from "@/lib/validationSchemas";

function Login() {
  const navigate = useNavigate();
  const { login, session, profile, loading, error: authError } = useAuth();
  const [submitError, setSubmitError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  useEffect(() => {
    if (!loading && session && profile) {
      navigate("/dashboard", { replace: true });
    }
  }, [loading, navigate, profile, session]);

  async function onSubmit(values) {
    setSubmitError("");

    try {
      await login(values);
      navigate("/dashboard", { replace: true });
    } catch (error) {
      const isProfileError = error.message?.includes("perfil") || error.message?.includes("inativa");
      setSubmitError(
        isProfileError
          ? error.message
          : "E-mail ou senha inválidos. Verifique os dados e tente novamente."
      );
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-primary">Feedback 360°</CardTitle>
          <CardDescription>Gestão de avaliações e desenvolvimento</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="voce@empresa.com"
                aria-invalid={Boolean(errors.email)}
                {...register("email")}
              />
              {errors.email && (
                <p className="text-xs text-destructive" role="alert">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password">Senha</Label>

              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Digite sua senha"
                  aria-invalid={Boolean(errors.password)}
                  className="pr-9"
                  {...register("password")}
                />
                <button
                 type="button"
                 onClick={() => setShowPassword((prev) => !prev)}
                 aria-label={showPassword ? "Ocultar senha" : "MostrarSenha"}
                 aria-pressed={showPassword}
                 tabIndex={-1}
                 className="absolute inset-y-0 right-0 flex w-9 items-center justify-center text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-r-lg"
                 >
                  {showPassword ? <EyeOff size={16} /> : <Eye size ={16} />}
                  
                </button>
              </div>
              
              {errors.password && (
                <p className="text-xs text-destructive" role="alert">
                  {errors.password.message}
                </p>
              )}
            </div>

            {(submitError || authError) && (
              <div className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive" role="alert">
                {submitError || authError}
              </div>
            )}

            <Button type="submit" className="w-full mt-1" disabled={isSubmitting || loading}>
              {isSubmitting ? "Entrando..." : "Entrar"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default Login;
