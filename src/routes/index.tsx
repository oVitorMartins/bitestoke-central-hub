import { createFileRoute } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Package,
  FileBarChart,
  Settings,
  LifeBuoy,
  LogOut,
  Search,
  Bell,
  Grid3x3,
  Plus,
  QrCode,
  TrendingUp,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "BitEstoque — Painel" },
      { name: "description", content: "Painel principal do sistema de inventário de TI BitEstoque." },
      { property: "og:title", content: "BitEstoque — Painel" },
      { property: "og:description", content: "Painel principal do sistema de inventário de TI BitEstoque." },
    ],
  }),
  component: Dashboard,
});

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", active: true },
  { icon: Package, label: "Inventário" },
  { icon: FileBarChart, label: "Relatórios" },
  { icon: Settings, label: "Configurações" },
];

const movimentacoes = [
  { ativo: "Notebook Dell XPS 13", id: "#DXP-1029", acao: "TRANSFERÊNCIA", acaoTone: "info", destino: "Setor Financeiro", data: "Hoje, 10:45" },
  { ativo: "Monitor LG UltraWide", id: "#MON-4421", acao: "NOVO CADASTRO", acaoTone: "success", destino: "Almoxarifado Central", data: "Hoje, 09:12" },
  { ativo: 'MacBook Pro 14"', id: "#MAC-9980", acao: "MANUTENÇÃO", acaoTone: "warning", destino: "Suporte Técnico", data: "Ontem, 16:30" },
  { ativo: "Cadeira Aeron Miller", id: "#MOB-2211", acao: "ATRIBUIÇÃO", acaoTone: "violet", destino: "RH - Sala 04", data: "Ontem, 14:00" },
  { ativo: 'iPad Pro 11"', id: "#TAB-5561", acao: "RETORNO", acaoTone: "danger", destino: "TI - Inventory", data: "Ontem, 11:20" },
] as const;

const categorias = [
  { nome: "Notebooks", pct: 45, color: "oklch(0.2 0.02 270)" },
  { nome: "Monitores", pct: 25, color: "oklch(0.45 0.02 270)" },
  { nome: "Periféricos", pct: 15, color: "oklch(0.7 0.02 270)" },
  { nome: "Outros", pct: 15, color: "oklch(0.85 0.03 290)" },
];

function toneClass(tone: string) {
  switch (tone) {
    case "info": return "bg-info-bg text-info";
    case "success": return "bg-success-bg text-success";
    case "warning": return "bg-warning-bg text-warning";
    case "danger": return "bg-danger-bg text-danger";
    case "violet": return "bg-violet-bg text-violet";
    default: return "bg-muted text-muted-foreground";
  }
}

function DonutChart() {
  const radius = 70;
  const stroke = 22;
  const c = 2 * Math.PI * radius;
  let offset = 0;
  return (
    <div className="relative grid place-items-center">
      <svg width="180" height="180" viewBox="0 0 180 180" className="-rotate-90">
        {categorias.map((cat) => {
          const len = (cat.pct / 100) * c;
          const el = (
            <circle
              key={cat.nome}
              cx="90"
              cy="90"
              r={radius}
              fill="none"
              stroke={cat.color}
              strokeWidth={stroke}
              strokeDasharray={`${len} ${c - len}`}
              strokeDashoffset={-offset}
            />
          );
          offset += len;
          return el;
        })}
      </svg>
      <div className="absolute text-center">
        <div className="text-xs text-muted-foreground">Total</div>
        <div className="text-2xl font-bold tracking-tight">1.2k+</div>
      </div>
    </div>
  );
}

function Dashboard() {
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
                <p className="truncate text-xs text-muted-foreground">Hospital Unidade Suzano</p>
              </div>
            </div>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <a
                    key={item.label}
                    href="#"
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                      item.active
                        ? "bg-sidebar-active text-info"
                        : "text-sidebar-foreground hover:bg-muted"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </a>
                );
              })}
            </nav>
          </div>
          <div className="space-y-3">
            <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90">
              <Plus className="h-4 w-4" /> Novo Ativo
            </button>
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
                placeholder="Buscar ativos, usuários ou IDs..."
                className="w-full rounded-full border bg-muted/50 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-info"
              />
            </div>
            <div className="ml-auto flex items-center gap-3">
              <button className="grid h-9 w-9 place-items-center rounded-lg text-muted-foreground hover:bg-muted"><Bell className="h-4 w-4" /></button>
              <button className="grid h-9 w-9 place-items-center rounded-lg text-muted-foreground hover:bg-muted"><Grid3x3 className="h-4 w-4" /></button>
              <div className="h-9 w-9 rounded-full bg-gradient-to-br from-violet to-info" />
            </div>
          </div>

          {/* Metric cards */}
          <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard label="Total de Ativos" value="1.240" footer={<span className="flex items-center gap-1 text-xs text-muted-foreground"><TrendingUp className="h-3 w-3" /> +12 este mês</span>} />
            <MetricCard label="Em Uso" value="980" footer={<div className="h-1.5 w-full rounded-full bg-muted"><div className="h-full w-[79%] rounded-full bg-primary" /></div>} />
            <MetricCard label="Em Manutenção" value="45" valueTone="warning" footer={<span className="text-[10px] font-bold tracking-wider text-warning">ALERTA</span>} />
            <MetricCard label="Aguardando Manutenção" value="12" valueTone="danger" footer={<span className="rounded-md bg-danger-bg px-2 py-0.5 text-[10px] font-bold tracking-wider text-danger">CRÍTICO</span>} />
          </div>

          {/* Action cards */}
          <div className="mb-5 grid grid-cols-1 gap-4 md:grid-cols-2">
            <button className="group relative flex items-center gap-4 overflow-hidden rounded-2xl bg-primary p-5 text-left text-primary-foreground transition-transform hover:scale-[1.01]">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/20">
                <Plus className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="font-semibold">Cadastrar Novo Ativo</div>
                <div className="text-xs text-primary-foreground/60">Adicionar manualmente hardware ou software ao sistema.</div>
              </div>
            </button>
            <button className="group flex items-center gap-4 rounded-2xl border bg-card p-5 text-left transition-colors hover:bg-muted">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-muted">
                <QrCode className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="font-semibold">Escanear QR Code</div>
                <div className="text-xs text-muted-foreground">Auditoria rápida através de identificação por câmera.</div>
              </div>
            </button>
          </div>

          {/* Bottom grid */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <section className="rounded-2xl border bg-card p-5 lg:col-span-2">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-semibold">Movimentações Recentes</h2>
                <a href="#" className="text-xs font-medium text-muted-foreground hover:text-foreground">Ver tudo</a>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    <th className="pb-3 text-left">Ativo</th>
                    <th className="pb-3 text-left">Ação</th>
                    <th className="pb-3 text-left">Destino</th>
                    <th className="pb-3 text-left">Data</th>
                  </tr>
                </thead>
                <tbody>
                  {movimentacoes.map((m, i) => (
                    <tr key={i} className="border-t">
                      <td className="py-3.5 pr-4">
                        <div className="font-semibold text-foreground">{m.ativo}</div>
                        <div className="font-mono text-[10px] uppercase text-muted-foreground">ID: {m.id}</div>
                      </td>
                      <td className="py-3.5 pr-4">
                        <span className={`inline-block rounded-md px-2 py-1 text-[10px] font-bold tracking-wider ${toneClass(m.acaoTone)}`}>
                          {m.acao}
                        </span>
                      </td>
                      <td className="py-3.5 pr-4 text-muted-foreground">{m.destino}</td>
                      <td className="py-3.5 text-muted-foreground">{m.data}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>

            <section className="rounded-2xl border bg-card p-5">
              <h2 className="mb-4 font-semibold">Distribuição por Categoria</h2>
              <div className="mb-5 flex justify-center">
                <DonutChart />
              </div>
              <ul className="space-y-2.5 text-sm">
                {categorias.map((c) => (
                  <li key={c.nome} className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                      {c.nome}
                    </span>
                    <span className="font-semibold text-muted-foreground">{c.pct}%</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  valueTone,
  footer,
}: {
  label: string;
  value: string;
  valueTone?: "warning" | "danger";
  footer?: React.ReactNode;
}) {
  const tone =
    valueTone === "warning" ? "text-warning" : valueTone === "danger" ? "text-danger" : "text-foreground";
  return (
    <div className="rounded-2xl border bg-card p-5">
      <div className="mb-3 text-xs font-medium text-muted-foreground">{label}</div>
      <div className={`mb-3 text-4xl font-bold tracking-tight ${tone}`}>{value}</div>
      <div className="min-h-[18px]">{footer}</div>
    </div>
  );
}
