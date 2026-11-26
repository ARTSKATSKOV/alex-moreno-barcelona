import { createFileRoute, Link } from "@tanstack/react-router";
import { LogOut, Mail, MessageCircle, ShieldAlert } from "lucide-react";
import { AuthShell } from "@/components/site/AuthShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { buildPrivateHead } from "@/data/metadata";
import { CONTACT } from "@/data/site";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/hooks/use-language";

export const Route = createFileRoute("/account-restricted")({
  head: () => buildPrivateHead("Account Restricted"),
  component: AccountRestrictedPage,
});

function AccountRestrictedPage() {
  const { profile, accountStatus, isAuthenticated } = useAuth();
  const { locale } = useLanguage();
  const isEs = locale === "es";

  const statusLabel =
    accountStatus === "banned"
      ? isEs
        ? "Cuenta suspendida"
        : "Banned"
      : accountStatus === "rejected"
        ? isEs
          ? "Acceso rechazado"
          : "Rejected"
        : isEs
          ? "Acceso restringido"
          : "Restricted";

  return (
    <AuthShell
      eyebrow={isEs ? "Estado de la cuenta" : "Account status"}
      title={isEs ? "Acceso restringido" : "Account restricted"}
      subtitle={
        isEs
          ? "No puedes reservar ni gestionar sesiones en este momento."
          : "Booking and portal access are currently disabled for this account."
      }
      maxWidthClass="max-w-lg"
    >
      <div className="space-y-5">
        <div className="flex items-start gap-3 rounded-sm border border-destructive/40 bg-destructive/10 p-4">
          <ShieldAlert className="mt-0.5 size-5 shrink-0 text-destructive" />
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="rounded-sm border-destructive/40 bg-destructive/15 text-[11px] uppercase tracking-wider text-destructive"
              >
                {statusLabel}
              </Badge>
            </div>
            <p className="text-foreground">
              {profile?.moderation_reason
                ? profile.moderation_reason
                : isEs
                  ? "Si crees que se trata de un error, contacta directamente con Alex para revisar tu cuenta."
                  : "If you believe this is a mistake, reach out directly to coach Alex to review your account."}
            </p>
          </div>
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          <Button asChild variant="outline" className="h-10 gap-2">
            <a href={CONTACT.whatsappUrl} target="_blank" rel="noreferrer">
              <MessageCircle className="size-4 text-primary" />
              <span>WhatsApp</span>
            </a>
          </Button>
          <Button asChild variant="outline" className="h-10 gap-2">
            <a href={`mailto:${CONTACT.email}`}>
              <Mail className="size-4 text-primary" />
              <span>{CONTACT.email}</span>
            </a>
          </Button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
          <Link
            to="/"
            className="text-xs font-semibold text-muted-foreground underline underline-offset-4 hover:text-foreground"
          >
            {isEs ? "Volver al inicio" : "Return home"}
          </Link>
          {isAuthenticated && (
            <Button asChild variant="secondary" size="sm" className="gap-1.5">
              <Link to="/logout">
                <LogOut className="size-3.5" />
                <span>{isEs ? "Cerrar sesión" : "Log out"}</span>
              </Link>
            </Button>
          )}
        </div>
      </div>
    </AuthShell>
  );
}
