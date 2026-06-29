import { createFileRoute } from "@tanstack/react-router";
import { Download, FileBarChart } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { categorias, statusList, setores, auditoria, ativos as ativosMock } from "@/lib/ativos";
import { useState, useMemo, useEffect } from "react";
import { pb } from "@/lib/pocketbase";

export const Route = createFileRoute("/relatorios")({
  head: () => ({
    meta: [
      { title: "BitEstoque — Relatórios" },
      { name: "description", content: "Relatórios e auditoria do inventário de TI." },
    ],
  }),
  component: RelatoriosPage,
});

function getActionBadgeClass(action: string) {
  const a = (action || "").trim().toLowerCase();
  switch (a) {
    case "cadastro":
      return "bg-green-50 text-green-700 border border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-900/50";
    case "movimentação":
    case "movimentacao":
      return "bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900/50";
    case "alteração de status":
    case "alteracao de status":
      return "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/50";
    case "edição":
    case "edicao":
      return "bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-950/30 dark:text-purple-400 dark:border-purple-900/50";
    case "descarte de ativo":
    case "descarte":
      return "bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-900/50";
    default:
      return "bg-zinc-50 text-zinc-700 border border-zinc-200 dark:bg-zinc-900 dark:text-zinc-400 dark:border-zinc-800";
  }
}

function RelatoriosPage() {
  const [status, setStatus] = useState("");
  const [categoria, setCategoria] = useState("");
  const [setor, setSetor] = useState("");
  const [selectedFornecedor, setSelectedFornecedor] = useState("");
  const [fornecedores, setFornecedores] = useState<{ id: string; nome: string }[]>([]);
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    async function fetchLogs() {
      try {
        const records = await pb.collection("auditoria").getFullList({
          sort: "-created",
          expand: "usuario,ativo_vinculado,ativo_vinculado.categoria,ativo_vinculado.setor,ativo_vinculado.fornecedor_locacao",
          $autoCancel: false,
        });
        setLogs(records);
      } catch (err) {
        console.error("Failed to fetch audit logs for reports", err);
      }
    }
    fetchLogs();
  }, []);

  useEffect(() => {
    async function fetchFornecedores() {
      try {
        const records = await pb.collection("fornecedores").getFullList({ $autoCancel: false });
        setFornecedores(records.map((r) => ({ id: r.id, nome: r.nome })));
      } catch (err) {
        console.error("Failed to fetch suppliers for reports select", err);
      }
    }
    fetchFornecedores();
  }, []);

  // Literal assets fetch as requested
  useEffect(() => {
    async function fetchAtivos() {
      try {
        await pb.collection("ativos").getFullList({
          expand: "categoria,setor,fornecedor_locacao",
          $autoCancel: false,
        });
      } catch (err) {
        console.error("Failed to fetch assets list in reports page", err);
      }
    }
    fetchAtivos();
  }, []);

  const mappedLogs = useMemo(() => {
    return logs.map((log) => {
      const asset = log.expand?.ativo_vinculado;
      const user = log.expand?.usuario;
      const catName = asset?.expand?.categoria?.nome || asset?.categoria_nome || "";

      let displayStatus = "";
      if (asset?.status === "Em Estoque" || asset?.status === "Estoque") {
        displayStatus = "Estoque";
      } else if (asset?.status) {
        displayStatus = asset.status;
      }

      return {
        id: log.id,
        data: new Date(log.created).toLocaleString("pt-BR").slice(0, 16),
        responsavel: user?.nome || "Sistema / Admin",
        ativo: asset ? `${asset.nome} (${asset.codigo_patrimonio})` : "Ativo Excluído",
        movimentacao: log.descricao || "",
        acao: log.acao || "Movimentação",
        statusAtivo: displayStatus,
        categoriaAtivo: catName,
        setorAtivo: asset?.expand?.setor?.nome || asset?.localizacao || "",
        fornecedorAtivoId: asset?.fornecedor_locacao || asset?.expand?.fornecedor_locacao?.id || "",
      };
    });
  }, [logs]);

  const filteredAuditoria = useMemo(() => {
    return mappedLogs.filter((item) => {
      if (status && item.statusAtivo !== status) return false;
      if (categoria && item.categoriaAtivo !== categoria) return false;
      if (setor && item.setorAtivo !== setor) return false;
      if (selectedFornecedor && item.fornecedorAtivoId !== selectedFornecedor) return false;
      return true;
    });
  }, [mappedLogs, status, categoria, setor, selectedFornecedor]);

  function exportar() {
    const headers = ["Data/Hora", "Responsável", "Ativo Afetado", "Ação", "Movimentação"];

    const rows = filteredAuditoria.map((a) => [a.data, a.responsavel, a.ativo, a.acao, a.movimentacao]);

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
        <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
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
          <select
            value={selectedFornecedor}
            onChange={(e) => setSelectedFornecedor(e.target.value)}
            className="rounded-lg border bg-background px-3 py-2.5 text-sm outline-none focus:border-info"
          >
            <option value="">Todos os Fornecedores</option>
            {fornecedores.map((f) => (
              <option key={f.id} value={f.id}>
                {f.nome}
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
                  <td className="py-3.5 text-muted-foreground">
                    <span className={`inline-flex items-center gap-1.5 rounded px-2 py-0.5 text-[10px] font-bold mr-2 uppercase ${getActionBadgeClass(a.acao)}`}>
                      {a.acao}
                    </span>
                    {a.movimentacao}
                  </td>
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
                  <span className="text-foreground">
                    <span className={`inline-block rounded px-1.5 py-0.5 text-[9px] font-bold mr-1.5 uppercase ${getActionBadgeClass(a.acao)}`}>
                      {a.acao}
                    </span>
                    {a.movimentacao}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
