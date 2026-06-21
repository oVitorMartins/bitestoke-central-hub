import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, QrCode, TrendingUp } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { auditoria } from "@/lib/ativos";

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

const categorias = [
  { nome: "Notebooks", pct: 45, color: "oklch(0.2 0.02 270)" },
  { nome: "Monitores", pct: 25, color: "oklch(0.45 0.02 270)" },
  { nome: "Periféricos", pct: 15, color: "oklch(0.7 0.02 270)" },
  { nome: "Outros", pct: 15, color: "oklch(0.85 0.03 290)" },
];

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
    <AppShell>
      {/* Metric cards */}
      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Total de Ativos" value="1.240" footer={<span className="flex items-center gap-1 text-xs text-muted-foreground"><TrendingUp className="h-3 w-3" /> +12 este mês</span>} />
        <MetricCard label="Em Uso" value="980" footer={<div className="h-1.5 w-full rounded-full bg-muted"><div className="h-full w-[79%] rounded-full bg-primary" /></div>} />
        <MetricCard label="Em Manutenção" value="45" valueTone="warning" footer={<span className="text-[10px] font-bold tracking-wider text-warning">ALERTA</span>} />
        <MetricCard label="Ativos Disponíveis" value="215" footer={<span className="rounded-md bg-success-bg px-2 py-0.5 text-[10px] font-bold tracking-wider text-success">DISPONÍVEL</span>} />
      </div>

      {/* Action cards */}
      <div className="mb-5 grid grid-cols-1 gap-4 md:grid-cols-2">
        <Link
          to="/inventario/novo"
          className="group relative flex items-center gap-4 overflow-hidden rounded-2xl bg-primary p-5 text-left text-primary-foreground transition-transform hover:scale-[1.01]"
        >
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/20">
            <Plus className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="font-semibold">Cadastrar Novo Ativo</div>
            <div className="text-xs text-primary-foreground/60">Adicionar manualmente hardware ou software ao sistema.</div>
          </div>
        </Link>
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
            <Link to="/relatorios" className="text-xs font-medium text-muted-foreground hover:text-foreground">Ver tudo</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  <th className="pb-3 text-left">Data</th>
                  <th className="pb-3 text-left">Responsável pela Movimentação</th>
                  <th className="pb-3 text-left">Ativo Afetado</th>
                  <th className="pb-3 text-left">Movimentação</th>
                </tr>
              </thead>
              <tbody>
                {auditoria.slice(0, 5).map((a, i) => (
                  <tr key={i} className="border-t">
                    <td className="py-3.5 pr-4 text-muted-foreground whitespace-nowrap">{a.data}</td>
                    <td className="py-3.5 pr-4 font-medium text-foreground">{a.responsavel}</td>
                    <td className="py-3.5 pr-4 font-mono text-xs">{a.ativo}</td>
                    <td className="py-3.5 text-muted-foreground">{a.movimentacao}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
    </AppShell>
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
