import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, QrCode } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { auditoria } from "@/lib/ativos";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "BitEstoque — Painel" },
      {
        name: "description",
        content: "Painel principal do sistema de inventário de TI BitEstoque.",
      },
      { property: "og:title", content: "BitEstoque — Painel" },
      {
        property: "og:description",
        content: "Painel principal do sistema de inventário de TI BitEstoque.",
      },
    ],
  }),
  component: Dashboard,
});

const categorias = [
  { nome: "Notebooks", pct: 45, barColor: "bg-zinc-900 dark:bg-zinc-100" },
  { nome: "Monitores", pct: 25, barColor: "bg-zinc-700 dark:bg-zinc-400" },
  { nome: "Periféricos", pct: 15, barColor: "bg-zinc-500 dark:bg-zinc-500" },
  { nome: "Outros", pct: 15, barColor: "bg-zinc-300 dark:bg-zinc-600" },
];

function Dashboard() {
  return (
    <AppShell>
      {/* Metric cards */}
      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Total de Ativos" value="1.240" />
        <MetricCard
          label="Em Uso"
          value="980"
          footer={
            <div className="space-y-1.5">
              <div className="h-1.5 w-full rounded-full bg-zinc-100 dark:bg-zinc-800">
                <div className="h-full w-[79%] rounded-full bg-slate-600 dark:bg-slate-400" />
              </div>
              <div className="text-xs text-muted-foreground">79% da capacidade</div>
            </div>
          }
        />
        <MetricCard
          label="Em Manutenção"
          value="45"
          valueColor="text-amber-600 dark:text-amber-500"
          badge={
            <span className="rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-bold tracking-wider text-amber-600 border border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/50">
              ALERTA
            </span>
          }
          footer={<div className="text-xs text-muted-foreground">Verificando integridade</div>}
        />
        <MetricCard
          label="Em Estoque"
          value="215"
          badge={
            <span className="rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-bold tracking-wider text-blue-600 border border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900/50">
              ESTOQUE
            </span>
          }
          footer={<div className="text-xs text-muted-foreground">Pronto para distribuição</div>}
        />
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
            <div className="text-xs text-primary-foreground/60">
              Adicionar manualmente hardware ou software ao sistema.
            </div>
          </div>
        </Link>
        <button className="group flex items-center gap-4 rounded-2xl border bg-card p-5 text-left transition-colors hover:bg-muted">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-muted">
            <QrCode className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="font-semibold">Escanear QR Code</div>
            <div className="text-xs text-muted-foreground">
              Auditoria rápida através de identificação por câmera.
            </div>
          </div>
        </button>
      </div>

      {/* Bottom grid */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <section className="rounded-2xl border bg-card p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">Movimentações Recentes</h2>
            <Link
              to="/relatorios"
              className="text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              Ver tudo
            </Link>
          </div>
          <div className="hidden md:block overflow-x-auto">
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
                    <td className="py-3.5 pr-4 text-muted-foreground whitespace-nowrap">
                      {a.data}
                    </td>
                    <td className="py-3.5 pr-4 font-medium text-foreground">{a.responsavel}</td>
                    <td className="py-3.5 pr-4 font-mono text-xs">{a.ativo}</td>
                    <td className="py-3.5 text-muted-foreground">{a.movimentacao}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile View */}
          <div className="block md:hidden space-y-3">
            {auditoria.slice(0, 5).map((a, i) => (
              <div key={i} className="rounded-xl border bg-card p-4 space-y-2 text-sm">
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="font-mono text-xs font-semibold text-foreground">{a.ativo}</span>
                  <span className="text-xs text-muted-foreground">{a.data}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                  <div>
                    <span className="text-muted-foreground block font-medium">Responsável:</span>
                    <span className="text-foreground font-semibold">{a.responsavel}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block font-medium">Movimentação:</span>
                    <span className="text-foreground">{a.movimentacao}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border bg-card p-5">
          <h2 className="mb-4 font-semibold">Distribuição por Categoria</h2>
          <div className="space-y-4">
            {categorias.map((c) => (
              <div key={c.nome} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm font-medium">
                  <span className="text-foreground">{c.nome}</span>
                  <span className="text-muted-foreground">{c.pct}%</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${c.barColor}`}
                    style={{ width: `${c.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}

function MetricCard({
  label,
  value,
  valueColor = "text-foreground",
  badge,
  footer,
}: {
  label: string;
  value: string;
  valueColor?: string;
  badge?: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div
      className={`rounded-2xl border bg-card p-5 flex flex-col h-[145px] ${
        footer ? "justify-between" : "justify-center"
      }`}
    >
      <div className={footer ? "" : "space-y-1"}>
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-medium text-muted-foreground">{label}</span>
          {badge}
        </div>
        <div className={`text-4xl font-bold tracking-tight ${valueColor}`}>{value}</div>
      </div>
      {footer && <div className="flex flex-col justify-end">{footer}</div>}
    </div>
  );
}
