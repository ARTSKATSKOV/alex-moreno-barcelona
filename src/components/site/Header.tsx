import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  CalendarCheck,
  LayoutDashboard,
  LogOut,
  Menu,
  ShieldCheck,
  User as UserIcon,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/hooks/use-language";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const SECTION_IDS = ["schedule", "pricing", "locations", "coach", "faq"] as const;
type SectionId = (typeof SECTION_IDS)[number];

export interface HeaderProps {
  savedCount: number;
  onOpenMyBookings: () => void;
  onNavigate: (id: string) => void;
}

function getInitials(name?: string | null, email?: string | null): string {
  const source = (name && name.trim()) || email || "AM";
  const [first, second] = source.split(/\s+/).filter(Boolean);
  if (first && second) {
    return `${first.charAt(0)}${second.charAt(0)}`.toUpperCase();
  }
  return source.slice(0, 2).toUpperCase();
}

export function Header({ savedCount, onOpenMyBookings, onNavigate }: HeaderProps) {
  const { locale, setLocale, t } = useLanguage();
  const { isAuthenticated, isAdmin, profile, user } = useAuth();
  const [activeSection, setActiveSection] = useState<SectionId | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Scroll-spy active section highlighting via IntersectionObserver.
  useEffect(() => {
    if (typeof window === "undefined" || typeof IntersectionObserver === "undefined") return;

    const elements = SECTION_IDS.map((id) => document.getElementById(id)).filter(
      (el): el is HTMLElement => Boolean(el),
    );
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        const top = visible[0];
        if (top?.target.id) {
          setActiveSection(top.target.id as SectionId);
        }
      },
      { rootMargin: "-25% 0px -55% 0px", threshold: [0.1, 0.25, 0.5] },
    );

    for (const el of elements) observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const navLinks: { id: SectionId; label: string }[] = [
    { id: "schedule", label: t.nav.schedule },
    { id: "pricing", label: t.nav.pricing },
    { id: "locations", label: t.nav.locations },
    { id: "coach", label: t.nav.coach },
    { id: "faq", label: t.nav.faq },
  ];

  const handleLinkClick = (id: string) => {
    setMobileMenuOpen(false);
    onNavigate(id);
  };

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-5">
        <a
          href="#top"
          className="font-display text-xl font-bold uppercase tracking-wide focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
        >
          Alex Moreno<span className="text-primary">.</span>
        </a>

        <nav aria-label="Main navigation" className="hidden items-center gap-5 text-sm md:flex">
          {navLinks.map((link) => (
            <button
              key={link.id}
              type="button"
              onClick={() => handleLinkClick(link.id)}
              aria-current={activeSection === link.id ? "location" : undefined}
              className={cn(
                "relative py-1 font-medium transition-colors cursor-pointer",
                activeSection === link.id
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {link.label}
              {activeSection === link.id && (
                <span className="absolute inset-x-0 -bottom-0.5 h-0.5 bg-primary" />
              )}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <div
            role="group"
            aria-label="Language"
            className="hidden rounded-sm border border-border p-0.5 text-[11px] font-semibold sm:inline-flex"
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

          <button
            type="button"
            aria-label={t.nav.myBookings}
            onClick={onOpenMyBookings}
            className="inline-flex items-center gap-1.5 rounded-sm border border-border px-2.5 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-accent cursor-pointer"
          >
            <CalendarCheck className="size-3.5 text-primary" />
            <span className="hidden lg:inline">{t.nav.myBookings}</span>
            {savedCount > 0 && (
              <span className="rounded-full bg-primary px-1.5 py-0.2 text-[10px] font-bold text-primary-foreground">
                {savedCount}
              </span>
            )}
          </button>

          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  aria-label="Account menu"
                  className="inline-flex items-center gap-2 rounded-sm border border-border p-0.5 pr-2 text-xs font-semibold transition-colors hover:border-primary/60 hover:bg-accent cursor-pointer"
                >
                  <Avatar className="size-7 rounded-sm">
                    <AvatarImage
                      src={profile?.avatar_url ?? undefined}
                      alt={profile?.full_name ?? ""}
                    />
                    <AvatarFallback className="rounded-sm bg-primary/15 font-display text-xs font-bold text-primary">
                      {getInitials(profile?.full_name, user?.email)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden max-w-24 truncate sm:inline">
                    {profile?.full_name?.split(" ")[0] ?? t.nav.profile}
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-sm border-border bg-card">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-0.5">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {profile?.full_name ?? user?.email}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {isAdmin && (
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link to="/admin">
                      <ShieldCheck className="mr-2 size-4 text-primary" />
                      <span>{t.nav.adminPortal}</span>
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link to="/client">
                    <LayoutDashboard className="mr-2 size-4" />
                    <span>{t.nav.dashboard}</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer"
                  onSelect={(e) => {
                    e.preventDefault();
                    onOpenMyBookings();
                  }}
                >
                  <CalendarCheck className="mr-2 size-4" />
                  <span>{t.nav.myBookings}</span>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link to="/profile">
                    <UserIcon className="mr-2 size-4" />
                    <span>{t.nav.profile}</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  asChild
                  className="cursor-pointer text-destructive focus:text-destructive"
                >
                  <Link to="/logout">
                    <LogOut className="mr-2 size-4" />
                    <span>{t.nav.logOut}</span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden items-center gap-1.5 sm:flex">
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="h-8 px-2.5 text-xs font-semibold"
              >
                <Link to="/login" search={{ redirect: undefined }}>
                  {t.nav.logIn}
                </Link>
              </Button>
              <Button asChild size="sm" className="h-8 px-3 text-xs font-semibold">
                <Link to="/signup" search={{ redirect: undefined }}>
                  {t.nav.signUp}
                </Link>
              </Button>
            </div>
          )}

          <button
            type="button"
            aria-label="Open navigation menu"
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen(true)}
            className="inline-flex size-9 items-center justify-center rounded-sm border border-border text-foreground transition-colors hover:bg-accent md:hidden cursor-pointer"
          >
            <Menu className="size-4" />
          </button>
        </div>
      </div>

      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="right" className="w-72 border-border bg-card">
          <SheetHeader className="p-0 pt-2 text-left">
            <SheetTitle className="font-display text-2xl uppercase">
              Alex Moreno<span className="text-primary">.</span>
            </SheetTitle>
            <SheetDescription>Barcelona · Strength &amp; Conditioning</SheetDescription>
          </SheetHeader>

          <nav aria-label="Mobile navigation" className="mt-8 flex flex-col gap-1">
            {navLinks.map((link) => (
              <button
                key={link.id}
                type="button"
                onClick={() => handleLinkClick(link.id)}
                className={cn(
                  "rounded-sm px-3 py-2.5 text-left text-base font-semibold transition-colors cursor-pointer",
                  activeSection === link.id
                    ? "bg-primary/15 text-primary"
                    : "text-foreground hover:bg-accent",
                )}
              >
                {link.label}
              </button>
            ))}
          </nav>

          <div className="mt-6 flex items-center justify-between border-t border-border pt-5">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {locale === "es" ? "Idioma" : "Language"}
            </span>
            <div
              role="group"
              aria-label="Mobile language"
              className="inline-flex rounded-sm border border-border p-0.5 text-xs font-semibold"
            >
              <button
                type="button"
                aria-pressed={locale === "en"}
                onClick={() => setLocale("en")}
                className={cn(
                  "rounded-sm px-2.5 py-1 cursor-pointer",
                  locale === "en" ? "bg-foreground text-background" : "text-muted-foreground",
                )}
              >
                EN
              </button>
              <button
                type="button"
                aria-pressed={locale === "es"}
                onClick={() => setLocale("es")}
                className={cn(
                  "rounded-sm px-2.5 py-1 cursor-pointer",
                  locale === "es" ? "bg-foreground text-background" : "text-muted-foreground",
                )}
              >
                ES
              </button>
            </div>
          </div>

          <div className="mt-6 space-y-2 border-t border-border pt-5">
            {isAuthenticated ? (
              <>
                {isAdmin && (
                  <Button
                    asChild
                    variant="outline"
                    className="h-10 w-full justify-start gap-2 font-semibold"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Link to="/admin">
                      <ShieldCheck className="size-4 text-primary" />
                      <span>{t.nav.adminPortal}</span>
                    </Link>
                  </Button>
                )}
                <Button
                  asChild
                  variant="outline"
                  className="h-10 w-full justify-start gap-2 font-semibold"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Link to="/client">
                    <LayoutDashboard className="size-4" />
                    <span>{t.nav.dashboard}</span>
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="h-10 w-full justify-start gap-2 font-semibold"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Link to="/profile">
                    <UserIcon className="size-4" />
                    <span>{t.nav.profile}</span>
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="ghost"
                  className="h-10 w-full justify-start gap-2 font-semibold text-destructive hover:text-destructive"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Link to="/logout">
                    <LogOut className="size-4" />
                    <span>{t.nav.logOut}</span>
                  </Link>
                </Button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Button
                  asChild
                  variant="outline"
                  className="h-10 font-semibold"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Link to="/login" search={{ redirect: undefined }}>
                    {t.nav.logIn}
                  </Link>
                </Button>
                <Button
                  asChild
                  className="h-10 font-semibold"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Link to="/signup" search={{ redirect: undefined }}>
                    {t.nav.signUp}
                  </Link>
                </Button>
              </div>
            )}
          </div>

          <Button
            className="mt-4 h-11 w-full font-semibold"
            onClick={() => handleLinkClick("schedule")}
          >
            {t.nav.bookCta}
          </Button>
        </SheetContent>
      </Sheet>
    </header>
  );
}
