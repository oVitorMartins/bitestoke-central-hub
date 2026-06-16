import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  SlidersHorizontal,
  ChevronDown,
  Download,
  Eye,
  Pencil,
  QrCode,
  ChevronLeft,
  ChevronRight,
  Laptop,
  Monitor,
  Router as RouterIcon,
  Printer,
  X,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/inventario/")({
  head: () => ({
    meta: [
      { title: "Inventário — AssetTrack IT" },
      { name: "description", content: "Gestão e listagem de todos os ativos de TI da corporação." },
      { property: "og:title", content: "Inventário — AssetTrack IT" },
      { property: "og:description", content: "Gestão e listagem de todos os ativos de TI da corporação." },
    ],
  }),
  component: InventarioPage,
});

type Status = "Em Uso" | "Manutenção" | "Estoque" | "Aguardando Descarte";

type Ativo = {
  nome: string;
  descricao: string;
  specs: string;
  icon: typeof Laptop;
  categoria: string;
  patrimonio: string;
  status: Status;
  localizacao: string;
};

const ativos: Ativo[] = [
  {
    nome: "Notebook Lenovo P15",
    descricao: "",
    specs: "Core i9 · 32GB RAM",
    icon: Laptop,
    categoria: "Notebook",
    patrimonio: "PAT-2023-001",
    status: "Em Uso",
    localizacao: "TI",
  },
  {
    nome: 'Monitor Dell 27"',
    descricao: "",
    specs: "4K Resolution · UltraSharp",
    icon: Monitor,
    categoria: "Monitor",
    patrimonio: "PAT-2023-045",
    status: "Manutenção",
    localizacao: "RH",
  },
  {
    nome: "Cisco ISR 4331",
    descricao: "",
    specs: "Roteador Enterprise",
    icon: RouterIcon,
    categoria: "Rede",
    patrimonio: "PAT-2023-089",
    status: "Estoque",
    localizacao: "TI - Almoxarifado",
  },
  {
    nome: "HP LaserJet Pro",
    descricao: "",
    specs: "Impressora Multifuncional",
    icon: Printer,
    categoria: "Periféricos",
    patrimonio: "PAT-2022-112",
    status: "Aguardando Descarte",
    localizacao: "Operações",
  },
];

function statusClass(s: Status) {
  switch (s) {
    case "Em Uso":
      return "bg-success-bg text-success ring-1 ring-success/30";
    case "Manutenção":
      return "bg-warning-bg text-warning ring-1 ring-warning/30";
    case "Estoque":
      return "bg-info-bg text-info ring-1 ring-info/30";
    case "Aguardando Descarte":
      return "bg-danger-bg text-danger ring-1 ring-danger/30";
  }
}

function FilterChip({ label }: { label: string }) {
  return (
    <button className="inline-flex items-center gap-2 rounded-lg border bg-card px-3 py-2 text-xs font-medium text-foreground hover:bg-muted">
      {label}
      <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
    </button>
  );
}

function InventarioPage() {
  const [qrAtivo, setQrAtivo] = useState<Ativo | null>(null);

  return (
    <AppShell>
      {/* Header */}
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Gestão de Inventário</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Visualize e gerencie todos os ativos de <span className="text-info">TI</span> da corporação.
          </p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-lg border bg-card px-4 py-2.5 text-sm font-medium hover:bg-muted">
          <Download className="h-4 w-4" /> Exportar
        </button>
      </div>

      {/* Filters bar */}
      <div className="mb-5 flex flex-wrap items-center gap-3 rounded-2xl border bg-card px-4 py-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
          <SlidersHorizontal className="h-4 w-4" /> Filtros:
        </div>
        <FilterChip label="Todas Categorias" />
        <FilterChip label="Todos Status" />
        <FilterChip label="Todos Setores" />
        <button className="ml-auto text-xs font-semibold text-info hover:underline">Limpar filtros</button>
      </div>

      {/* Table */}
      <section className="rounded-2xl border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              <th className="px-5 py-3 text-left">Nome do Ativo</th>
              <th className="px-3 py-3 text-left">Categoria</th>
              <th className="px-3 py-3 text-left">Patrimônio</th>
              <th className="px-3 py-3 text-left">Status</th>
              <th className="px-3 py-3 text-left">Localização</th>
              <th className="px-5 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {ativos.map((a) => {
              const Icon = a.icon;
              return (
                <tr key={a.patrimonio} className="border-t">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-foreground">{a.nome}</div>
                        <div className="text-[11px] text-muted-foreground">{a.specs}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-4 text-muted-foreground">{a.categoria}</td>
                  <td className="px-3 py-4 font-mono text-xs text-muted-foreground">{a.patrimonio}</td>
                  <td className="px-3 py-4">
                    <span className={`inline-block rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusClass(a.status)}`}>
                      {a.status}
                    </span>
                  </td>
                  <td className="px-3 py-4 text-muted-foreground">{a.localizacao}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        title="Visualizar"
                        className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        title="Editar"
                        className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        title="Ver QR Code"
                        onClick={() => setQrAtivo(a)}
                        className="grid h-8 w-8 place-items-center rounded-md bg-foreground text-background transition-opacity hover:opacity-90"
                      >
                        <QrCode className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t px-5 py-3">
          <span className="text-xs text-muted-foreground">Mostrando 1-4 de 128 ativos</span>
          <div className="flex items-center gap-1">
            <button className="grid h-8 w-8 place-items-center rounded-md border text-muted-foreground hover:bg-muted">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button className="grid h-8 w-8 place-items-center rounded-md bg-foreground text-xs font-semibold text-background">
              1
            </button>
            <button className="grid h-8 w-8 place-items-center rounded-md border text-xs font-semibold hover:bg-muted">
              2
            </button>
            <button className="grid h-8 w-8 place-items-center rounded-md border text-xs font-semibold hover:bg-muted">
              3
            </button>
            <button className="grid h-8 w-8 place-items-center rounded-md border text-muted-foreground hover:bg-muted">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      {/* QR Modal */}
      {qrAtivo && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={() => setQrAtivo(null)}
        >
          <div
            className="relative w-full max-w-sm rounded-2xl border bg-card p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setQrAtivo(null)}
              className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-md text-muted-foreground hover:bg-muted"
              aria-label="Fechar"
            >
              <X className="h-4 w-4" />
            </button>
            <h3 className="text-lg font-bold">QR Code do Ativo</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Escaneie para acessar os detalhes deste ativo.
            </p>
            <div className="mt-5 grid place-items-center rounded-xl border bg-background p-5">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=0&data=${encodeURIComponent(
                  `${qrAtivo.patrimonio}|${qrAtivo.nome}`,
                )}`}
                alt={`QR Code ${qrAtivo.patrimonio}`}
                width={220}
                height={220}
              />
            </div>
            <div className="mt-4 space-y-1 text-center">
              <div className="font-semibold">{qrAtivo.nome}</div>
              <div className="font-mono text-xs text-muted-foreground">{qrAtivo.patrimonio}</div>
            </div>
            <button
              onClick={() => setQrAtivo(null)}
              className="mt-5 w-full rounded-lg bg-foreground py-2.5 text-sm font-semibold text-background hover:opacity-90"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </AppShell>
  );
}
