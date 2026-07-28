import { useState } from "react"
import ConfirmDialog from "./ConfirmDialog"
import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { useTheme } from "@/hooks/useTheme"
import {
  ChevronsUpDownIcon,
  LogOutIcon,
  MoonIcon,
  SunIcon,
} from "lucide-react"

function getInitials(name) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase()
}

export function NavUser({ user, onLogout }) {
  const { isMobile } = useSidebar()
  const { theme, toggleTheme } = useTheme()
  const initials = getInitials(user.name) || "U"

  // 1. Estado para controlar a exibição do modal de saída
  const [isLogoutOpen, setIsLogoutOpen] = useState(false)

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <SidebarMenuButton
                  size="lg"
                  className="data-open:bg-sidebar-accent data-open:text-sidebar-accent-foreground"
                />
              }
            >
              <Avatar className="size-8 rounded-lg">
                <AvatarFallback className="rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.name}</span>
                <span className="truncate text-xs text-sidebar-foreground/70">
                  {user.role}
                </span>
              </div>
              <ChevronsUpDownIcon className="ml-auto size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="min-w-56 rounded-lg"
              side={isMobile ? "bottom" : "right"}
              align="end"
              sideOffset={4}
            >
              <DropdownMenuGroup>
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-2 py-1.5 text-left text-sm">
                    <Avatar className="size-8 rounded-lg">
                      <AvatarFallback className="rounded-lg">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-medium">{user.name}</span>
                      <span className="truncate text-xs text-muted-foreground">
                        {user.email || user.role}
                      </span>
                    </div>
                  </div>
                </DropdownMenuLabel>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={toggleTheme}>
                {theme === "dark" ? <SunIcon /> : <MoonIcon />}
                {theme === "dark" ? "Usar tema claro" : "Usar tema escuro"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              
              {/* 2. Alteração do evento onClick para abrir o modal */}
              <DropdownMenuItem variant="destructive" onClick={() => setIsLogoutOpen(true)}>
                <LogOutIcon />
                Sair
              </DropdownMenuItem>

            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>

      {/* 3. Componente do Modal de Confirmação */}
      <ConfirmDialog
        open={isLogoutOpen}
        onOpenChange={setIsLogoutOpen}
        title="Deseja realmente sair?"
        description="Sua sessão será encerrada e você precisará fazer login novamente para acessar o sistema."
        confirmLabel="Sim, sair"
        cancelLabel="Cancelar"
        destructive={true} // Deixa o botão de confirmar vermelho
        onConfirm={() => {
          setIsLogoutOpen(false); // Fecha o modal
          onLogout();             // Executa a função de logout real
        }}
      />
    </>
  )
}