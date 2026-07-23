import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background gap-4">
      <p className="text-6xl font-bold text-primary">404</p>
      <h1 className="text-2xl font-semibold text-foreground">Página não encontrada</h1>
      <p className="text-sm text-muted-foreground">
        A página que você procura não existe ou foi removida.
      </p>
      <Button asChild className="mt-2">
        <Link to="/dashboard">Voltar ao início</Link>
      </Button>
    </div>
  );
}

export default NotFound;