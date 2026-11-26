import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Calendar, LogOut, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { buildPrivateHead } from "@/data/metadata";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/hooks/use-language";
import { requireActiveUser } from "@/lib/auth-guards";

export const Route = createFileRoute("/client")({
  beforeLoad: async ({ location }) => {
    await requireActiveUser({ locationHref: location.href });
  },
  head: () => buildPrivateHead("Client Dashboard"),
  component: ClientPortalEntryPage,
});

function ClientPortalEntryPage() {
  const { profile, user, role, isAdmin } = useAuth();
  const { locale } = useLanguage();
  const isEs = locale === "es";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/70 bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-4 px-5">
          <Link to="/" className="font-display text-xl font-bold uppercase tracking-wide">
            Alex Moreno<span className="text-primary">.</span>
          </Link>
          <div className="flex items-center gap-2">
            {isAdmin && (
              <Button asChild variant="outline" size="sm">
                <Link to="/admin">{isEs ? "Panel Admin" : "Admin Portal"}</Link>
              </Button>
            )}
            <Button asChild variant="outline" size="sm" className="gap-1.5">
              <Link to="/profile">
                <User className="size-3.5" />
                <span>{isEs ? "Perfil" : "Profile"}</span>
              </Link>
            </Button>
            <Button asChild variant="ghost" size="sm" className="gap-1.5">
              <Link to="/logout">
                <LogOut className="size-3.5" />
                <span>{isEs ? "Salir" : "Log out"}</span>
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-6 px-5 py-10">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            {isEs ? "Portal de miembro" : "Member dashboard"}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <h1 className="font-display text-4xl font-extrabold uppercase sm:text-5xl">
              {isEs ? "Hola," : "Welcome,"} {profile?.full_name ?? user?.email}
            </h1>
            <Badge
              variant="outline"
              className="rounded-sm border-primary/40 bg-primary/15 text-[11px] uppercase tracking-wider text-primary"
            >
              {role ?? "user"}
            </Badge>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="rounded-sm border-border bg-card">
            <CardHeader>
              <CardTitle className="font-display text-2xl uppercase">
                {isEs ? "Reserva tu próxima sesión" : "Book your next session"}
              </CardTitle>
              <CardDescription>
                {role === "user"
                  ? isEs
                    ? "Tu cuenta pasará automáticamente a Cliente en cuanto confirmes tu primera clase."
                    : "Your account automatically upgrades to Client as soon as you confirm your first class."
                  : isEs
                    ? "Consulta los horarios en estudio y al aire libre de esta semana."
                    : "Browse this week's studio and outdoor slots across Barcelona."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="h-10 gap-2 font-semibold">
                <Link to="/">
                  <Calendar className="size-4" />
                  <span>{isEs ? "Ver horario" : "Browse schedule"}</span>
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="rounded-sm border-border bg-card">
            <CardHeader>
              <CardTitle className="font-display text-2xl uppercase">
                {isEs ? "Tu perfil y objetivos" : "Your training profile"}
              </CardTitle>
              <CardDescription>
                {isEs
                  ? "Actualiza tu WhatsApp, idioma, lesiones y contacto de emergencia."
                  : "Keep your WhatsApp, preferred language, injury notes, and emergency contact up to date."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="h-10 gap-2 font-semibold">
                <Link to="/profile">
                  <User className="size-4" />
                  <span>{isEs ? "Editar perfil" : "Edit profile"}</span>
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
