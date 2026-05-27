import { createFileRoute } from "@tanstack/react-router";
import { BottomNav } from "@/components/BottomNav";
import { Dumbbell, Sparkles } from "lucide-react";

export const Route = createFileRoute("/workouts")({
  component: Workouts,
});

function Workouts() {
  return (
    <div className="min-h-screen pb-28">
      <div className="mx-auto max-w-md px-5 pt-8">
        <h1 className="text-2xl font-bold tracking-tight">Treinos</h1>
        <p className="mt-1 text-sm text-muted-foreground">Seu personal trainer com IA.</p>

        <div className="mt-8 flex flex-col items-center rounded-3xl bg-gradient-card p-10 text-center shadow-card">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/15">
            <Dumbbell className="h-8 w-8 text-primary" />
          </div>
          <h2 className="mt-5 text-xl font-bold">Em breve</h2>
          <p className="mt-2 max-w-xs text-sm text-muted-foreground">
            Treinos ABC, ABCD e Full Body gerados pela IA chegam na Etapa 2.
          </p>
          <div className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-3 py-1 text-xs font-medium text-primary">
            <Sparkles className="h-3 w-3" /> Próxima etapa
          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
