import {
  Avatar,
  AvatarFallback,
  AvatarImage,
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
import { Badge } from "@/components/ui/badge"
import { EllipsisVerticalIcon, CircleUserRoundIcon, BellIcon, LogOutIcon, ShieldCheckIcon } from "lucide-react"
import { authClient } from "@/lib/auth-client"
import { useNavigate } from "react-router"
import { toast } from "sonner"

function getInitials(name: string): string {
  if (!name) return "US"
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[1][0]).toUpperCase()
}

export function NavUser({
  user: initialUser,
}: {
  user?: {
    name: string
    email: string
    avatar?: string
  }
}) {
  const { data: session } = authClient.useSession()
  const navigate = useNavigate()
  const { isMobile } = useSidebar()

  // Priorité à la session live Better Auth
  const currentUser = session?.user
  const name = currentUser?.name || initialUser?.name || "Administrateur"
  const email = currentUser?.email || initialUser?.email || "admin@medtrack.sn"
  const avatar = currentUser?.image || initialUser?.avatar || ""
  const role = (currentUser as { role?: string | null })?.role || "admin"

  const handleSignOut = async () => {
    try {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            toast.success("Déconnexion réussie", {
              description: "Vous avez été déconnecté avec succès.",
            })
            navigate("/auth/sign-in", { replace: true })
          },
          onError: (ctx) => {
            toast.error("Erreur de déconnexion", {
              description: ctx.error.message,
            })
          },
        },
      })
    } catch {
      toast.error("Une erreur est survenue lors de la déconnexion.")
    }
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton size="lg" className="aria-expanded:bg-muted hover:bg-sidebar-accent" />
            }
          >
            <Avatar className="size-8 rounded-lg border shadow-2xs shrink-0">
              <AvatarImage src={avatar} alt={name} />
              <AvatarFallback className="rounded-lg bg-primary/10 text-primary font-bold text-xs">
                {getInitials(name)}
              </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="truncate font-semibold text-xs text-foreground">{name}</span>
                <Badge variant="outline" className="h-3.5 px-1 text-[9px] uppercase font-bold tracking-wider text-primary border-primary/30">
                  {role}
                </Badge>
              </div>
              <span className="truncate text-[11px] text-muted-foreground font-medium">
                {email}
              </span>
            </div>
            <EllipsisVerticalIcon className="ml-auto size-4 text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="min-w-60 rounded-xl p-1 shadow-md"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={6}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2.5 px-2 py-2 text-left text-sm bg-muted/40 rounded-lg">
                  <Avatar className="size-9 rounded-lg border shadow-xs shrink-0">
                    <AvatarImage src={avatar} alt={name} />
                    <AvatarFallback className="rounded-lg bg-primary/10 text-primary font-bold text-xs">
                      {getInitials(name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight min-w-0">
                    <span className="truncate font-bold text-xs text-foreground">{name}</span>
                    <span className="truncate text-[11px] text-muted-foreground">
                      {email}
                    </span>
                    <div className="mt-1">
                      <span className="text-[10px] inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                        <ShieldCheckIcon className="size-3" />
                        Rôle : {role.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem className="cursor-pointer gap-2 text-xs" onClick={() => navigate("/admin/profil")}>
                <CircleUserRoundIcon className="size-4 text-muted-foreground" />
                Mon profil
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer gap-2 text-xs">
                <BellIcon className="size-4 text-muted-foreground" />
                Notifications
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={handleSignOut}
              className="cursor-pointer gap-2 text-xs font-semibold text-destructive focus:bg-destructive/10 focus:text-destructive"
            >
              <LogOutIcon className="size-4" />
              Se déconnecter
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
