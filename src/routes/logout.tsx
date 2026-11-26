import { useEffect, useRef } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { AuthShell } from "@/components/site/AuthShell";
import { buildPrivateHead } from "@/data/metadata";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/hooks/use-language";

export const Route = createFileRoute("/logout")({
  head: () => buildPrivateHead("Signing Out"),
  component: LogoutPage,
});

function LogoutPage() {
  const { signOut } = useAuth();
  const { locale } = useLanguage();
  const navigate = useNavigate();
  const ranRef = useRef(false);

  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;

    const run = async () => {
      await signOut();
      toast.info(locale === "es" ? "Sesión cerrada correctamente." : "You have been signed out.");
      await navigate({ to: "/", replace: true });
    };

    void run();
  }, [locale, navigate, signOut]);

  return (
    <AuthShell
      eyebrow={locale === "es" ? "Sesión" : "Session"}
      title={locale === "es" ? "Cerrando sesión" : "Signing out"}
    >
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin text-primary" />
        <span>
          {locale === "es"
            ? "Limpiando tu sesión de forma segura..."
            : "Clearing your session securely..."}
        </span>
      </div>
    </AuthShell>
  );
}
