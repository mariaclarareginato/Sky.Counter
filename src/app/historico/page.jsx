"use client";

import { useEffect, useState } from "react";
import { Button } from "@/app/components/ui/button";

export default function HistoricoPage() {
  const [historico, setHistorico] = useState([]);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("historicoCotacoes")) || [];
    setHistorico(data);
  }, []);

  const excluir = (id) => {
    const novo = historico.filter((h) => h.id !== id);
    setHistorico(novo);
    localStorage.setItem("historicoCotacoes", JSON.stringify(novo));
  };

  const reabrirCotacao = (flightData) => {
    localStorage.setItem("flightData", JSON.stringify(flightData));
    window.location.href = "/ida.volta"; 
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <h1 className="text-4xl font-extrabold text-center">
        Histórico de Cotações 📄
      </h1>
      <p className="text-lg font-bold">A cotação/orçamento só é salva depois da geração de PDF.</p>

      {historico.length === 0 && (
        <p className="text-center text-lg">Nenhuma cotação salva.</p>
      )}

      <div className="space-y-4">
        {historico.map((item) => (
          <div
            key={item.id}
            className="p-4 rounded-xl shadow flex flex-col md:flex-row md:items-center md:justify-between gap-4"
          >
            <div>
              <p className="font-bold text-3xl">Cotação #{item.id}</p>
              <p className="text-lg">Data: {item.data}</p>
              <p className="text-lg">
                {item.classificacao} • {item.tipo}
              </p>
              <p className="text-lg">
                Passageiros: {item.passageiros}
              </p>
              <p className="font-extrabold text-2xl mt-1">
                R$ {item.total.toFixed(2)}
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => reabrirCotacao(item.flightData)}
              >
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
