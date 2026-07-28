import { useEffect } from "react"
import { Link, useLocation } from "react-router-dom"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"

const getPageTitle = (pathname) => {
  const normalizedPath = pathname.toLowerCase()

  if (normalizedPath === "/dashboard") return "Dashboard"
  if (normalizedPath === "/users") return "Usuários"
  if (normalizedPath === "/teams") return "Equipes"
  if (normalizedPath === "/feedback") return "Feedbacks"
  if (normalizedPath === "/reports") return "Relatórios"
  if (normalizedPath === "/nova-avaliacao") return "Nova avaliação"
  if (normalizedPath === "/minhas-avaliacoes") return "Meus resultados"
  if (normalizedPath === "/ciclos") return "Ciclos de Avaliação"
  if (normalizedPath === "/templates") return "Templates"
  if (normalizedPath === "/templates/novo") return "Novo Template"
  if (normalizedPath.startsWith("/templates/") && normalizedPath.endsWith("/clonar")) return "Clonar Template"
  if (normalizedPath.startsWith("/templates/") && normalizedPath.endsWith("/editar")) return "Editar Template"

  return "Página atual"
}

function Header() {
  const { pathname } = useLocation()
  const normalizedPath = pathname.toLowerCase()
  const pageTitle = getPageTitle(pathname)
  const showBreadcrumb = normalizedPath !== "/dashboard"

  useEffect(() => {
    document.title = `${pageTitle} | Avalia.ai`
  }, [pageTitle])

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
      <div className="flex min-w-0 items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" aria-label="Alternar menu lateral" />
        {showBreadcrumb && (
          <>
            <Separator
              orientation="vertical"
              className="mr-2 data-vertical:h-4 data-vertical:self-center"
            />
            <Breadcrumb>
              <BreadcrumbList className="flex-nowrap">
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink render={<Link to="/dashboard" />}>
                    Página Inicial
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage className="truncate font-medium">
                    {pageTitle}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </>
        )}
      </div>
    </header>
  )
}

export default Header
