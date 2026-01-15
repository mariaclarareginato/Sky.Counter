"use client"

import { useEffect, useState } from "react"
import { NavMain } from "../components/nav-main"

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
} from "../components/ui/sidebar"

export function AppSidebar({ ...props }) {
  const [user, setUser] = useState({ name: "", email: "" })

  useEffect(() => {
    const userData = sessionStorage.getItem("user")
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

  const data = {
    navegacao: [
      { name: "Perfil", url: "/perfil" },
      { name: "Cotação", url: "/cotacao" },
      { name: "Parcelamento", url: "/parcelamento" },
      { name: "Histórico de cotações", url: "/historico" },
    ],
  }

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      {/* Header */}
      <SidebarHeader className="hover:bg-transparent transition-none">
         <SidebarHeader>
        <div className="flex w-full items-center justify-center">
         <img
      className="h-40 w-[170px] rounded-[20px]"
      src="/logo.png"
      alt="Logo"
    />
        </div>
        </SidebarHeader>
      </SidebarHeader>

      {/* Conteúdo da Sidebar */}
      <SidebarContent className="font-semibold gap-4 flex text-lg">
        <NavMain  items={data.navegacao} />
      </SidebarContent>
    </Sidebar>
  )
}
