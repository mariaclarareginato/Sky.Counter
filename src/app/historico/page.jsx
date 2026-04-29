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

        <p className="text-m m-5 font-semibold text-lg text-center">O histórico só é ativado depois da geração do PDF da cotação.</p>

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
            {/* Header */}
            <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
            <span className="font-extrabold text-2xl">#{item.id}</span>

           <span
           className={`cursor-pointer text-2xl ${
           item.favorito ? "text-blue-700" : "text-black-300"
           }`}
            onClick={() => toggleFavorito(item.id)}
            >
           ★
           </span>
            </div>
          </div>

         <p className="font-semibold text-lg">
         {item.classificacao} • {item.passageiros} passageiros
         </p>
                
       <p className="mt-5 font-semibold text-lg">
        {f.cliente}
       </p>

              
      {/* Trechos */}
      {f?.trechos?.slice(0, item.qtdVoos || f?.trechos.length).map((t, index) => (
      <div key={index} className="p-4 rounded-xl border space-y-3">
    
     {/* Label do voo */}
     <p className="font-extrabold text-xl border-b pb-2">
      {item.qtdVoos === 1
        ? "Voo - Ida"
        : item.qtdVoos === 2
        ? index === 0 ? "Voo - Ida" : "Voo - Volta"
        : `Voo ${index + 1}`}
     </p>

    {/* Rota + horários */}
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      <div>
        <p className="text-m font-medium uppercase">Rota:</p>
        <p className="font-semibold text-lg">
          {t.origem?.toUpperCase() || "-"} → {t.destino?.toUpperCase() || "-"}
        </p>
      </div>

      <div>
        <p className="text-m font-medium uppercase">Data:</p>
        <p className="font-semibold text-lg">{formatarData(t.data)}</p>
      </div>

      <div>
        <p className="text-m font-medium uppercase">Horários:</p>
        <p className="font-semibold text-lg">{t.embarque || "-"} → {t.chegada || "-"}</p>
      </div>

      <div>
        <p className="text-m font-medium uppercase">Classe:</p>
        <p className="font-semibold text-lg">{t.classe || "-"}</p>
      </div>
     </div>

     {/* Escalas */}
     <div>
      <p className="text-m font-medium uppercase mb-1">Escalas:</p>
      {Number(t.escalas) === 0 || !t.escalas ? (
        <span className="text-lg font-bold px-2 py-1 rounded-full">
          Voo direto
        </span>
       ) : (
        <div className="flex flex-col gap-3">
          {Number(t.escalas) >= 1 && t.escala1Cidade && (
            <div className="text-m font-medium px-3 py-3 rounded-lg border">
              {t.escala1Cidade.toUpperCase()}
              {t.escala1Chegada && t.escala1Partida && (
                <span  className="font-medium text-m font-semibold"> <br></br>  {t.escala1Chegada} às {t.escala1Partida}</span>
              )}
            </div>
          )}
          {Number(t.escalas) === 2 && t.escala2Cidade && (
            <div className="text-m font-medium px-3 py-3 rounded-lg border">
              {t.escala2Cidade.toUpperCase()}
              {t.escala2Chegada && t.escala2Partida && (
                <span className="font-medium text-m font-semibold"> <br></br> {t.escala2Chegada} às {t.escala2Partida}</span>
              )}
            </div>
          )}
        </div>
      )}
      </div>

     {/* Bagagens */}
     <div>
      <p className="text-m uppercase mb-1">Bagagens:</p>
      {!Number(t.bagagemQtd) ? (
        <span className="text-lg font-semibold px-2 py-1 rounded-full">
          Sem bagagem
        </span>
       ) : (
        <div className="text-m font-semibold px-3 py-1 rounded-lg border inline-flex gap-18 items-center">
          {t.bagagemQtd} {Number(t.bagagemQtd) > 1 ? "bagagens" : "bagagem"}
          <span className="font-semibold"> • {t.tipoBagagem || "-"}</span>
        </div>
       )}
       </div>
       </div>
       ))}

         {/* Info extra */}
          <div className="space-y-1 mt-2">
           <p className="font-semibold text-lg">Total final:</p>
           <p className="font-extrabold text-2xl">{formatMoney(item.total)}</p>
          </div>

              {/* Botões */}
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