  "use client";

  import { Button } from "../components/ui/button";
  import { useEffect, useState } from "react";
  import { useRouter } from "next/navigation";

  export default function HistoricoCotacoes() {
  const [historico, setHistorico] = useState([]);
  const [mostrarFavoritos, setMostrarFavoritos] = useState(false);
  const router = useRouter();


  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("historicoCotacoes")) || [];
    setHistorico(data);
  }, []);

  const formatMoney = (value) =>
    `R$ ${Number(value || 0).toFixed(2)}`;

   const formatarData = (data) => {
    if (!data) return "-";
    return data.split("-").reverse().join("/");
   };

    const toggleFavorito = (id) => {
    const novo = historico.map((item) =>
      item.id === id
        ? { ...item, favorito: !item.favorito }
        : item
      );

    setHistorico(novo);
    localStorage.setItem("historicoCotacoes", JSON.stringify(novo));
   };

    const limparHistorico = () => {
    if (!confirm("Tem certeza que deseja apagar todo o histórico?")) return;

    localStorage.removeItem("historicoCotacoes");
    setHistorico([]);
    };

    const listaFiltrada = mostrarFavoritos
    ? historico.filter((item) => item.favorito)
    : historico;

     // Escalas novo modelo
     const renderEscalas = (t) => {
      if (!t.escalas || Number(t.escalas) === 0) return "Voo direto";

    const lista = [];

    if (Number(t.escalas) >= 1 && t.escala1Cidade) {
      lista.push(
        `${t.escala1Cidade.toUpperCase()} (${t.escala1Chegada} - ${t.escala1Partida})`
      );
    }

    if (Number(t.escalas) === 2 && t.escala2Cidade) {
      lista.push(
        `${t.escala2Cidade.toUpperCase()} (${t.escala2Chegada} - ${t.escala2Partida})`
      );
    }

    return lista.join(" • ");
     };

    // Bagagem Nova
    const renderBagagem = (t) => {
    const qtd = Number(t.bagagemQtd || 0);

    if (!qtd) return "Sem bagagem";

    return `${qtd} ${qtd > 1 ? "bagagens" : "bagagem"} • ${
      t.tipoBagagem || "-"
    }`;
    };

     return (
    <div className="w-full">
      <h1 className="text-3xl font-extrabold mb-6 text-center">
        Histórico de Cotações
      </h1>

        <p className="text-m m-5 font-semibold text-center">O histórico só é ativado depois da geração do PDF da cotação.</p>

      {historico.length > 0 && (
        <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
          <Button
            onClick={() => setMostrarFavoritos(!mostrarFavoritos)}
            className="p-5 rounded-lg text-lg font-bold"
          >
            {mostrarFavoritos ? "Mostrar todas" : "Só favoritas"}
          </Button>

          <Button
            onClick={limparHistorico}
            variant="destructive"
            className="p-5 rounded-lg text-lg font-bold"
          >
            Limpar histórico
          </Button>
        </div>
      )}

      {listaFiltrada.length === 0 ? (
        <p className="text-center font-semibold text-xl mt-20">
          {mostrarFavoritos
            ? "Nenhuma cotação favoritada"
            : "Nenhuma cotação encontrada"}
        </p>
        ) : (
        <div className="grid gap-5">
          {listaFiltrada.map((item) => {
            const f = item.flightData;

            return (
              <div
                key={item.id}
                className="p-6 rounded-2xl mt-5 shadow-lg space-y-4"
              >
                {/* HEADER */}
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xl">#{item.id}</span>

                    <span
                      className={`cursor-pointer text-xl ${
                        item.favorito ? "text-blue-700" : "text-black-300"
                      }`}
                      onClick={() => toggleFavorito(item.id)}
                    >
                      ★
                    </span>
                  </div>
                </div>

                <p className="font-semibold text-m">
                  {item.classificacao} • {item.passageiros} passageiros
                </p>

                {/* TRECHOS */}
                {f?.trechos?.slice(0, item.qtdVoos || f?.trechos.length).map((t, index) => (
                  <div key={index} className="p-4 rounded-xl border">
                    <p className="font-bold text-lg mb-1">
                      Voo {index + 1}
                    </p>

                    <p className="text-m">
                      {t.origem?.toUpperCase() || "-"} →{" "}
                      {t.destino?.toUpperCase() || "-"}
                    </p>

                  
                    <p className="text-m">
                      {formatarData(t.data)} | {t.embarque || "-"} → {t.chegada || "-"}
                    </p>


                    <p className="text-m mt-1">
                    Classe: {t.classe || "-"}
                    </p>


                    <p className="text-m mt-2">
                      Escalas: {renderEscalas(t)}
                    </p>

                    <p className="text-m mt-1">
                      {renderBagagem(t)}
                    </p>
                  </div>
                ))}

                    {/* INFO EXTRA */}
                <div className="space-y-1 mt-2">
                  <p className="font-semibold text-lg">Total final:</p>
                  <p className="font-bold text-2xl">{formatMoney(item.total)}</p>
                </div>

                {/* BOTÕES */}
                <div className="flex justify-end gap-2">
                  <Button
                    className="px-4 py-2 text-lg font-semibold rounded-lg"
                         onClick={() => {
              localStorage.setItem(
              "voosProData",
              JSON.stringify({
              flight: item.flightData,
              qtdVoos: item.qtdVoos, 
              taxasAdicionais: item.taxasAdicionais || "",
                })
                );
                router.push("/cotacao");
                }}
                  >
                    Reabrir
                  </Button>

                  <Button
                    variant="destructive"
                    className="px-4 py-2 text-lg font-semibold rounded-lg"
                    onClick={() => {
                      const novo = historico.filter(
                        (h) => h.id !== item.id
                      );
                      setHistorico(novo);
                      localStorage.setItem(
                        "historicoCotacoes",
                        JSON.stringify(novo)
                      );
                    }}
                  >
                    Excluir
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
        )}
        </div>
        );
        }