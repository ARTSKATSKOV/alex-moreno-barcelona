import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { AuthShell } from "@/components/site/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { buildPrivateHead } from "@/data/metadata";
import { useLanguage } from "@/hooks/use-language";
import { supabase } from "@/lib/supabase";

const resetSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(8, "Please confirm your new password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ResetValues = z.infer<typeof resetSchema>;

export const Route = createFileRoute("/reset-password")({
  head: () => buildPrivateHead("Set New Password"),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const { locale } = useLanguage();
  const isEs = locale === "es";
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<ResetValues>({
    resolver: zodResolver(resetSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const onSubmit = async (values: ResetValues) => {
    setServerError(null);

    const { error } = await supabase.auth.updateUser({
      password: values.password,
    });

    if (error) {
      setServerError(error.message);
      toast.error(error.message);
      return;
    }

    toast.success(
      isEs ? "Contraseña actualizada correctamente." : "Password updated successfully.",
    );
    await navigate({ to: "/client", replace: true });
  };

  return (
    <AuthShell
      eyebrow={isEs ? "Seguridad" : "Security"}
      title={isEs ? "Nueva contraseña" : "Set new password"}
      subtitle={
        isEs
          ? "Elige una contraseña segura de al menos 8 caracteres."
          : "Choose a strong password of at least 8 characters."
      }
    >
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="space-y-1.5">
          <Label htmlFor="reset-password">{isEs ? "Nueva contraseña" : "New password"}</Label>
          <Input
            id="reset-password"
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
          <Label htmlFor="reset-confirm">
            {isEs ? "Confirmar contraseña" : "Confirm new password"}
          </Label>
          <Input
            id="reset-confirm"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            {...form.register("confirmPassword")}
          />
          {form.formState.errors.confirmPassword && (
            <p className="text-xs text-destructive">
              {form.formState.errors.confirmPassword.message}
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
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting && <Loader2 className="mr-2 size-4 animate-spin" />}
          {isEs ? "Guardar contraseña" : "Update password"}
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
    </AuthShell>
  );
}
