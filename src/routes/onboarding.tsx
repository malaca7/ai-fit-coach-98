import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/Logo";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowRight,
  Loader2,
  Flame,
  Dumbbell,
  Sparkles,
  HeartPulse,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/onboarding")({
  component: Onboarding,
});

type Goal = "emagrecimento" | "hipertrofia" | "definicao" | "saude";
type Level = "iniciante" | "intermediario" | "avancado";
type Sex = "masculino" | "feminino" | "outro";

const goals: { id: Goal; label: string; desc: string; icon: typeof Flame }[] = [
  { id: "emagrecimento", label: "Emagrecer", desc: "Perder gordura corporal", icon: Flame },
  { id: "hipertrofia", label: "Hipertrofia", desc: "Ganhar massa muscular", icon: Dumbbell },
  { id: "definicao", label: "Definição", desc: "Esculpir o corpo", icon: Sparkles },
  { id: "saude", label: "Saúde", desc: "Bem-estar e energia", icon: HeartPulse },
];

const levels: { id: Level; label: string; desc: string }[] = [
  { id: "iniciante", label: "Iniciante", desc: "Pouca ou nenhuma experiência" },
  { id: "intermediario", label: "Intermediário", desc: "Treina há alguns meses" },
  { id: "avancado", label: "Avançado", desc: "Treina há mais de 1 ano" },
];

const sexes: { id: Sex; label: string }[] = [
  { id: "masculino", label: "Masculino" },
  { id: "feminino", label: "Feminino" },
  { id: "outro", label: "Outro" },
];

const TOTAL = 6;

function Onboarding() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState({
    goal: undefined as Goal | undefined,
    sex: undefined as Sex | undefined,
    level: undefined as Level | undefined,
    age: "",
    weight: "",
    height: "",
    frequency: 3,
  });

  useEffect(() => {
    if (!authLoading && !user) navigate({ to: "/auth", replace: true });
  }, [user, authLoading, navigate]);

  const next = () => setStep((s) => Math.min(s + 1, TOTAL - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const canAdvance = () => {
    switch (step) {
      case 0: return !!data.goal;
      case 1: return !!data.sex;
      case 2: return !!data.age && Number(data.age) >= 12 && Number(data.age) <= 100;
      case 3: return !!data.weight && !!data.height;
      case 4: return !!data.level;
      case 5: return data.frequency >= 1 && data.frequency <= 7;
      default: return false;
    }
  };

  const handleFinish = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        goal: data.goal,
        sex: data.sex,
        age: Number(data.age),
        weight_kg: Number(data.weight),
        height_cm: Number(data.height),
        level: data.level,
        training_frequency: data.frequency,
        onboarding_completed: true,
      })
      .eq("id", user.id);

    if (error) {
      toast.error("Erro ao salvar perfil");
      setSaving(false);
      return;
    }
    toast.success("Perfil pronto! Bora treinar 💪");
    navigate({ to: "/dashboard", replace: true });
  };

  const progress = ((step + 1) / TOTAL) * 100;

  return (
    <div className="flex min-h-screen flex-col px-6 py-8">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={back}
            disabled={step === 0}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary/60 text-foreground disabled:opacity-30"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <Logo size="sm" />
          <span className="text-xs font-medium text-muted-foreground">
            {step + 1}/{TOTAL}
          </span>
        </div>

        {/* Progress */}
        <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full bg-gradient-primary transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Step content */}
        <div className="mt-10 flex-1">
          {step === 0 && (
            <StepShell title="Qual seu objetivo?" subtitle="Vamos personalizar tudo para você.">
              <div className="grid grid-cols-2 gap-3">
                {goals.map((g) => (
                  <OptionCard
                    key={g.id}
                    active={data.goal === g.id}
                    onClick={() => setData({ ...data, goal: g.id })}
                  >
                    <g.icon className="h-7 w-7 text-primary" strokeWidth={2.2} />
                    <div className="mt-3 text-sm font-semibold">{g.label}</div>
                    <div className="text-xs text-muted-foreground">{g.desc}</div>
                  </OptionCard>
                ))}
              </div>
            </StepShell>
          )}

          {step === 1 && (
            <StepShell title="Seu sexo biológico" subtitle="Usamos para calcular suas metas.">
              <div className="space-y-3">
                {sexes.map((s) => (
                  <RowOption
                    key={s.id}
                    active={data.sex === s.id}
                    onClick={() => setData({ ...data, sex: s.id })}
                  >
                    {s.label}
                  </RowOption>
                ))}
              </div>
            </StepShell>
          )}

          {step === 2 && (
            <StepShell title="Qual sua idade?" subtitle="Em anos.">
              <BigNumberInput
                value={data.age}
                onChange={(v) => setData({ ...data, age: v })}
                unit="anos"
                max={3}
              />
            </StepShell>
          )}

          {step === 3 && (
            <StepShell title="Peso e altura" subtitle="Suas medidas atuais.">
              <div className="grid grid-cols-2 gap-3">
                <UnitField
                  label="Peso"
                  unit="kg"
                  value={data.weight}
                  onChange={(v) => setData({ ...data, weight: v })}
                />
                <UnitField
                  label="Altura"
                  unit="cm"
                  value={data.height}
                  onChange={(v) => setData({ ...data, height: v })}
                />
              </div>
            </StepShell>
          )}

          {step === 4 && (
            <StepShell title="Seu nível de treino" subtitle="Para calibrar a intensidade.">
              <div className="space-y-3">
                {levels.map((l) => (
                  <RowOption
                    key={l.id}
                    active={data.level === l.id}
                    onClick={() => setData({ ...data, level: l.id })}
                  >
                    <div>
                      <div className="font-semibold">{l.label}</div>
                      <div className="text-xs text-muted-foreground">{l.desc}</div>
                    </div>
                  </RowOption>
                ))}
              </div>
            </StepShell>
          )}

          {step === 5 && (
            <StepShell
              title="Frequência semanal"
              subtitle="Quantos dias por semana você quer treinar?"
            >
              <div className="rounded-3xl bg-gradient-card p-8 text-center shadow-card">
                <div className="text-6xl font-bold text-gradient">{data.frequency}</div>
                <div className="mt-1 text-sm text-muted-foreground">dias por semana</div>
                <input
                  type="range"
                  min={1}
                  max={7}
                  value={data.frequency}
                  onChange={(e) => setData({ ...data, frequency: Number(e.target.value) })}
                  className="mt-8 w-full accent-primary"
                />
                <div className="mt-2 flex justify-between text-[10px] text-muted-foreground">
                  {[1, 2, 3, 4, 5, 6, 7].map((n) => (
                    <span key={n}>{n}</span>
                  ))}
                </div>
              </div>
            </StepShell>
          )}
        </div>

        {/* CTA */}
        <div className="sticky bottom-0 pt-6">
          <Button
            onClick={step === TOTAL - 1 ? handleFinish : next}
            disabled={!canAdvance() || saving}
            className="h-14 w-full rounded-2xl bg-gradient-primary text-base font-semibold text-primary-foreground shadow-glow disabled:opacity-40"
          >
            {saving ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                {step === TOTAL - 1 ? "Gerar meu plano" : "Continuar"}
                <ArrowRight className="ml-2 h-5 w-5" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

function StepShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
      <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
      <p className="mt-1.5 text-sm text-muted-foreground">{subtitle}</p>
      <div className="mt-8">{children}</div>
    </div>
  );
}

function OptionCard({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-col items-start rounded-2xl border bg-gradient-card p-4 text-left transition-all",
        active
          ? "border-primary/70 shadow-glow"
          : "border-border hover:border-border/80"
      )}
    >
      {children}
    </button>
  );
}

function RowOption({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center justify-between rounded-2xl border bg-gradient-card px-5 py-4 text-left transition-all",
        active ? "border-primary/70 shadow-glow" : "border-border"
      )}
    >
      <div className="font-medium">{children}</div>
      <div
        className={cn(
          "h-5 w-5 rounded-full border-2 transition-all",
          active ? "border-primary bg-primary" : "border-border"
        )}
      />
    </button>
  );
}

function BigNumberInput({
  value,
  onChange,
  unit,
  max,
}: {
  value: string;
  onChange: (v: string) => void;
  unit: string;
  max: number;
}) {
  return (
    <div className="rounded-3xl bg-gradient-card p-8 text-center shadow-card">
      <Input
        type="number"
        inputMode="numeric"
        value={value}
        onChange={(e) => onChange(e.target.value.slice(0, max))}
        placeholder="0"
        className="h-auto border-0 bg-transparent p-0 text-center text-6xl font-bold text-gradient placeholder:text-muted-foreground/30 focus-visible:ring-0"
      />
      <div className="mt-2 text-sm text-muted-foreground">{unit}</div>
    </div>
  );
}

function UnitField({
  label,
  unit,
  value,
  onChange,
}: {
  label: string;
  unit: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="rounded-2xl bg-gradient-card p-5 shadow-card">
      <div className="text-xs font-medium text-muted-foreground">{label}</div>
      <div className="mt-3 flex items-baseline gap-1.5">
        <Input
          type="number"
          inputMode="decimal"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="0"
          className="h-auto w-full border-0 bg-transparent p-0 text-3xl font-bold text-foreground placeholder:text-muted-foreground/30 focus-visible:ring-0"
        />
        <span className="text-sm text-muted-foreground">{unit}</span>
      </div>
    </div>
  );
}
