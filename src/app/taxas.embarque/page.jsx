  "use client";

 
  import { useEffect, useState } from "react";
  import { Button } from "../components/ui/button.jsx";
  import { Pencil, Trash2 } from "lucide-react";

 export default function TaxasAeroportos() {

   // Use States
  const [airportRates, setAirportRates] = useState([]);
  const [aeroporto, setAeroporto] = useState("");
  const [nacional, setNacional] = useState("");
  const [internacional, setInternacional] = useState("");
  const [editingAeroporto, setEditingAeroporto] = useState(null);
  const [busca, setBusca] = useState("");

   // Buscar taxas
   const taxasFiltradas = airportRates.filter((a) =>
   a.aeroporto.toUpperCase().includes(busca.toUpperCase())
   );


   // Carregar taxas salvas
   useEffect(() => {

    const saved = localStorage.getItem("airportRates");

    if (saved) {
      const data = JSON.parse(saved);
      setAirportRates(data || []);
    }
    }, []);

   // Salvar no localStorage
   const salvarTaxas = (data) => {
    setAirportRates(data);
    localStorage.setItem("airportRates", JSON.stringify(data));
   };

   // Adicionar 
   const adicionar = () => {
   if (!aeroporto) return;

    const novo = {
      aeroporto: aeroporto.toUpperCase(),
      nacional: Number(nacional) || 0,
      internacional: Number(internacional) || 0
    };

    let lista;

    if (editingAeroporto) {

      lista = airportRates.map(a =>
        a.aeroporto === editingAeroporto ? novo : a
      );

    } else {
      lista = [...airportRates.filter(a => a.aeroporto !== novo.aeroporto), novo];
    }

    salvarTaxas(lista);
    setAeroporto("");
    setNacional("");
    setInternacional("");
    setEditingAeroporto(null);
   };

   // Editar
   const editar = (aeroporto) => {
    setAeroporto(aeroporto.aeroporto || "");
    setNacional(aeroporto.nacional || "");
    setInternacional(aeroporto.internacional || "");
    setEditingAeroporto(aeroporto.aeroporto);
   };

   // Remover
   const remover = (aeroporto) => {

   const lista = airportRates.filter(a => a.aeroporto !== aeroporto);
   salvarTaxas(lista);
   };

     return (
     <div className="max-w-3xl mx-auto space-y-8">

      <h1 className="text-4xl font-extrabold text-center">
        Cadastro das Taxas de Embarque dos Aeroportos
      </h1>

      <p className="text-center text-lg font-semibold">
        Cadastre ou edite as taxas de embarque utilizadas no cálculo das cotações.
      </p>

      {/* Formulário */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        <input
          placeholder="Aeroporto (EX: GRU)"
          value={aeroporto || ""}
          maxLength={3}
          onChange={(e)=>setAeroporto(e.target.value.toUpperCase())}
          className="uppercase w-full p-2 text-sm font-semibold rounded-lg border"/>

        <input
          placeholder="Nacional (EX: 3.65)"
          type="number"
          value={nacional || ""}
          onChange={(e)=>setNacional(e.target.value)}
          className="uppercase w-full p-2 text-sm font-semibold rounded-xl border"/>

        <input
          placeholder="Internacional (EX: 5.20)"
          type="number"
          value={internacional || ""}
          onChange={(e)=>setInternacional(e.target.value)}
          className="uppercase w-full p-2 text-sm font-semibold rounded-xl border"/>

      </div>

      <div className="flex justify-center">
        <Button className="p-8" onClick={adicionar}>
          <p className="text-xl font-semibold">
            {editingAeroporto ? "Atualizar taxa" : "Adicionar taxa"}
          </p>
        </Button>
      </div>

      {/* Lista */}
      <div className="space-y-4">


     <h2 className="text-2xl font-bold">
     Taxas de embarque cadastradas
     </h2>

    {airportRates.length  >=  4 && (
    <input
    type="text"
    placeholder={"Pesquisar taxa (EX: FOR)"}
    value={busca}
    onChange={(e) => setBusca(e.target.value.toUpperCase())}
    className="border p-2 rounded w-full text-m font-bold"
    />
    )}

     {airportRates.length === 0 && (
      <p className="text-lg text-center font-medium text-italic">
      Nenhuma taxa de embarque cadastrada ainda.
      </p>
      )}

        {taxasFiltradas.map((a, i) => (
          <div
            key={(a.aeroporto || "item") + i}
            className="shadow-lg rounded-xl p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">

            {/* Informações */}
            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6">

              <span className="text-xl font-bold">
                {a.aeroporto}
              </span>

              <span className="text-lg font-semibold">
                Nacional: <span className="text-xl font-bold">R$ {a.nacional}</span>
              </span>

              <span className="text-lg font-semibold">
                Internacional: <span className="text-xl font-bold">R$ {a.internacional}</span>
              </span>
              </div>

            {/* Botões */}
            <div className="flex gap-2">

              <Button
                className="text-sm md:text-base font-semibold px-4 py-2"
                onClick={() => editar(a)}>
                <Pencil size={16} />
              </Button>

              <Button
                className="text-sm md:text-base font-semibold px-4 py-2"
                variant="destructive"
                onClick={() => remover(a.aeroporto)}>
                <Trash2 size={16}/>
              </Button>
            </div>
            </div>
           ))}
          </div>
          </div>
          );
          }