import { useNavigate } from "react-router-dom"
import {
  BarChart3Icon,
  ClipboardListIcon,
  FileEditIcon,
  LayoutDashboardIcon,
  MessageSquareIcon,
  NetworkIcon,
  UsersIcon,
  FileTextIcon,
  RefreshCcwIcon,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { useAuth } from "@/hooks/useAuth"

const MANAGEMENT_LINKS = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboardIcon },
  { title: "Templates", url: "/templates", icon: FileTextIcon },
  { title: "Ciclos", url: "/ciclos", icon: RefreshCcwIcon },
  { title: "Usuários", url: "/users", icon: UsersIcon },
  { title: "Times", url: "/teams", icon: NetworkIcon },
  { title: "Feedbacks", url: "/feedback", icon: MessageSquareIcon },
  { title: "Relatórios", url: "/reports", icon: BarChart3Icon },
]

const COLLABORATOR_LINKS = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboardIcon },
  { title: "Nova avaliação", url: "/nova-avaliacao", icon: FileEditIcon },
  {
    title: "Meus resultados",
    url: "/minhas-avaliacoes",
    icon: ClipboardListIcon,
  },
]

const ROLE_LABELS = {
  admin: "Administrador",
  rh: "RH",
  colaborador: "Colaborador",
}

export function AppSidebar(props) {
  const navigate = useNavigate()
  const { profile, logout } = useAuth()
  const canManage = ["admin", "rh"].includes(profile?.papel)
  const displayName = profile?.nome_completo || profile?.email || "Usuário"

  async function handleLogout() {
    try {
      await logout()
    } finally {
      navigate("/", { replace: true })
    }
  }

  return (
    <Sidebar collapsible="icon" variant="inset" {...props}>
      <SidebarHeader>
        <TeamSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={canManage ? MANAGEMENT_LINKS : COLLABORATOR_LINKS} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser
          user={{
            name: displayName,
            email: profile?.email || "",
            role: ROLE_LABELS[profile?.papel] || "Colaborador",
          }}
          onLogout={handleLogout}
        />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
