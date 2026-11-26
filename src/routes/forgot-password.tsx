import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
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
import { supabase } from "@/lib/supabase";

const forgotSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address"),
});

type ForgotValues = z.infer<typeof forgotSchema>;

export const Route = createFileRoute("/forgot-password")({
  head: () => buildPrivateHead("Forgot Password"),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const { locale } = useLanguage();
  const isEs = locale === "es";
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<ForgotValues>({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (values: ForgotValues) => {
    setServerError(null);
    const redirectTo =
      typeof window !== "undefined" ? `${window.location.origin}/reset-password` : undefined;

    const { error } = await supabase.auth.resetPasswordForEmail(
      values.email,
      redirectTo ? { redirectTo } : undefined,
    );

    if (error) {
      setServerError(error.message);
      toast.error(error.message);
      return;
    }

    setSubmittedEmail(values.email);
    toast.success(
      isEs
        ? "Si el correo existe, recibirás un enlace de recuperación."
        : "If an account exists for that email, a reset link has been sent.",
    );
  };

  return (
    <AuthShell
      eyebrow={isEs ? "Recuperación de acceso" : "Account recovery"}
      title={isEs ? "Restablecer contraseña" : "Forgot password"}
      subtitle={
        isEs
          ? "Introduce tu correo y te enviaremos un enlace seguro para crear una contraseña nueva."
          : "Enter your email and we will send a secure link to choose a new password."
      }
    >
      {submittedEmail ? (
        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded-sm border border-emerald-500/30 bg-emerald-500/10 p-4">
            <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-400" />
            <div className="text-sm">
              <p className="font-semibold text-foreground">
                {isEs ? "Revisa tu bandeja de entrada" : "Check your inbox"}
              </p>
              <p className="mt-1 text-muted-foreground">
                {isEs
                  ? `Si existe una cuenta asociada a ${submittedEmail}, recibirás un enlace de recuperación en unos instantes.`
                  : `If an account exists for ${submittedEmail}, you will receive a password reset link shortly.`}
              </p>
            </div>
          </div>

          <Button asChild variant="outline" className="h-10 w-full">
            <Link to="/login" search={{ redirect: undefined }}>
              {isEs ? "Volver a iniciar sesión" : "Back to log in"}
            </Link>
          </Button>
        </div>
      ) : (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="forgot-email">{isEs ? "Correo electrónico" : "Email"}</Label>
            <Input
              id="forgot-email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              {...form.register("email")}
            />
            {form.formState.errors.email && (
              <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
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
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting && <Loader2 className="mr-2 size-4 animate-spin" />}
            {isEs ? "Enviar enlace de recuperación" : "Send reset link"}
          </Button>

          <p className="pt-2 text-center text-xs text-muted-foreground">
            <Link
              to="/login"
              search={{ redirect: undefined }}
              className="font-semibold text-primary underline underline-offset-4 hover:text-primary/80"
            >
              {isEs ? "Volver a iniciar sesión" : "Back to log in"}
            </Link>
          </p>
        </form>
      )}
    </AuthShell>
  );
}
