import { useEffect, useState, type FormEvent } from "react";
import { ExternalLink, Target, Trash2 } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";
import { betProfit, type Bet } from "../lib/types";
import { StatusBadge } from "../components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

export function MyBets() {
  const { session, profile, refreshProfile } = useAuth();
  const [bets, setBets] = useState<Bet[]>([]);
  const [loading, setLoading] = useState(true);

  const [description, setDescription] = useState("");
  const [odd, setOdd] = useState("");
  const [stake, setStake] = useState("");
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [predictedChampion, setPredictedChampion] = useState("");
  const [predictedTopScorer, setPredictedTopScorer] = useState("");
  const [savingPredictions, setSavingPredictions] = useState(false);
  const [predictionsError, setPredictionsError] = useState<string | null>(null);

  async function loadBets() {
    if (!session) return;
    setLoading(true);
    const { data } = await supabase
      .from("bets")
      .select("*")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false });
    setBets(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    loadBets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user.id]);

  useEffect(() => {
    setPredictedChampion(profile?.predicted_champion ?? "");
    setPredictedTopScorer(profile?.predicted_top_scorer ?? "");
  }, [profile]);

  async function handleSavePredictions(e: FormEvent) {
    e.preventDefault();
    if (!session) return;
    setPredictionsError(null);

    if (!predictedChampion.trim() || !predictedTopScorer.trim()) {
      setPredictionsError("Preenche os dois palpites antes de guardar.");
      return;
    }

    setSavingPredictions(true);
    try {
      await supabase
        .from("profiles")
        .update({
          predicted_champion: predictedChampion.trim(),
          predicted_top_scorer: predictedTopScorer.trim(),
        })
        .eq("id", session.user.id);
      await refreshProfile();
    } finally {
      setSavingPredictions(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const oddValue = Number(odd);
    const stakeValue = Number(stake);

    if (!description.trim()) {
      setError("Descreve a aposta.");
      return;
    }
    if (Number.isNaN(oddValue) || oddValue < 1.2 || oddValue > 10) {
      setError("A odd tem de estar entre 1.2 e 10.");
      return;
    }
    if (Number.isNaN(stakeValue) || stakeValue <= 0) {
      setError("O valor apostado tem de ser maior que 0.");
      return;
    }
    if (!proofFile) {
      setError("Anexa um print/comprovativo da aposta.");
      return;
    }

    setSubmitting(true);
    try {
      const userId = session!.user.id;
      const ext = proofFile.name.split(".").pop();
      const path = `${userId}/${crypto.randomUUID()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("bet-proofs")
        .upload(path, proofFile);

      if (uploadError) {
        setError(`Erro ao enviar o print: ${uploadError.message}`);
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from("bet-proofs")
        .getPublicUrl(path);

      const { error: insertError } = await supabase.from("bets").insert({
        user_id: userId,
        description: description.trim(),
        odd: oddValue,
        stake: stakeValue,
        proof_url: publicUrlData.publicUrl,
      });

      if (insertError) {
        setError(`Erro ao registar a aposta: ${insertError.message}`);
        return;
      }

      setDescription("");
      setOdd("");
      setStake("");
      setProofFile(null);
      await loadBets();
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(bet: Bet) {
    if (!confirm("Apagar esta aposta?")) return;
    await supabase.from("bets").delete().eq("id", bet.id);
    await loadBets();
  }

  const profit = bets.reduce((sum, bet) => sum + betProfit(bet), 0);
  const pendingStake = bets
    .filter((bet) => bet.status === "pending")
    .reduce((sum, bet) => sum + bet.stake, 0);
  const balance = (profile?.starting_balance ?? 0) + profit - pendingStake;
  const hasSavedPredictions = Boolean(
    profile?.predicted_champion && profile?.predicted_top_scorer,
  );

  return (
    <div className="flex flex-col gap-6">
      <Card className="border-none bg-gradient-to-r from-violet-600 via-red-600 to-lime-400 text-white">
        <CardContent className="flex flex-wrap items-center justify-between gap-4 pt-6">
          <div>
            <p className="text-sm opacity-90">O teu saldo</p>
            <p className="text-1xl font-display font-bold tracking-wide">
              {balance.toFixed(2)} €
            </p>
          </div>
          {hasSavedPredictions && (
            <>
              <div>
                <p className="text-sm opacity-90">Equipa vencedora</p>
                <p className="text-1xl font-display font-bold tracking-wide">
                  {profile?.predicted_champion}
                </p>
              </div>
              <div>
                <p className="text-sm opacity-90">Melhor marcador</p>
                <p className="text-1xl font-display font-bold tracking-wide">
                  {profile?.predicted_top_scorer}
                </p>
              </div>
            </>
          )}
          <div>
            <p className="text-sm opacity-90">Lucro</p>
            <p className="text-1xl font-display font-bold tracking-wide">
              {profit >= 0 ? "+" : ""}
              {profit.toFixed(2)} €
            </p>
          </div>
        </CardContent>
      </Card>

      {!hasSavedPredictions && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="size-5 text-primary" />
              Os meus palpites
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form
              className="flex flex-col gap-4"
              onSubmit={handleSavePredictions}
            >
              <p className="text-sm text-muted-foreground">
                Só podes submeter estes palpites uma vez.
              </p>
              <div className="flex gap-4">
                <div className="flex flex-1 flex-col gap-1.5">
                  <Label htmlFor="predicted-champion">Equipa vencedora</Label>
                  <Input
                    id="predicted-champion"
                    type="text"
                    placeholder="Ex: Brasil"
                    value={predictedChampion}
                    onChange={(e) => setPredictedChampion(e.target.value)}
                  />
                </div>
                <div className="flex flex-1 flex-col gap-1.5">
                  <Label htmlFor="predicted-top-scorer">Melhor marcador</Label>
                  <Input
                    id="predicted-top-scorer"
                    type="text"
                    placeholder="Ex: Mbappé"
                    value={predictedTopScorer}
                    onChange={(e) => setPredictedTopScorer(e.target.value)}
                  />
                </div>
              </div>
              {predictionsError && (
                <p className="text-sm text-destructive">{predictionsError}</p>
              )}
              <Button
                type="submit"
                disabled={savingPredictions}
                className="w-full bg-gradient-to-r from-violet-600 via-red-600 to-lime-400 text-white hover:opacity-90"
              >
                {savingPredictions ? "A guardar..." : "Guardar palpites"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Registar nova aposta</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="description">Descrição</Label>
              <Input
                id="description"
                type="text"
                placeholder="Ex: Portugal vence Espanha"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="flex gap-4">
              <div className="flex flex-1 flex-col gap-1.5">
                <Label htmlFor="odd">Odd (1.2 - 10)</Label>
                <Input
                  id="odd"
                  type="number"
                  step="0.01"
                  min="1.2"
                  max="10"
                  value={odd}
                  onChange={(e) => setOdd(e.target.value)}
                />
              </div>
              <div className="flex flex-1 flex-col gap-1.5">
                <Label htmlFor="stake">Valor apostado (€)</Label>
                <Input
                  id="stake"
                  type="number"
                  step="0.01"
                  min="0"
                  value={stake}
                  onChange={(e) => setStake(e.target.value)}
                />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="proof">Print do comprovativo</Label>
              <Input
                id="proof"
                type="file"
                accept="image/*"
                onChange={(e) => setProofFile(e.target.files?.[0] ?? null)}
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button
              type="submit"
              disabled={submitting}
              className="w-full bg-gradient-to-r from-violet-600 via-red-600 to-lime-400 text-white hover:opacity-90"
            >
              {submitting ? "A registar..." : "Registar aposta"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>As minhas apostas</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">A carregar...</p>
          ) : bets.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Ainda não registaste nenhuma aposta.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Odd</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Lucro</TableHead>
                  <TableHead>Print</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bets.map((bet) => (
                  <TableRow key={bet.id}>
                    <TableCell className="max-w-50 whitespace-normal">
                      {bet.description}
                    </TableCell>
                    <TableCell>{bet.odd.toFixed(2)}</TableCell>
                    <TableCell>{bet.stake.toFixed(2)} €</TableCell>
                    <TableCell>
                      <StatusBadge status={bet.status} />
                    </TableCell>
                    <TableCell
                      className={cn(
                        "font-semibold",
                        betProfit(bet) >= 0
                          ? "text-success"
                          : "text-destructive",
                      )}
                    >
                      {bet.status === "pending"
                        ? "-"
                        : `${betProfit(bet).toFixed(2)} €`}
                    </TableCell>
                    <TableCell>
                      {bet.proof_url && (
                        <a
                          href={bet.proof_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-primary hover:underline"
                        >
                          <ExternalLink className="size-4" />
                        </a>
                      )}
                    </TableCell>
                    <TableCell>
                      {bet.status === "pending" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(bet)}
                          title="Apagar"
                        >
                          <Trash2 className="size-4 text-destructive" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
