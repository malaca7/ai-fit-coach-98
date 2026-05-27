import { createFileRoute } from "@tanstack/react-router";
import { BottomNav } from "@/components/BottomNav";
import { Apple, Sparkles } from "lucide-react";

export const Route = createFileRoute("/nutrition")({
  component: Nutrition,
});

function Nutrition() {
  return (
    <div className="min-h-screen pb-28">
      <div className="mx-auto max-w-md px-5 pt-8">
        <h1 className="text-2xl font-bold tracking-tight">Nutrição</h1>
        <p className="mt-1 text-sm text-muted-foreground">Sua nutricionista virtual.</p>

        <div className="mt-8 flex flex-col items-center rounded-3xl bg-gradient-card p-10 text-center shadow-card">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/15">
            <Apple className="h-8 w-8 text-accent" />
          </div>
          <h2 className="mt-5 text-xl font-bold">Em breve</h2>
          <p className="mt-2 max-w-xs text-sm text-muted-foreground">
            Plano alimentar com macros e lista de compras chegam na Etapa 3.
          </p>
          <div className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-accent/15 px-3 py-1 text-xs font-medium text-accent">
            <Sparkles className="h-3 w-3" /> Próxima etapa
          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
