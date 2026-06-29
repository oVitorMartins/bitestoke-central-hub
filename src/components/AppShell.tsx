import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { LayoutDashboard, Package, FileBarChart, Settings, LogOut, User, Key } from "lucide-react";
import { type ReactNode, useState, useEffect } from "react";
import { ProtectedRoute } from "./ProtectedRoute";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { pb } from "@/lib/pocketbase";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", to: "/" },
  { icon: Package, label: "Inventário", to: "/inventario" },
  { icon: Key, label: "Licenças", to: "/licencas" },
  { icon: FileBarChart, label: "Relatórios", to: "/relatorios" },
  { icon: Settings, label: "Configurações", to: "/configuracoes" },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();

  const [model, setModel] = useState(pb.authStore.model);

  useEffect(() => {
    setModel(pb.authStore.model);
    return pb.authStore.onChange((token, m) => {
      setModel(m);
    });
  }, []);

  const getPerfilValue = (m: any): string => {
    if (!m?.perfil) return "";
    if (Array.isArray(m.perfil)) {
      return m.perfil[0] || "";
    }
    return m.perfil;
  };

  const perfil = getPerfilValue(model);
  const isTecnico = perfil === "Técnico";

  const filteredNavItems = navItems.filter((item) => {
    if (isTecnico && item.to === "/configuracoes") return false;
    return true;
  });

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    pb.authStore.clear();
    navigate({ to: "/login" });
  };

  const nomeExibido = model?.name || model?.nome || model?.email || "Vitor Santos";
  const cargoExibido = perfil || "Administrador";

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background p-0 md:p-4 flex flex-col justify-center">
        <div className="mx-auto flex w-full max-w-[1400px] min-h-screen md:min-h-[calc(100vh-2rem)] gap-0 overflow-hidden rounded-none md:rounded-3xl border-0 md:border-2 border-border bg-background shadow-none md:shadow-sm">
          {/* Sidebar */}
          <aside className="hidden md:flex w-64 min-w-[16rem] shrink-0 flex-col justify-between bg-sidebar p-5 relative z-10 shadow-xl shadow-zinc-200/50 dark:shadow-black/20">
            <div>
              <div className="mb-8 flex items-center">
                <h1 className="text-xl font-bold bg-gradient-to-r from-zinc-900 via-zinc-700 to-zinc-500 dark:from-white dark:via-zinc-100 dark:to-zinc-400 bg-clip-text text-transparent tracking-tight">
                  BitEstoque
                </h1>
              </div>
              <nav className="space-y-1">
                {filteredNavItems.map((item) => {
                  const Icon = item.icon;
                  const active = pathname === item.to;
                  return (
                    <Link
                      key={item.label}
                      to={item.to}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                        active
                          ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50 font-semibold"
                          : "text-sidebar-foreground hover:bg-muted"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </div>
            <div className="space-y-3">
              <div className="space-y-1 pt-2">
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground hover:bg-muted cursor-pointer"
                >
                  <LogOut className="h-4 w-4" /> Sair
                </button>
              </div>
            </div>
          </aside>

          {/* Main */}
          <main className="min-w-0 flex-1 p-4 md:p-6 pb-20 md:pb-6 flex flex-col justify-between">
            <div className="flex-1">
              <div className="mb-6 flex items-center justify-end gap-4">
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-sm font-semibold leading-tight">{nomeExibido}</div>
                    <div className="text-[11px] text-muted-foreground leading-tight">
                      {cargoExibido}
                    </div>
                  </div>
                  <Avatar className="h-9 w-9 border border-border">
                    <AvatarFallback className="bg-muted text-muted-foreground">
                      <User className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                </div>
              </div>

              {children}
            </div>

            <footer className="mt-8 py-4 border-t text-center text-xs text-muted-foreground shrink-0">
              Desenvolvido por SMARTins Software Solutions
            </footer>
          </main>

          {/* Bottom Nav Bar (Mobile only) */}
          <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 border-t bg-sidebar flex items-center justify-around z-40 px-2 shadow-lg">
            {filteredNavItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.to;
              return (
                <Link
                  key={item.label}
                  to={item.to}
                  className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 text-[10px] font-medium transition-colors ${
                    active
                      ? "text-zinc-950 dark:text-zinc-50 font-semibold"
                      : "text-sidebar-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
            <button
              onClick={handleLogout}
              className="flex flex-col items-center justify-center gap-1 flex-1 py-1 text-[10px] font-medium transition-colors text-sidebar-foreground hover:text-foreground cursor-pointer"
            >
              <LogOut className="h-5 w-5" />
              <span>Sair</span>
            </button>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
