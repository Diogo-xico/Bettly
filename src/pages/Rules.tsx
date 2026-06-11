import { ScrollText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function Rules() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ScrollText className="size-5 text-primary" />
          Regras
        </CardTitle>
      </CardHeader>

      <CardContent>
        <ol className="list-decimal space-y-3 pl-5 text-sm leading-relaxed">
          <li>
            Todos os participantes começam o torneio com{" "}
            <span className="font-medium">€10,00</span>.
          </li>

          <li>
            O torneio decorre desde o primeiro jogo do Mundial até à final e
            apenas contam apostas realizadas em jogos oficiais da competição.
          </li>

          <li>
            Cada participante pode registar apenas{" "}
            <span className="font-medium">1 aposta por dia</span>.
          </li>

          <li>
            As apostas devem ser registadas antes do início do primeiro evento
            envolvido na aposta. Após o início do evento não podem ser
            alteradas.
          </li>

          <li>
            O valor mínimo por aposta é{" "}
            <span className="font-medium">€0,50</span> e o valor máximo é{" "}
            <span className="font-medium">25%</span> da banca disponível no
            momento da aposta.
          </li>

          <li>
            São permitidas apostas simples e múltiplas nos mercados disponíveis
            na casa de apostas escolhida (resultado final, dupla possibilidade,
            over/under, ambas marcam, marcadores, cantos, cartões, entre
            outros).
          </li>

          <li>
            Apenas são válidas apostas com odds entre{" "}
            <span className="font-medium">1.20</span> e{" "}
            <span className="font-medium">10.00</span>.
          </li>

          <li>
            É obrigatório anexar um print ou comprovativo da aposta no momento
            do registo.
          </li>

          <li>
            Cada participante dispõe de{" "}
            <span className="font-medium">1 Joker</span> durante todo o torneio.
            O Joker deve ser declarado antes da validação da aposta e faz com
            que o lucro obtido nessa aposta conte a dobrar.
          </li>

          <li>
            No final de cada evento, a aposta é marcada como{" "}
            <span className="font-medium">Ganha</span>,{" "}
            <span className="font-medium">Perdida</span> ou{" "}
            <span className="font-medium">Anulada</span>.
          </li>

          <li>
            Cálculo do resultado:
            <ul className="mt-2 list-disc pl-5 space-y-1">
              <li>Ganha: retorno = stake × odd.</li>
              <li>Perdida: perda total da stake.</li>
              <li>Anulada: stake devolvida.</li>
            </ul>
          </li>

          <li>
            Caso a banca fique abaixo de{" "}
            <span className="font-medium">€0,50</span>, o participante permanece
            no torneio mas deixa de poder realizar novas apostas.
          </li>

          <li>
            Antes do início do Mundial, cada participante deve indicar:
            <ul className="mt-2 list-disc pl-5 space-y-1">
              <li>Campeão do Mundo (+€2,00 se acertar).</li>
              <li>Melhor Marcador (+€1,00 se acertar).</li>
            </ul>
          </li>

          <li>
            A classificação final é determinada pela maior banca. Em caso de
            empate, aplicam-se os seguintes critérios:
            <ul className="mt-2 list-disc pl-5 space-y-1">
              <li>Maior ROI.</li>
              <li>Maior número de apostas vencedoras.</li>
              <li>Maior odd vencedora.</li>
            </ul>
          </li>

          <li>
            Além do vencedor principal, serão atribuídos os títulos especiais:
            Campeão do Mundial, Sniper, Streak Master, Trader do Mundial e
            Kamikaze.
          </li>

          <li>
            Em caso de dúvida ou disputa sobre qualquer aposta, a decisão será
            tomada por maioria dos participantes.
          </li>
        </ol>
      </CardContent>
    </Card>
  );
}
