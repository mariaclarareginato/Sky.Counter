  "use client";

  import { useEffect, useState } from "react";
  import jsPDF from "jspdf";
  import { Button } from "../../app/components/ui/button";
  import { useRouter } from "next/navigation";

  export default function Cotacoes() {
  const router = useRouter();

  const [loaded, setLoaded] = useState(false);

  const [qtdVoos, setQtdVoos] = useState(1);
  const [taxasAdicionais, setTaxasAdicionais] = useState("");
  const [airportRates, setAirportRates] = useState([]);

  const [flight, setFlight] = useState({
    classificacao: "Nacional",
    tipoviagem: "",

    adultos: 0,
    criancas: 0,
    bebes: 0,

    trechos: Array.from({ length: 4 }, () => ({
      data: "",
      embarque: "",
      chegada: "",
      origem: "",
      destino: "",
      companhia: "",
      classe: "Econômica",

      programa: "Latam",

      bagagemQtd: "",
      bagagemPreco: "",
      tipoBagagem: "Sem bagagem",

      milhas: 0,
      precoMilheiro: 0,

      escalas: 0,

      escala1Cidade: "",
      escala1Chegada: "",
      escala1Partida: "",

      escala2Cidade: "",
      escala2Chegada: "",
      escala2Partida: ""
    }))
  });

  const [userLogo, setUserLogo] = useState(null);
  const [nomeAgencia, setNomeAgencia] = useState("");
  const [telefoneAgencia, setTelefoneAgencia] = useState("");
  const [redesAgencia, setRedesAgencia] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [cadastur, setCadastur] = useState("");
  const [pdfFields, setPdfFields] = useState({});

  // CARREGAR TODOS OS DADOS
  useEffect(() => {
    try {
      const savedData = localStorage.getItem("voosProData");

      if (savedData) {
        const parsed = JSON.parse(savedData);

        setQtdVoos(parsed.qtdVoos ?? 1);
        setTaxasAdicionais(parsed.taxasAdicionais ?? "");
        setAirportRates(parsed.airportRates ?? []);

        if (parsed.flight) {
          setFlight((prev) => ({
            ...prev,
            ...parsed.flight,

            trechos: Array.from({ length: 4 }, (_, i) => ({
              ...prev.trechos[i],
              ...(parsed.flight.trechos?.[i] || {})
            }))
          }));
        }
      } else {
        const savedRates = localStorage.getItem("airportRates");
        if (savedRates) {
          setAirportRates(JSON.parse(savedRates));
        }
      }

      setUserLogo(localStorage.getItem("agencia_logo") || null);
      setNomeAgencia(localStorage.getItem("agencia_nome") || "");
      setTelefoneAgencia(localStorage.getItem("agencia_telefone") || "");
      setRedesAgencia(localStorage.getItem("agencia_redes") || "");
      setCnpj(localStorage.getItem("agencia_cnpj") || "");
      setCadastur(localStorage.getItem("agencia_cadastur") || "");

      const savedFields = localStorage.getItem("agencia_pdf_fields");
      if (savedFields) {
        setPdfFields(JSON.parse(savedFields));
      }
    } catch (err) {
      console.error("Erro ao carregar dados:", err);
    } finally {
      setLoaded(true);
    }
  }, []);

  // Salvar todos os dados
  useEffect(() => {
    if (!loaded) return;

    try {
      localStorage.setItem(
        "voosProData",
        JSON.stringify({
          qtdVoos,
          taxasAdicionais,
          flight,
          totaisTrechos: flight.trechos
          .slice(0, qtdVoos)
          .map((trecho) => totalTrecho(trecho)),
          totalFinal
        })
      );
    } catch (err) {
      console.error("Erro ao salvar dados:", err);
    }
  }, [loaded, qtdVoos, taxasAdicionais, flight]);


  // Atualizar campos de cada trecho
  const updateTrecho = (index, field, value) => {
    setFlight((prev) => ({
      ...prev,
      trechos: prev.trechos.map((trecho, i) =>
        i === index
          ? {
              ...trecho,
              [field]: value
            }
          : trecho
      )
    }));
  };

  // Passageiros
  const totalPax =
    Number(flight.adultos || 0) + Number(flight.criancas || 0);

  const totalPaxEx = totalPax + Number(flight.bebes || 0);

  // Taxa do aeroporto
  // Troque a função getTaxa por esta:
  const getTaxa = (code) => {
  if (!code) return 0;

  // Lê sempre direto do localStorage para garantir dados atualizados
  const rates = airportRates.length > 0
    ? airportRates
    : JSON.parse(localStorage.getItem("airportRates") || "[]");

  const rate = rates.find(
    (a) => a.aeroporto?.toUpperCase() === code.toUpperCase()
    );

   if (!rate) return 0;

   return flight.classificacao === "Internacional"
    ? Number(rate.internacional || 0)
    : Number(rate.nacional || 0);
   };

  // Total taxas
  const totalTaxas = flight.trechos
    .slice(0, qtdVoos)
    .reduce((acc, trecho) => {
      return acc + getTaxa(trecho.origem) * totalPax;
    }, 0);

  // Totais
  const totalTrecho = (trecho) => {
    const bagagem =
      Number(trecho.bagagemQtd || 0) *
      Number(trecho.bagagemPreco || 0);

    const milhas =
      Number(trecho.milhas || 0) *
      Number(trecho.precoMilheiro || 0) *
      totalPax;

    const taxa = getTaxa(trecho.origem) * totalPax;

    return bagagem + milhas + taxa;
  };

  
  const totalGeral = flight.trechos
    .slice(0, qtdVoos)
    .reduce((acc, trecho) => acc + totalTrecho(trecho), 0);


  const totalFinal =
    totalGeral + Number(taxasAdicionais || 0);



    // Helpers para o PDF
    const toBase64 = async (path) => {
      if (!path) return null;
      const url = path;
      const res = await fetch(url);
      const blob = await res.blob();
      return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
      });
     };

     
    // PDF
    const gerarPDF = async () => {
    try {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 40;
    const maxY = pageHeight - margin;
    const formatarEscala = (cidade, chegada, partida) => {
    if (!cidade) return "";

     let texto = cidade.toUpperCase();

    if (chegada) texto += ` - das ${chegada}`;
    if (partida) texto += ` às ${partida}`;

    return texto;
    };

     let y = margin;

    const newPageIfNeeded = (space = 20) => {
     if (y + space > maxY) {
     doc.addPage();
     y = margin;
     }
     };

    const arredondarImagem = async (base64) => {
    return new Promise((resolve) => {
    const img = new Image();
    img.src = base64;

    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      const width = 200;
      const height = 150;
      const radius = 20; 
      canvas.width = width;
      canvas.height = height;
      ctx.beginPath();
      ctx.moveTo(radius, 0);
      ctx.lineTo(width - radius, 0);
      ctx.quadraticCurveTo(width, 0, width, radius);
      ctx.lineTo(width, height - radius);
      ctx.quadraticCurveTo(width, height, width - radius, height);
      ctx.lineTo(radius, height);
      ctx.quadraticCurveTo(0, height, 0, height - radius);
      ctx.lineTo(0, radius);
      ctx.quadraticCurveTo(0, 0, radius, 0);
      ctx.closePath();
      ctx.clip();

      ctx.drawImage(img, 0, 0, width, height);

      resolve(canvas.toDataURL("image/png"));
    };
    });
    };

    // Número de série
     const currentYear = new Date().getFullYear();
     const serialKey = `serie_pdf_${currentYear}`;
      // Pega o último número salvo
     let stored = Number(localStorage.getItem(serialKey));
     stored = stored && stored >= 999 ? stored : 999;
     // Incrementa
     const serial = stored + 1;
    // Salva de volta no localStorage
    localStorage.setItem(serialKey, serial);
    // Formata para exibição no PDF
     const serialFormatted = `${String(serial).padStart(4, "0")}/${currentYear}`;
     doc.setFontSize(11);
     doc.setFont("helvetica", "normal");
     doc.text(`Número de série: `, margin, y);
     doc.setFont("helvetica", "bold");
     doc.text(serialFormatted, margin + 90, y);

    // logo 
     let logoBase64 = null;
     if (pdfFields.logo) {
     const candidate = userLogo || (logo && (logo.src || logo));
     logoBase64 = await toBase64(candidate);
     }
      
     if (logoBase64) {
    const roundedLogo = await arredondarImagem(logoBase64);
    const w = 70, h = 70;
    doc.addImage(roundedLogo, "PNG", (pageWidth - w) / 2, y, w, h);
    y += h;
    }

    // Título
    y += 30;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("Orçamento e Informações da Viagem", pageWidth / 2, y, { align: "center" });
    y += 20;

     // Função padrão para escrita organizada 
     const separator = () => {
     doc.setDrawColor(185);
     doc.setLineWidth(0.4);
     doc.line(margin, y, pageWidth - margin, y);
      y += 20;
      };
     const write = (label, value) => {
      const labelX = margin;
      const valueX = margin + 150;
      const maxWidth = pageWidth - valueX - margin;

    
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text(`${label}:`, labelX, y);

      doc.setFont("helvetica", "bold");
      const lines = doc.splitTextToSize(String(value ?? "-"), maxWidth);
      doc.text(lines, valueX, y);

      y += lines.length * 14 + 4;
      if (y > maxY) {
        doc.addPage();
        y = margin;
      }
    };

    // Info. Geral
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);

    separator();
    doc.text("INFORMAÇÕES GERAIS", margin, y);
    y += 20;
    write("Classificação", flight.classificacao);
    write("Total passageiros", totalPaxEx);
    write("Taxas", `R$ ${(totalTaxas + Number(taxasAdicionais || 0)).toFixed(2)}`);

     // Trechos
      flight.trechos.slice(0, qtdVoos).forEach((t, i) => {
      newPageIfNeeded(180);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      separator();
      const labelVoo =
      qtdVoos === 1
      ? "VOO - IDA"
      : qtdVoos === 2
      ? i === 0 ? "VOO - IDA" : "VOO - VOLTA"
      : `VOO ${i + 1}`;
      doc.text(labelVoo, margin, y);
      y += 20;
      let escalasTexto = "Voo direto";

      if (Number(t.escalas) === 1) {
        escalasTexto = formatarEscala(
          t.escala1Cidade,
          t.escala1Chegada,
          t.escala1Partida
        );
      }

      if (Number(t.escalas) === 2) {
        escalasTexto =
          formatarEscala(
            t.escala1Cidade,
            t.escala1Chegada,
            t.escala1Partida
          ) +
          " || " +
          formatarEscala(
            t.escala2Cidade,
            t.escala2Chegada,
            t.escala2Partida
          );
      }

      write("Data", t.data ? t.data.split("-").reverse().join("/") : "");
      write("Horário embarque", t.embarque);
      write("Horário chegada", t.chegada);
      write("Companhia", t.companhia?.toUpperCase());
      write("Classe", t.classe);
      write("Aeroporto embarque", t.origem?.toUpperCase());
      write("Aeroporto destino", t.destino?.toUpperCase());
      write("Escalas", escalasTexto);
      write("Bagagem",`${Number(t.bagagemQtd || 0)} x R$ ${Number(t.bagagemPreco || 0).toFixed(2)} = R$ ${(Number(t.bagagemQtd || 0) * Number(t.bagagemPreco || 0)).toFixed(2)} || ${t.tipoBagagem}`);
      write("Total do trecho", "R$" + totalTrecho(t).toFixed(2))
    });


    // ====== TOTAL FINAL ======
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    separator();
    doc.text(`TOTAL GERAL: R$ ${totalFinal.toFixed(2)}`, pageWidth / 2, y, { align: "center" });
    y += 10;
    separator();

    y += 5;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("Atenção: Nenhuma emissão foi efetuada até o momento. Este documento é apenas um orçamento.", pageWidth / 2, y, {
      align: "center",
    });

    // Observações
    y += 14;
    doc.setFontSize(8.5);
    doc.setFont("helvetica", "normal");
    const obs = "Aviso importante sobre preços dinâmicos: Os valores apresentados neste orçamento estão sujeitos à variação de acordo com disponibilidade, demanda, políticas das companhias aéreas e hotéis, além de possíveis alterações cambiais. Como se tratam de preços dinâmicos, o valor final somente será confirmado no momento da emissão da passagem aérea ou da reserva da hospedagem. Recomenda-se confirmar a compra o quanto antes para garantir as tarifas informadas.";
    const obsLines = doc.splitTextToSize(obs, pageWidth - margin * 2);
    doc.text(obsLines, margin, y);
    
     y += 55;

    const agenciaInfo = [];

   if (pdfFields.nome && nomeAgencia) {
    agenciaInfo.push(`Agência: ${nomeAgencia}`);
   }

   if (pdfFields.telefone && telefoneAgencia) {
   agenciaInfo.push(`Telefone: ${telefoneAgencia}`);
   }

   if (pdfFields.redes && redesAgencia) {
   agenciaInfo.push(`Redes sociais: ${redesAgencia}`);
   }

   if (pdfFields.cnpj && cnpj) {
   agenciaInfo.push(`CNPJ: ${cnpj}`);
   }

   if (pdfFields.cadastur && cadastur) {
   agenciaInfo.push(`Cadastur: ${cadastur}`);
   }

  if (agenciaInfo.length > 0) {
  doc.setFontSize(8.5);
  doc.setFont("helvetica", "bold");
  
 
   // Juntar as informações da empresa com separador geral
   const textoFinal = agenciaInfo.join("  |  ");
   const textWidth = doc.getTextWidth(textoFinal);
   const x = (pageWidth - textWidth) / 2;
   doc.text(textoFinal, x, y);
    y += 10;
    } 

    // Salvar
     doc.save(`informacoes.orcamento_${serialFormatted}.pdf`);

    // Salvar histórico
    const historico = JSON.parse(localStorage.getItem("historicoCotacoes")) || [];

    const registro = {
      id: serialFormatted,
      data: new Date().toLocaleString("pt-BR"),
      classificacao: flight.classificacao,
      tipo: flight.tipoviagem, 
      passageiros: totalPaxEx,
      total: Number(totalFinal.toFixed(2)),
      flightData: flight,
      qtdVoos: qtdVoos ,
      taxasAdicionais: taxasAdicionais, 
    };

    historico.unshift(registro); // Mais recentes primeiro
    localStorage.setItem("historicoCotacoes", JSON.stringify(historico));

    } catch (err) {
    console.error("Erro ao gerar PDF:", err);
    }
  
    };

         
   return (

       <div className="max-w-4xl  space-y-8">
        
      <style jsx>{`
        /* Remove as setas dos inputs numéricos */
        input[type="number"]::-webkit-inner-spin-button,
        input[type="number"]::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        input[type="number"] {
          -moz-appearance: textfield;
        }
      `}</style>
    
    <div className="max-w-5xl mx-auto p-6 space-y-8">

      <h1 className="text-4xl font-extrabold text-center">
        Sistema de Orçamentos
      </h1>

      {/* Infos. gerais */}
          <div className= "rounded-xl shadow-md p-5 space-y-6">
        
          <h2 className="text-2xl font-extrabold text-center">
          Informações gerais
          </h2>
      
         <label className="flex flex-col text-lg font-bold">
         Viagem:
         <select
          value={qtdVoos}
          onChange={(e) => setQtdVoos(Number(e.target.value))}
          className="p-2 border font-medium rounded" >
          <option className="bg-gray-400 text-gray-800 text-lg font-semibold" value={1}>Somente Ida</option>
          <option className="bg-gray-400 text-gray-800 text-lg font-semibold" value={2}>Ida e Volta</option>
          <option className="bg-gray-400 text-gray-800 text-lg font-semibold" value={3}>Multitrechos (3 Voos)</option>
          <option className="bg-gray-400 text-gray-800 text-lg font-semibold" value={4}>Multitrechos (4 Voos)</option>
        </select>
        </label>


        <label className="flex flex-col text-lg font-semibold">
        Tipo de viagem:
        <select
          value={flight.classificacao}
          onChange={(e) =>
            setFlight({ ...flight, classificacao: e.target.value })
          }
          className="p-2 border font-medium rounded"
        >
          <option className="bg-gray-400 text-gray-800 text-lg font-semibold">Nacional</option>
          <option className="bg-gray-400 text-gray-800 text-lg font-semibold">Internacional</option>
        </select>
        </label>
     

      {/* PASSAGEIROS */}
      <div className="text-center font-bold text-xl mt-4">
     Passageiros: {totalPaxEx}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {[
      { key: "adultos", label: "Adultos:" },
      { key: "criancas", label: "Crianças (2-11):" },
      { key: "bebes", label: "Bebês (não pagam):" },
      ].map(({ key, label }) => (

     <label key={key} className="flex flex-col text-lg font-bold">
      {label}
      <input
        type="number"
        placeholder={`Ex: 1`}
        value={flight[key] ?? ""}
        onChange={(e) =>
         setFlight({
         ...flight,
        [key]: e.target.value === "" ? "" : Number(e.target.value)
          })
        }
      className="mt-2 p-2 border rounded text-center uppercase"/>
      </label>
       ))}
      </div>

      <div className="mt-6 space-y-3 text-center">

   <div className="text-lg font-bold">
    Total taxas de embarque:
     <div className="text-2xl font-extrabold">
      R$ {totalTaxas.toFixed(2)}
     </div>
    </div>

   <div className="flex flex-col items-center">
    <label className="text-lg font-bold">
      Taxas adicionais:
    </label>

    <input
      type="number"
      placeholder="Ex: 50.00"
      value={taxasAdicionais}
      onChange={(e) => setTaxasAdicionais(e.target.value)}
      className="mt-2 p-2 border rounded text-lg font-bold text-center uppercase w-40"
    />
    </div>

    <div className="text-lg font-bold">
    Total taxas:
    <div className="text-3xl font-extrabold">
      R$ {(totalTaxas + Number(taxasAdicionais || 0)).toFixed(2)}
     </div>
     </div>
     </div>
     </div>

    {/* TRECHOS */}
    {flight.trechos.slice(0, qtdVoos).map((t, i) => (

    <div key={i} className="p-6 rounded-2xl shadow-xl space-y-6">

     <h2 className="text-2xl font-extrabold text-center">
      {qtdVoos === 1
     ? "Dados Voo - Ida"
     : qtdVoos === 2
     ? i === 0 ? "Dados Voo - Ida" : "Dados Voo - Volta"
     : `Dados do voo ${i + 1}`}
      </h2>

     {/* Companhia */}
     <div>
      <label className="flex flex-col text-lg font-bold">
        Companhia aérea:
        <input
          type="text"
          value={t.companhia}
          onChange={(e)=>updateTrecho(i,"companhia",e.target.value)}
          placeholder="Ex: LATAM"
          className="mt-2 p-2 rounded border text-center uppercase"
        />
      </label>
     </div>

    {/* Classe */}
    <div>
      <label className="flex flex-col text-lg font-bold">
        Classe:
        <select
          value={t.classe || "Econômica"}
          onChange={(e)=>updateTrecho(i,"classe",e.target.value)}
          className="mt-2 font-medium text-lg p-2 rounded border text-center"
        >
          <option className="bg-gray-400 text-gray-800 text-lg font-semibold">Econômica</option>
          <option className="bg-gray-400 text-gray-800 text-lg font-semibold">Executiva</option>
        </select>
      </label>
     </div>

     {/* Horários */}
     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <label className="flex text-lg flex-col font-bold">
        Data:
        <input
          type="date"
          value={t.data}
          onChange={(e)=>updateTrecho(i,"data",e.target.value)}
          className="mt-1 p-2 rounded border text-center"
        />
      </label>

      <label className="flex text-lg  flex-col font-bold">
        Hora embarque:
        <input
          type="time"
          value={t.embarque}
          onChange={(e)=>updateTrecho(i,"embarque",e.target.value)}
          className="mt-1 p-2 rounded border text-center"
        />
      </label>

      <label className="flex text-lg flex-col font-bold">
        Hora chegada:
        <input
          type="time"
          value={t.chegada}
          onChange={(e)=>updateTrecho(i,"chegada",e.target.value)}
          className="mt-1 p-2 rounded border text-center"
        />
      </label>
    </div>

     {/* Aeroportos */}
     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <label className="flex text-lg flex-col font-bold">
        Aeroporto embarque:
        <input
          type="text"
          maxLength={3}
          value={t.origem}
          onChange={(e)=>updateTrecho(i,"origem",e.target.value)}
          placeholder="Ex: GRU"
          className="mt-1 p-2 rounded border text-center text-lg font-bold uppercase"
        />
      </label>

      <label className="flex text-lg flex-col font-bold">
        Aeroporto destino:
        <input
          type="text"
          maxLength={3}
          value={t.destino}
          onChange={(e)=>updateTrecho(i,"destino",e.target.value)}
          placeholder="Ex: CGH"
          className="mt-1 p-2 rounded border text-center text-lg font-bold uppercase"
        />
      </label>
    </div>

    {/* Escalas */}
    <div>
      <label className="flex text-lg flex-col font-bold">
        Escalas:
        <select
          value={t.escalas || 0}
          onChange={(e)=>updateTrecho(i,"escalas",Number(e.target.value))}
          className="mt-2 p-2 font-medium text-lg rounded border text-center"
        >
          <option className="bg-gray-400 text-gray-800 text-lg font-semibold" value={0}>Voo direto</option>
          <option className="bg-gray-400 text-gray-800 text-lg font-semibold" value={1}>1 escala</option>
          <option className="bg-gray-400 text-gray-800 text-lg font-semibold" value={2}>2 escalas</option>
        </select>
      </label>
    </div>

    {/* Escala 1 */}
    {Number(t.escalas) >= 1 && (
      <div className="border rounded-xl p-4 space-y-3">
        <h3 className="font-bold text-xl">Escala 1 - </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <label className="flex flex-col text-lg font-semibold">
          Cidade:
          <input
            placeholder="Ex: São Paulo"
            value={t.escala1Cidade || ""}
            onChange={(e)=>updateTrecho(i,"escala1Cidade",e.target.value)}
            className="p-2 border rounded text-center text-lg font-bold  uppercase"
          />
          </label>

          <label className="flex flex-col text-lg font-semibold">
          Hora chegada:
          <input
            type="time"
            value={t.escala1Chegada || ""}
            onChange={(e)=>updateTrecho(i,"escala1Chegada",e.target.value)}
            className="p-2 border rounded text-center"
          />
          </label>

          <label className="flex flex-col text-lg font-semibold">
          Hora partida:
          <input
            type="time"
            value={t.escala1Partida || ""}
            onChange={(e)=>updateTrecho(i,"escala1Partida",e.target.value)}
            className="p-2 border rounded text-center"
          />
          </label>

        </div>
        </div>
         )}

      {/* Escala 2 */}
      {Number(t.escalas) === 2 && (
      <div className="border rounded-xl p-4 space-y-3">
        <h3 className="font-bold text-xl">Escala 2 - </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
         <label className="flex flex-col text-lg font-semibold">
          Cidade:
          <input
            placeholder="Ex: Recife"
            value={t.escala2Cidade || ""}
            onChange={(e)=>updateTrecho(i,"escala2Cidade",e.target.value)}
            className="p-2 border rounded text-center text-lg font-bold uppercase"
          />
          </label>

         <label className="flex flex-col text-lg font-semibold">
          Hora chegada:
          <input
            type="time"
            value={t.escala2Chegada || ""}
            onChange={(e)=>updateTrecho(i,"escala2Chegada",e.target.value)}
            className="p-2 border rounded text-center"
          />
          </label>

          <label className="flex flex-col text-lg font-semibold">
          Hora partida:
          <input
            type="time"
            value={t.escala2Partida || ""}
            onChange={(e)=>updateTrecho(i,"escala2Partida",e.target.value)}
            className="p-2 border rounded text-center"
          />
          </label>

        </div>
      </div>
    )}

    {/* Taxa */}
    <div className="flex justify-center">
    <div className="text-lg font-bold text-center">
    Taxa de embarque (automática):

    {!t.origem ? (

      <div className="text-lg mt-2 font-medium">
        Informe o aeroporto de embarque
      </div>

    ) : getTaxa(t.origem) === 0 ? (

      <div className="mt-2 text-lg font-medium">
        Aeroporto não cadastrado

        <div className="mt-2">
          <Button
            onClick={() => router.push("/taxas.embarque")}
            className="text-lg p-6 font-bold"
          >
            Cadastre aqui
          </Button>
        </div>
      </div>

      ) : (

      <div className="text-2xl font-extrabold">
        R$ {(getTaxa(t.origem) * totalPax).toFixed(2)}

        {totalPax > 1 && (
          <div className="text-lg font-semibold mt-1">
            ({totalPax} passageiros × R$ {getTaxa(t.origem).toFixed(2)})
          </div>
        )}
      </div>
      )}
     </div>
     </div>


    {/* Bagagens */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
     
    <label className="flex flex-col text-lg font-bold">
      Quantidade de bagagens:
    <input
     type="number"
     placeholder="Ex: 1"
     value={t.bagagemQtd ?? ""}
     onChange={(e)=>
     updateTrecho(i, "bagagemQtd", e.target.value === "" ? "" : Number(e.target.value))
      }
      className="p-2 border rounded text-center uppercase"
      />
      </label>


     <label className="flex flex-col text-lg font-bold">
      Valor unitário:
     <input
     type="number"
     placeholder="Ex: 100.00"
     value={t.bagagemPreco ?? ""}
     onChange={(e)=>
     updateTrecho(i, "bagagemPreco", e.target.value === "" ? "" : Number(e.target.value))
      }
      className="p-2 border rounded text-center uppercase"
      />
      </label>
    <label className="flex flex-col text-lg font-bold">
    Tipo de bagagem:
     <select
    value={t.tipoBagagem || "Sem bagagem"}
    onChange={(e)=>updateTrecho(i,"tipoBagagem",e.target.value)}  
    className="mt-1 p-2 border font-medium rounded text-center">
      
    <option className="bg-gray-400 text-gray-900 font-semibold text-lg">
      Sem bagagem
    </option>
    <option className="bg-gray-400 text-gray-900 font-semibold text-lg">
      Bagagem de mão
    </option>
    <option className="bg-gray-400 text-gray-900 font-semibold text-lg">
      Bagagem despachada
    </option>
    <option className="bg-gray-400 text-gray-900 font-semibold text-lg">
      Item pessoal
    </option>
   </select>
    </label>
    </div>

    {/* Total bagagem */}
    <div className="text-center text-xl font-bold">
        Total bagagens: R$ {(t.bagagemQtd * t.bagagemPreco).toFixed(2)}
    </div>

    {/* Progama / Milhas */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <label className="flex flex-col text-lg font-bold">
      Programa milheiro:
      <select
        value={t.programa || "Latam"}
        onChange={(e)=>updateTrecho(i,"programa",e.target.value)}
        className="mt-1 p-2 border rounded font-medium text-center">
        {["Latam",
          "Smiles",
          "Azul",
          "Iberia",
          "American Airlines",
          "British",
          "Qatar",
        ].map(p=>(
          <option className="bg-gray-400 text-gray-800 text-lg font-semibold" key={p}>{p}</option>
        ))}
      </select>
      </label>


      <label className="flex flex-col text-lg font-bold">
      Milhas por passageiro:
      <input
        type="number"
        placeholder="Ex: 21.00"
        value={t.milhas || ""}
        onChange={(e)=>updateTrecho(i,"milhas",Number(e.target.value))}
        className="p-2 border rounded text-cente uppercase text-center"
      />
      </label>


     <label className="flex flex-col text-lg font-bold">
      Preço do milheiro:
      <input
        type="number"
        placeholder="Ex: 30.00"
        value={t.precoMilheiro || ""}
        onChange={(e)=>updateTrecho(i,"precoMilheiro",Number(e.target.value))}
        className="p-2 border rounded text-center uppercase"
      />
      </label>
    </div>

    {/* TOTAL */}
    <div className="text-center">
      <span className="font-bold text-xl">Total do trecho:</span>
      <div className="text-3xl font-extrabold">
        R$ {totalTrecho(t).toFixed(2)}
      </div>
    </div>

  </div>

   ))}
      

      {/* TOTAL GERAL */}
      <div className="text-center mt-13 text-3xl font-extrabold">
        TOTAL: R$ {totalFinal.toFixed(2)}
      </div>

      <div className="flex justify-center">
        <Button 
        className="text-xl font-bold p-6"
        onClick={gerarPDF}>
          Gerar PDF
        </Button>
    </div>
    </div>
    </div> 
    )};