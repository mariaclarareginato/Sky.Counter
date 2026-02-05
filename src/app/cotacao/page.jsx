"use client";

import { useEffect, useState } from "react";
import jsPDF from "jspdf";
import { Button } from "../components/ui/button.jsx";
import logo from "../../../public/logo.png";

export default function IdaVoltaPage() {
  const [flight, setFlight] = useState({
    // Dados gerais
    classificacao: "Nacional",
    tipoviagem: "Ida e Volta",
    adultos: 1,
    criancas: 0,
    bebes: 0,

    // Ida
    idaData: "",
    idaEmbarqueHora: "",
    idaChegadaHora: "",
    idaAeroporto: "",
    idaChegadaAeroporto: "",
    idaTaxaManual: "",

    // Volta
    voltaData: "",
    voltaEmbarqueHora: "",
    voltaChegadaHora: "",
    voltaAeroporto: "",
    voltaChegadaAeroporto: "",
    voltaTaxaManual: "",

    // Bagagens
    bagagemQuantidadeIda: 0,
    bagagemPrecoIda: 0,
    bagagemQuantidadeVolta: 0,
    bagagemPrecoVolta: 0,

    // Programa / milhas IDA
    programaIda: "Latam",
    milhasPorPassageiroIda: 0,
    precoMilheiroIda: 0,

    // Programa / milhas VOLTA
    programaVolta: "Latam",
    milhasPorPassageiroVolta: 0,
    precoMilheiroVolta: 0,

    // Escalas IDA
       
       voltaEscalas: 0,
      
      idaEscala1Cidade: "",
      idaEscala1Chegada: "",
      idaEscala1Partida: "",

      idaEscala2Cidade: "",
      idaEscala2Chegada: "",
      idaEscala2Partida: "",

    

    // Escalas VOLTA
     voltaEscalas: 0,

      voltaEscala1Cidade: "",
      voltaEscala1Chegada: "",
      voltaEscala1Partida: "",

      voltaEscala2Cidade: "",
      voltaEscala2Chegada: "",
      voltaEscala2Partida: "",


  });

const [nomeAgencia, setNomeAgencia] = useState("");
const [telefoneAgencia, setTelefoneAgencia] = useState("");
const [redesAgencia, setRedesAgencia] = useState("");
const [userLogo, setUserLogo] = useState(null);
const [cnpj, setCnpj] = useState("");
const [cadastur, setCadastur] = useState("");
const [pdfFields, setPdfFields] = useState({});

  const [airportRates] = useState([
  
  { code: "BEL", nacional: 25, internacional: 90 },
  { code: "BSB", nacional: 35, internacional: 110 },
  { code: "CDG", nacional: 0, internacional: 320 },
  { code: "CGB", nacional: 20, internacional: 80 },
  { code: "CGH", nacional: 60.62, internacional: 120 },
  { code: "CNF", nacional: 33.56, internacional: 120 },
  { code: "CWB", nacional: 25, internacional: 90 },
  { code: "DXB", nacional: 0, internacional: 400 },
  { code: "EZE", nacional: 0, internacional: 270 },
  { code: "FLN", nacional: 20, internacional: 80 },
  { code: "FOR", nacional: 56.88, internacional: 305.58 },
  { code: "FRA", nacional: 0, internacional: 330 },
  { code: "GIG", nacional: 40, internacional: 120 },
  { code: "GRU", nacional: 33.64, internacional: 59.54 },
  { code: "HND", nacional: 0, internacional: 380 },
  { code: "IGU", nacional: 42.10, internacional: 120 },
  { code: "JFK", nacional: 0, internacional: 300 },
  { code: "JOI", nacional: 20, internacional: 80 },
  { code: "LHR", nacional: 0, internacional: 350 },
  { code: "MAD", nacional: 0, internacional: 310 },
  { code: "MAO", nacional: 20, internacional: 80 },
  { code: "MCZ", nacional: 20, internacional: 80 },
  { code: "MIA", nacional: 0, internacional: 300 },
  { code: "NAT", nacional: 46.20, internacional: 294.74 },
  { code: "POA", nacional: 25, internacional: 90 },
  { code: "REC", nacional: 30, internacional: 100 },
  { code: "SDU", nacional: 30, internacional: 100 },
  { code: "SFO", nacional: 0, internacional: 300 },
  { code: "SIN", nacional: 0, internacional: 380 },
  { code: "SSA", nacional: 30, internacional: 100 },
  { code: "VCP", nacional: 40, internacional: 120 },
  { code: "VIX", nacional: 20, internacional: 80 },
  { code: "YYZ", nacional: 0, internacional: 290 }


  ]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFlight((prev) => ({ ...prev, [name]: value }));
  };

  const getAirportTax = (airportCode, manualValue, classificacao) => {
    // usa manual se preenchido
    if (manualValue !== "" && manualValue !== null && typeof manualValue !== "undefined")
      return parseFloat(manualValue) || 0;
    const rate = airportRates.find((r) => r.code === (airportCode || "").toUpperCase());
    if (!rate) return 0;
    return classificacao === "Nacional" ? rate.nacional : rate.internacional;
  };

  // total de passageiros (adultos + crianças; bebês não pagam normalmente taxas/milhas) para calculo
  const totalPax = Number(flight.adultos || 0) + Number(flight.criancas || 0);

  
  // total de passageiros (adultos + crianças + bebês)

    const totalPaxEx = Number(flight.adultos || 0) + Number(flight.criancas || 0) + Number(flight.bebes || 0) ;






  // bagagens por trecho
  const totalBagagemIda = Number(flight.bagagemQuantidadeIda || 0) * Number(flight.bagagemPrecoIda || 0);
  const totalBagagemVolta = Number(flight.bagagemQuantidadeVolta || 0) * Number(flight.bagagemPrecoVolta || 0);

  // taxas (manual ou automática via aeroporto)
  const taxaIda = getAirportTax(flight.idaAeroporto, flight.idaTaxaManual, flight.classificacao);
  const taxaVolta =
    flight.tipoviagem === "Ida e Volta"
      ? getAirportTax(flight.voltaAeroporto, flight.voltaTaxaManual, flight.classificacao)
      : 0;

  // ===== CÁLCULOS DAS MILHAS (USANDO MILHEIRO: /1000 * precoMilheiro * pax) =====
  
  const valorMilhasIda =
    (Number(flight.milhasPorPassageiroIda || 0)) * Number(flight.precoMilheiroIda || 0) * totalPax;

  const valorMilhasVolta =
    flight.tipoviagem === "Ida e Volta"
      ? (Number(flight.milhasPorPassageiroVolta || 0)) *
        Number(flight.precoMilheiroVolta || 0) *
        totalPax
      : 0;

  // totais por trecho
  const totalIda = valorMilhasIda  + Number(taxaIda * totalPax|| 0) + Number(totalBagagemIda || 0) ;

  const totalVolta =
    flight.tipoviagem === "Ida e Volta" ? valorMilhasVolta + Number(taxaVolta * totalPax|| 0) + Number(totalBagagemVolta || 0) : 0 ;

  const totalGeral = totalIda + totalVolta;

  // Sempre salva o total (para rápido acesso)

  useEffect(() => {
    try {
      localStorage.setItem("valorTotal", String(totalGeral));
    } catch (e) {
      
    }
  }, [totalGeral]);

  // Controle para impedir salvar vazio na primeira renderização
  const [loaded, setLoaded] = useState(false);

  // Carrega dados salvos quando a página abre
 useEffect(() => {
  try {
    const savedData = localStorage.getItem("flightData");
    if (savedData) {
      setFlight((prev) => ({ ...prev, ...JSON.parse(savedData) }));
    }
  } catch (e) {}

  setLoaded(true);

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

}, []);


  // Salva os dados do voo sempre que mudar, mas SOMENTE após carregar primeiro
  useEffect(() => {
    if (!loaded) return; // evita sobrescrever com vazio ao iniciar
    try {
      localStorage.setItem("flightData", JSON.stringify(flight));
    } catch (e) {
      // ignore
    }
  }, [flight, loaded]);

  // ========================
  // Helpers para o PDF
  // ========================

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

     


    const gerarPDF = async () => {
  try {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 40;
    const maxY = pageHeight - margin;
    const formatarEscala = (cidade, chegada, partida) => {
    if (!cidade) return "-";

     let texto = cidade.toUpperCase();

    if (chegada) texto += ` - das ${chegada}`;
    if (partida) texto += ` às ${partida}`;

    return texto;
    };

     let y = margin;

    // logo 

     let logoBase64 = null;

     if (pdfFields.logo) {
     const candidate = userLogo || (logo && (logo.src || logo));
     logoBase64 = await toBase64(candidate);
     }

    if (logoBase64) {
      const w = 70, h = 60;
      doc.addImage(logoBase64, "PNG", (pageWidth - w) / 2, y, w, h);
      y += h + 14;
    }

    y += 10

    // -- Título --
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("Orçamento e Informações da Viagem", pageWidth / 2, y, { align: "center" });
    y += 30;

    // -- Número de série --
    const currentYear = new Date().getFullYear();
    const serialKey = `serie_pdf_${currentYear}`;
    let stored = Number(localStorage.getItem(serialKey));
    stored = stored && stored >= 999 ? stored : 999;
    const serial = stored + 1;
    localStorage.setItem(serialKey, serial);

    const serialFormatted = `${String(serial).padStart(4, "0")}/${currentYear}`;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Número de série: `, margin, y);
    doc.setFont("helvetica", "bold");
    doc.text(serialFormatted, margin + 80, y);
    y += 20;

    //  Função padrão para escrita organizada
    const write = (label, value) => {
      const labelX = margin;
      const valueX = margin + 150;
      const maxWidth = pageWidth - valueX - margin;

      doc.setFontSize(10);
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

    //  Dados gerais
    y += 10;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Informações gerais do Voo", margin, y);
    y += 18;

    write("Classificação", flight.classificacao);
    write("Tipo de viagem", flight.tipoviagem);
    write("Adultos", flight.adultos);
    write("Crianças", flight.criancas);
    write("Bebês", flight.bebes);

    y += 10;

    //  IDA
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Trecho: IDA", margin, y);
    y += 18;

    write("Data", flight.idaData ? flight.idaData.split("-").reverse().join("/") : "-");

      let escalasIdaTexto = "Voo direto";

    if (Number(flight.idaEscalas) === 1) {
  escalasIdaTexto = formatarEscala(
    flight.idaEscala1Cidade,
    flight.idaEscala1Chegada,
    flight.idaEscala1Partida
     );
    }

    if (Number(flight.idaEscalas) === 2) {
  escalasIdaTexto =
    formatarEscala(
      flight.idaEscala1Cidade,
      flight.idaEscala1Chegada,
      flight.idaEscala1Partida
    ) +
    "  e  " +
    formatarEscala(
      flight.idaEscala2Cidade,
      flight.idaEscala2Chegada,
      flight.idaEscala2Partida
    );
    }

   
    write("Horário do embarque", flight.idaEmbarqueHora);
    write("Horário da chegada", flight.idaChegadaHora);
    write("Aeroporto de origem", flight.idaAeroporto?.toUpperCase());
    write("Escalas", escalasIdaTexto);
    write("Aeroporto de destino", flight.idaChegadaAeroporto?.toUpperCase());
    write("Taxa de embarque (R$)", Number(taxaIda || 0).toFixed(2));
    write("Bagagens", `${flight.bagagemQuantidadeIda} x R$ ${Number(flight.bagagemPrecoIda || 0).toFixed(2)}`);
    write("Preço da passagem (R$)", valorMilhasIda.toFixed(2));
    write("Total (R$)", totalIda.toFixed(2));

    //  VOLTA
    if (flight.tipoviagem === "Ida e Volta") {
      y += 10;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text("Trecho: VOLTA", margin, y);
      y += 18;

      write("Data", flight.voltaData ? flight.voltaData.split("-").reverse().join("/") : "-");

         let escalasVoltaTexto = "Voo direto";

    if (Number(flight.voltaEscalas) === 1) {
  escalasVoltaTexto = formatarEscala(
    flight.voltaEscala1Cidade,
    flight.voltaEscala1Chegada,
    flight.voltaEscala1Partida
     );
    }

    if (Number(flight.voltaEscalas) === 2) {
  escalasVoltaTexto =
    formatarEscala(
      flight.voltaEscala1Cidade,
      flight.voltaEscala1Chegada,
      flight.voltaEscala1Partida
    ) +
    "  e  " +
    formatarEscala(
      flight.voltaEscala2Cidade,
      flight.voltaEscala2Chegada,
      flight.voltaEscala2Partida
    );
    }

     
      write("Horário do embarque", flight.voltaEmbarqueHora);
      write("Horário da chegada", flight.voltaChegadaHora);
      write("Aeroporto de origem", flight.voltaAeroporto?.toUpperCase());
      write("Escalas", escalasVoltaTexto);
      write("Aeroporto de destino", flight.voltaChegadaAeroporto?.toUpperCase());
      write("Taxa de embarque (R$)", Number(taxaVolta || 0).toFixed(2));
      write("Bagagens", `${flight.bagagemQuantidadeVolta} x R$ ${Number(flight.bagagemPrecoVolta || 0).toFixed(2)}`);
      write("Preço da passagem (R$)", valorMilhasVolta.toFixed(2));
      write("Total (R$)", totalVolta.toFixed(2));
    }

    //  Total geral
    y += 20;
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text(`TOTAL GERAL: R$ ${totalGeral.toFixed(2)}`, pageWidth / 2, y, { align: "center" });

    y += 20;

  doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("Atenção: Nenhuma emissão foi efetuada até o momento. Este documento é apenas um orçamento.", pageWidth / 2, y, {
      align: "center",
    });

    //  Observações
    y += 15;
    doc.setFontSize(9);
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

  // Junta os itens com separador visual
  const textoFinal = agenciaInfo.join("  |  ");

  const textWidth = doc.getTextWidth(textoFinal);
  const x = (pageWidth - textWidth) / 2;

  doc.text(textoFinal, x, y);

  y += 10;
}



    doc.save(`informacoes.orcamento_${serialFormatted}.pdf`);

    // **Salvar histórico**
    const historico = JSON.parse(localStorage.getItem("historicoCotacoes")) || [];

    const registro = {
      id: serialFormatted,
      data: new Date().toLocaleString("pt-BR"),
      classificacao: flight.classificacao,
      tipo: flight.tipoviagem,
      passageiros: totalPaxEx,
      total: Number(totalGeral.toFixed(2)),
      flightData: flight
    };

    historico.unshift(registro); // mais recente primeiro
    localStorage.setItem("historicoCotacoes", JSON.stringify(historico));

  } catch (err) {
    console.error("Erro ao gerar PDF:", err);
  }
};

  


  return (


    <div className="max-w-4xl mx-auto space-y-8">
        
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

      {/* Passageiros e Trecho */}

          <div>
      <h1 className="text-4xl font-extrabold text-center mb-10">Orçamento de Viagem</h1>
    </div>

    <div className="p-6 rounded-xl shadow-md space-y-6">
 
    
  <h2 className="text-2xl font-extrabold text-center">
     Informações gerais
  </h2>


  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-lg">

    <label className="flex flex-col text-lg font-semibold">
      Classificação:
      <select
        name="classificacao"
        value={flight.classificacao}
        onChange={handleChange}
        className="mt-1 p-2 rounded border text-center"
      >
        <option className="bg-gray-400 text-gray-900 font-semibold" value="Nacional">Nacional</option>
        <option className="bg-gray-400 text-gray-900 font-semibold" value="Internacional">Internacional</option>
      </select>
    </label>

    <label className="flex flex-col text-lg font-semibold">
      Tipo de viagem:
      <select
        name="tipoviagem"
        value={flight.tipoviagem}
        onChange={handleChange}
        className="mt-1 p-2 rounded border text-center"
      >
        <option className="bg-gray-400 text-gray-900 font-semibold" value="Ida">Somente ida</option>
        <option className="bg-gray-400 text-gray-900 font-semibold" value="Ida e Volta">Ida e volta</option>
      </select>
    </label>

  </div>

  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-lg">

    <label className="flex flex-col text-lg font-semibold">
      Adultos:
      <select
        name="adultos"
        value={flight.adultos}
        onChange={handleChange}
        className="mt-1 p-2 rounded border text-center"
      >
        {Array.from({ length: 10 }, (_, i) => i).map((n) => (
          <option className="bg-gray-400 text-gray-900 font-semibold" key={n} value={n}>
            {n}
          </option>
        ))}
      </select>
    </label>

    <label className="flex flex-col text-lg font-semibold">
      Crianças (2-11):
      <select
        name="criancas"
        value={flight.criancas}
        onChange={handleChange}
        className="mt-1 p-2 rounded border text-center"
      >
        {Array.from({ length: 10 }, (_, i) => i).map((n) => (
          <option className="bg-gray-400 text-gray-900 font-semibold" key={n} value={n}>
            {n}
          </option>
        ))}
      </select>
    </label>

    <label className="flex flex-col text-lg font-semibold">
      Bebês (0-2):
      <select
        name="bebes"
        value={flight.bebes}
        onChange={handleChange}
        className="mt-1 p-2 rounded border text-center"
      >
        {Array.from({ length: 4 }, (_, i) => i).map((n) => (
          <option className="bg-gray-400 text-gray-900 font-semibold" key={n} value={n}>
            {n}
          </option>
        ))}
      </select>
    </label>

  </div>

  {/* TOTAL DE PASSAGEIROS */}
  <div className="p-4 rounded-lg flex flex-col items-center">
    <span className="text-lg font-semibold">
      Total de passageiros:
    </span>

    <span className="text-3xl font-extrabold">
      {totalPaxEx}
    </span>
  </div>

</div>


      {/* Ida */}

       <div className="p-6 rounded-xl shadow-md space-y-6">

  <h2 className="text-2xl font-extrabold text-center">
     Dados do voo – Ida
  </h2>

  {/* ESCALAS */}
  <div className="p-4 rounded-lg space-y-4">
  <label className="flex flex-col text-lg font-bold">
    Escalas
    <select
      name="idaEscalas"
      value={flight.idaEscalas}
      onChange={handleChange}
      className="mt-2 p-2 rounded border text-center"
    >
      <option  className="bg-gray-400 text-gray-900 font-semibold text-lg" value={0}>Voo direto</option>
      <option  className="bg-gray-400 text-gray-900 font-semibold text-lg" value={1}>1 escala</option>
      <option   className="bg-gray-400 text-gray-900 font-semibold text-lg" value={2}>2 escalas</option>
    </select>
  </label>
</div>
  

  {Number(flight.idaEscalas) >= 1 && (
  <div className="p-4 rounded-lg border">
    <h3 className="text-lg font-bold mb-3">Escala 1</h3>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <label className="flex flex-col font-semibold">
        Cidade
        <input
          type="text"
          name="idaEscala1Cidade"
          value={flight.idaEscala1Cidade}
          onChange={handleChange}
          placeholder="Ex: São Paulo"
          className="mt-1 p-2 rounded border text-center uppercase"
        />
      </label>

      <label className="flex flex-col font-semibold">
        Chegada
        <input
          type="time"
          name="idaEscala1Chegada"
          value={flight.idaEscala1Chegada}
          onChange={handleChange} 
          className="mt-1 p-2 rounded border text-center"
        />
      </label>

      <label className="flex flex-col font-semibold">
        Partida
        <input
          type="time"
          name="idaEscala1Partida"
          value={flight.idaEscala1Partida}
          onChange={handleChange}
          className="mt-1 p-2 rounded border text-center"
        />
      </label>
     </div>
    </div>
    )}


     {Number(flight.idaEscalas) === 2 && (
    <div className="p-4 rounded-lg border">
    <h3 className="text-lg font-bold mb-3">Escala 2</h3>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <label className="flex flex-col font-semibold">
        Cidade
        <input
          type="text"
          name="idaEscala2Cidade"
          value={flight.idaEscala2Cidade}
          onChange={handleChange}
          placeholder="Ex: Recife"
          className="mt-1 p-2 rounded border text-center uppercase"
        />
      </label>

      <label className="flex flex-col font-semibold">
        Chegada
        <input
          type="time"
          name="idaEscala2Chegada"
          value={flight.idaEscala2Chegada}
          onChange={handleChange}
          className="mt-1 p-2 rounded border text-center"
        />
      </label>

      <label className="flex flex-col font-semibold">
        Partida
        <input
          type="time"
          name="idaEscala2Partida"
          value={flight.idaEscala2Partida}
          onChange={handleChange}
          className="mt-1 p-2 rounded border text-center"
        />
      </label>
     </div>
    </div>
   )}




  {/* HORÁRIOS */}
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-lg">
    <label className="flex flex-col text-lg font-bold">
      Data:
      <input
        type="date"
        name="idaData"
        value={flight.idaData}
        onChange={handleChange}
        className="mt-1 p-2 rounded border text-center"
      />
    </label>

    <label className="flex flex-col text-lg font-bold">
      Horário embarque:
      <input
        type="time"
        name="idaEmbarqueHora"
        value={flight.idaEmbarqueHora}
        onChange={handleChange}
        className="mt-1 p-2 rounded border text-center"
      />
    </label>

    <label className="flex flex-col text-lg font-bold">
      Horário chegada:
      <input
        type="time"
        name="idaChegadaHora"
        value={flight.idaChegadaHora}
        onChange={handleChange}
        className="mt-1 p-2 rounded border text-center"
      />
    </label>
  </div>

  {/* AEROPORTOS */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-lg">
    <label className="flex flex-col text-lg font-bold">
      Aeroporto origem:
      <input
        type="text"
        maxLength={3}
        name="idaAeroporto"
        value={flight.idaAeroporto}
        onChange={handleChange}
        placeholder="Ex: GRU"
        className="mt-1 p-2 rounded text-center border uppercase"
      />
    </label>

    <label className="flex flex-col text-lg font-bold">
      Aeroporto destino:
      <input
        type="text"
        maxLength={3}
        name="idaChegadaAeroporto"
        value={flight.idaChegadaAeroporto}
        onChange={handleChange}
        placeholder="Ex: CGH"
        className="mt-1 p-2 rounded text-center border uppercase"
      />
    </label>
  </div>

  {/* TAXA */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-lg items-center">

     <label className="flex flex-col text-lg font-bold">
      Taxa de embarque (manual):
      <input
        type="number"
        name="idaTaxaManual"
        value={flight.idaTaxaManual}
        onChange={handleChange}
        className="mt-1 p-2 rounded text-center border"
      />
    </label>

    <div className="text-lg font-bold text-center">
      Taxa de embarque (automática):
      <div className="text-2xl font-extrabold">
        R$ {getAirportTax(flight.idaAeroporto, "", flight.classificacao).toFixed(2)}
      </div>
    </div>
  </div>

  {/* BAGAGENS */}
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-lg">

    <label className="flex flex-col text-lg font-bold">
      Quantidade de bagagens:
      <select
        name="bagagemQuantidadeIda"
        value={flight.bagagemQuantidadeIda}
        onChange={handleChange}
        className="mt-1 p-2 rounded border text-center"
      >
        {Array.from({ length: 11 }, (_, i) => i).map((n) => (
          <option className="bg-gray-400 text-gray-900 font-semibold text-lg" key={n} value={n}>
            {n}
          </option>
        ))}
      </select>
    </label>

    <label className="flex flex-col text-lg font-bold">
      Valor unitário:
      <input
        type="number"
        name="bagagemPrecoIda"
        value={flight.bagagemPrecoIda}
        onChange={handleChange}
        placeholder="Ex: 100,00"
        className="mt-1 p-2 rounded border text-center"
      />
    </label>

    <div className="flex flex-col justify-center items-center text-lg font-bold">
      Total bagagens:
      <span className="text-2xl font-extrabold">
        R$ {totalBagagemIda.toFixed(2)}
      </span>
    </div>

  </div>



      {/* Programa / Milhas - IDA */}
     

  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-lg">

    <label className="flex flex-col text-lg font-bold">
      Programa:
      <select
        name="programaIda"
        value={flight.programaIda}
        onChange={handleChange}
        className="mt-1 p-2 rounded border text-center"
      >
        {[
          "Latam",
          "Smiles",
          "Azul",
          "Iberia",
          "American Airlines",
          "British",
          "Qatar",
        ].map((p) => (
          <option  className="bg-gray-400 text-gray-900 font-semibold text-lg" key={p} value={p}>
            {p}
          </option>
        ))}
      </select>
    </label>

    <label className="flex flex-col text-lg font-bold">
      Milhas por passageiro:
      <input
        type="number"
        step="1"
        name="milhasPorPassageiroIda"
        value={flight.milhasPorPassageiroIda}
        onChange={handleChange}
        placeholder="Ex: 200,00"
        className="mt-1 p-2 rounded border text-center"
      />
    </label>

    <label className="flex flex-col text-lg font-bold">
      Preço do milheiro:
      <input
        type="number"
        step="0.01"
        name="precoMilheiroIda"
        value={flight.precoMilheiroIda}
        onChange={handleChange}
        placeholder="Ex: 30,00"
        className="mt-1 p-2 rounded border text-center"
      />
    </label>


  </div>

  {/* TOTAL EM DESTAQUE */}
  <div className="p-4 rounded-lg flex flex-col items-center justify-center">
    <span className="text-lg font-bold">Total do trecho:</span>

    <span className="sm:text-3xl text-2xl font-extrabold">
      R$ {totalIda.toFixed(2)}
    </span>
  </div>

</div>


         
        
       {/* Volta */}
       
   {flight.tipoviagem === "Ida e Volta" && (

   <div className="p-6 rounded-xl shadow-md space-y-6">

   <h2 className="text-2xl font-extrabold text-center">
     Dados do voo – Volta
   </h2>

   {/* ESCALAS */}
  
             <div className="p-4 rounded-lg space-y-4">
  <label className="flex flex-col text-lg font-bold">
    Escalas
    <select
      name="voltaEscalas"
      value={flight.voltaEscalas}
      onChange={handleChange}
      className="mt-2 p-2 rounded border text-center"
    >
      <option  className="bg-gray-400 text-gray-900 font-semibold text-lg" value={0}>Voo direto</option>
      <option  className="bg-gray-400 text-gray-900 font-semibold text-lg" value={1}>1 escala</option>
      <option   className="bg-gray-400 text-gray-900 font-semibold text-lg" value={2}>2 escalas</option>
    </select>
  </label>
</div>
  

  {Number(flight.voltaEscalas) >= 1 && (
  <div className="p-4 rounded-lg border">
    <h3 className="text-lg font-bold mb-3">Escala 1</h3>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <label className="flex flex-col font-semibold">
        Cidade
        <input
          type="text"
          name="voltaEscala1Cidade"
          value={flight.voltaEscala1Cidade}
          onChange={handleChange}
          placeholder="Ex: São Paulo"
          className="mt-1 p-2 rounded border text-center uppercase"
        />
      </label>

      <label className="flex flex-col font-semibold">
        Chegada
        <input
          type="time"
          name="voltaEscala1Chegada"
          value={flight.voltaEscala1Chegada}
          onChange={handleChange}
          className="mt-1 p-2 rounded border text-center"
        />
      </label>

      <label className="flex flex-col font-semibold">
        Partida
        <input
          type="time"
          name="voltaEscala1Partida"
          value={flight.voltaEscala1Partida}
          onChange={handleChange}
          className="mt-1 p-2 rounded border text-center"
        />
      </label>
     </div>
    </div>
   )}


   {Number(flight.voltaEscalas) === 2 && (
  <div className="p-4 rounded-lg border">
    <h3 className="text-lg font-bold mb-3">Escala 2</h3>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <label className="flex flex-col font-semibold">
        Cidade
        <input
          type="text"
          name="voltaEscala2Cidade"
          value={flight.voltaEscala2Cidade}
          onChange={handleChange}
          placeholder="Ex: Recife"
          className="mt-1 p-2 rounded border text-center uppercase"
        />
      </label>

      <label className="flex flex-col font-semibold">
        Chegada
        <input
          type="time"
          name="voltaEscala2Chegada"
          value={flight.voltaEscala2Chegada}
          onChange={handleChange}
          className="mt-1 p-2 rounded border text-center"
        />
      </label>

      <label className="flex flex-col font-semibold">
        Partida
        <input
          type="time"
          name="voltaEscala2Partida"
          value={flight.voltaEscala2Partida}
          onChange={handleChange}
          className="mt-1 p-2 rounded border text-center"
        />
      </label>
     </div>
    </div>
   )}




  {/* HORÁRIOS */}
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-lg">
    <label className="flex flex-col text-lg font-bold">
      Data:
      <input
        type="date"
        name="voltaData"
        value={flight.voltaData}
        onChange={handleChange}
        className="mt-1 p-2 rounded border text-center"
      />
    </label>

    <label className="flex flex-col text-lg font-bold">
      Horário embarque:
      <input
        type="time"
        name="voltaEmbarqueHora"
        value={flight.voltaEmbarqueHora}
        onChange={handleChange}
        className="mt-1 p-2 rounded border text-center"
      />
    </label>

    <label className="flex flex-col text-lg font-bold">
      Horário chegada:
      <input
        type="time"
        name="voltaChegadaHora"
        value={flight.voltaChegadaHora}
        onChange={handleChange}
        className="mt-1 p-2 rounded border text-center"
      />
    </label>
  </div>

  {/* AEROPORTOS */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-lg">
    <label className="flex flex-col text-lg font-bold">
      Aeroporto origem:
      <input
        type="text"
        maxLength={3}
        name="voltaAeroporto"
        value={flight.voltaAeroporto}
        onChange={handleChange}
        placeholder="Ex: GRU"
        className="mt-1 p-2 rounded text-center border uppercase"
      />
    </label>

    <label className="flex flex-col text-lg font-bold">
      Aeroporto destino:
      <input
        type="text"
        maxLength={3}
        name="voltaChegadaAeroporto"
        value={flight.voltaChegadaAeroporto}
        onChange={handleChange}
        placeholder="Ex: CGH"
        className="mt-1 p-2 rounded text-center border uppercase"
      />
    </label>
  </div>

  {/* TAXA */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-lg items-center">

         <label className="flex flex-col text-lg font-bold">
      Taxa de embarque (manual):
      <input
        type="number"
        name="voltaTaxaManual"
        value={flight.voltaTaxaManual}
        onChange={handleChange}
        className="mt-1 p-2 rounded text-center border"
      />
    </label>

    <div className="text-lg font-bold text-center">
      Taxa de embarque (automática):
      <div className="text-2xl font-extrabold">
        R$ {getAirportTax(flight.voltaAeroporto, "", flight.classificacao).toFixed(2)}
      </div>
    </div>
  </div>

  {/* BAGAGENS */}
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-lg">

    <label className="flex flex-col text-lg font-bold">
      Quantidade de bagagens:
      <select
        name="bagagemQuantidadeVolta"
        value={flight.bagagemQuantidadeVolta}
        onChange={handleChange}
        className="mt-1 p-2 rounded border text-center"
      >
        {Array.from({ length: 11 }, (_, i) => i).map((n) => (
          <option className="bg-gray-400 text-gray-900 font-semibold" key={n} value={n}>
            {n}
          </option>
        ))}
      </select>
    </label>

    <label className="flex flex-col text-lg font-bold">
      Valor unitário:
      <input
        type="number"
        name="bagagemPrecoVolta"
        value={flight.bagagemPrecoVolta}
        onChange={handleChange}
        placeholder="Ex: 100,00"
        className="mt-1 p-2 rounded border text-center"
      />
    </label>

    <div className="flex flex-col justify-center items-center text-lg font-bold">
      Total bagagens:
      <span className="text-2xl font-extrabold">
        R$ {totalBagagemVolta.toFixed(2)}
      </span>
    </div>

  </div>

  {/* Programa / Milhas - VOLTA */}
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-lg">

    <label className="flex flex-col text-lg font-bold">
      Programa:
      <select
        name="programaVolta"
        value={flight.programaVolta}
        onChange={handleChange}
        className="mt-1 p-2 rounded border text-center"
      >
        {[
          "Latam",
          "Smiles",
          "Azul",
          "Iberia",
          "American Airlines",
          "British",
          "Qatar",
        ].map((p) => (
          <option  className="bg-gray-400 text-gray-900 font-semibold" key={p} value={p}>
            {p}
          </option>
        ))}
      </select>
    </label>

    <label className="flex flex-col text-lg font-bold">
      Milhas por passageiro:
      <input
        type="number"
        step="1"
        name="milhasPorPassageiroVolta"
        value={flight.milhasPorPassageiroVolta}
        onChange={handleChange}
        placeholder="Ex: 200,00"
        className="mt-1 p-2 rounded border text-center"
      />
    </label>

    <label className="flex flex-col text-lg font-bold">
      Preço do milheiro:
      <input
        type="number"
        step="0.01"
        name="precoMilheiroVolta"
        value={flight.precoMilheiroVolta}
        onChange={handleChange}
        placeholder="Ex: 30,00"
        className="mt-1 p-2 rounded border text-center"
      />
    </label>

  </div>

  {/* TOTAL EM DESTAQUE */}
  <div className="p-4 rounded-lg flex flex-col items-center justify-center">
    <span className="text-lg font-bold">Total do trecho:</span>

    <span className="sm:text-3xl text-2xl font-extrabold">
      R$ {totalVolta.toFixed(2)}
    </span>
  </div>

  </div>

  )}

      <div className="flex flex-col justify-end m-7">

         <h1 className="text-xl font-bold">Valor total:</h1>

        <h1 className="text-4xl font-extrabold">
         R$ {totalGeral.toFixed(2)}
        </h1>

      </div>

      <div className="pt-2">
        <Button className="p-7 m-7" onClick={gerarPDF}>
          <p className="font-extrabold text-xl">Gerar PDF</p>
        </Button>
      </div>
    </div>
  );
}
