"use client";

import { useEffect, useState } from "react";
import { Button } from "../components/ui/button.jsx";
import { Input } from "../components/ui/input.jsx";

export default function PerfilAgencia() {
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [redes, setRedes] = useState("");
  const [logo, setLogo] = useState(null);

  useEffect(() => {
    setNome(localStorage.getItem("agencia_nome") || "");
    setTelefone(localStorage.getItem("agencia_telefone") || "");
    setRedes(localStorage.getItem("agencia_redes") || "");
    setLogo(localStorage.getItem("agencia_logo") || null);
  }, []);

  const salvarPerfil = () => {
    localStorage.setItem("agencia_nome", nome);
    localStorage.setItem("agencia_telefone", telefone);
    localStorage.setItem("agencia_redes", redes);

    alert("Perfil salvo com sucesso!");
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
  <h1 className="text-3xl font-extrabold text-center">
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
      Enviar logo
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

  <div className="flex justify-center">
    <Button onClick={salvarPerfil} className="px-6 py-6 text-lg font-bold">
      Salvar perfil
    </Button>
  </div>
</div>

  );
}
