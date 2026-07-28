import { Fragment } from "react"
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

const ROUTE_LABELS = {
  "/dashboard": "Dashboard",
  "/users": "Usuários",
  "/teams": "Times",
  "/templates": "Templates",
  "/ciclos": "Ciclos",
  "/nova-avaliacao": "Nova avaliação",
  "/minhas-avaliacoes": "Meus resultados",
}

function getBreadcrumbItems(pathname) {
  if (pathname === "/templates/novo") {
    return [
      { label: "Templates", to: "/templates" },
      { label: "Novo template" },
    ]
  }

  if (/^\/templates\/[^/]+\/editar$/.test(pathname)) {
    return [
      { label: "Templates", to: "/templates" },
      { label: "Editar template" },
    ]
  }

  if (/^\/templates\/[^/]+\/clonar$/.test(pathname)) {
    return [
      { label: "Templates", to: "/templates" },
      { label: "Clonar template" },
    ]
  }

  const fallbackLabel = pathname
    .split("/")
    .filter(Boolean)
    .at(-1)
    ?.replaceAll("-", " ")

  return [{
    label: ROUTE_LABELS[pathname]
      || (fallbackLabel
        ? fallbackLabel.charAt(0).toUpperCase() + fallbackLabel.slice(1)
        : "Dashboard"),
  }]
}

function Header() {
  const { pathname } = useLocation()
  const normalizedPath = pathname.toLowerCase()
  const breadcrumbItems = getBreadcrumbItems(normalizedPath)
  const showBreadcrumb = normalizedPath !== "/dashboard"

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
                {breadcrumbItems.map((item, index) => {
                  const isCurrentPage = index === breadcrumbItems.length - 1

                  return (
                    <Fragment key={item.to || item.label}>
                      <BreadcrumbSeparator className="hidden md:block" />
                      <BreadcrumbItem className={isCurrentPage ? "min-w-0" : "hidden md:block"}>
                        {isCurrentPage ? (
                          <BreadcrumbPage className="truncate font-medium">
                            {item.label}
                          </BreadcrumbPage>
                        ) : (
                          <BreadcrumbLink render={<Link to={item.to} />}>
                            {item.label}
                          </BreadcrumbLink>
                        )}
                      </BreadcrumbItem>
                    </Fragment>
                  )
                })}
              </BreadcrumbList>
            </Breadcrumb>
          </>
        )}
      </div>
    </header>
  )
}

export default Header
