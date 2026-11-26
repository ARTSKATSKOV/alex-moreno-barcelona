import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckCircle2, Loader2, Mail } from "lucide-react";
import { toast } from "sonner";
import { AuthShell } from "@/components/site/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { buildPrivateHead } from "@/data/metadata";
import { useLanguage } from "@/hooks/use-language";
import {
  getAuthGuardSnapshot,
  redirectIfAuthenticated,
  resolvePostLoginDestination,
  sanitizeRedirectPath,
} from "@/lib/auth-guards";
import { recordLoginEvent } from "@/lib/auth-events";
import { supabase } from "@/lib/supabase";

const passwordLoginSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address"),
  password: z.string().min(1, "Please enter your password"),
});

const magicLinkSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address"),
});

type PasswordLoginValues = z.infer<typeof passwordLoginSchema>;
type MagicLinkValues = z.infer<typeof magicLinkSchema>;

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>) => ({
    redirect: typeof search["redirect"] === "string" ? search["redirect"] : undefined,
  }),
  beforeLoad: async ({ search }) => {
    await redirectIfAuthenticated({ requestedRedirect: search.redirect });
  },
  head: () => buildPrivateHead("Log In", "Sign in to your Alex Moreno Barcelona account."),
  component: LoginPage,
});

function LoginPage() {
  const { locale } = useLanguage();
  const isEs = locale === "es";
  const { redirect: requestedRedirect } = Route.useSearch();
  const navigate = useNavigate();

  const [serverError, setServerError] = useState<string | null>(null);
  const [magicLinkSentTo, setMagicLinkSentTo] = useState<string | null>(null);

  const passwordForm = useForm<PasswordLoginValues>({
    resolver: zodResolver(passwordLoginSchema),
    defaultValues: { email: "", password: "" },
  });

  const magicForm = useForm<MagicLinkValues>({
    resolver: zodResolver(magicLinkSchema),
    defaultValues: { email: "" },
  });

  const handlePasswordSubmit = async (values: PasswordLoginValues) => {
    setServerError(null);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    });

    if (error || !data.user) {
      const message = error?.message ?? "Invalid email or password";
      setServerError(message);
      toast.error(message);
      return;
    }

    await recordLoginEvent({ userId: data.user.id, authMethod: "password" });
    const snapshot = await getAuthGuardSnapshot();
    const destination = resolvePostLoginDestination(snapshot.profile, requestedRedirect);

    if (destination === "/account-restricted") {
      toast.error(
        isEs
          ? "Tu cuenta tiene el acceso restringido."
          : "Your account access is currently restricted.",
      );
    } else {
      toast.success(isEs ? "Sesión iniciada." : "Signed in successfully.");
    }

    await navigate({ href: destination, replace: true });
  };

  const handleMagicLinkSubmit = async (values: MagicLinkValues) => {
    setServerError(null);
    const safeNext = sanitizeRedirectPath(requestedRedirect, "/client");
    const emailRedirectTo =
      typeof window !== "undefined"
        ? `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(safeNext)}`
        : undefined;

    const { error } = await supabase.auth.signInWithOtp({
      email: values.email,
      ...(emailRedirectTo ? { options: { emailRedirectTo } } : {}),
    });

    if (error) {
      setServerError(error.message);
      toast.error(error.message);
      return;
    }

    setMagicLinkSentTo(values.email);
    toast.success(
      isEs ? "Enlace mágico enviado a tu correo." : "Magic sign-in link sent to your email.",
    );
  };

  return (
    <AuthShell
      eyebrow={isEs ? "Acceso de miembros" : "Member access"}
      title={isEs ? "Iniciar sesión" : "Log in"}
      subtitle={
        isEs
          ? "Accede a tus reservas, lista de espera y perfil de entrenamiento."
          : "Access your upcoming sessions, waitlist, and training profile."
      }
    >
      <Tabs defaultValue="password" className="w-full">
        <TabsList className="grid w-full grid-cols-2 rounded-sm">
          <TabsTrigger value="password" className="rounded-sm">
            {isEs ? "Contraseña" : "Password"}
          </TabsTrigger>
          <TabsTrigger value="magic" className="rounded-sm">
            {isEs ? "Enlace mágico" : "Magic Link"}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="password" className="mt-5">
          <form
            onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)}
            className="space-y-4"
            noValidate
          >
            <div className="space-y-1.5">
              <Label htmlFor="login-email">{isEs ? "Correo electrónico" : "Email"}</Label>
              <Input
                id="login-email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                {...passwordForm.register("email")}
              />
              {passwordForm.formState.errors.email && (
                <p className="text-xs text-destructive">
                  {passwordForm.formState.errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="login-password">{isEs ? "Contraseña" : "Password"}</Label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-medium text-muted-foreground underline underline-offset-4 hover:text-primary"
                >
                  {isEs ? "¿Olvidaste tu contraseña?" : "Forgot password?"}
                </Link>
              </div>
              <Input
                id="login-password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                {...passwordForm.register("password")}
              />
              {passwordForm.formState.errors.password && (
                <p className="text-xs text-destructive">
                  {passwordForm.formState.errors.password.message}
                </p>
              )}
            </div>

            {serverError && (
              <div className="rounded-sm border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                {serverError}
              </div>
            )}

            <Button
              type="submit"
              className="h-11 w-full font-semibold"
              disabled={passwordForm.formState.isSubmitting}
            >
              {passwordForm.formState.isSubmitting && (
                <Loader2 className="mr-2 size-4 animate-spin" />
              )}
              {isEs ? "Entrar" : "Log in"}
            </Button>
          </form>
        </TabsContent>

        <TabsContent value="magic" className="mt-5">
          {magicLinkSentTo ? (
            <div className="space-y-4">
              <div className="flex items-start gap-3 rounded-sm border border-emerald-500/30 bg-emerald-500/10 p-4">
                <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-400" />
                <div className="text-sm">
                  <p className="font-semibold text-foreground">
                    {isEs ? "Enlace enviado a" : "Magic link sent to"}{" "}
                    <span className="text-primary">{magicLinkSentTo}</span>
                  </p>
                  <p className="mt-1 text-muted-foreground">
                    {isEs
                      ? "Haz clic en el enlace de tu bandeja de entrada para entrar al instante."
                      : "Click the link in your inbox to sign in immediately without a password."}
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                className="h-10 w-full"
                onClick={() => setMagicLinkSentTo(null)}
              >
                {isEs ? "Usar otro correo" : "Use a different email"}
              </Button>
            </div>
          ) : (
            <form
              onSubmit={magicForm.handleSubmit(handleMagicLinkSubmit)}
              className="space-y-4"
              noValidate
            >
              <div className="space-y-1.5">
                <Label htmlFor="magic-email">{isEs ? "Correo electrónico" : "Email"}</Label>
                <Input
                  id="magic-email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  {...magicForm.register("email")}
                />
                {magicForm.formState.errors.email && (
                  <p className="text-xs text-destructive">
                    {magicForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              {serverError && (
                <div className="rounded-sm border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                  {serverError}
                </div>
              )}

              <Button
                type="submit"
                className="h-11 w-full font-semibold"
                disabled={magicForm.formState.isSubmitting}
              >
                {magicForm.formState.isSubmitting ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                ) : (
                  <Mail className="mr-2 size-4" />
                )}
                {isEs ? "Enviar enlace mágico" : "Send magic link"}
              </Button>
            </form>
          )}
        </TabsContent>
      </Tabs>

      <p className="mt-6 border-t border-border pt-4 text-center text-xs text-muted-foreground">
        {isEs ? "¿Primera vez entrenando aquí?" : "New to Alex Moreno Barcelona?"}{" "}
        <Link
          to="/signup"
          search={{ redirect: requestedRedirect }}
          className="font-semibold text-primary underline underline-offset-4 hover:text-primary/80"
        >
          {isEs ? "Crear cuenta" : "Create an account"}
        </Link>
      </p>
    </AuthShell>
  );
}
