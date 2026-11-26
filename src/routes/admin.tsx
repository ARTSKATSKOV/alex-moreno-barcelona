import { createFileRoute, Link } from "@tanstack/react-router";
import { LogOut, ShieldCheck, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { buildPrivateHead } from "@/data/metadata";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/hooks/use-language";
import { requireAdmin } from "@/lib/auth-guards";

export const Route = createFileRoute("/admin")({
  beforeLoad: async ({ location }) => {
    await requireAdmin({ locationHref: location.href });
  },
  head: () => buildPrivateHead("Admin Portal"),
  component: AdminPortalEntryPage,
});

function AdminPortalEntryPage() {
  const { profile, user } = useAuth();
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
            {isEs ? "Panel de entrenador" : "Coach administration"}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <h1 className="font-display text-4xl font-extrabold uppercase sm:text-5xl">
              {isEs ? "Portal Admin" : "Admin Portal"}
            </h1>
            <Badge
              variant="outline"
              className="rounded-sm border-emerald-500/30 bg-emerald-500/15 text-[11px] uppercase tracking-wider text-emerald-400"
            >
              <ShieldCheck className="mr-1 size-3" />
              Admin
            </Badge>
          </div>
        </div>

        <Card className="rounded-sm border-border bg-card">
          <CardHeader>
            <CardTitle className="font-display text-2xl uppercase">
              {isEs ? "Acceso verificado" : "Coach access verified"}
            </CardTitle>
            <CardDescription>
              {isEs
                ? `Conectado como ${profile?.full_name ?? user?.email}. Los módulos completos de sesiones, calendario, reservas, clientes y analíticas se conectan en las Phases 6–7.`
                : `Signed in as ${profile?.full_name ?? user?.email}. Full sessions, availability calendar, bookings, clients, and reporting modules wire in during Phases 6–7.`}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button asChild>
              <Link to="/">{isEs ? "Ver sitio público" : "View public site"}</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/client">{isEs ? "Vista cliente" : "Client view"}</Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
