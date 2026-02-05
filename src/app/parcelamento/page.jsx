"use client";

import { useEffect, useState } from "react";
import jsPDF from "jspdf";
import { Button } from "../components/ui/button.jsx";
import logo from "../../../public/logo.png";


  export default function ParcelamentoPage() {
  // Taxas tabela
  const taxas = [
    { p: 1, link: 4.39, maquina: 3.26 },
    { p: 2, link: 6.49, maquina: 5.70 },
    { p: 3, link: 7.54, maquina: 6.52 },
    { p: 4, link: 8.60, maquina: 7.36 },
    { p: 5, link: 9.66, maquina: 8.20 },
    { p: 6, link: 10.71, maquina: 9.03 },
    { p: 7, link: 14.40, maquina: 9.88 },
    { p: 8, link: 15.50, maquina: 10.73 },
    { p: 9, link: 16.62, maquina: 11.59 },
    { p: 10, link: 17.74, maquina: 12.44 },
    { p: 11, link: 18.87, maquina: 13.30 },
    { p: 12, link: 20.00, maquina: 14.16 },
  ];

  const [metodo, setMetodo] = useState("link");
  const [parcelas, setParcelas] = useState(1);
  const [flight, setFlight] = useState(null);
  const [total, setTotal] = useState(0);

  const [nomeAgencia, setNomeAgencia] = useState("");
  const [telefoneAgencia, setTelefoneAgencia] = useState("");
  const [redesAgencia, setRedesAgencia] = useState("");
  const [userLogo, setUserLogo] = useState(null);
  const [cnpj, setCnpj] = useState("");
  const [cadastur, setCadastur] = useState("");
  const [pdfFields, setPdfFields] = useState({});



  // Carrega flightData e valorTotal ao abrir

  useEffect(() => {
  const savedFlight = localStorage.getItem("flightData");
  const savedTotal = localStorage.getItem("valorTotal");

  if (savedFlight) {
    try {
      setFlight(JSON.parse(savedFlight));
    } catch (err) {
      console.warn("Erro parse flightData", err);
    }
  }

  if (savedTotal) {
    setTotal(parseFloat(savedTotal));
  }

  // CARREGAR CAMPOS DA AGÊNCIA
  setNomeAgencia(localStorage.getItem("agencia_nome") || "");
  setTelefoneAgencia(localStorage.getItem("agencia_telefone") || "");
  setRedesAgencia(localStorage.getItem("agencia_redes") || "");
  setUserLogo(localStorage.getItem("agencia_logo") || null);
  setCnpj(localStorage.getItem("agencia_cnpj") || "");
  setCadastur(localStorage.getItem("agencia_cadastur") || "");

  // CHECKBOXES (perfil)
  const savedFields = localStorage.getItem("agencia_pdf_fields");
  if (savedFields) {
    setPdfFields(JSON.parse(savedFields));
  }
}, []);


    // calcula percentuais a partir das taxas
  const taxaSelecionada = taxas.find((t) => t.p === parcelas);
  const percentual = taxaSelecionada ? taxaSelecionada[metodo] : 0;
  const valorComTaxa = total + (total * percentual) / 100;
  const valorParcela = parcelas > 0 ? valorComTaxa / parcelas : valorComTaxa;

    // Helpers
  const toBase64 = async (path) => {
    const url = path || "/logo.png";
    const res = await fetch(url);
    const blob = await res.blob();
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  };




  // função que calcula valores detalhados novamente (garante consistência)
  const computeDetails = (f) => {
    if (!f) return null;
    const totalPax = Number(f.adultos || 0) + Number(f.criancas || 0);

    // bagagens
    const totalBagagemIda = Number(f.bagagemQuantidadeIda || 0) * Number(f.bagagemPrecoIda || 0);
    const totalBagagemVolta = Number(f.bagagemQuantidadeVolta || 0) * Number(f.bagagemPrecoVolta || 0);

    // airportRates same as on IdaVoltaPage (kept small reproduce)
    const airportRates = [
    
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

    ];

    const getAirportTax = (airportCode, manualValue, classificacao) => {
      if (manualValue !== "" && manualValue !== null && typeof manualValue !== "undefined")
        return parseFloat(manualValue) || 0;
      const rate = airportRates.find((r) => r.code === (airportCode || "").toUpperCase());
      if (!rate) return 0;
      return classificacao === "Nacional" ? rate.nacional : rate.internacional;
    };

    const taxaIda = getAirportTax(f.idaAeroporto, f.idaTaxaManual, f.classificacao);
    const taxaVolta = f.tipoviagem === "Ida e Volta" ? getAirportTax(f.voltaAeroporto, f.voltaTaxaManual, f.classificacao) : 0;

    const valorMilhasIda = (Number(f.milhasPorPassageiroIda || 0)) * Number(f.precoMilheiroIda || 0) * totalPax;
    const valorMilhasVolta = f.tipoviagem === "Ida e Volta" ? (Number(f.milhasPorPassageiroVolta || 0)) * Number(f.precoMilheiroVolta || 0) * totalPax : 0;

    const totalIda = valorMilhasIda + Number(taxaIda || 0) + Number(totalBagagemIda || 0);
    const totalVolta = f.tipoviagem === "Ida e Volta" ? valorMilhasVolta + Number(taxaVolta || 0) + Number(totalBagagemVolta || 0) : 0;
    const totalGeral = totalIda + totalVolta;

    return {
      totalPax,
      totalBagagemIda,
      totalBagagemVolta,
      taxaIda,
      taxaVolta,
      valorMilhasIda,
      valorMilhasVolta,
      totalIda,
      totalVolta,
      totalGeral,
    };
  };

const gerarPDF = async () => {
  try {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 26;
    let y = margin;

    const formatarEscala = (cidade, chegada, partida) => {
      if (!cidade) return "-";

     let texto = cidade.toUpperCase();

    if (chegada) texto += ` - das ${chegada}`;
    if (partida) texto += ` às ${partida}`;

    return texto;

   };


    // Utilitários
    const up = (txt) => (txt ? String(txt).toUpperCase() : "-");
    const money = (n) => `R$ ${(Number(n) || 0).toFixed(2)}`;
    const toBRDate = (d) => (d ? d.split("-").reverse().join("/") : "-");

    const details = computeDetails(flight);

    // =====================
    // LOGO
    // =====================
     let logoBase64 = null;

     if (pdfFields.logo) {
     const candidate = userLogo || (logo && (logo.src || logo)) || "";
     logoBase64 = await toBase64(candidate);
     }

    if (logoBase64) {
      const w = 70, h = 60;
      doc.addImage(logoBase64, "PNG", (pageWidth - w) / 2, y, w, h);
      y += h + 10;
    }

    // =====================
    // SERIAL
    // =====================
    const year = new Date().getFullYear();
    const key = `serie_pdf_${year}`;
    const stored = Number(localStorage.getItem(key)) || 999;
    const serial = stored + 1;
    localStorage.setItem(key, serial);
    const serialFormatted = `${String(serial).padStart(4, "0")}/${year}`;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text(serialFormatted, pageWidth - margin, y, { align: "right" });

    const sw = doc.getTextWidth(serialFormatted);
    doc.setFont("helvetica", "normal");
    doc.text("Número de série:", pageWidth - margin - sw - 6, y, {
      align: "right",
    });

    y += 10;

    // =====================
    // CONFIG PADRÃO
    // =====================
    const FONT = "helvetica";
    const LABEL_WIDTH = 170;
    const LINE_GAP = 15;
    const SECTION_GAP = 15;

    const separator = () => {
      doc.setDrawColor(185);
      doc.setLineWidth(0.4);
      doc.line(margin, y, pageWidth - margin, y);
    };

    const title = (text) => {
      y += SECTION_GAP;
      doc.setFont(FONT, "bold");
      doc.setFontSize(10);
      doc.text(text, margin, y);
      y += 10;
      separator();
      y += 10;
    };

    const writeLine = (label, value) => {
      doc.setFontSize(9);
      doc.setFont(FONT, "normal");
      doc.text(`${label}:`, margin, y);

      doc.setFont(FONT, "bold");
      doc.text(`${value}`, margin + LABEL_WIDTH, y);

      y += LINE_GAP;
    };

    // =====================
    // TÍTULO PRINCIPAL
    // =====================
    y += 10;

    doc.setFont(FONT, "bold");
    doc.setFontSize(13);
    doc.text("Orçamento e Informações da Viagem", pageWidth / 2, y, {
      align: "center",
    });

    y += SECTION_GAP;

    // =====================
    // INFO GERAIS
    // =====================
    title("Informações gerais do Voo");

    y += 5

    writeLine("Classificação", up(flight.classificacao));
    writeLine("Tipo de viagem", flight.tipoviagem);
    writeLine("Adultos", flight.adultos);
    writeLine("Crianças", flight.criancas);
    writeLine("Bebês", flight.bebes);

    // =====================
    // TRECHO: IDA
    // =====================

    title("Trecho: IDA");

     y += 5

    writeLine("Data", toBRDate(flight.idaData));

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

    
    writeLine("Horário do embarque", flight.idaEmbarqueHora);
    writeLine("Horário da chegada", flight.idaChegadaHora);
    writeLine("Aeroporto de origem", up(flight.idaAeroporto));
    writeLine("Escalas", escalasIdaTexto);
    writeLine("Aeroporto de destino", up(flight.idaChegadaAeroporto));
    writeLine("Taxa de embarque (R$)", money(details.taxaIda));
    writeLine(
      "Bagagens",
      `${flight.bagagemQuantidadeIda} x ${money(flight.bagagemPrecoIda)}`
    );

    // =====================
    // TRECHO: VOLTA (SE EXISTIR)
    // =====================
    if (flight.tipoviagem === "Ida e Volta") {

      title("Trecho: VOLTA");

      y += 5

      writeLine("Data", toBRDate(flight.voltaData));

     
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

      
      writeLine("Horário do embarque", flight.voltaEmbarqueHora);
      writeLine("Horário da chegada", flight.voltaChegadaHora);
      writeLine("Aeroporto de origem", up(flight.voltaAeroporto));
      writeLine("Escalas", escalasVoltaTexto);
      writeLine("Aeroporto de destino", up(flight.voltaChegadaAeroporto));
      writeLine("Taxa de embarque (R$)", money(details.taxaVolta));
      writeLine(
        "Bagagens",
        `${flight.bagagemQuantidadeVolta} x ${money(
          flight.bagagemPrecoVolta
        )}`
      );
    }

    // =====================
    // RESUMO
    // =====================
    title("Resumo financeiro");

    y += 5

    writeLine("Valor Total (R$)", money(valorComTaxa));
    writeLine("Parcelas", `${parcelas}x`);
    writeLine("Valor por Parcela (R$)", money(valorParcela));

    // =====================
    // OBS
    // =====================

    y += 45

  doc.setFont(FONT, "bold");
    doc.setFontSize(10);
    doc.text("Atenção: Nenhuma emissão foi efetuada até o momento. Este documento é apenas um orçamento.", pageWidth / 2, y, {
      align: "center",
    });

     y += 30;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const obs = "Aviso importante sobre preços dinâmicos: Os valores apresentados neste orçamento estão sujeitos à variação de acordo com disponibilidade, demanda, políticas das companhias aéreas e hotéis, além de possíveis alterações cambiais. Como se tratam de preços dinâmicos, o valor final somente será confirmado no momento da emissão da passagem aérea ou da reserva da hospedagem. Recomenda-se confirmar a compra o quanto antes para garantir as tarifas informadas.";
    const obsLines = doc.splitTextToSize(obs, pageWidth - margin * 2);
    doc.text(obsLines, margin, y);

     y += 70;

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

  y += LINE_GAP;
}

    // =====================
    // SALVAR
    // =====================
    const fileName = `informacoes.orcamento_${serialFormatted}.pdf`;
    doc.save(fileName);

      // **Salvar histórico**
    const historico = JSON.parse(localStorage.getItem("historicoCotacoes")) || [];

    const registro = {
  id: serialFormatted,
  data: new Date().toLocaleString("pt-BR"),
  classificacao: flight.classificacao,
  tipo: flight.tipoviagem,
  passageiros: details?.totalPax || 
    Number(flight.adultos || 0) +
    Number(flight.criancas || 0) +
    Number(flight.bebes || 0),
  total: Number(valorComTaxa || 0),
  flightData: flight
 };


    historico.unshift(registro); 
    localStorage.setItem("historicoCotacoes", JSON.stringify(historico));

  } catch (err) {
    console.error("Erro ao gerar PDF:", err);
  }
};


  return (
   <div className="p-10 w-full mx-auto rounded-xl space-y-5">
  <h2 className="text-4xl font-extrabold text-center mb-15">Parcelamento</h2>

  <div className="p-6 w-full mx-auto space-y-8 rounded-xl shadow-lg">

    <div>
      <p className="text-xl font-semibold">Valor total da cotação:</p>
      <strong className="font-extrabold text-3xl mt-2 block">
        R$ {total.toFixed(2)}
      </strong>
    </div>

    <div className="space-y-4 mt-10">
      <label className="text-xl font-semibold block">
        Método de pagamento:
      </label>

      <select
        className="p-2 text-2xl font-extrabold rounded"
        value={metodo}
        onChange={(e) => setMetodo(e.target.value)}
      >
        <option className="bg-gray-400 text-gray-900 text-lg font-bold" value="link">
          Link
        </option>
        <option className="bg-gray-400 text-gray-900 text-lg font-bold" value="maquina">
          Maquininha
        </option>
      </select>
    </div>

    <div className="space-y-4 mt-10">
      <label className="text-xl font-semibold block">
        Parcelas:
      </label>

      <select
        className="p-2 text-2xl font-extrabold rounded"
        value={parcelas}
        onChange={(e) => setParcelas(Number(e.target.value))}
      >
        {taxas.map((t) => (
          <option
            className="bg-gray-400 text-gray-900 text-lg font-bold"
            key={t.p}
            value={t.p}
          >
            {t.p}x
          </option>
        ))}
      </select>
    </div>

    <div className="border p-4 rounded space-y-8">
      <div>
        <p className="text-xl font-semibold">Taxa:</p>
        <strong className="text-2xl font-extrabold block mt-1">
          {percentual}%
        </strong>
      </div>

      <div>
        <p className="text-xl font-semibold">Total com taxa:</p>
        <strong className="text-2xl font-extrabold block mt-1">
          R$ {valorComTaxa.toFixed(2)}
        </strong>
      </div>

      <div>
        <p className="text-xl font-semibold">Parcela escolhida:</p>
        <strong className="text-2xl font-extrabold block mt-1">
          R$ {valorParcela.toFixed(2)}
        </strong>
      </div>
    </div>

  </div>

  <Button className="mt-10 p-7" onClick={gerarPDF}>
    <p className="font-extrabold text-xl">Gerar PDF</p>
  </Button>
  </div>

  );
}
