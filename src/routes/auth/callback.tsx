import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { AuthShell } from "@/components/site/AuthShell";
import { Button } from "@/components/ui/button";
import { buildPrivateHead } from "@/data/metadata";
import { useLanguage } from "@/hooks/use-language";
import { getAuthGuardSnapshot, resolvePostLoginDestination } from "@/lib/auth-guards";
import { recordLoginEvent } from "@/lib/auth-events";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/auth/callback")({
  validateSearch: (search: Record<string, unknown>) => ({
    code: typeof search["code"] === "string" ? search["code"] : undefined,
    redirect: typeof search["redirect"] === "string" ? search["redirect"] : undefined,
    type: typeof search["type"] === "string" ? search["type"] : undefined,
    error_description:
      typeof search["error_description"] === "string" ? search["error_description"] : undefined,
  }),
  head: () => buildPrivateHead("Completing Sign In"),
  component: AuthCallbackPage,
});

function AuthCallbackPage() {
  const { locale } = useLanguage();
  const isEs = locale === "es";
  const { code, redirect: requestedRedirect, type, error_description } = Route.useSearch();
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState<string | null>(error_description ?? null);
  const ranRef = useRef(false);

  useEffect(() => {
    if (ranRef.current || error_description) return;
    ranRef.current = true;

    const completeAuth = async () => {
      try {
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) {
            setErrorMessage(error.message);
            toast.error(error.message);
            return;
          }
        }

        const snapshot = await getAuthGuardSnapshot();
        if (!snapshot.user) {
          setErrorMessage(
            isEs
              ? "El enlace ha caducado o ya fue utilizado. Solicita uno nuevo."
              : "This sign-in link has expired or was already used. Please request a new one.",
          );
          return;
        }

        await recordLoginEvent({ userId: snapshot.user.id, authMethod: "magic_link" });

        if (type === "recovery") {
          await navigate({ to: "/reset-password", replace: true });
          return;
        }

        const destination = resolvePostLoginDestination(snapshot.profile, requestedRedirect);
        toast.success(isEs ? "Acceso confirmado." : "Sign-in confirmed.");
        await navigate({ href: destination, replace: true });
      } catch (err) {
        const message = err instanceof Error ? err.message : "Authentication callback failed";
        setErrorMessage(message);
      }
    };

    void completeAuth();
  }, [code, error_description, isEs, navigate, requestedRedirect, type]);

  return (
    <AuthShell
      eyebrow={isEs ? "Autenticación" : "Authentication"}
      title={
        errorMessage
          ? isEs
            ? "Enlace inválido"
            : "Link invalid"
          : isEs
            ? "Verificando acceso"
            : "Verifying sign-in"
      }
    >
      {errorMessage ? (
        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded-sm border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <p>{errorMessage}</p>
          </div>
          <Button asChild className="h-10 w-full font-semibold">
            <Link to="/login" search={{ redirect: requestedRedirect }}>
              {isEs ? "Volver a iniciar sesión" : "Back to log in"}
            </Link>
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin text-primary" />
          <span>
            {isEs
              ? "Completando tu inicio de sesión con Supabase..."
              : "Completing your sign-in securely..."}
          </span>
        </div>
      )}
    </AuthShell>
  );
}
