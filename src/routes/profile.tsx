import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ArrowLeft,
  Clock,
  KeyRound,
  Loader2,
  LogOut,
  ShieldCheck,
  User as UserIcon,
} from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { buildPrivateHead } from "@/data/metadata";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/hooks/use-language";
import { requireActiveUser } from "@/lib/auth-guards";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

const profileSchema = z.object({
  fullName: z.string().trim().min(2, "Name must be at least 2 characters"),
  phone: z.string().trim().max(32).optional(),
  locale: z.enum(["en", "es"]),
  goals: z.string().trim().max(500).optional(),
  injuriesNotes: z.string().trim().max(500).optional(),
  emergencyContact: z.string().trim().max(200).optional(),
});

const passwordSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(8, "Please confirm your new password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ProfileFormValues = z.infer<typeof profileSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;

export const Route = createFileRoute("/profile")({
  beforeLoad: async ({ location }) => {
    await requireActiveUser({ locationHref: location.href });
  },
  head: () => buildPrivateHead("Profile", "Manage your Alex Moreno Barcelona training profile."),
  component: ProfilePage,
});

function getInitials(name?: string | null, email?: string | null): string {
  const source = (name && name.trim()) || email || "AM";
  const [first, second] = source.split(/\s+/).filter(Boolean);
  if (first && second) {
    return `${first.charAt(0)}${second.charAt(0)}`.toUpperCase();
  }
  return source.slice(0, 2).toUpperCase();
}

function ProfilePage() {
  const { user, profile, role, isAdmin, isLoading, refreshProfile } = useAuth();
  const { locale, setLocale } = useLanguage();
  const isEs = locale === "es";
  const [savingPassword, setSavingPassword] = useState(false);

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: profile?.full_name ?? "",
      phone: profile?.phone ?? "",
      locale: profile?.locale ?? locale,
      goals: profile?.goals ?? "",
      injuriesNotes: profile?.injuries_notes ?? "",
      emergencyContact: profile?.emergency_contact ?? "",
    },
  });

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  useEffect(() => {
    if (!profile) return;
    profileForm.reset({
      fullName: profile.full_name,
      phone: profile.phone ?? "",
      locale: profile.locale,
      goals: profile.goals ?? "",
      injuriesNotes: profile.injuries_notes ?? "",
      emergencyContact: profile.emergency_contact ?? "",
    });
  }, [profile, profileForm]);

  const { data: loginHistory = [] } = useQuery({
    queryKey: ["profile-login-history", user?.id],
    enabled: Boolean(user?.id),
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("user_login_history")
        .select("id, auth_method, success, logged_in_at, ip_address")
        .eq("user_id", user.id)
        .order("logged_in_at", { ascending: false })
        .limit(5);
      if (error) return [];
      return data ?? [];
    },
  });

  const handleSaveProfile = async (values: ProfileFormValues) => {
    if (!user) return;

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: values.fullName,
        phone: values.phone || null,
        locale: values.locale,
        goals: values.goals || null,
        injuries_notes: values.injuriesNotes || null,
        emergency_contact: values.emergencyContact || null,
      })
      .eq("id", user.id);

    if (error) {
      toast.error(error.message);
      return;
    }

    setLocale(values.locale);
    await refreshProfile();
    toast.success(isEs ? "Perfil actualizado." : "Profile updated.");
  };

  const handleUpdatePassword = async (values: PasswordFormValues) => {
    setSavingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: values.password });
      if (error) {
        toast.error(error.message);
        return;
      }
      passwordForm.reset();
      toast.success(isEs ? "Contraseña actualizada." : "Password updated.");
    } finally {
      setSavingPassword(false);
    }
  };

  const selectedLocale = profileForm.watch("locale");

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/70 bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-4 px-5">
          <div className="flex items-center gap-4">
            <Link to="/" className="font-display text-xl font-bold uppercase tracking-wide">
              Alex Moreno<span className="text-primary">.</span>
            </Link>
            <Separator orientation="vertical" className="h-5" />
            <Link
              to={isAdmin ? "/admin" : "/client"}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="size-3.5" />
              <span>
                {isAdmin
                  ? isEs
                    ? "Panel Admin"
                    : "Admin Portal"
                  : isEs
                    ? "Mi panel"
                    : "Dashboard"}
              </span>
            </Link>
          </div>

          <Button asChild variant="outline" size="sm" className="gap-1.5">
            <Link to="/logout">
              <LogOut className="size-3.5" />
              <span>{isEs ? "Cerrar sesión" : "Log out"}</span>
            </Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-6 px-5 py-10">
        {/* Header Identity Card */}
        <div className="flex flex-col justify-between gap-4 rounded-sm border border-border bg-card p-6 sm:flex-row sm:items-center">
          <div className="flex items-center gap-4">
            <Avatar className="size-16 rounded-sm border border-border">
              <AvatarImage src={profile?.avatar_url ?? undefined} alt={profile?.full_name ?? ""} />
              <AvatarFallback className="rounded-sm bg-primary/15 font-display text-2xl font-bold text-primary">
                {getInitials(profile?.full_name, user?.email)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                {isEs ? "Cuenta personal" : "Member profile"}
              </p>
              <h1 className="mt-1 font-display text-3xl font-extrabold uppercase sm:text-4xl">
                {profile?.full_name ?? user?.email}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span>{user?.email}</span>
                {profile?.slug && (
                  <>
                    <span>·</span>
                    <span className="font-mono text-[11px]">@{profile.slug}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="outline"
              className={cn(
                "rounded-sm uppercase tracking-wider text-[11px]",
                role === "admin"
                  ? "border-primary/40 bg-primary/15 text-primary"
                  : role === "client"
                    ? "border-emerald-500/30 bg-emerald-500/15 text-emerald-400"
                    : "border-border bg-secondary text-muted-foreground",
              )}
            >
              {role ?? "user"}
            </Badge>
            <Badge
              variant="outline"
              className="rounded-sm border-emerald-500/30 bg-emerald-500/15 text-[11px] uppercase tracking-wider text-emerald-400"
            >
              {profile?.account_status ?? "active"}
            </Badge>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Profile Details Form */}
          <Card className="rounded-sm border-border bg-card lg:col-span-2">
            <CardHeader>
              <div className="flex items-center gap-2 text-primary">
                <UserIcon className="size-4" />
                <span className="text-xs font-semibold uppercase tracking-[0.2em]">
                  {isEs ? "Datos de entrenamiento" : "Training profile"}
                </span>
              </div>
              <CardTitle className="font-display text-2xl uppercase">
                {isEs ? "Información personal" : "Personal details"}
              </CardTitle>
              <CardDescription>
                {isEs
                  ? "Alex revisa tus objetivos y notas de lesiones antes de cada sesión."
                  : "Alex reviews your goals and injury notes before sessions to scale loads safely."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={profileForm.handleSubmit(handleSaveProfile)}
                className="space-y-4"
                noValidate
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="profile-name">{isEs ? "Nombre completo" : "Full name"}</Label>
                    <Input id="profile-name" {...profileForm.register("fullName")} />
                    {profileForm.formState.errors.fullName && (
                      <p className="text-xs text-destructive">
                        {profileForm.formState.errors.fullName.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="profile-phone">
                      {isEs ? "WhatsApp / Teléfono" : "WhatsApp / Phone"}
                    </Label>
                    <Input
                      id="profile-phone"
                      placeholder="+34 612 345 678"
                      {...profileForm.register("phone")}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label>{isEs ? "Idioma preferido" : "Preferred language"}</Label>
                  <div className="grid max-w-xs grid-cols-2 gap-2">
                    {(["en", "es"] as const).map((lang) => (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => profileForm.setValue("locale", lang)}
                        className={cn(
                          "h-9 rounded-sm border text-xs font-semibold transition-colors cursor-pointer",
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

                <div className="space-y-1.5">
                  <Label htmlFor="profile-goals">
                    {isEs ? "Objetivos de entrenamiento" : "Training goals"}
                  </Label>
                  <Textarea
                    id="profile-goals"
                    rows={3}
                    placeholder={
                      isEs
                        ? "Ej. Ganar fuerza general, mejorar peso muerto, 3 sesiones/semana..."
                        : "e.g. Build consistent 3x/week strength routine, improve deadlift and mobility..."
                    }
                    {...profileForm.register("goals")}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="profile-injuries">
                    {isEs ? "Lesiones o molestias" : "Injuries or movement notes"}
                  </Label>
                  <Textarea
                    id="profile-injuries"
                    rows={3}
                    placeholder={
                      isEs
                        ? "Ej. Molestia leve en hombro izquierdo o rodilla..."
                        : "e.g. Mild left shoulder impingement, lower-back stiffness..."
                    }
                    {...profileForm.register("injuriesNotes")}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="profile-emergency">
                    {isEs ? "Contacto de emergencia" : "Emergency contact"}
                  </Label>
                  <Input
                    id="profile-emergency"
                    placeholder={isEs ? "Nombre y teléfono" : "Name and phone number"}
                    {...profileForm.register("emergencyContact")}
                  />
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    className="h-10 px-6 font-semibold"
                    disabled={profileForm.formState.isSubmitting}
                  >
                    {profileForm.formState.isSubmitting && (
                      <Loader2 className="mr-2 size-4 animate-spin" />
                    )}
                    {isEs ? "Guardar cambios" : "Save changes"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Security & Login History Column */}
          <div className="space-y-6">
            <Card className="rounded-sm border-border bg-card">
              <CardHeader>
                <div className="flex items-center gap-2 text-primary">
                  <KeyRound className="size-4" />
                  <span className="text-xs font-semibold uppercase tracking-[0.2em]">
                    {isEs ? "Seguridad" : "Security"}
                  </span>
                </div>
                <CardTitle className="font-display text-2xl uppercase">
                  {isEs ? "Cambiar contraseña" : "Change password"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={passwordForm.handleSubmit(handleUpdatePassword)}
                  className="space-y-3"
                  noValidate
                >
                  <div className="space-y-1.5">
                    <Label htmlFor="new-pw">{isEs ? "Nueva contraseña" : "New password"}</Label>
                    <Input
                      id="new-pw"
                      type="password"
                      autoComplete="new-password"
                      placeholder="••••••••"
                      {...passwordForm.register("password")}
                    />
                    {passwordForm.formState.errors.password && (
                      <p className="text-xs text-destructive">
                        {passwordForm.formState.errors.password.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="confirm-pw">
                      {isEs ? "Confirmar contraseña" : "Confirm password"}
                    </Label>
                    <Input
                      id="confirm-pw"
                      type="password"
                      autoComplete="new-password"
                      placeholder="••••••••"
                      {...passwordForm.register("confirmPassword")}
                    />
                    {passwordForm.formState.errors.confirmPassword && (
                      <p className="text-xs text-destructive">
                        {passwordForm.formState.errors.confirmPassword.message}
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    variant="secondary"
                    className="h-10 w-full font-semibold"
                    disabled={savingPassword}
                  >
                    {savingPassword && <Loader2 className="mr-2 size-4 animate-spin" />}
                    {isEs ? "Actualizar contraseña" : "Update password"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="rounded-sm border-border bg-card">
              <CardHeader>
                <div className="flex items-center gap-2 text-primary">
                  <ShieldCheck className="size-4" />
                  <span className="text-xs font-semibold uppercase tracking-[0.2em]">
                    {isEs ? "Actividad" : "Activity"}
                  </span>
                </div>
                <CardTitle className="font-display text-2xl uppercase">
                  {isEs ? "Últimos accesos" : "Recent logins"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loginHistory.length === 0 ? (
                  <p className="text-xs text-muted-foreground">
                    {profile?.last_login_at
                      ? `${isEs ? "Último acceso:" : "Last login:"} ${new Date(profile.last_login_at).toLocaleString()}`
                      : isEs
                        ? "Sin registros de acceso todavía."
                        : "No login history entries recorded yet."}
                  </p>
                ) : (
                  <ul className="space-y-2.5 text-xs">
                    {loginHistory.map((item) => (
                      <li
                        key={item.id}
                        className="flex items-center justify-between gap-2 rounded-sm border border-border bg-background/60 px-3 py-2"
                      >
                        <div className="flex items-center gap-2">
                          <Clock className="size-3.5 text-muted-foreground" />
                          <span className="font-medium capitalize">
                            {item.auth_method.replace("_", " ")}
                          </span>
                        </div>
                        <span className="tabular-nums text-muted-foreground">
                          {new Date(item.logged_in_at).toLocaleDateString()}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
