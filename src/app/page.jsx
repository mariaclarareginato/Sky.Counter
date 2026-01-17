"use client";

import { useRouter } from "next/navigation";
import { Button } from "./components/ui/button";

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="w-full flex flex-col">

      {/* VIDEO NO TOPO */}
      <div className="w-full h-[100vh] overflow-hidden pointer-events-none select-none">
        <video
          src="/videobanner.mp4"
          autoPlay
          loop
          muted
          playsInline
          disablePictureInPicture
          className="w-full h-full object-cover"
        />
      </div>

      {/* SEÇÃO PRINCIPAL */}
      <section className="flex flex-col items-center text-center px-6 py-20 bg-gradient-to-b from-background to-accent/20">

        <h1 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight">
          Bem-vindo(a) ao Sky Counter 
        </h1>

        <p className="text-xl md:text-xl max-w-3xl leading-relaxed mb-10 text-muted-foreground">
          O Sky Counter foi criado para transformar a rotina de <strong>agentes de viagens.</strong>  
          <br></br>
          <br></br>
          Realize cotações de passagens por milhas de forma rápida, organizada 
          <br></br>
          e profissional, gerando orçamentos completos em poucos cliques.
        </p>

        <Button
          className="text-2xl font-mono font-bold p-12 rounded-xl shadow-lg transition hover:scale-105"
          onClick={() => router.push("/cotacao")}
        >
          Explorar Plataforma
        </Button>

      </section>

      {/* SEÇÃO FERRAMENTAS */}
      <section className="flex flex-col items-center text-center px-6 py-20 bg-primary text-primary-foreground">

        <h2 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight">
          Ferramentas Disponíveis
        </h2>
           <div className="text-2xl p-4 md:text-2xl max-w-2xl leading-relaxed opacity-90 text-muted-foreground">
    <p className="mb-7">
    Sistema completo para agentes de viagens:
   </p>

   <ul className="space-y-3 list-disc list-inside font-semibold">
    <li>Cotações inteligentes</li>
    <li>Simulação de parcelamento</li>
    <li>Geração automática de PDF</li>
    <li>Cadastro de perfil</li>
    <li>Controle de taxas</li>
    </ul>
   </div>

      </section>


    </div>
  );
}
