"use client";

// Importações
import { useRouter } from "next/navigation";
import { Button } from "./components/ui/button";
import { SiteFooter } from "./components/site-footer";

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="w-full flex flex-col">

      {/* Vídeo no topo */}
      <div className="w-full h-[100vh] overflow-hidden pointer-events-none select-none">
        <video
          src="/videobanner.mp4"
          autoPlay
          loop
          muted
          playsInline
          disablePictureInPicture
          preload="auto"
          className="w-full h-full object-cover"
        />

        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-primary animate-bounce opacity-70">
   <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-8 w-8 text-white"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
   </svg>
   </div>

      </div>

      {/* Seção principal */}
       <section className="flex flex-col items-center text-center px-6 py-20 bg-gradient-to-b from-background to-accent/20">

  <h1 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight animate-fade-in">
    Bem-vindo(a) ao Sky Counter
  </h1>

  <h2 className="text-2xl max-w-3xl leading-relaxed mb-4 font-bold text-muted-foreground animate-fade-in-delay">
    Revolucione sua forma de trabalhar com milhas.
  </h2>

  <p className="text-xl max-w-3xl font-semibold text-muted-foreground animate-fade-in-delay mb-10">
    Realize cotações de passagens aéreas com milhas de forma rápida e crie orçamentos profissionais em segundos.
  </p>

  <Button
    className="text-2xl font-mono font-bold px-4 py-12 rounded-xl shadow-lg transition hover:scale-105"
    onClick={() => router.push("/cotacao")}
  >
    Explorar Plataforma
  </Button>

  </section>


      {/* Seção ferramentas */}
      
      <section className="flex flex-col items-center text-center px-6 py-20 bg-primary text-primary-foreground">

        <h1 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight animate-fade-in">
          Ferramentas Disponíveis
        </h1>

           <div className="text-2xl p-4 md:text-2xl max-w-2xl leading-relaxed opacity-90 animate-fade-in-delay">

    <ul className="space-y-3 font-semibold list-disc list-inside text-xl animate-fade-in-delay">
    <li>Cotações inteligentes</li>
    <li>Simulação de parcelamento</li>
    <li>Geração automática de PDF</li>
    <li>Cadastro de perfil</li>
    <li>Controle de taxas</li>
    </ul>
   </div>

      </section>

  <SiteFooter></SiteFooter>
    </div>
  );
  }
