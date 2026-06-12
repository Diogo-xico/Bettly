import { useEffect, useState, type FormEvent } from "react";
import { ExternalLink, ShieldCheck, Target } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";
import { betProfit, type Bet, type BetStatus } from "../lib/types";
import { StatusBadge } from "../components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface BetWithUser extends Bet {
  profiles: { name: string } | null;
}

export function Admin() {
  const { session, profile, refreshProfile } = useAuth();
  const [bets, setBets] = useState<BetWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showResolved, setShowResolved] = useState(false);

  const [actualChampion, setActualChampion] = useState("");
  const [actualTopScorer, setActualTopScorer] = useState("");
  const [savingResults, setSavingResults] = useState(false);
  const [resultsSaved, setResultsSaved] = useState(false);

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from("bets")
      .select("*, profiles(name)")
      .order("created_at", { ascending: false });
    setBets((data as BetWithUser[]) ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    setActualChampion(profile?.actual_champion ?? "");
    setActualTopScorer(profile?.actual_top_scorer ?? "");
  }, [profile]);

  async function handleSaveResults(e: FormEvent) {
    e.preventDefault();
    if (!session) return;
    setSavingResults(true);
    setResultsSaved(false);
    try {
      await supabase
        .from("profiles")
        .update({
          actual_champion: actualChampion.trim() || null,
          actual_top_scorer: actualTopScorer.trim() || null,
        })
        .eq("id", session.user.id);
      await refreshProfile();
      setResultsSaved(true);
    } finally {
      setSavingResults(false);
    }
  }

  async function resolve(bet: Bet, status: BetStatus) {
    await supabase
      .from("bets")
      .update({ status, resolved_at: new Date().toISOString() })
      .eq("id", bet.id);
    await load();
  }

  const visibleBets = showResolved
    ? bets
    : bets.filter((b) => b.status === "pending");

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="size-5 text-primary" />
            Admin — Resolver Apostas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="size-4 accent-primary"
              checked={showResolved}
              onChange={(e) => setShowResolved(e.target.checked)}
            />
            Mostrar apostas já resolvidas
          </label>
        </CardContent>
      </Card>

      {loading ? (
        <p className="text-sm text-muted-foreground">A carregar...</p>
      ) : visibleBets.length === 0 ? (
        <p className="text-sm text-muted-foreground">Sem apostas pendentes.</p>
      ) : (
        visibleBets.map((bet) => (
          <Card key={bet.id}>
            <CardContent className="flex flex-col gap-3 pt-6">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold">{bet.profiles?.name ?? "—"}</p>
                  <p className="text-sm text-muted-foreground">
                    {bet.description}
                  </p>
                </div>
                <StatusBadge status={bet.status} />
              </div>

              <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-sm">
                <span>
                  Odd: <span className="font-medium">{bet.odd.toFixed(2)}</span>
                </span>
                <span>
                  Valor:{" "}
                  <span className="font-medium">{bet.stake.toFixed(2)} €</span>
                </span>
                <span>
                  Lucro:{" "}
                  <span
                    className={cn(
                      "font-semibold",
                      betProfit(bet) >= 0 ? "text-success" : "text-destructive",
                    )}
                  >
                    {bet.status === "pending"
                      ? "-"
                      : `${betProfit(bet).toFixed(2)} €`}
                  </span>
                </span>
                {bet.proof_url && (
                  <a
                    href={bet.proof_url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-primary hover:underline"
                  >
                    Ver print <ExternalLink className="size-3.5" />
                  </a>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="success"
                  onClick={() => resolve(bet, "won")}
                  disabled={bet.status === "won"}
                >
                  Ganha
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => resolve(bet, "lost")}
                  disabled={bet.status === "lost"}
                >
                  Perdida
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => resolve(bet, "void")}
                  disabled={bet.status === "void"}
                >
                  Anular
                </Button>
                {bet.status !== "pending" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => resolve(bet, "pending")}
                  >
                    Repor pendente
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))
      )}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="size-5 text-primary" />
            Resultados reais do Mundial
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-4" onSubmit={handleSaveResults}>
            <div className="flex gap-4">
              <div className="flex flex-1 flex-col gap-1.5">
                <Label htmlFor="actual-champion">Equipa vencedora</Label>
                <Input
                  id="actual-champion"
                  type="text"
                  placeholder="Ex: Brasil"
                  value={actualChampion}
                  onChange={(e) => {
                    setActualChampion(e.target.value);
                    setResultsSaved(false);
                  }}
                />
              </div>
              <div className="flex flex-1 flex-col gap-1.5">
                <Label htmlFor="actual-top-scorer">Melhor marcador</Label>
                <Input
                  id="actual-top-scorer"
                  type="text"
                  placeholder="Ex: Mbappé"
                  value={actualTopScorer}
                  onChange={(e) => {
                    setActualTopScorer(e.target.value);
                    setResultsSaved(false);
                  }}
                />
              </div>
            </div>
            {resultsSaved && (
              <p className="text-sm text-success">Resultados guardados!</p>
            )}
            <Button type="submit" disabled={savingResults} className="w-full">
              {savingResults ? "A guardar..." : "Guardar resultados"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
