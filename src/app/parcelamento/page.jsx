   "use client";

   // Importações
   import { useEffect, useState } from "react";
   import jsPDF from "jspdf";
   import { Button } from "../components/ui/button.jsx";

   export default function ParcelamentoPage() {

   // Use States
   const [bancos, setBancos] = useState([]);
   const [bancoSelecionado, setBancoSelecionado] = useState("");
   const [parcelas, setParcelas] = useState(1);
   const [tipoTaxa, setTipoTaxa] = useState("link");

   const [flight, setFlight] = useState(null);
   const [qtdVoos, setQtdVoos] = useState(0);
   const [taxasAdicionais, setTaxasAdicionais] = useState(0);
   const [airportRates, setAirportRates] = useState([]);
   const [totalFinal, setTotalFinal] = useState(0);

   const [userLogo, setUserLogo] = useState(null);
   const [nomeAgencia, setNomeAgencia] = useState("");
   const [telefoneAgencia, setTelefoneAgencia] = useState("");
   const [redesAgencia, setRedesAgencia] = useState("");
   const [cnpj, setCnpj] = useState("");
   const [cadastur, setCadastur] = useState("");
   const [pdfFields, setPdfFields] = useState({});
   const [loaded, setLoaded] = useState(false);

    // Load
    useEffect(() => {
    try {
      const savedVoos = localStorage.getItem("voosProData");
      if (savedVoos) {
        const parsed = JSON.parse(savedVoos);

        setFlight(parsed.flight);
        setQtdVoos(Number(parsed.qtdVoos) || 1);
        setTaxasAdicionais(parsed.taxasAdicionais);
        setTotalFinal(Number(parsed.totalFinal || 0));
      }

      const savedTaxas = localStorage.getItem("parcelamentoTaxas");
      if (savedTaxas) {
        setBancos(JSON.parse(savedTaxas));
      }

          const savedRates = localStorage.getItem("airportRates");
       if (savedRates) {
       setAirportRates(JSON.parse(savedRates));
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
      console.error(err);
    } finally {
      setLoaded(true);
    }
    }, []);

  // Helpers PDF
  const formatar = (valor) =>
    Number(valor || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    });

  const bancoObj = bancos.find((b) => b.banco === bancoSelecionado);

  const taxasValidas = bancoObj
    ? bancoObj.taxas.filter((t) => t[tipoTaxa] !== "")
    : [];

   const taxaSelecionada = taxasValidas.find(
    (t) => Number(t.parcelas) === Number(parcelas)
   );

   const percentual = taxaSelecionada
    ? Number(taxaSelecionada[tipoTaxa])
    : null;

   const valorComTaxa =
    percentual !== null ? totalFinal / (1 - percentual / 100) : totalFinal;

   const valorParcela = parcelas
    ? valorComTaxa / parcelas
    : valorComTaxa;

    //  Funções auxiliares do PDF 
    const getTaxa = (code) => {
    if (!code) return 0;

    const rate = airportRates.find(
      (a) => a.aeroporto?.toUpperCase() === code.toUpperCase()
    );

    if (!rate) return 0;

    return flight.classificacao === "Internacional"
      ? Number(rate.internacional || 0)
      : Number(rate.nacional || 0);
    };

   const totalPax =
    Number(flight?.adultos || 0) + Number(flight?.criancas || 0);

   const totalPaxEx = totalPax + Number(flight?.bebes || 0);

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


    const totalGeral = flight
    ? flight.trechos
        .slice(0, qtdVoos)
        .reduce((acc, trecho) => acc + totalTrecho(trecho), 0)
    : 0;

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
        write("Cliente", flight.cliente);
        write("Classificação", flight.classificacao);
        write("Total passageiros", totalPaxEx);
        
    
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
          write("Bagagem", `${t.bagagemQtd || "0"} x R$ ${Number( t.bagagemPreco || "" ).toFixed(2)} = R$ ${(t.bagagemQtd * t.bagagemPreco).toFixed(2)} || ${t.tipoBagagem}`);
          });
    
    
        // Total final
        doc.setFontSize(13);
        doc.setFont("helvetica", "bold");
        separator();
        doc.text(`R$ ${valorComTaxa.toFixed(2)}`, pageWidth / 2, y, { align: "center" });
        y += 20;
        doc.text(`${parcelas} X de ${formatar(valorParcela)}`, pageWidth / 2, y, { align: "center" });
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
    
        // ====== SAVE ======
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
          qtdVoos: qtdVoos,
          taxasAdicionais: taxasAdicionais, 
        };
    
        historico.unshift(registro); // Mais recentes primeiro
        localStorage.setItem("historicoCotacoes", JSON.stringify(historico));
    
        } catch (err) {
        console.error("Erro ao gerar PDF:", err);
        }
        };


    

       return (
      <div className="w-full max-w-2xl mx-auto p-6 space-y-6 rounded-2xl shadow-xl">
      <h1 className="text-3xl sm:text-4xl font-extrabold text-center">Parcelamento</h1>
      <h2 className="text-3xl font-extrabold text-center">{formatar(totalFinal)}</h2>
      <p className="text-m font-semibold text-center">De acordo com seus bancos e taxas de parcelamento cadastradas, confira o preço da sua cotação parcelada.</p>

      <div className="mt-10">
        <label className="font-semibold text-m">Banco:</label>
        <select
          className="w-full p-2 text-m font-extrabold rounded mt-1"
          value={bancoSelecionado}
          onChange={(e) => {
            setBancoSelecionado(e.target.value);
            setParcelas(1);
          }}
          >
          <option className="bg-gray-400 text-lg font-semibold text-gray-900" value="">Selecione um banco</option>
          {bancos.map((b) => (
            <option className="bg-gray-400 text-lg font-semibold text-gray-900" key={b.banco} value={b.banco}>
              {b.banco}
            </option>
          ))}
        </select>
      </div>

      {bancoSelecionado && (
        <>
          <div>
            <label className="font-semibold text-m">Tipo de taxa:</label>
            <select
              className="w-full p-2 rounded mt-1 font-extrabold text-m"
              value={tipoTaxa}
              onChange={(e) => setTipoTaxa(e.target.value)}
            >
              <option className="bg-gray-400 text-lg font-semibold text-gray-900" value="link">Link</option>
              <option className="bg-gray-400 text-lg font-semibold text-gray-900" value="maquina">Maquininha</option>
            </select>
          </div>

          <div>
            <label className="font-semibold text-m">Parcelas:</label>
            <select
              className="w-full p-2 rounded mt-1 text-m font-extrabold"
              value={parcelas}
              onChange={(e) => setParcelas(Number(e.target.value))}
            >
              {taxasValidas.map((t) => (
                <option className="text-lg font-semibold bg-gray-400 text-gray-900" key={t.parcelas} value={t.parcelas}>
                  {t.parcelas}x
                </option>
              ))}
            </select>
          </div>

          <div className="p-4 rounded-xl shadow space-y-3">
            {percentual === null ? (
              <p className="text-lg font-bold">
                Taxa não cadastrada 
              </p>
            ) : (
              <>
                <div>
                  <p className="font-semibold">Taxa:</p>
                  <p className="text-xl font-extrabold">{percentual}%</p>
                </div>

                <div>
                  <p className="font-semibold">Total:</p>
                  <p className="text-xl font-extrabold">
                    {formatar(valorComTaxa)}
                  </p>
                </div>

                <div>
                  <p className="font-semibold">
                    {parcelas}x de:
                  </p>
                  <p className="text-xl font-extrabold">
                    {formatar(valorParcela)}
                  </p>
                </div>
              </>
            )}
          </div>

          {percentual !== null && (
            <div className="flex justify-center">
              <Button
                className="p-6 text-xl font-semibold"
                onClick={gerarPDF}
              >
                Gerar PDF
              </Button>
            </div>
          )}
        </>
      )}
     </div>
     );
     }
