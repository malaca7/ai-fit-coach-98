import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { LogOut, Target, Activity, Calendar, Mail } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/profile")({
  component: ProfilePage,
});

type Profile = {
  full_name: string | null;
  goal: string | null;
  level: string | null;
  training_frequency: number | null;
  age: number | null;
  weight_kg: number | null;
  height_cm: number | null;
};

function ProfilePage() {
  const { user, loading: authLoading, signOut } = useAuth();
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
        .select("full_name, goal, level, training_frequency, age, weight_kg, height_cm")
        .eq("id", user.id)
        .maybeSingle();
      setProfile(data);
      setLoading(false);
    })();
  }, [user, authLoading, navigate]);

  const initials = (profile?.full_name || user?.email || "U")
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="min-h-screen pb-28">
      <div className="mx-auto max-w-md px-5 pt-8">
        <h1 className="text-2xl font-bold tracking-tight">Perfil</h1>

        <div className="mt-6 flex flex-col items-center rounded-3xl bg-gradient-card p-8 text-center shadow-card">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-primary text-2xl font-bold text-primary-foreground shadow-glow">
            {initials}
          </div>
          <div className="mt-4 text-lg font-bold">
            {loading ? <Skeleton className="h-6 w-32" /> : profile?.full_name || "Atleta"}
          </div>
          <div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Mail className="h-3 w-3" /> {user?.email}
          </div>
        </div>

        <div className="mt-6 space-y-2">
          <Row icon={Target} label="Objetivo" value={profile?.goal} loading={loading} />
          <Row icon={Activity} label="Nível" value={profile?.level} loading={loading} />
          <Row
            icon={Calendar}
            label="Frequência"
            value={profile?.training_frequency ? `${profile.training_frequency}x / semana` : null}
            loading={loading}
          />
        </div>

        <Button
          variant="outline"
          onClick={async () => {
            await signOut();
            navigate({ to: "/auth", replace: true });
          }}
          className="mt-8 h-12 w-full rounded-xl border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
        >
          <LogOut className="mr-2 h-4 w-4" /> Sair da conta
        </Button>
      </div>
      <BottomNav />
    </div>
  );
}

function Row({
  icon: Icon,
  label,
  value,
  loading,
}: {
  icon: typeof Target;
  label: string;
  value: string | null | undefined;
  loading: boolean;
}) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-gradient-card px-5 py-4 shadow-card">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 text-primary">
          <Icon className="h-4 w-4" />
        </div>
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
      <span className="text-sm font-semibold capitalize">
        {loading ? <Skeleton className="h-4 w-16" /> : value ?? "—"}
      </span>
    </div>
  );
}
