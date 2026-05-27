import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { BottomNav } from "@/components/BottomNav";
import { Logo } from "@/components/Logo";
import {
  Dumbbell,
  Apple,
  Flame,
  Target,
  TrendingUp,
  Calendar,
  Sparkles,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/dashboard")({
  component: Dashboard,
});

type Profile = {
  full_name: string | null;
  goal: string | null;
  weight_kg: number | null;
  height_cm: number | null;
  age: number | null;
  sex: string | null;
  level: string | null;
  training_frequency: number | null;
  onboarding_completed: boolean;
};

const goalLabels: Record<string, string> = {
  emagrecimento: "Emagrecimento",
  hipertrofia: "Hipertrofia",
  definicao: "Definição",
  saude: "Saúde & Bem-estar",
};

function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate({ to: "/auth", replace: true });
      return;
    }
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("full_name, goal, weight_kg, height_cm, age, sex, level, training_frequency, onboarding_completed")
        .eq("id", user.id)
        .maybeSingle();

      if (data && !data.onboarding_completed) {
        navigate({ to: "/onboarding", replace: true });
        return;
      }
      setProfile(data);
      setLoading(false);
    })();
  }, [user, authLoading, navigate]);

  const firstName = profile?.full_name?.split(" ")[0] || "atleta";
  const bmi =
    profile?.weight_kg && profile?.height_cm
      ? (profile.weight_kg / Math.pow(profile.height_cm / 100, 2)).toFixed(1)
      : null;

  // Rough calorie estimate (Mifflin-St Jeor)
  const calories = (() => {
    if (!profile?.weight_kg || !profile?.height_cm || !profile?.age) return null;
    const base =
      profile.sex === "feminino"
        ? 10 * profile.weight_kg + 6.25 * profile.height_cm - 5 * profile.age - 161
        : 10 * profile.weight_kg + 6.25 * profile.height_cm - 5 * profile.age + 5;
    const activity = 1.2 + 0.1 * (profile.training_frequency ?? 3);
    const tdee = base * activity;
    const adj =
      profile.goal === "emagrecimento"
        ? -400
        : profile.goal === "hipertrofia"
        ? +350
        : 0;
    return Math.round(tdee + adj);
  })();

  return (
    <div className="min-h-screen pb-28">
      <div className="mx-auto max-w-md px-5 pt-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Olá,</p>
            <h1 className="text-2xl font-bold tracking-tight">
              {loading ? <Skeleton className="h-7 w-32" /> : `${firstName} 👋`}
            </h1>
          </div>
          <Logo size="sm" />
        </div>

        {/* Hero goal card */}
        <div className="relative mt-6 overflow-hidden rounded-3xl bg-gradient-card p-6 shadow-card">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/20 blur-3xl" />
          <div className="relative">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-primary">
              <Target className="h-3.5 w-3.5" />
              Seu objetivo
            </div>
            <h2 className="mt-2 text-2xl font-bold">
              {loading ? (
                <Skeleton className="h-8 w-48" />
              ) : (
                goalLabels[profile?.goal ?? ""] ?? "Definir"
              )}
            </h2>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Plano personalizado para você
            </p>

            <div className="mt-5 grid grid-cols-3 gap-3">
              <Stat label="Peso" value={profile?.weight_kg ? `${profile.weight_kg}kg` : "—"} loading={loading} />
              <Stat label="Altura" value={profile?.height_cm ? `${profile.height_cm}cm` : "—"} loading={loading} />
              <Stat label="IMC" value={bmi ?? "—"} loading={loading} />
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <h3 className="mt-8 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Seu plano de hoje
        </h3>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <ActionCard
            icon={Dumbbell}
            title="Treino"
            sub={profile?.training_frequency ? `${profile.training_frequency}x na semana` : "Personalizado"}
            tint="primary"
          />
          <ActionCard
            icon={Apple}
            title="Dieta"
            sub={calories ? `${calories} kcal/dia` : "Em breve"}
            tint="accent"
          />
        </div>

        {/* Stats grid */}
        <h3 className="mt-8 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Visão geral
        </h3>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <InfoCard icon={Flame} label="Streak" value="0 dias" />
          <InfoCard icon={TrendingUp} label="Progresso" value="—" />
          <InfoCard icon={Calendar} label="Nível" value={profile?.level ?? "—"} capitalize />
          <InfoCard icon={Sparkles} label="IA" value="Pronta" />
        </div>

        {/* Coming soon */}
        <div className="mt-8 rounded-3xl border border-dashed border-border bg-card/40 p-6 text-center">
          <Sparkles className="mx-auto h-8 w-8 text-primary" />
          <h3 className="mt-3 font-semibold">IA personalizando seu plano</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Treinos e dieta com IA chegam na próxima etapa.
          </p>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}

function Stat({ label, value, loading }: { label: string; value: string; loading: boolean }) {
  return (
    <div className="rounded-2xl bg-background/40 p-3 text-center">
      <div className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="mt-1 text-lg font-bold">
        {loading ? <Skeleton className="mx-auto h-5 w-12" /> : value}
      </div>
    </div>
  );
}

function ActionCard({
  icon: Icon,
  title,
  sub,
  tint,
}: {
  icon: typeof Dumbbell;
  title: string;
  sub: string;
  tint: "primary" | "accent";
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl bg-gradient-card p-5 shadow-card transition-all hover:shadow-elevated">
      <div
        className={`absolute -right-6 -top-6 h-24 w-24 rounded-full blur-2xl ${
          tint === "primary" ? "bg-primary/25" : "bg-accent/25"
        }`}
      />
      <div className="relative">
        <div
          className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${
            tint === "primary" ? "bg-primary/15 text-primary" : "bg-accent/15 text-accent"
          }`}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div className="mt-4 text-lg font-bold">{title}</div>
        <div className="text-xs text-muted-foreground">{sub}</div>
      </div>
    </div>
  );
}

function InfoCard({
  icon: Icon,
  label,
  value,
  capitalize,
}: {
  icon: typeof Flame;
  label: string;
  value: string;
  capitalize?: boolean;
}) {
  return (
    <div className="rounded-2xl bg-gradient-card p-4 shadow-card">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <div className={`mt-2 text-base font-bold ${capitalize ? "capitalize" : ""}`}>{value}</div>
    </div>
  );
}
