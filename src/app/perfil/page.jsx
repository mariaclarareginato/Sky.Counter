"use client";

import { useEffect, useState } from "react";
import { Button } from "../components/ui/button.jsx";
import { Input } from "../components/ui/input.jsx";

export default function PerfilAgencia() {

  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [redes, setRedes] = useState("");
  const [logo, setLogo] = useState(null);
  const [cnpj, setCnpj] = useState("");
  const [cadastur, setCadastur] = useState("");
  const [sucesso, setSucesso] = useState(false);

   const [pdfFields, setPdfFields] = useState({
  nome: true,
  telefone: true,
  redes: true,
  cnpj: false,
  cadastur: false,
  logo: true,
});


  const togglePdfField = (field) => {
   const updated = { ...pdfFields, [field]: !pdfFields[field] };
   setPdfFields(updated);
   localStorage.setItem("agencia_pdf_fields", JSON.stringify(updated));
    };

useEffect(() => {

  setLogo(localStorage.getItem("agencia_logo") || null);
  setNome(localStorage.getItem("agencia_nome") || "");
  setTelefone(localStorage.getItem("agencia_telefone") || "");
  setRedes(localStorage.getItem("agencia_redes") || "");
  setCnpj(localStorage.getItem("agencia_cnpj") || "");
  setCadastur(localStorage.getItem("agencia_cadastur") || "");

  const savedFields = localStorage.getItem("agencia_pdf_fields");
  if (savedFields) {
    setPdfFields(JSON.parse(savedFields));
  }

}, []);


const salvarPerfil = () => {
  localStorage.setItem("agencia_nome", nome);
  localStorage.setItem("agencia_telefone", telefone);
  localStorage.setItem("agencia_redes", redes);
  localStorage.setItem("agencia_cnpj", cnpj);
  localStorage.setItem("agencia_cadastur", cadastur);

  setSucesso(true);
  setTimeout(() => setSucesso(false), 3000);
};


const handleLogoUpload = (e) => {
  const file = e.target.files[0];

  if (!file) return;

  const reader = new FileReader();
  reader.onloadend = () => {
    setLogo(reader.result);
    localStorage.setItem("agencia_logo", reader.result);
  };
  reader.readAsDataURL(file);
};


  return (
   <div className="p-10 max-w-3xl mx-auto space-y-6">
  <h1 className="text-4xl font-extrabold text-center">
    Perfil da sua agência
  </h1>

<div className="flex flex-col items-center justify-center gap-4">

  <Input
    id="logoUpload"
    type="file"
    accept="image/*"
    className="hidden"
    onChange={handleLogoUpload}
  />

  {/* Placeholder quando não tiver logo */}
  {!logo && (
    <div className="h-32 w-32 rounded-full text-lg font-semibold flex items-center justify-center border-2">
      Sem logo
    </div>
  )}


  {logo && (
    <div className="h-32 w-32 rounded-full border-2 shadow-md overflow-hidden flex items-center justify-center bg-white">
      <img
        src={logo}
        className="max-h-full max-w-full object-contain"
        alt="Logo da agência"
      />
    </div>
  )}

  {/* Botão único: alterna entre enviar e remover */}
  {logo ? (
    <Button
      variant="destructive"
      onClick={() => {
        setLogo(null);
        localStorage.removeItem("agencia_logo");
      }}
      className="font-bold text-lg"
    >
      Remover logo
    </Button>
  ) : (
    <label
      htmlFor="logoUpload"
      className="cursor-pointer font-bold text-lg border px-6 py-2 rounded text-center"
    >
      Enviar logo (230 x 170)
    </label>
  )}

</div>


  <Input
    placeholder="Nome"
    value={nome}
    onChange={(e) => {
      setNome(e.target.value);
      localStorage.setItem("agencia_nome", e.target.value);
    }}
    className="text-lg font-semibold"
  />

  <Input
    placeholder="Telefone"
    value={telefone}
    onChange={(e) => {
      setTelefone(e.target.value);
      localStorage.setItem("agencia_telefone", e.target.value);
    }}
    className="text-lg font-semibold"
  />

  <Input
    placeholder="Redes sociais"
    value={redes}
    onChange={(e) => {
      setRedes(e.target.value);
      localStorage.setItem("agencia_redes", e.target.value);
    }}
    className="text-lg font-semibold"
  />

   <Input
    placeholder="CNPJ"
    value={cnpj}
    onChange={(e) => {
      setCnpj(e.target.value);
      localStorage.setItem("agencia_cnpj", e.target.value);
    }}
    className="text-lg font-semibold"
  />

     <Input
    placeholder="Cadastur"
    value={cadastur}
    onChange={(e) => {
    setCadastur(e.target.value);
    localStorage.setItem("agencia_cadastur", e.target.value);
    }}
    className="text-lg font-semibold"
  />

  {sucesso && (
  <div className="p-4 text-green-900 dark:text-green-400 rounded text-center text-xl font-semibold">
    Perfil salvo com sucesso!
  </div>
)}

  <div className="flex justify-center">
    <Button onClick={salvarPerfil} className="px-6 py-6 text-lg font-bold">
      Salvar perfil
    </Button>
  </div>
  <br></br>
  
  <p className="text-lg font-semibold">As informações do perfil da sua agência serão utilizadas nos PDFs das suas cotações</p>

<div className="border rounded-lg p-4 space-y-3">
  <p className="font-bold text-xl">
  Selecione abaixo quais dados você deseja que apareçam nos seus documentos:
  </p>

  {[
    ["logo", "Logo"],
    ["nome", "Nome"],
    ["telefone", "Telefone"],
    ["redes", "Redes sociais"],
    ["cnpj", "CNPJ"],
    ["cadastur", "Cadastur"],
  ].map(([key, label]) => (
    <label
      key={key}
      className="flex items-center gap-3 text-lg font-semibold cursor-pointer"
    >
      <input
        type="checkbox"
        checked={pdfFields[key]}
        onChange={() => togglePdfField(key)}
        className="scale-125"
      />
      {label}
    </label>
  ))}
</div>
</div>

  );
}
