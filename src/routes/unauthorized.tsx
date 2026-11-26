import { createFileRoute, Link } from "@tanstack/react-router";
import { Lock } from "lucide-react";
import { AuthShell } from "@/components/site/AuthShell";
import { Button } from "@/components/ui/button";
import { buildPrivateHead } from "@/data/metadata";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/hooks/use-language";

export const Route = createFileRoute("/unauthorized")({
  head: () => buildPrivateHead("Unauthorized"),
  component: UnauthorizedPage,
});

function UnauthorizedPage() {
  const { isAuthenticated } = useAuth();
  const { locale } = useLanguage();
  const isEs = locale === "es";

  return (
    <AuthShell
      eyebrow="403 · Forbidden"
      title={isEs ? "Acceso no autorizado" : "Access denied"}
      subtitle={
        isEs
          ? "Esta sección es exclusiva para el equipo de entrenadores."
          : "This area is restricted to coach administrators."
      }
    >
      <div className="space-y-5">
        <div className="flex items-start gap-3 rounded-sm border border-border bg-background/60 p-4 text-sm text-muted-foreground">
          <Lock className="mt-0.5 size-4 shrink-0 text-primary" />
          <p>
            {isEs
              ? "Tu cuenta no tiene permisos de administrador. Puedes gestionar tus sesiones desde tu panel de cliente."
              : "Your account does not have administrator privileges. You can manage your classes from your member dashboard."}
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          {isAuthenticated && (
            <Button asChild className="h-10 flex-1 font-semibold">
              <Link to="/client">{isEs ? "Ir a mi panel" : "Go to Dashboard"}</Link>
            </Button>
          )}
          <Button asChild variant="outline" className="h-10 flex-1">
            <Link to="/">{isEs ? "Volver al horario" : "Back to schedule"}</Link>
          </Button>
        </div>
      </div>
    </AuthShell>
  );
}
