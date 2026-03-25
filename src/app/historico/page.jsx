"use client";

  //Importações
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

  const totalVendido = historico.reduce(
    (acc, item) => acc + Number(item.total || 0),
    0
  );

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

  const renderEscalas = (f, tipo) => {
    const escalas = Number(f[`${tipo}Escalas`]);

    if (!escalas || escalas === 0) return "Voo direto";

    const lista = [];

    for (let i = 1; i <= escalas; i++) {
      const cidade = f[`${tipo}Escala${i}Cidade`];
      const chegada = f[`${tipo}Escala${i}Chegada`];
      const partida = f[`${tipo}Escala${i}Partida`];

      if (cidade) {
        lista.push(
          `${cidade.toUpperCase()} (${chegada} - ${partida})`
        );
      }
    }

   

    return lista.join(" • ");
     };


     // Cards
     return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-extrabold mb-6 text-center">
        Histórico de Cotações
      </h1>

      {historico.length > 0 && (
        <div className="flex justify-between mb-4">
          <Button
            onClick={() => setMostrarFavoritos(!mostrarFavoritos)}
            className="px-4 py-2 rounded-lg text-lg font-bold"
          >
            {mostrarFavoritos ? "Mostrar todas" : "Só favoritas"}
          </Button>

          <Button
            onClick={limparHistorico}
             variant="destructive"
            className="px-4 py-2 rounded-lg text-lg font-bold"
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
        <>
          <div className="grid gap-5">
            {listaFiltrada.map((item) => {
              const f = item.flightData;

               const renderBagagem = (f, tipo) => {
    const isIda = tipo === "Ida";

    const qtd = Number(
    f?.[isIda ? "bagagemQuantidadeIda" : "bagagemQuantidadeVolta"] || 0
    );

   const tipoBag = f?.[
    isIda ? "idaTipoBagagens" : "voltaTipoBagagens"
   ];

   if (!qtd) return "Sem bagagem";

   return `${qtd} ${qtd > 1 ? "bagagens" : "bagagem"} • ${
    tipoBag || "-"
    }`;
    };

              return (
                <div
              key={item.id}
              className="p-6 rounded-2xl shadow-lg space-y-4"
                >
                {/* HEADER */}
                <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                <span className="font-bold text-xl">#{item.id}</span>

                 <span
                  className={`cursor-pointer text-xl ${
                  item.favorito ? "text-blue-700" : "text-black-300"
                 }`}
                 onClick={() => toggleFavorito(item.id)}>
                   ★
                </span>
               </div>
               </div>

             <div>
              <p className="font-semibold text-m">{item.classificacao} || {item.passageiros} Passageiros</p>
             </div>

              {/* IDA */}
              <div className="p-4 rounded-xl">
              <p className="text-m mb-1">IDA</p>
              <p className="font-bold text-lg">{f?.idaAeroporto?.toUpperCase()} → {f?.idaChegadaAeroporto?.toUpperCase()}</p>
              <p className="text-m"> {formatarData(f?.idaData)} | das {f?.idaEmbarqueHora} ás {f?.idaChegadaHora}</p>
              <p className="text-m mt-2"> Escalas: {renderEscalas(f, "ida")}</p>
              <p className="text-m mt-1">{renderBagagem(f, "Ida")}</p>
                  </div>



             {/* VOLTA */}
             {f?.tipoviagem === "Ida e Volta" && (
             <div className="p-4 rounded-xl">
             <p className="text-m mb-1">VOLTA</p>
             <p className="font-bold text-lg">  {f?.voltaAeroporto?.toUpperCase()} → {f?.voltaChegadaAeroporto?.toUpperCase()} </p>
             <p className="text-m"> {formatarData(f?.voltaData)} | das {f?.voltaEmbarqueHora} ás {f?.voltaChegadaHora}</p>
             <p className="text-m mt-2">Escalas: {renderEscalas(f, "volta")} </p>
             <p className="text-m mt-1">{renderBagagem(f, "Volta")}</p>
           </div>
            )}

           {/* INFO EXTRA */}
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
            <p className="font-semibold text-m">Tipo</p>
             <p className="font-bold text-lg">{item.tipo}</p>
            </div>

                  
             <div>
               <p className="font-semibold text-m">Classe</p>
               <p className="font-bold text-lg">{item.flightData.classe}</p>
              </div>
              <div>

            <p className="font-semibold text-m">Total</p>
             <p className="font-bold text-lg">
            {formatMoney(item.total)}
             </p>
            </div>
           </div>

     {/* Botões */}
       <div className="flex justify-end gap-2">
           <Button
             className="px-4 py-2 text-lg font-semibold rounded-lg"
             onClick={() => {
             localStorage.setItem("flightData", JSON.stringify(item.flightData) );
             router.push("/cotacao");
               }}   
               >
            Reabrir
           </Button>

           <Button
          variant="destructive"
          className="px-4 py-2 text-lg font-semibold rounded-lg"
          onClick={() => {
         const novo = historico.filter((h) => h.id !== item.id);
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
         </>
        )}
      </div>
      );
      }