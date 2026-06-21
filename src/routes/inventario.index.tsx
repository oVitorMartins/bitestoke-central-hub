import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  SlidersHorizontal,
  ChevronDown,
  Download,
  Eye,
  Pencil,
  QrCode,
  ChevronLeft,
  ChevronRight,
  Printer,
  X,
  Search,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { toast } from "sonner";
import {
  ativos as ativosMock,
  categorias,
  statusList,
  setores,
  type Ativo,
  type Status,
} from "@/lib/ativos";

export const Route = createFileRoute("/inventario/")({
  head: () => ({
    meta: [
      { title: "Inventário — BitEstoque" },
      { name: "description", content: "Gestão e listagem de todos os ativos de TI da corporação." },
      { property: "og:title", content: "Inventário — BitEstoque" },
      {
        property: "og:description",
        content: "Gestão e listagem de todos os ativos de TI da corporação.",
      },
    ],
  }),
  component: InventarioPage,
});

function statusClass(s: Status) {
  switch (s) {
    case "Em Uso":
      return "bg-success-bg text-success ring-1 ring-success/30";
    case "Em Manutenção":
      return "bg-warning-bg text-warning ring-1 ring-warning/30";
    case "Estoque":
      return "bg-info-bg text-info ring-1 ring-info/30";
    case "Descarte":
      return "bg-danger-bg text-danger ring-1 ring-danger/30";
  }
}

function SelectChip({
  value,
  onChange,
  options,
  allLabel,
}: {
  value: string;
  onChange: (v: string) => void;
  options: readonly string[];
  allLabel: string;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none rounded-lg border bg-card py-2 pl-3 pr-8 text-xs font-medium text-foreground hover:bg-muted focus:outline-none"
      >
        <option value="">{allLabel}</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
    </div>
  );
}

function InventarioPage() {
  const navigate = useNavigate();
  const [qrAtivo, setQrAtivo] = useState<Ativo | null>(null);
  const [viewAtivo, setViewAtivo] = useState<Ativo | null>(null);

  const [busca, setBusca] = useState("");
  const [fCategoria, setFCategoria] = useState("");
  const [fStatus, setFStatus] = useState("");
  const [fSetor, setFSetor] = useState("");

  const filtered = useMemo(() => {
    const q = busca.trim().toLowerCase();
    return ativosMock.filter((a) => {
      if (fCategoria && a.categoria !== fCategoria) return false;
      if (fStatus && a.status !== fStatus) return false;
      if (fSetor && a.localizacao !== fSetor) return false;
      if (q) {
        const hay = `${a.nome} ${a.patrimonio} ${a.serie}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [busca, fCategoria, fStatus, fSetor]);

  function limparFiltros() {
    setBusca("");
    setFCategoria("");
    setFStatus("");
    setFSetor("");
  }

  return (
    <AppShell>
      {/* Header */}
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Gestão de Inventário</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Visualize e gerencie todos os ativos de <span className="text-info">TI</span> da
            corporação.
          </p>
        </div>
        <button
          onClick={() => {
            toast.info("Exportando inventário para Excel (CSV)...");
            setTimeout(() => toast.success("Download concluído com sucesso!"), 1000);
          }}
          className="inline-flex items-center gap-2 rounded-lg border bg-card px-4 py-2.5 text-sm font-medium hover:bg-muted"
        >
          <Download className="h-4 w-4" /> Exportar
        </button>
      </div>

      {/* Search */}
      <div className="mb-3 relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar por nome, patrimônio ou série..."
          className="w-full rounded-2xl border bg-card py-2.5 pl-10 pr-4 text-sm placeholder:text-muted-foreground/70 focus:border-info focus:outline-none"
        />
      </div>

      {/* Filters bar */}
      <div className="mb-5 flex flex-wrap items-center gap-3 rounded-2xl border bg-card px-4 py-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
          <SlidersHorizontal className="h-4 w-4" /> Filtros:
        </div>
        <SelectChip
          value={fCategoria}
          onChange={setFCategoria}
          options={categorias}
          allLabel="Todas Categorias"
        />
        <SelectChip
          value={fStatus}
          onChange={setFStatus}
          options={statusList}
          allLabel="Todos Status"
        />
        <SelectChip
          value={fSetor}
          onChange={setFSetor}
          options={setores}
          allLabel="Todos Setores"
        />
        <button
          onClick={limparFiltros}
          className="ml-auto text-xs font-semibold text-info hover:underline"
        >
          Limpar filtros
        </button>
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
            {filtered.map((a) => {
              const Icon = a.icon;
              return (
                <tr key={a.id} className="border-t">
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
                  <td className="px-3 py-4 font-mono text-xs text-muted-foreground">
                    {a.patrimonio}
                  </td>
                  <td className="px-3 py-4">
                    <span
                      className={`inline-block rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusClass(a.status)}`}
                    >
                      {a.status}
                    </span>
                  </td>
                  <td className="px-3 py-4 text-muted-foreground">{a.localizacao}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        title="Visualizar"
                        onClick={() => setViewAtivo(a)}
                        className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        title="Editar"
                        onClick={() =>
                          navigate({ to: "/inventario/editar/$id", params: { id: a.id } })
                        }
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
            {filtered.length === 0 && (
              <tr className="border-t">
                <td colSpan={6} className="px-5 py-10 text-center text-sm text-muted-foreground">
                  Nenhum ativo encontrado com os filtros aplicados.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t px-5 py-3">
          <span className="text-xs text-muted-foreground">
            Mostrando {filtered.length} de {ativosMock.length} ativos
          </span>
          <div className="flex items-center gap-1">
            <button className="grid h-8 w-8 place-items-center rounded-md border text-muted-foreground hover:bg-muted">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button className="grid h-8 w-8 place-items-center rounded-md bg-foreground text-xs font-semibold text-background">
              1
            </button>
            <button className="grid h-8 w-8 place-items-center rounded-md border text-muted-foreground hover:bg-muted">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Sheet — Ficha completa do ativo */}
      <Sheet open={!!viewAtivo} onOpenChange={(o) => !o && setViewAtivo(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-md">
          {viewAtivo && (
            <>
              <SheetHeader>
                <SheetTitle>Ficha Completa do Ativo</SheetTitle>
                <SheetDescription>Dados detalhados do registro selecionado.</SheetDescription>
              </SheetHeader>

              <div className="mt-5 flex items-center gap-3 rounded-xl border bg-muted/30 p-4">
                <div className="grid h-12 w-12 place-items-center rounded-lg bg-muted text-muted-foreground">
                  <viewAtivo.icon className="h-6 w-6" />
                </div>
                <div className="min-w-0">
                  <div className="font-semibold">{viewAtivo.nome}</div>
                  <div className="text-xs text-muted-foreground">{viewAtivo.specs}</div>
                </div>
                <span
                  className={`ml-auto rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusClass(viewAtivo.status)}`}
                >
                  {viewAtivo.status}
                </span>
              </div>

              <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-4 text-sm">
                <Detail label="Categoria" value={viewAtivo.categoria} />
                <Detail label="Localização" value={viewAtivo.localizacao} />
                <Detail label="Patrimônio" value={viewAtivo.patrimonio} mono />
                <Detail label="Número de Série (S/N)" value={viewAtivo.serie} mono />
                <Detail label="Marca / Modelo" value={viewAtivo.marcaModelo} />
                <Detail label="Criticidade" value={viewAtivo.criticidade} />
                <Detail label="Data de Aquisição" value={viewAtivo.dataAquisicao} />
                <Detail label="Valor do Ativo" value={viewAtivo.valor} />
                <Detail label="Nota Fiscal" value={viewAtivo.notaFiscal} mono />
              </dl>

              <div className="mt-5">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Observações técnicas
                </div>
                <p className="mt-1.5 rounded-lg border bg-muted/30 p-3 text-sm text-foreground">
                  {viewAtivo.observacoes}
                </p>
              </div>

              <div className="mt-6 flex gap-2">
                <button
                  onClick={() => setViewAtivo(null)}
                  className="flex-1 rounded-lg border bg-background py-2.5 text-sm font-semibold hover:bg-muted"
                >
                  Fechar
                </button>
                <Link
                  to="/inventario/editar/$id"
                  params={{ id: viewAtivo.id }}
                  className="flex-1 rounded-lg bg-foreground py-2.5 text-center text-sm font-semibold text-background hover:opacity-90"
                >
                  Editar
                </Link>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Etiqueta de Patrimônio Modal */}
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
            <h3 className="text-lg font-bold">Etiqueta de Patrimônio</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Escaneie o QR Code para acessar os detalhes deste ativo.
            </p>
            <div className="mt-5 grid place-items-center rounded-xl border bg-white p-5">
              <img
                key={qrAtivo.id}
                src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
                  `ATIVO:${qrAtivo.id}|PAT:${qrAtivo.patrimonio}|SN:${qrAtivo.serie}`,
                )}`}
                alt={`QR Code ${qrAtivo.patrimonio}`}
                width={150}
                height={150}
              />
            </div>
            <div className="mt-4 space-y-1 text-center">
              <div className="font-semibold text-foreground">{qrAtivo.nome}</div>
              <div className="font-mono text-xs text-muted-foreground">{qrAtivo.patrimonio}</div>
            </div>
            <div className="mt-5 flex items-center gap-2">
              <button
                onClick={() => setQrAtivo(null)}
                className="flex-1 rounded-lg border bg-background py-2.5 text-sm font-semibold hover:bg-muted"
              >
                Fechar
              </button>
              <button
                onClick={() => window.print()}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-foreground py-2.5 text-sm font-semibold text-background hover:opacity-90"
              >
                <Printer className="h-4 w-4" />
                Imprimir Etiqueta
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}

function Detail({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <dt className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </dt>
      <dd className={`mt-1 text-sm text-foreground ${mono ? "font-mono" : ""}`}>{value}</dd>
    </div>
  );
}
