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
     cliente: "",
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

     useEffect(() => {
     if (qtdVoos < 2) return;
     const ida = flight.trechos[0];
     if (ida.destino) updateTrecho(1, "origem", ida.destino);
     if (ida.origem) updateTrecho(1, "destino", ida.origem);
    }, [flight.trechos[0].origem, flight.trechos[0].destino, qtdVoos]);  
      
    // Passageiros
    const totalPax =
    Number(flight.adultos || 0) + Number(flight.criancas || 0);

    const totalPaxEx = totalPax + Number(flight.bebes || 0);

    // Taxa do aeroporto
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

     if (chegada) texto += ` das ${chegada}`;
     if (partida) texto += ` às ${partida}`;

     return texto;
     };

     let y = margin;

     const newPageIfNeeded = (space = 20) => {
     if (y + space > maxY) {
     doc.addPage();
     y = margin;
     }};

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
      }};

    // Info. Geral
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);

    separator();
    doc.text("INFORMAÇÕES GERAIS", margin, y);
    y += 20;
    write("Cliente", flight.cliente);
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
          " e " +
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
      write("Total do trecho", "R$ " + totalTrecho(t).toFixed(2))
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
    
     y += 50;

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

    // Taxas por trecho 
    const taxasPorTrecho = flight.trechos
    .slice(0, qtdVoos)
    .map((trecho, i) => ({
    index: i,
    origem: trecho.origem,
    valor: getTaxa(trecho.origem) * totalPax
     }));

     // Aeroporto inputs
     const GRUPOS_AEROPORTO = {
    SAO: [
    { codigo: "GRU", nome: "Guarulhos" },
    { codigo: "CGH", nome: "Congonhas" },
    { codigo: "VCP", nome: "Viracopos" },
    ],
    RIO: [
    { codigo: "GIG", nome: "Galeão" },
    { codigo: "SDU", nome: "Santos Dumont" },
    ],
    NYC: [
    { codigo: "JFK", nome: "John F. Kennedy" },
    { codigo: "EWR", nome: "Newark" },
    { codigo: "LGA", nome: "LaGuardia" },
    ],
    LON: [
    { codigo: "LHR", nome: "Heathrow" },
    { codigo: "LGW", nome: "Gatwick" },
    ],
    PAR: [
    { codigo: "CDG", nome: "Charles de Gaulle" },
    { codigo: "ORY", nome: "Orly" },
    ],
    BHZ: [
    { codigo: "CNF", nome: "Confins" },
    { codigo: "PLU", nome: "Pampulha" },
    ],
    };
         
    return (
       <div className="w-full space-y-8">
        
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
    
     <div className="w-full">

      <h1 className="text-4xl mb-10 mt-5 font-extrabold text-center">
        Sistema de Orçamentos
      </h1>

      {/* Infos. gerais */}
      <div className="rounded-2xl w-full shadow-xl p-6 space-y-4">
      <h2 className="text-2xl font-extrabold text-center">
      Informações gerais
      </h2>

        <div className="flex flex-col md:flex-row gap-3">
        <label className="flex flex-col text-lg font-bold flex-1">
         Nome do cliente:
        <input
          type="text"
          value={flight.cliente}
          onChange={(e) => setFlight({ ...flight, cliente: e.target.value })}
          placeholder="EX: Joana Silva"
          className="p-1 rounded border text-center"
        />
       </label>
     
      <label className="flex flex-col text-lg font-bold flex-1">
      Viagem:
      <select
        value={qtdVoos}
        onChange={(e) => setQtdVoos(Number(e.target.value))}
        className="p-2 border font-medium rounded w-full">
        <option className="bg-gray-400 text-gray-800 text-lg font-semibold" value={1}>Somente Ida</option>
        <option className="bg-gray-400 text-gray-800 text-lg font-semibold" value={2}>Ida e Volta</option>
        <option className="bg-gray-400 text-gray-800 text-lg font-semibold" value={3}>Multitrechos (3 Voos)</option>
        <option className="bg-gray-400 text-gray-800 text-lg font-semibold" value={4}>Multitrechos (4 Voos)</option>
      </select>
      </label>

      <label className="flex flex-col text-lg font-semibold flex-1">
      Tipo de viagem:
      <select
        value={flight.classificacao}
        onChange={(e) => setFlight({ ...flight, classificacao: e.target.value })}
        className="p-2 border font-medium rounded w-full">
        <option className="bg-gray-400 text-gray-800 text-lg font-semibold">Nacional</option>
        <option className="bg-gray-400 text-gray-800 text-lg font-semibold">Internacional</option>
      </select>
      </label>
      </div>
  
     

      {/* PASSAGEIROS */}
      <div className="text-center font-bold text-2xl mt-10">
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
     </div>
     </div>

    {/* Trechos */}
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
      <div className="flex flex-col md:flex-row gap-5">
      <label className="flex flex-col text-lg font-bold flex-1">
        Companhia aérea:
        <input
          type="text"
          value={t.companhia}
          onChange={(e)=>updateTrecho(i,"companhia",e.target.value)}
          placeholder="Ex: LATAM"
          className="mt-2 p-2 rounded border text-center uppercase"
        />
      </label>
     

      {/* Classe */}
      <div>
      <label className="flex flex-col text-lg font-semibold flex-1">
        Classe:
        <select
          value={t.classe || "Econômica"}
          onChange={(e)=>updateTrecho(i,"classe",e.target.value)}
          className="mt-2 font-medium text-lg p-2 rounded border text-center">
          <option className="bg-gray-400 text-gray-800 text-lg font-semibold">Econômica</option>
          <option className="bg-gray-400 text-gray-800 text-lg font-semibold">Executiva</option>
        </select>
       </label>
       </div>
       </div>
     

     {/* Horários */}
     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <label className="flex text-lg flex-col font-bold">
        Data:
        <input
          type="date"
          value={t.data}
          onChange={(e)=>updateTrecho(i,"data",e.target.value)}
          className="mt-1 p-2 rounded border text-center"/>
      </label>

      <label className="flex text-lg  flex-col font-bold">
        Hora embarque:
        <input
          type="time"
          value={t.embarque}
          onChange={(e)=>updateTrecho(i,"embarque",e.target.value)}
          className="mt-1 p-2 rounded border text-center"/>
      </label>

      <label className="flex text-lg flex-col font-bold">
        Hora chegada:
        <input
          type="time"
          value={t.chegada}
          onChange={(e)=>updateTrecho(i,"chegada",e.target.value)}
          className="mt-1 p-2 rounded border text-center"/>
      </label>
    </div>

     {/* Aeroportos */}
     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">  
     {[
     { field: "origem", label: "Aeroporto embarque", placeholder: "Ex: GRU" },
     { field: "destino", label: "Aeroporto destino", placeholder: "Ex: CGH" },
     ].map(({ field, label, placeholder }) => {
     const valor = (t[field] || "").toUpperCase();
     const grupo = GRUPOS_AEROPORTO[valor];

     return (
      <div key={field} className="relative flex flex-col gap-1">
        <label className="text-lg font-bold">{label}:</label>
        <input
          type="text"
          maxLength={3}
          value={t[field]}
          onChange={(e) => updateTrecho(i, field, e.target.value.toUpperCase())}
          placeholder={placeholder}
          className="p-2 rounded border text-center text-lg font-bold uppercase mt-1"
        />

        {grupo && (
          <ul className="absolute top-full left-0 right-0 z-50 border rounded-xl shadow-lg overflow-hidden mt-1">
            {grupo.map((a) => (
              <li
                key={a.codigo}
                onMouseDown={() => updateTrecho(i, field, a.codigo)}
                className="flex items-center justify-between px-4 py-3 dark:bg-gray-900 bg-gray-400 transition-opacity hover:brightness-90">
                <span className="text-lg font-extrabold">{a.codigo}</span>
                <span className="text-m font-semibold">{a.nome}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
      );
      })}
      </div>

     {/* Escalas */}
      <div>
      <label className="flex text-lg flex-col font-bold">
        Escalas:
        <select
          value={t.escalas || 0}
          onChange={(e)=>updateTrecho(i,"escalas",Number(e.target.value))}
          className="mt-2 p-2 font-medium text-lg rounded border text-center">
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
            className="p-2 border rounded text-center text-lg font-bold  uppercase"/>
          </label>

          <label className="flex flex-col text-lg font-semibold">
          Hora chegada:
          <input
            type="time"
            value={t.escala1Chegada || ""}
            onChange={(e)=>updateTrecho(i,"escala1Chegada",e.target.value)}
            className="p-2 border rounded text-center"/>
          </label>

          <label className="flex flex-col text-lg font-semibold">
          Hora partida:
          <input
            type="time"
            value={t.escala1Partida || ""}
            onChange={(e)=>updateTrecho(i,"escala1Partida",e.target.value)}
            className="p-2 border rounded text-center"/>
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
            className="p-2 border rounded text-center"/>
          </label>

          <label className="flex flex-col text-lg font-semibold">
          Hora partida:
          <input
            type="time"
            value={t.escala2Partida || ""}
            onChange={(e)=>updateTrecho(i,"escala2Partida",e.target.value)}
            className="p-2 border rounded text-center" />
          </label>
         </div>
        </div>
        )}


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
      className="p-2 border rounded text-center uppercase"/>
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
      className="p-2 border rounded text-center uppercase"/>
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
    <div className="text-center text-m sm:text-xl font-bold">
        Total bagagens: R$ {(t.bagagemQtd * t.bagagemPreco).toFixed(2)}
    </div>

     {/* Progama / Milhas */}
     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <label className="flex flex-col text-lg font-bold">
      Programa:
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
        className="p-2 border rounded text-cente uppercase text-center"/>
      </label>


     <label className="flex flex-col text-lg font-bold">
      Preço do milheiro:
      <input
        type="number"
        placeholder="Ex: 30.00"
        value={t.precoMilheiro || ""}
        onChange={(e)=>updateTrecho(i,"precoMilheiro",Number(e.target.value))}
        className="p-2 border rounded text-center uppercase"/>
      </label>
      </div>

     {/* Total trecho */}
     <div className="text-center">
      <span className="font-bold text-xl">Total do trecho:</span>
      <div className="text-3xl font-extrabold">
        R$ {totalTrecho(t).toFixed(2)}
      </div>
      </div>
      </div>
      ))}


    {/* Taxas de embarque por trecho */}
     <div className="space-y-8">
     <h2 className="text-2xl mt-12 mb-10 font-extrabold text-center">
     Taxas de embarque por voo:
     </h2>

      {taxasPorTrecho.map((taxa, i) => {
      const labelVoo =
      qtdVoos === 1
        ? "Voo - Ida"
        : qtdVoos === 2
        ? i === 0 ? "Voo - Ida" : "Voo - Volta"
        : `Voo ${i + 1}`;

     const valorTaxa = getTaxa(taxa.origem);
     const semAeroporto = !taxa.origem;
     const naoCadastrado = !semAeroporto && valorTaxa === 0;
     const temTaxa = !semAeroporto && valorTaxa > 0;

      return (
      <div
        key={i}
        className="rounded-xl border p-4 flex flex-col items-center gap-2 shadow-sm">
        {/* Label do voo */}
        <div className="text-lg font-extrabold underline uppercase tracking-wide">
          {labelVoo}
        </div>

        {semAeroporto && (
          <div className="font-medium text-lg italic">
            Adicione o aeroporto de embarque para conseguir a taxa de embarque por favor.
          </div>
        )}

        {naoCadastrado && (
          <>
          <div className="font-medium text-lg italic">
          Taxa do aeroporto de embarque informado não cadastrada.
          </div>
          <Button
          onClick={() => router.push("/taxas.embarque")}
          className="text-lg p-5 m-2 text-white font-semibold">
          Cadastre aqui
          </Button>
          </>
          )}

        {temTaxa && (
          <>
            <div className="text-lg font-medium">
              {taxa.origem.toUpperCase()}
            </div>
            <div className="text-2xl font-extrabold">
              R$ {(valorTaxa * totalPax).toFixed(2)}
            </div>
            {totalPax > 1 && (
              <div className="text-lg font-medium">
                {totalPax} × R$ {valorTaxa.toFixed(2)}
              </div>
            )}
          </>
        )}
      </div>
      );
      })}
    
 
     {/* Resumo de taxas */}
     <div className="rounded-xl border p-5 flex flex-col gap-5 shadow-sm mt-20">

     {/* Soma das taxas de embarque */}
      <div className="flex flex-col gap-1 items-center">
      <span className="text-m sm:text-lg font-bold">Taxas de embarque:</span>
      <span className="text-xl font-extrabold">
        R$ {totalTaxas.toFixed(2)}
      </span>
      </div>

     <hr className="opacity-20"/>

      {/* Taxa adicional */}
      <div className="flex flex-col gap-1 items-center">
      <span className="text-m sm:text-lg font-bold">Taxa adicional:</span>
      <input
        type="number"
        placeholder="EX: R$ 5.00"
        value={taxasAdicionais}
        onChange={(e) => setTaxasAdicionais(e.target.value)}
        className="border p-2 rounded text-lg font-bold text-center w-35"/>
      </div>

     <hr className="opacity-20" />

    {/* Total final das taxas */}
    <div className="flex flex-col gap-1 items-center">
      <span className="text-m sm:text-lg font-bold">Total das taxas de embarque:</span>
      <span className="text-xl font-extrabold">
        R$ {(totalTaxas + Number(taxasAdicionais || 0)).toFixed(2)}
      </span>
      </div>
      </div>
      </div>

      

      {/* Total geral */}
      <div className="text-center mt-13 text-2xl sm:text-3xl font-extrabold">
        TOTAL: R$ {totalFinal.toFixed(2)}
      </div>

        <div className="flex justify-center">
        <Button 
        className="text-xl font-bold p-6 mb-3"
        onClick={gerarPDF}>
          Gerar PDF
        </Button>
        </div>
        </div>
        )};