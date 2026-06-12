import { useEffect, useState } from "react";
import { Award, LineChart as LineChartIcon, Trophy } from "lucide-react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { supabase } from "../lib/supabaseClient";
import { betProfit, guessIsCorrect, type Bet, type Profile } from "../lib/types";
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

interface LeaderboardRow {
  profile: Profile;
  profit: number;
  balance: number;
  pendingCount: number;
}

type HistoryPoint = { date: string } & Record<string, number | string>;

const CHART_COLORS = [
  "#7c3aed",
  "#dc2626",
  "#84cc16",
  "#0ea5e9",
  "#f59e0b",
  "#ec4899",
  "#14b8a6",
];

function buildHistory(profiles: Profile[], bets: Bet[]): HistoryPoint[] {
  const betsByUser = new Map<string, Bet[]>();
  profiles.forEach((p) => betsByUser.set(p.id, []));

  bets
    .filter((b) => b.status !== "pending" && b.resolved_at)
    .sort(
      (a, b) =>
        new Date(a.resolved_at!).getTime() - new Date(b.resolved_at!).getTime(),
    )
    .forEach((b) => betsByUser.get(b.user_id)?.push(b));

  const maxBets = Math.max(
    0,
    ...profiles.map((p) => betsByUser.get(p.id)!.length),
  );

  const initialPoint: HistoryPoint = { date: "0" };
  profiles.forEach((p) => (initialPoint[p.name] = p.starting_balance));

  const points: HistoryPoint[] = [initialPoint];

  for (let i = 1; i <= maxBets; i++) {
    const point: HistoryPoint = { date: String(i) };
    profiles.forEach((p) => {
      const userBets = betsByUser.get(p.id)!;
      const count = Math.min(i, userBets.length);
      const profit = userBets
        .slice(0, count)
        .reduce((sum, b) => sum + betProfit(b), 0);
      point[p.name] = p.starting_balance + profit;
    });
    points.push(point);
  }

  return points;
}

export function Leaderboard() {
  const [rows, setRows] = useState<LeaderboardRow[]>([]);
  const [history, setHistory] = useState<HistoryPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [{ data: profiles }, { data: bets }] = await Promise.all([
        supabase.from("profiles").select("*"),
        supabase.from("bets").select("*"),
      ]);

      const profileList = profiles ?? [];
      const betList: Bet[] = bets ?? [];

      const computed = profileList.map((profile) => {
        const userBets = betList.filter((b) => b.user_id === profile.id);
        const profit = userBets.reduce((sum, b) => sum + betProfit(b), 0);
        const pendingBets = userBets.filter((b) => b.status === "pending");
        const pendingStake = pendingBets.reduce((sum, b) => sum + b.stake, 0);
        return {
          profile,
          profit,
          balance: profile.starting_balance + profit - pendingStake,
          pendingCount: pendingBets.length,
        };
      });

      computed.sort((a, b) => b.balance - a.balance);
      setRows(computed);
      setHistory(buildHistory(profileList, betList));
      setLoading(false);
    }

    load();
  }, []);

  const startingBalance =
    rows.length > 0
      ? Math.min(...rows.map((r) => r.profile.starting_balance))
      : 0;

  const yValues = history.flatMap((point) =>
    rows
      .map((row) => point[row.profile.name])
      .filter((v): v is number => typeof v === "number"),
  );
  const yMin = yValues.length > 0 ? Math.floor(Math.min(...yValues)) - 1 : 0;
  const yMax = yValues.length > 0 ? Math.ceil(Math.max(...yValues)) + 1 : 0;
  const yTicks = [];
  for (let v = yMin; v <= yMax; v++) yTicks.push(v);

  const adminProfile = rows.find((r) => r.profile.is_admin)?.profile;
  const actualChampion = adminProfile?.actual_champion ?? null;
  const actualTopScorer = adminProfile?.actual_top_scorer ?? null;

  const pointsRows = rows.map((row, i) => {
    const n = rows.length;
    const balancePoints = n > 1 ? 4 - ((i * 3) / (n - 1)) : 4;
    const championPoints = guessIsCorrect(row.profile.predicted_champion, actualChampion)
      ? 2
      : 0;
    const topScorerPoints = guessIsCorrect(
      row.profile.predicted_top_scorer,
      actualTopScorer,
    )
      ? 3
      : 0;
    return {
      profile: row.profile,
      balancePoints,
      championPoints,
      topScorerPoints,
      total: balancePoints + championPoints + topScorerPoints,
    };
  });

  pointsRows.sort((a, b) => b.total - a.total);

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="size-5 text-primary" />
            Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">A carregar...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Saldo</TableHead>
                  <TableHead>Lucro</TableHead>
                  <TableHead className="hidden sm:table-cell">
                    Pendentes
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row, i) => (
                  <TableRow key={row.profile.id}>
                    <TableCell className="font-semibold">{i + 1}</TableCell>
                    <TableCell>{row.profile.name}</TableCell>
                    <TableCell className="font-semibold">
                      {row.balance.toFixed(2)} €
                    </TableCell>
                    <TableCell
                      className={cn(
                        "font-semibold",
                        row.profit >= 0 ? "text-success" : "text-destructive",
                      )}
                    >
                      {row.profit >= 0 ? "+" : ""}
                      {row.profit.toFixed(2)} €
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {row.pendingCount}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LineChartIcon className="size-5 text-primary" />
            Evolução do saldo
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">A carregar...</p>
          ) : history.length <= 1 ? (
            <p className="text-sm text-muted-foreground">
              Ainda não há histórico suficiente.
            </p>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={history}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="oklch(0.9 0.01 264)"
                  />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    domain={[yMin, yMax]}
                    ticks={yTicks}
                    tickFormatter={(value: number) => `${value.toFixed(0)} €`}
                  />
                  <Tooltip
                    formatter={(value) => `${Number(value).toFixed(2)} €`}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <ReferenceLine
                    y={startingBalance}
                    stroke="oklch(0.4 0.02 264)"
                    label={{
                      value: `Saldo inicial (${startingBalance} €)`,
                      position: "insideBottomLeft",
                      fontSize: 11,
                    }}
                  />
                  {rows.map((row, i) => (
                    <Line
                      key={row.profile.id}
                      type="linear"
                      dataKey={row.profile.name}
                      stroke={CHART_COLORS[i % CHART_COLORS.length]}
                      strokeWidth={2}
                      dot={false}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
              <p className="text-center text-xs text-muted-foreground">
                Nº de apostas
              </p>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="size-5 text-primary" />
            Classificação por pontos
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">A carregar...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Saldo</TableHead>
                  <TableHead>Vencedor</TableHead>
                  <TableHead>Marcador</TableHead>
                  <TableHead>Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pointsRows.map((row, i) => (
                  <TableRow key={row.profile.id}>
                    <TableCell className="font-semibold">{i + 1}</TableCell>
                    <TableCell>{row.profile.name}</TableCell>
                    <TableCell>{row.balancePoints.toFixed(1)}</TableCell>
                    <TableCell
                      className={cn(
                        row.championPoints > 0
                          ? "font-semibold text-success"
                          : "text-muted-foreground",
                      )}
                    >
                      {row.championPoints}
                    </TableCell>
                    <TableCell
                      className={cn(
                        row.topScorerPoints > 0
                          ? "font-semibold text-success"
                          : "text-muted-foreground",
                      )}
                    >
                      {row.topScorerPoints}
                    </TableCell>
                    <TableCell className="font-semibold">
                      {row.total.toFixed(1)}
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
