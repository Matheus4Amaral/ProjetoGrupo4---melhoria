import { Link } from "react-router-dom";
import { Construction } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";


export default function ComingSoon({ title, description, plannedItems = [] }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center px-6 py-14 text-center">
          <Construction className="mb-4 h-12 w-12 text-muted-foreground/60" />
          <h2 className="text-lg font-medium text-foreground">Ainda em construção</h2>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            Esta área ainda não está conectada aos dados reais. Preferimos deixá-la vazia
            a exibir números que não refletem o seu ciclo.
          </p>

          {plannedItems.length > 0 && (
            <ul className="mt-6 space-y-1.5 text-left text-sm text-muted-foreground">
              {plannedItems.map((item) => (
                <li key={item} className="flex gap-2">
                  <span aria-hidden="true" className="text-primary">
                    •
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          )}

          <Button asChild variant="outline" className="mt-8">
            <Link to="/dashboard">Voltar ao dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
