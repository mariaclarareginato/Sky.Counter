  "use client";

   // Importações
   import { useState, useEffect } from "react";
   import { Button } from "../components/ui/button.jsx";
   import { Pencil, Trash2 } from "lucide-react";

   export default function TaxasParcelamentoPage() {

   const [banco, setBanco] = useState("");
   const [busca, setBusca] = useState("");
   const [parcelaSelecionada, setParcelaSelecionada] = useState(0);

   const [taxas, setTaxas] = useState(
   Array.from({ length: 24 }, (_, i) => ({
   parcelas: i + 1,
   link: "",
   maquina: ""
   }))
   );

  const [listaBancos, setListaBancos] = useState([]);
  const [editIndex, setEditIndex] = useState(null);


  // Busca bancos
  const bancosFiltrados = listaBancos.filter((b) =>
  b.banco.toLowerCase().includes(busca.toLowerCase())
  );

  useEffect(() => {

  const saved = localStorage.getItem("parcelamentoTaxas");

  if (saved) {
  setListaBancos(JSON.parse(saved));
   }

   }, []);


  // Editar valores tabela
  const handleChange = (index, field, value) => {

  const copy = [...taxas];
  copy[index][field] = value;

  setTaxas(copy);

   };


  // Salvar banco e taxa
   const salvarBanco = () => {

  if (!banco) {
  alert("Informe o nome do banco");
  return;
  }

  const novo = {
  banco,
  taxas
  };

  let updated;

  if (editIndex !== null) {

  updated = [...listaBancos];
  updated[editIndex] = novo;
  setEditIndex(null);

   } else {

  updated = [...listaBancos, novo];

  }

 setListaBancos(updated);

  localStorage.setItem(
  "parcelamentoTaxas",
   JSON.stringify(updated)
  );

  setBanco("");

  setTaxas(
  Array.from({ length: 24 }, (_, i) => ({
  parcelas: i + 1,
  link: "",
  maquina: ""
  }))
  );

  alert("Banco salvo com sucesso!");

  };


  // Editar banco
  const editarBanco = (index) => {

  const bancoEdit = listaBancos[index];

   setBanco(bancoEdit.banco);

   setTaxas(bancoEdit.taxas);

   setEditIndex(index);

  window.scrollTo({
  top: 0,
  behavior: "smooth"
  });

  };


   // Remover banco
  const removerBanco = (index) => {

  const updated = [...listaBancos];

  updated.splice(index, 1);

  setListaBancos(updated);

  localStorage.setItem(
  "parcelamentoTaxas",
  JSON.stringify(updated)
  );

  };


   return (

   <div className="space-y-8">

   <h1 className="text-4xl font-extrabold text-center">
   Taxas de Parcelamento
   </h1>

      <p className="text-center text-lg font-semibold">
        Cadastre ou edite as taxas de cada banco para parcelamentos do preço total das cotações.
      </p>



  {/* Banco */}

   <div className="space-y-3">

   <label className="font-bold text-lg">
   Banco
   </label>

  <input
  type="text"
  value={banco}
  placeholder="Ex: Itaú"
  onChange={(e)=>setBanco(e.target.value)}
  className="border text-base text-lg font-semibold p-2 mt-5 rounded w-full"
  />

   </div>



  {/* Tabela */}

  <div className="space-y-3">

  <label className="font-bold text-lg">
  Parcelas
  </label>

  <div className="space-y-2">

  <select
  value={parcelaSelecionada}
  onChange={(e)=>setParcelaSelecionada(Number(e.target.value))}
  className="border text-base text-lg font-bold p-2 mt-5 rounded"
  >


  {taxas.map((t,i)=>(
  <option key={i} value={i}
  className="text-lg bg-gray-400 text-gray-900 font-semibold">
  {t.parcelas}x
  </option>
  ))}

  </select>

  </div>

  <div className="grid grid-cols-2 gap-4">

  <div className="space-y-2 mt-5">

  <label className="font-bold text-lg">
   Link-%
   </label>

  <input
   type="number"
   step="0.01"
   value={taxas[parcelaSelecionada].link}
   placeholder="Ex: 4.77"
   onChange={(e)=>handleChange(parcelaSelecionada,"link",e.target.value)}
   className="border mt-3 rounded-md px-2 py-2 w-full text-lg text-center font-semibold"
   />

  </div>

  <div className="mt-5">

  <label className="font-bold text-lg">
  Maquininha-%
  </label>

  <input
  type="number"
  step="0.01"
  value={taxas[parcelaSelecionada].maquina}
  placeholder="Ex: 3.57"
  onChange={(e)=>handleChange(parcelaSelecionada,"maquina",e.target.value)}
  className="border mt-3 rounded-md px-2 py-2 w-full text-lg text-center font-semibold"
  />

  </div>

  </div>

  </div>

  {/* Botão salvar */}

  <Button
  className="w-full p-6 text-xl font-bold"
  onClick={salvarBanco}
  >
  {editIndex !== null ? "Atualizar taxas banco" : "Salvar taxas banco"}
   </Button>



  {/* Bancos cadastrados */}

  <div className="space-y-4">

  <h2 className="text-2xl font-bold">
  Bancos cadastrados
  </h2>

   {listaBancos.length  >=  4 && (
   <input
    type="text"
    placeholder="Pesquisar banco (Ex: Itaú)"
    value={busca}
    onChange={(e) => setBusca(e.target.value)}
    className="border p-2 rounded w-full text-m font-bold"
   />
   )}

   {listaBancos.length === 0 && (
   <p className="text-lg text-center font-semibold">
    Nenhum banco cadastrado ainda.
   </p>
   )}


   {bancosFiltrados.map((b, i)=>(
    

   <div
   key={i}
   className="flex flex-col sm:flex-row sm:justify-between sm:items-center shadow-sm p-4 rounded gap-3"
   >

   <span className="font-bold text-lg">
   {b.banco}
   </span>

     <div className="flex gap-2">

  <Button
  onClick={()=>editarBanco(i)}
  >
  <Pencil size={16}/>
  </Button>

  <Button
  variant="destructive"
  onClick={()=>removerBanco(i)}
  >

  <Trash2 size={16}/>
  </Button>

   </div>

   </div>
    ))}

  </div>
  </div>

    );
   }