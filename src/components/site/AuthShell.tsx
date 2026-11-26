import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { cn } from "@/lib/utils";

export interface AuthShellProps {
  eyebrow: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
  maxWidthClass?: string;
}

export function AuthShell({
  eyebrow,
  title,
  subtitle,
  children,
  maxWidthClass = "max-w-md",
}: AuthShellProps) {
  const { locale, setLocale } = useLanguage();

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="border-b border-border/70 bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-5">
          <Link
            to="/"
            className="font-display text-xl font-bold uppercase tracking-wide rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Alex Moreno<span className="text-primary">.</span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="size-3.5" />
              <span>{locale === "es" ? "Volver al horario" : "Back to schedule"}</span>
            </Link>

            <div
              role="group"
              aria-label="Language"
              className="inline-flex rounded-sm border border-border p-0.5 text-[11px] font-semibold"
            >
              <button
                type="button"
                aria-pressed={locale === "en"}
                onClick={() => setLocale("en")}
                className={cn(
                  "rounded-sm px-1.5 py-0.5 transition-colors cursor-pointer",
                  locale === "en"
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                EN
              </button>
              <button
                type="button"
                aria-pressed={locale === "es"}
                onClick={() => setLocale("es")}
                className={cn(
                  "rounded-sm px-1.5 py-0.5 transition-colors cursor-pointer",
                  locale === "es"
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                ES
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full flex-1 items-center justify-center px-5 py-12 md:py-16">
        <div className={cn("w-full", maxWidthClass)}>
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              {eyebrow}
            </p>
            <h1 className="mt-2 font-display text-4xl font-extrabold uppercase tracking-tight sm:text-5xl">
              {title}
            </h1>
            {subtitle && <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>}
          </div>

          <div className="rounded-sm border border-border bg-card p-6">{children}</div>
        </div>
      </main>
    </div>
  );
}
