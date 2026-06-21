import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Package,
  FileBarChart,
  Settings,
  LifeBuoy,
  LogOut,
  Search,
  Plus,
} from "lucide-react";
import type { ReactNode } from "react";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", to: "/" },
  { icon: Package, label: "Inventário", to: "/inventario" },
  { icon: FileBarChart, label: "Relatórios", to: "/relatorios" },
  { icon: Settings, label: "Configurações", to: "/configuracoes" },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="mx-auto flex max-w-[1400px] gap-0 overflow-hidden rounded-3xl border-2 border-violet/30 bg-background shadow-sm">
        {/* Sidebar */}
        <aside className="flex w-64 shrink-0 flex-col justify-between border-r bg-sidebar p-5">
          <div>
            <div className="mb-8 flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary text-primary-foreground">
                <Package className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h1 className="truncate font-bold text-foreground">BitEstoque</h1>
                <p className="truncate text-[10px] uppercase tracking-wider text-muted-foreground">
                  Hospital Unidade Suzano
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
            <Link to="/inventario/novo" className="flex w-full items-center justify-center gap-2 rounded-xl bg-foreground px-4 py-3 text-sm font-semibold text-background transition-opacity hover:opacity-90">
              <Plus className="h-4 w-4" /> Novo Ativo
            </Link>
            <div className="space-y-1 pt-2">
              <a href="#" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground hover:bg-muted">
                <LifeBuoy className="h-4 w-4" /> Suporte
              </a>
              <a href="#" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground hover:bg-muted">
                <LogOut className="h-4 w-4" /> Sair
              </a>
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className="min-w-0 flex-1 p-6">
          {/* Topbar */}
          <div className="mb-6 flex items-center gap-4">
            <div className="relative max-w-md flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar por nome, patrimônio ou série..."
                className="w-full rounded-full border bg-muted/50 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-info"
              />
            </div>
            <div className="ml-auto flex items-center gap-3">
              <div className="text-right">
                <div className="text-sm font-semibold leading-tight">Admin Usuário</div>
                <div className="text-[11px] text-muted-foreground leading-tight">Gestor Global</div>
              </div>
              <div className="h-9 w-9 rounded-full bg-gradient-to-br from-violet to-info" />
            </div>
          </div>

          {children}
        </main>
      </div>
    </div>
  );
}
