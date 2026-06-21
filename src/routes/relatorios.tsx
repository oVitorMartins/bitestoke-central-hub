import { createFileRoute } from "@tanstack/react-router";
import { Download, FileBarChart } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { categorias, statusList, setores, auditoria, ativos as ativosMock } from "@/lib/ativos";
import { useState, useMemo } from "react";

export const Route = createFileRoute("/relatorios")({
  head: () => ({
    meta: [
      { title: "BitEstoque — Relatórios" },
      { name: "description", content: "Relatórios e auditoria do inventário de TI." },
    ],
  }),
  component: RelatoriosPage,
});

function RelatoriosPage() {
  const [status, setStatus] = useState("");
  const [categoria, setCategoria] = useState("");
  const [setor, setSetor] = useState("");

  const filteredAuditoria = useMemo(() => {
    return auditoria.filter((a) => {
      const asset = ativosMock.find(
        (item) =>
          item.patrimonio === a.ativo || item.id === a.ativo || a.ativo.includes(item.patrimonio),
      );
      if (status && asset && asset.status !== status) return false;
      if (categoria && asset && asset.categoria !== categoria) return false;
      if (setor && asset && asset.localizacao !== setor) return false;
      return true;
    });
  }, [status, categoria, setor]);

  function exportar() {
    const headers = ["Data/Hora", "Responsável", "Ativo Afetado", "Movimentação"];

    const rows = filteredAuditoria.map((a) => [a.data, a.responsavel, a.ativo, a.movimentacao]);

    const csvContent = [
      "sep=;",
      headers.join(";"),
      ...rows.map((row) =>
        row.map((val) => `"${(val || "").toString().replace(/"/g, '""')}"`).join(";"),
      ),
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "relatorio_movimentacoes.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Relatório de auditoria exportado com sucesso!");
  }

  return (
    <AppShell>
      <div className="mb-5 flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-lg bg-muted">
          <FileBarChart className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight">Relatórios</h1>
          <p className="text-xs text-muted-foreground">
            Exporte dados filtrados e acompanhe o histórico de auditoria.
          </p>
        </div>
      </div>

      {/* Filtros para Exportação */}
      <section className="mb-5 rounded-2xl border bg-card p-5">
        <h2 className="mb-4 text-sm font-semibold">Filtros para Exportação</h2>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:border-info"
          >
            <option value="">Todos Status</option>
            {statusList.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <select
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            className="rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:border-info"
          >
            <option value="">Todas Categorias</option>
            {categorias.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <select
            value={setor}
            onChange={(e) => setSetor(e.target.value)}
            className="rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:border-info"
          >
            <option value="">Todos Setores</option>
            {setores.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <button
            onClick={exportar}
            className="flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            <Download className="h-4 w-4" /> Exportar Relatório
          </button>
        </div>
      </section>

      {/* Histórico e Auditoria */}
      <section className="rounded-2xl border bg-card p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold">Histórico e Auditoria</h2>
          <span className="text-xs text-muted-foreground">
            {filteredAuditoria.length} registros
          </span>
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
              {filteredAuditoria.map((a, i) => (
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

        {/* Mobile Cards */}
        <div className="block md:hidden space-y-3">
          {filteredAuditoria.map((a, i) => (
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
    </AppShell>
  );
}
