 "use client";

  // Importações
  import { useEffect, useState } from "react";
  import jsPDF from "jspdf";
  import { Button } from "../components/ui/button.jsx";
  import logo from "../../../public/logo.png";
  import { useRouter } from "next/navigation";


  export default function ParcelamentoPage() {

  const router = useRouter();

  // Use States
  const [bancos, setBancos] = useState([]);
  const [bancoSelecionado, setBancoSelecionado] = useState("");
  const [taxas, setTaxas] = useState([]);
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


  // Carregar dados iniciais
  useEffect(() => {

  const savedFlight = localStorage.getItem("flightData");
  const savedTotal = localStorage.getItem("valorTotal");
  const savedTaxas = localStorage.getItem("parcelamentoTaxas");

  if (savedFlight) {
    try {
      setFlight(JSON.parse(savedFlight));
    } catch (err) {
      console.warn("Erro ao alcançar flightData", err);
    }
  }

  if (savedTotal) {
    setTotal(parseFloat(savedTotal));
  }

  // Carregar bancos e taxas
  if (savedTaxas) {

    const bancosData = JSON.parse(savedTaxas);

    setBancos(bancosData);
  if (savedTaxas) {
  const bancosData = JSON.parse(savedTaxas);
  setBancos(bancosData);

  // Começa sem banco selecionado
  setBancoSelecionado("");
  setTaxas([]);
  }

  }

  // Dados da agência
  setNomeAgencia(localStorage.getItem("agencia_nome") || "");
  setTelefoneAgencia(localStorage.getItem("agencia_telefone") || "");
  setRedesAgencia(localStorage.getItem("agencia_redes") || "");
  setUserLogo(localStorage.getItem("agencia_logo") || null);
  setCnpj(localStorage.getItem("agencia_cnpj") || "");
  setCadastur(localStorage.getItem("agencia_cadastur") || "");

  const savedFields = localStorage.getItem("agencia_pdf_fields");

  if (savedFields) {
    setPdfFields(JSON.parse(savedFields));
  }

  }, []);

  useEffect(() => {

  if (!bancoSelecionado) {
    setTaxas([]);
    return;
  }

  const bancoAtual = bancos.find(
    (b) => b.banco === bancoSelecionado
  );

  if (bancoAtual) {
    setTaxas(bancoAtual.taxas);
  }

}, [bancoSelecionado, bancos]);


  // Calcula percentuais a partir das taxas
  const taxaSelecionada = taxas.find((t) => Number(t.parcelas) === parcelas);

   let percentual = null;

   if (
   taxaSelecionada &&
   taxaSelecionada[metodo] !== undefined &&
   taxaSelecionada[metodo] !== "" &&
   Number(taxaSelecionada[metodo]) > 0
   ) {
  percentual = Number(taxaSelecionada[metodo]);
   }

  const taxaNaoExiste = percentual === null;
  const valorComTaxa = total / (1 - percentual / 100);
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


  // Função que calcula valores detalhados novamente (garante consistência)
    const computeDetails = (f) => {
    if (!f) return null;

  const totalPax = Number(f.adultos || 0) + Number(f.criancas || 0);

  const totalBagagemIda =
    Number(f.bagagemQuantidadeIda || 0) *
    Number(f.bagagemPrecoIda || 0);

  const totalBagagemVolta =
    Number(f.bagagemQuantidadeVolta || 0) *
    Number(f.bagagemPrecoVolta || 0);

  // Pegar taxas salvas
  const airportRates = JSON.parse(localStorage.getItem("airportRates")) || [];

  const getAirportTax = (airportCode, manualValue, classificacao) => {
    if (manualValue !== "" && manualValue !== null && typeof manualValue !== "undefined")
      return parseFloat(manualValue) || 0;

    const rate = airportRates.find(
      (r) => r.aeroporto === (airportCode || "").toUpperCase()
    );

    if (!rate) return 0;

    return classificacao === "Nacional"
      ? Number(rate.nacional || 0)
      : Number(rate.internacional || 0);
  };

    const taxaIda = getAirportTax(
    f.idaAeroporto,
    f.taxaIdaManual,
    f.classificacao
     ) * totalPax; 

    const taxaVolta =
    f.tipoviagem === "Ida e Volta"
      ? getAirportTax(
        f.voltaAeroporto,
        f.taxaVoltaManual,
        f.classificacao
        ) * totalPax
      : 0;



   // Milhas
   const valorMilhasIda =
    Number(f.milhasPorPassageiroIda || 0) *
    Number(f.precoMilheiroIda || 0) *
    totalPax;

  const valorMilhasVolta =
    f.tipoviagem === "Ida e Volta"
      ? Number(f.milhasPorPassageiroVolta || 0) *
        Number(f.precoMilheiroVolta || 0) *
        totalPax
      : 0;

  const totalIda = valorMilhasIda + taxaIda + totalBagagemIda;
  const totalVolta =
    f.tipoviagem === "Ida e Volta"
      ? valorMilhasVolta + taxaVolta + totalBagagemVolta
      : 0;

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

  // PDF
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

    // Logo
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


    // Serial
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

    // Config. padrão
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


    const write = (label, value) => {
      doc.setFontSize(9);
      doc.setFont(FONT, "normal");
      doc.text(`${label}:`, margin, y);

      doc.setFontSize(14);
      doc.setFont(FONT, "bold");
      doc.text(`${value}`, margin + LABEL_WIDTH, y);

      y += LINE_GAP;
    };



    // Título principal
    y += 10;

    doc.setFont(FONT, "bold");
    doc.setFontSize(13);
    doc.text("Orçamento e Informações da Viagem", pageWidth / 2, y, {
      align: "center",
    });

    y += SECTION_GAP;


    // Info gerais
    title("Informações gerais do voo");

    y += 5

    writeLine("Classificação", up(flight.classificacao));
    writeLine("Tipo de viagem", flight.tipoviagem);
    writeLine("Classe", flight.classe);
    writeLine("Adultos", flight.adultos);
    writeLine("Crianças", flight.criancas);
    writeLine("Bebês", flight.bebes);


    // Trecho: Ida
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
    writeLine("Companhia aérea", flight.companhiaAereaIda?.toUpperCase());
    writeLine("Aeroporto de origem", up(flight.idaAeroporto));
    writeLine("Escalas", escalasIdaTexto);
    writeLine("Aeroporto de destino", up(flight.idaChegadaAeroporto));
    writeLine("Taxas", money(details.taxaIda));
    writeLine("Bagagens",`${flight.bagagemQuantidadeIda} x ${money(flight.bagagemPrecoIda)} = ${money(flight.totalBagagemIda )}  || ${flight.idaTipoBagagens}`);



    // Trecho: Volta (se existir)
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
      writeLine("Companhia aérea", flight.companhiaAereaVolta?.toUpperCase());
      writeLine("Aeroporto de origem", up(flight.voltaAeroporto));
      writeLine("Escalas", escalasVoltaTexto);
      writeLine("Aeroporto de destino", up(flight.voltaChegadaAeroporto));
      writeLine("Taxas", money(details.taxaVolta));
      writeLine("Bagagens",`${flight.bagagemQuantidadeVolta} x ${money(flight.bagagemPrecoVolta)} = ${money(flight.totalBagagemVolta )}  || ${flight.voltaTipoBagagens}`);
     }

   
    // Resumo
    title("Resumo financeiro");
    y += 12;
    write("Valor total", money(valorComTaxa));
    write("Parcelas", `${parcelas}x`);
    write("Valor por parcela", money(valorParcela));
    separator();
    y += 30;

    // OBS
    doc.setFont(FONT, "bold");
    doc.setFontSize(10);
    doc.text("Atenção: nenhuma emissão foi efetuada até o momento. Este documento é apenas um orçamento.", pageWidth / 2, y, {
      align: "center",
    });

     y += 30;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const obs = "Aviso importante sobre preços dinâmicos: os valores apresentados neste orçamento estão sujeitos à variação de acordo com disponibilidade, demanda, políticas das companhias aéreas e hotéis, além de possíveis alterações cambiais. Como se tratam de preços dinâmicos, o valor final somente será confirmado no momento da emissão da passagem aérea ou da reserva da hospedagem. Recomenda-se confirmar a compra o quanto antes para garantir as tarifas informadas.";
    const obsLines = doc.splitTextToSize(obs, pageWidth - margin * 2);
    doc.text(obsLines, margin, y);

   y += 60;

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

    // Salvar PDF
    const fileName = `informacoes.orcamento_${serialFormatted}.pdf`;
    doc.save(fileName);

    // Salvar histórico
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

   // Página Percelamneto
  return (

 <div className="w-full mx-auto rounded-xl space-y-5">
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
    Banco:
  </label>

  <select
    className="text-xl w-full p-2 font-extrabold rounded"
    value={bancoSelecionado}
    onChange={(e) => setBancoSelecionado(e.target.value)}
  >

    <option value="" className="bg-gray-400 mr-5 text-gray-900 text-lg font-bold">Escolher banco</option>
    
    {bancos.map((b) => (
      <option
        key={b.banco}
        value={b.banco}
        className="bg-gray-400 text-gray-900 text-lg font-bold"
      >
        {b.banco}
      </option>
    ))}
  </select>
   </div>

   {bancoSelecionado && (

    <>

    <div className="space-y-4 mt-10">
    <label className="text-xl font-semibold block">
    Método de pagamento:
    </label>

     <select
     className="p-2 text-xl font-extrabold rounded"
     value={metodo}
     onChange={(e) => setMetodo(e.target.value)}>

    <option
    className="bg-gray-400 text-gray-900 text-lg font-bold"
    value="link">
     Link
    </option>

   <option
   className="bg-gray-400 text-gray-900 text-lg font-bold"
   value="maquina">
   Maquininha
  </option>

  </select>
   </div>

   <div className="space-y-4 mt-10">

  <label className="text-xl font-semibold block">
   Parcelas:
   </label>

   <select
   className="p-2 text-xl font-extrabold rounded"
   value={parcelas}
   onChange={(e) => setParcelas(Number(e.target.value))}
   >

  {taxas.map((t) => (

   <option
   key={t.parcelas}
   value={t.parcelas}
   className="bg-gray-400 text-gray-900 text-lg font-bold">
  {t.parcelas}x
  </option>

  ))}

  </select>
  </div>

   <div className="border p-2 rounded space-y-8">

    {taxaNaoExiste ? (

  <div>
  <p className="text-xl font-semibold m-2">Taxa não cadastrada para esse banco</p>

  <Button 
   onClick={() => router.push("/taxas.parcelamento")}
   className="text-lg p-8 mb-2 w-full font-extrabold">
   Clique aqui <br></br> e cadastre
  </Button>
  </div>

  ) : (

    <>

  <div className="ml-2 mt-2">
  <p className="text-xl font-semibold">Taxa:</p>

  <strong className="text-2xl font-extrabold block mt-1">
  {percentual}%
  </strong>
  </div>

  <div className="ml-2">
  <p className="text-xl font-semibold">Total com taxa:</p>

  <strong className="text-2xl font-extrabold block mt-1">
  R$ {valorComTaxa.toFixed(2)}
  </strong>
  </div>

  <div className="ml-2 mb-2">
  <p className="text-xl font-semibold">
  Valor por parcela:
  </p>

  <strong className="text-2xl font-extrabold block mt-1">
  R$ {valorParcela.toFixed(2)}
  </strong>
  </div>

   </>

   )}

  </div>


 {!taxaNaoExiste && (
  <Button 
    className="mt-10 p-7"
    onClick={gerarPDF}
  >
    <p className="font-extrabold text-xl">Gerar PDF</p>
  </Button>
 )}

  </>

 )}

 </div>
 </div>

  )};