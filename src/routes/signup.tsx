import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { AuthShell } from "@/components/site/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { cn } from "@/lib/utils";

const signupSchema = z.object({
  fullName: z.string().trim().min(2, "Please enter your full name"),
  email: z.string().trim().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  phone: z.string().trim().max(32).optional(),
  locale: z.enum(["en", "es"]),
});

type SignupValues = z.infer<typeof signupSchema>;

export const Route = createFileRoute("/signup")({
  validateSearch: (search: Record<string, unknown>) => ({
    redirect: typeof search["redirect"] === "string" ? search["redirect"] : undefined,
  }),
  beforeLoad: async ({ search }) => {
    await redirectIfAuthenticated({ requestedRedirect: search.redirect });
  },
  head: () => buildPrivateHead("Sign Up", "Create your Alex Moreno Barcelona training account."),
  component: SignupPage,
});

function SignupPage() {
  const { locale: uiLocale, setLocale } = useLanguage();
  const { redirect: requestedRedirect } = Route.useSearch();
  const navigate = useNavigate();
  const [confirmationEmail, setConfirmationEmail] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      phone: "",
      locale: uiLocale,
    },
  });

  const selectedLocale = form.watch("locale");
  const isEs = uiLocale === "es";

  const onSubmit = async (values: SignupValues) => {
    setServerError(null);
    const safeNext = sanitizeRedirectPath(requestedRedirect, "/client");
    const emailRedirectTo =
      typeof window !== "undefined"
        ? `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(safeNext)}`
        : undefined;

    const { data, error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        ...(emailRedirectTo ? { emailRedirectTo } : {}),
        data: {
          full_name: values.fullName,
          phone: values.phone || null,
          locale: values.locale,
        },
      },
    });

    if (error) {
      setServerError(error.message);
      toast.error(error.message);
      return;
    }

    setLocale(values.locale);

    if (data.session && data.user) {
      await recordLoginEvent({ userId: data.user.id, authMethod: "password" });
      const snapshot = await getAuthGuardSnapshot();
      const destination = resolvePostLoginDestination(snapshot.profile, requestedRedirect);
      toast.success(
        isEs ? "Cuenta creada. ¡Bienvenido al equipo!" : "Account created. Welcome to the crew!",
      );
      await navigate({ href: destination, replace: true });
      return;
    }

    setConfirmationEmail(values.email);
    toast.success(
      isEs
        ? "Revisa tu correo para confirmar tu cuenta."
        : "Check your email to confirm your account.",
    );
  };

  if (confirmationEmail) {
    return (
      <AuthShell
        eyebrow={isEs ? "Cuenta creada" : "Account created"}
        title={isEs ? "Confirma tu correo" : "Confirm your email"}
        subtitle={
          isEs
            ? "Un paso más antes de reservar tu primera sesión."
            : "One quick step before booking your first session."
        }
      >
        <div className="space-y-5">
          <div className="flex items-start gap-3 rounded-sm border border-emerald-500/30 bg-emerald-500/10 p-4">
            <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-400" />
            <div className="text-sm">
              <p className="font-semibold text-foreground">
                {isEs ? "Enlace enviado a" : "Confirmation link sent to"}{" "}
                <span className="text-primary">{confirmationEmail}</span>
              </p>
              <p className="mt-1 text-muted-foreground">
                {isEs
                  ? "Abre el enlace del correo para activar tu cuenta y volver directamente al calendario."
                  : "Open the link in your inbox to activate your account and jump straight back into booking."}
              </p>
            </div>
          </div>

          <Button asChild className="h-11 w-full font-semibold">
            <Link to="/login" search={{ redirect: requestedRedirect }}>
              {isEs ? "Ir a iniciar sesión" : "Continue to log in"}
            </Link>
          </Button>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      eyebrow={isEs ? "Nuevo miembro" : "New member"}
      title={isEs ? "Crea tu cuenta" : "Create account"}
      subtitle={
        isEs
          ? "Regístrate en segundos para reservar sesiones en estudio o al aire libre en Barcelona."
          : "Sign up in seconds to book studio or outdoor sessions across Barcelona."
      }
    >
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="space-y-1.5">
          <Label htmlFor="signup-name">{isEs ? "Nombre completo" : "Full name"}</Label>
          <Input
            id="signup-name"
            type="text"
            autoComplete="name"
            placeholder="Laura Martínez"
            {...form.register("fullName")}
          />
          {form.formState.errors.fullName && (
            <p className="text-xs text-destructive">{form.formState.errors.fullName.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="signup-email">{isEs ? "Correo electrónico" : "Email"}</Label>
          <Input
            id="signup-email"
            type="email"
            autoComplete="email"
            placeholder="laura@example.com"
            {...form.register("email")}
          />
          {form.formState.errors.email && (
            <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="signup-password">{isEs ? "Contraseña" : "Password"}</Label>
          <Input
            id="signup-password"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            {...form.register("password")}
          />
          {form.formState.errors.password && (
            <p className="text-xs text-destructive">{form.formState.errors.password.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="signup-phone">
            {isEs ? "WhatsApp / Teléfono (opcional)" : "WhatsApp / Phone (optional)"}
          </Label>
          <Input
            id="signup-phone"
            type="tel"
            autoComplete="tel"
            placeholder="+34 612 345 678"
            {...form.register("phone")}
          />
          <p className="text-xs text-muted-foreground">
            {isEs
              ? "Solo para avisos rápidos de lluvia o cambios de punto de encuentro."
              : "Only used for outdoor weather alerts or meeting-point updates."}
          </p>
        </div>

        <div className="space-y-1.5">
          <Label>{isEs ? "Idioma preferido" : "Preferred language"}</Label>
          <div className="grid grid-cols-2 gap-2">
            {(["en", "es"] as const).map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => form.setValue("locale", lang)}
                className={cn(
                  "h-10 rounded-sm border text-sm font-semibold transition-colors cursor-pointer",
                  selectedLocale === lang
                    ? "border-primary bg-primary/15 text-primary"
                    : "border-border bg-background text-muted-foreground hover:text-foreground",
                )}
              >
                {lang === "en" ? "English (EN)" : "Español (ES)"}
              </button>
            ))}
          </div>
        </div>

        {serverError && (
          <div className="rounded-sm border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">
            {serverError}
          </div>
        )}

        <Button
          type="submit"
          className="h-11 w-full font-semibold"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting && <Loader2 className="mr-2 size-4 animate-spin" />}
          {isEs ? "Crear cuenta" : "Create account"}
        </Button>

        <p className="pt-2 text-center text-xs text-muted-foreground">
          {isEs ? "¿Ya tienes cuenta?" : "Already have an account?"}{" "}
          <Link
            to="/login"
            search={{ redirect: requestedRedirect }}
            className="font-semibold text-primary underline underline-offset-4 hover:text-primary/80"
          >
            {isEs ? "Iniciar sesión" : "Log in"}
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
