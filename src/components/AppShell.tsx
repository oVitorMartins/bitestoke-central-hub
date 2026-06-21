import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { LayoutDashboard, Package, FileBarChart, Settings, LogOut, Plus, User } from "lucide-react";
import { type ReactNode, useState, useEffect } from "react";
import { ProtectedRoute } from "./ProtectedRoute";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", to: "/" },
  { icon: Package, label: "Inventário", to: "/inventario" },
  { icon: FileBarChart, label: "Relatórios", to: "/relatorios" },
  { icon: Settings, label: "Configurações", to: "/configuracoes" },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const [user, setUser] = useState<{ nome: string; perfil: string } | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("bitestoque_user");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch (err) {
        console.error("Failed to parse user session", err);
      }
    }
  }, []);

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    localStorage.removeItem("bitestoque_user");
    navigate({ to: "/login" });
  };

  const nomeExibido = user?.nome || "Vitor Santos";
  const cargoExibido = user?.perfil || "Administrador";

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background p-0 md:p-4 flex flex-col justify-center">
        <div className="mx-auto flex w-full max-w-[1400px] min-h-screen md:min-h-[calc(100vh-2rem)] gap-0 overflow-hidden rounded-none md:rounded-3xl border-0 md:border-2 border-violet/30 bg-background shadow-none md:shadow-sm">
          {/* Sidebar */}
          <aside className="hidden md:flex w-64 min-w-[16rem] shrink-0 flex-col justify-between border-r bg-sidebar p-5">
            <div>
              <div className="mb-8 flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary text-primary-foreground">
                  <Package className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <h1 className="truncate font-bold text-foreground">BitEstoque</h1>
                  <p className="truncate text-[10px] uppercase tracking-wider text-muted-foreground">
                    HMS
                  </p>
                </div>
              </div>
              <nav className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const active = pathname === item.to;
                  return (
                    <Link
                      key={item.label}
                      to={item.to}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                        active
                          ? "bg-sidebar-active text-info"
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
              <Link
                to="/inventario/novo"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-foreground px-4 py-3 text-sm font-semibold text-background transition-opacity hover:opacity-90"
              >
                <Plus className="h-4 w-4" /> Novo Ativo
              </Link>
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
          <main className="min-w-0 flex-1 p-4 md:p-6 pb-20 md:pb-6">
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
          </main>

          {/* Bottom Nav Bar (Mobile only) */}
          <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 border-t bg-sidebar flex items-center justify-around z-40 px-2 shadow-lg">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.to;
              return (
                <Link
                  key={item.label}
                  to={item.to}
                  className={`flex flex-col items-center justify-center gap-1 flex-1 py-1 text-[10px] font-medium transition-colors ${
                    active ? "text-info" : "text-sidebar-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
