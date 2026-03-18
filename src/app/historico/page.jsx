"use client";

import { useEffect, useState } from "react";
import { Button } from "@/app/components/ui/button";

export default function HistoricoPage() {
  const [historico, setHistorico] = useState([]);

  useEffect(() => {
    try {
      const salvo = localStorage.getItem("historicoCotacoes");
      const data = salvo ? JSON.parse(salvo) : [];

      // Garante que esteja ordenado do mais recente pro mais antigo
      const ordenado = data.sort((a, b) => {
        return new Date(b.data) - new Date(a.data);
      });

      setHistorico(ordenado);
    } catch (e) {
      console.error("Erro ao carregar histórico:", e);
      setHistorico([]);
    }
  }, []);

  const excluir = (id) => {
    if (!confirm("Deseja realmente excluir esta cotação?")) return;

    const novo = historico.filter((h) => h.id !== id);
    setHistorico(novo);
    localStorage.setItem("historicoCotacoes", JSON.stringify(novo));
  };

  const reabrirCotacao = (flightData) => {
    localStorage.setItem("flightData", JSON.stringify(flightData));
    window.location.href = "/cotacao";
  };

  const formatarTotal = (valor) => {
    return Number(valor || 0).toFixed(2);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <h1 className="text-4xl font-extrabold text-center">
        Histórico de Cotações
      </h1>

      <p className="mt-10 text-xl font-bold text-center">
        A cotação só é salva depois da geração do PDF da mesma.
      </p>

      {historico.length === 0 && (
        <div className="p-6 max-w-4xl mx-auto space-y-8 rounded-xl shadow-lg">
          <p className="text-center m-10 font-extrabold text-3xl">
            Nenhuma cotação salva.
          </p>
        </div>
      )}

      <div className="space-y-4">
        {historico.map((item) => (
          <div
            key={item.id}
            className="p-4 rounded-xl shadow flex flex-col md:flex-row md:items-center md:justify-between gap-4"
          >
            <div>
              <p className="font-bold text-3xl">Cotação #{item.id}</p>

              <p className="text-lg mt-2">Data: {item.data}</p>

              <p className="text-lg">
                {item.classificacao} • {item.tipo}
              </p>

              <p className="text-lg">
                Passageiros: {item.passageiros}
              </p>

              <p className="font-extrabold text-2xl mt-3">
                R$ {formatarTotal(item.total)}
              </p>
            </div>

            <div className="flex gap-2">
              <Button onClick={() => reabrirCotacao(item.flightData)}>
                <p className="text-lg font-bold">Reabrir</p>
              </Button>

              <Button
                variant="destructive"
                onClick={() => excluir(item.id)}
              >
                <p className="text-lg font-bold">Excluir</p>
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
