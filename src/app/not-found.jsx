"use client";

import { Button } from "./components/ui/button";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen p-5 relative flex items-center justify-center overflow-hidden">

      {/* BACKGROUND */}
      <img
        src="/banner.png"
        alt="Fundo 404"
        className="absolute inset-0 w-full h-full object-cover -z-20"
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/20 -z-10" />

      {/* CARD */}
      <div className="
        backdrop-blur-xl
        bg-blue/80 
        border border-neutral-300 dark:border-[#081427]
        shadow-2xl
        rounded-3xl
        p-12 md:p-16
        max-w-xl w-full
        flex flex-col items-center text-center
      ">

        {/* 404 */}
        <h1 className="
          text-8xl md:text-9xl
          font-extrabold
          text-white dark:text-[#081427]
          mb-2
        ">
          404
        </h1>

        {/* TÍTULO */}
        <h2 className="
          text-3xl md:text-4xl
          font-bold
          text-white dark:text-[#081427]
          mt-2
        ">
          Página não encontrada
        </h2>

        {/* TEXTO */}
        <p className="
          mt-6 text-xl text-white font-semibold dark:text-[#081427] max-w-md">
          Poxa… parece que você se perdeu no caminho ou tentou acessar uma página que não existe.
        </p>

        {/* BOTÃO */}
        <Button
          onClick={() => router.push("/")}
          className="
            mt-10
            px-4 py-10
            text-xl font-bold
            rounded-2xl
            bg-gradient-to-r from-blue-800 to-indigo-900
            hover:from-blue-700 hover:to-indigo-800
            text-white
            shadow-lg
            transition-all
          "
        >
          Voltar para a página inicial
        </Button>
      </div>
    </div>
  );
}
