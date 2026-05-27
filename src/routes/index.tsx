import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/Logo";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate({ to: "/auth", replace: true });
      return;
    }
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("onboarding_completed")
        .eq("id", user.id)
        .maybeSingle();
      navigate({
        to: data?.onboarding_completed ? "/dashboard" : "/onboarding",
        replace: true,
      });
    })();
  }, [user, loading, navigate]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6">
      <Logo size="lg" />
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
    </div>
  );
}
