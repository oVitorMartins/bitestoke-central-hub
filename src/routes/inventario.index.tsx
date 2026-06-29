import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
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
  Package,
  Plus,
  Trash2,
  Lock,
  Computer,
  Laptop,
  Monitor,
  Tablet,
  Server,
  Router,
  BatteryCharging,
  Camera,
  Fingerprint,
  Tv,
  Phone,
  Cpu,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { pb, createAuditLog } from "@/lib/pocketbase";

function getIconForCategory(categoria: string) {
  const c = (categoria || "").trim().toLowerCase();
  switch (c) {
    case "desktop":
    case "computador":
      return Computer;
    case "notebook":
    case "laptop":
      return Laptop;
    case "monitor":
    case "tela":
      return Monitor;
    case "impressora":
    case "multifuncional":
      return Printer;
    case "tablet":
      return Tablet;
    case "servidor":
      return Server;
    case "rede":
    case "switch":
    case "roteador":
      return Router;
    case "no-break":
    case "bateria":
      return BatteryCharging;
    case "câmera":
    case "camera":
    case "cftv":
      return Camera;
    case "leitor":
    case "scanner":
      return QrCode;
    case "relógio de ponto":
    case "relogio de ponto":
    case "biometria":
      return Fingerprint;
    case "televisão":
    case "televisao":
    case "painel":
      return Tv;
    case "telefone":
    case "interfone":
    case "ramal":
      return Phone;
    default:
      return Cpu;
  }
}
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  ativos as ativosMock,
  categorias,
  statusList,
  setores,
  auditoria,
  type Ativo,
  type Status,
  type Criticidade,
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

function mapRecordToAtivo(r: any): Ativo {
  const categoryName = r.expand?.categoria?.nome || r.categoria_nome || "Geral";
  
  let displayStatus: Status = "Estoque";
  if (r.status === "Em Uso" || r.status === "Em Manutenção" || r.status === "Descarte") {
    displayStatus = r.status as Status;
  } else if (r.status === "Em Estoque" || r.status === "Estoque") {
    displayStatus = "Estoque";
  }

  const specsStr = r.marca_modelo || r.observacoes || "";

  return {
    id: r.id,
    nome: r.nome || "",
    specs: specsStr,
    icon: Laptop,
    marcaModelo: r.marca_modelo || "",
    categoria: categoryName,
    patrimonio: r.codigo_patrimonio || "",
    serie: r.numero_serie || "",
    status: displayStatus,
    localizacao: r.expand?.setor?.nome || r.localizacao || "TI",
    dataAquisicao: r.data_aquisicao ? new Date(r.data_aquisicao).toLocaleDateString("pt-BR") : "",
    valor: r.valor ? r.valor.toString() : "",
    notaFiscal: r.nota_fiscal || "",
    criticidade: (r.criticidade as Criticidade) || "Baixa",
    observacoes: r.observacoes || "",
    expand: r.expand,
  };
}

function InventarioPage() {
  const navigate = useNavigate();
  const [qrAtivo, setQrAtivo] = useState<Ativo | null>(null);
  const [viewAtivo, setViewAtivo] = useState<Ativo | null>(null);

  const [busca, setBusca] = useState("");
  const [fCategoria, setFCategoria] = useState("");
  const [fStatus, setFStatus] = useState("");
  const [fSetor, setFSetor] = useState("");

  const [ativos, setAtivos] = useState<Ativo[]>([]);
  const ativosList = ativos;
  const setAtivosList = setAtivos;
  const [currentUser, setCurrentUser] = useState<{ nome: string; perfil: string } | null>(null);
  const [categoriasDb, setCategoriasDb] = useState<string[]>([]);
  const [setoresDb, setSetoresDb] = useState<string[]>([]);
  const [historicoLogs, setHistoricoLogs] = useState<any[]>([]);

  useEffect(() => {
    if (!viewAtivo) {
      setHistoricoLogs([]);
      return;
    }
    const ativoId = viewAtivo.id;
    async function fetchLogs() {
      try {
        const records = await pb.collection("auditoria").getFullList({
          filter: `ativo_vinculado = "${ativoId}"`,
          sort: "-created",
          $autoCancel: false,
        });
        setHistoricoLogs(records);
      } catch (err) {
        console.error("Failed to fetch audit logs for asset", err);
      }
    }
    fetchLogs();
  }, [viewAtivo]);

  async function fetchAtivos() {
    try {
      const records = await pb.collection("ativos").getFullList({
        expand: "categoria,setor,fornecedor_locacao",
        $autoCancel: false,
      });
      setAtivos(records.map(mapRecordToAtivo));
    } catch (err) {
      console.error("Failed to fetch assets from PocketBase", err);
      setAtivos([]);
    }
  }

  useEffect(() => {
    fetchAtivos();
  }, []);

  useEffect(() => {
    async function fetchCategorias() {
      try {
        const records = await pb.collection("categorias").getFullList({ $autoCancel: false });
        setCategoriasDb(records.map((r) => r.nome));
      } catch (err) {
        console.error("Failed to fetch categories from PocketBase", err);
        // Fallback to local hardcoded categories
        setCategoriasDb(Array.from(categorias));
      }
    }
    fetchCategorias();
  }, []);

  useEffect(() => {
    async function fetchSetores() {
      try {
        const records = await pb.collection("setores").getFullList({ $autoCancel: false });
        setSetoresDb(records.map((r) => r.nome));
      } catch (err) {
        console.error("Failed to fetch sectors from PocketBase", err);
        // Fallback to local hardcoded sectors
        setSetoresDb(Array.from(setores));
      }
    }
    fetchSetores();
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem("bitestoque_user");
    if (stored) {
      try {
        setCurrentUser(JSON.parse(stored));
      } catch (err) {
        console.error("Failed to parse user session", err);
      }
    }
  }, []);

  // Disposal states
  const [isDisposalOpen, setIsDisposalOpen] = useState(false);
  const [disposalAtivo, setDisposalAtivo] = useState<Ativo | null>(null);
  const [disposalReason, setDisposalReason] = useState("");

  const [isBatchPrintOpen, setIsBatchPrintOpen] = useState(false);
  const [printCategoria, setPrintCategoria] = useState("");
  const [printSetor, setPrintSetor] = useState("");
  const [ativosParaImprimir, setAtivosParaImprimir] = useState<Ativo[]>([]);



  const canDispose =
    currentUser?.perfil === "Administrador" ||
    currentUser?.perfil === "Admin" ||
    currentUser?.perfil === "Gestor";

  const handleDisposalClick = (a: Ativo) => {
    setDisposalAtivo(a);
    setDisposalReason("");
    setIsDisposalOpen(true);
  };

  const handleConfirmDisposal = async () => {
    if (!disposalReason.trim()) {
      toast.error("Por favor, insira o motivo do descarte.");
      return;
    }

    if (!disposalAtivo) return;

    let statusUpdated = false;
    try {
      // 1. Update active status to "Descarte" in PocketBase
      await pb.collection("ativos").update(disposalAtivo.id, {
        status: "Descarte",
      }, { $autoCancel: false });
      statusUpdated = true;
    } catch (err) {
      console.error("Failed to update asset status in PocketBase", err);
      toast.error("Erro ao atualizar o status do ativo no banco de dados.", {
        description: err instanceof Error ? err.message : "Erro desconhecido",
      });
      return;
    }

    // 2. Create the audit log in PocketBase
    await createAuditLog(disposalAtivo.id, "Descarte de Ativo", disposalReason.trim());

    // Local state update since the critical status update succeeded
    setAtivosList((prev) =>
      prev.map((a) => (a.id === disposalAtivo.id ? { ...a, status: "Descarte" } : a)),
    );

    const newLog = {
      data: new Date().toLocaleString("pt-BR").slice(0, 16),
      responsavel: currentUser?.nome || "Admin Usuário",
      ativo: disposalAtivo.patrimonio,
      movimentacao: `Descartou ativo. Motivo: ${disposalReason.trim()}`,
    };
    auditoria.unshift(newLog);

    toast.success("Ativo descartado com sucesso!");
    setIsDisposalOpen(false);
    setDisposalReason("");
    setDisposalAtivo(null);
  };

  useEffect(() => {
    if (ativosParaImprimir.length > 0) {
      const timer = setTimeout(() => {
        window.print();
        setAtivosParaImprimir([]);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [ativosParaImprimir]);

  const handlePrintBatch = () => {
    const list = ativosList.filter((a) => {
      if (printCategoria && a.categoria !== printCategoria) return false;
      if (printSetor && a.localizacao !== printSetor) return false;
      return true;
    });

    if (list.length === 0) {
      toast.error("Nenhum ativo encontrado com os filtros selecionados.");
      return;
    }

    setAtivosParaImprimir(list);
    setIsBatchPrintOpen(false);
    toast.success(`Gerando folha de impressão para ${list.length} ativos...`);
  };

  const matchingPrintCount = useMemo(() => {
    return ativosList.filter((a) => {
      if (printCategoria && a.categoria !== printCategoria) return false;
      if (printSetor && a.localizacao !== printSetor) return false;
      return true;
    }).length;
  }, [ativosList, printCategoria, printSetor]);

  const filtered = useMemo(() => {
    const q = busca.trim().toLowerCase();
    return ativosList.filter((a) => {
      if (fCategoria && a.categoria !== fCategoria) return false;
      if (fStatus && a.status !== fStatus) return false;
      if (fSetor && a.localizacao !== fSetor) return false;
      if (q) {
        const hay = `${a.nome} ${a.patrimonio} ${a.serie}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [ativosList, busca, fCategoria, fStatus, fSetor]);

  const handleExportCsv = () => {
    const headers = [
      "Nome do Ativo",
      "Categoria",
      "Patrimônio",
      "Número de Série",
      "Status",
      "Localização",
      "Data de Aquisição",
      "Valor",
      "Nota Fiscal",
      "Criticidade",
      "Observações",
    ];
    const rows = filtered.map((a) => [
      a.nome,
      a.categoria,
      a.patrimonio,
      a.serie,
      a.status,
      a.localizacao,
      a.dataAquisicao,
      a.valor,
      a.notaFiscal,
      a.criticidade,
      a.observacoes,
    ]);
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
    link.setAttribute("download", "inventario_bitestoque.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Inventário exportado com sucesso!");
  };

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
        <div className="flex items-center gap-2.5">
          <Link
            to="/inventario/novo"
            className="inline-flex items-center gap-2 rounded-lg bg-foreground px-4 py-2.5 text-sm font-semibold text-background hover:opacity-90 cursor-pointer"
          >
            <Plus className="h-4 w-4" /> Novo Ativo
          </Link>
          <button
            onClick={() => {
              setPrintCategoria("");
              setPrintSetor("");
              setIsBatchPrintOpen(true);
            }}
            className="inline-flex items-center gap-2 rounded-lg border bg-card px-4 py-2.5 text-sm font-semibold hover:bg-muted cursor-pointer"
          >
            <Printer className="h-4 w-4" /> Imprimir em Lote
          </button>
          <button
            onClick={handleExportCsv}
            className="inline-flex items-center gap-2 rounded-lg border bg-card px-4 py-2.5 text-sm font-medium hover:bg-muted cursor-pointer"
          >
            <Download className="h-4 w-4" /> Exportar
          </button>
        </div>
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
          options={categoriasDb}
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
          options={setoresDb}
          allLabel="Todos Setores"
        />
        <button
          onClick={limparFiltros}
          className="ml-auto text-xs font-semibold text-info hover:underline cursor-pointer"
        >
          Limpar filtros
        </button>
      </div>

      {/* Table */}
      <section className="rounded-2xl border bg-card">
        <div className="hidden md:block overflow-x-auto">
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
                const Icon = getIconForCategory(a.categoria);
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
                        className={`inline-block rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusClass(
                          a.status,
                        )}`}
                      >
                        {a.status}
                      </span>
                    </td>
                    <td className="px-3 py-4 text-muted-foreground">
                      <div>{a.expand?.setor?.nome || a.localizacao}</div>
                      {a.expand?.fornecedor_locacao?.nome && (
                        <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
                          Locado: {a.expand.fornecedor_locacao.nome}
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          title="Visualizar"
                          onClick={() => setViewAtivo(a)}
                          className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          title="Editar"
                          onClick={() =>
                            navigate({ to: "/inventario/editar/$id", params: { id: a.id } })
                          }
                          className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          title="Ver QR Code"
                          onClick={() => setQrAtivo(a)}
                          className="grid h-8 w-8 place-items-center rounded-md bg-foreground text-background transition-opacity hover:opacity-90 cursor-pointer"
                        >
                          <QrCode className="h-4 w-4" />
                        </button>
                        {canDispose && a.status !== "Descarte" && (
                          <button
                            title="Descartar Ativo"
                            onClick={() => handleDisposalClick(a)}
                            className="grid h-8 w-8 place-items-center rounded-md text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/30 cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
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
        </div>

        {/* Mobile Cards */}
        <div className="block md:hidden divide-y">
          {filtered.map((a) => {
            const Icon = getIconForCategory(a.categoria);
            return (
              <div key={a.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-foreground text-sm">{a.nome}</div>
                      <div className="text-[11px] text-muted-foreground">{a.specs}</div>
                    </div>
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusClass(
                      a.status,
                    )}`}
                  >
                    {a.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-1 text-muted-foreground">
                  <div>
                    <span className="block font-medium">Categoria:</span>
                    <span className="text-foreground">{a.categoria}</span>
                  </div>
                  <div>
                    <span className="block font-medium">Patrimônio:</span>
                    <span className="text-foreground font-mono">{a.patrimonio}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="block font-medium">Localização:</span>
                    <span className="text-foreground">
                      {a.expand?.setor?.nome || a.localizacao}
                      {a.expand?.fornecedor_locacao?.nome && (
                        <span className="block text-[11px] text-zinc-500 dark:text-zinc-400">
                          Locado: {a.expand.fornecedor_locacao.nome}
                        </span>
                      )}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-dashed">
                  <button
                    onClick={() => setViewAtivo(a)}
                    className="flex items-center justify-center gap-1.5 rounded-lg border bg-background px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    <Eye className="h-3.5 w-3.5" /> Ficha
                  </button>
                  <button
                    onClick={() => navigate({ to: "/inventario/editar/$id", params: { id: a.id } })}
                    className="flex items-center justify-center gap-1.5 rounded-lg border bg-background px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    <Pencil className="h-3.5 w-3.5" /> Editar
                  </button>
                  <button
                    onClick={() => setQrAtivo(a)}
                    className="flex items-center justify-center gap-1.5 rounded-lg bg-foreground text-background px-3 py-1.5 text-xs hover:opacity-90 cursor-pointer"
                  >
                    <QrCode className="h-3.5 w-3.5" /> QR Code
                  </button>
                  {canDispose && a.status !== "Descarte" && (
                    <button
                      onClick={() => handleDisposalClick(a)}
                      className="flex items-center justify-center gap-1.5 rounded-lg border border-red-200 bg-red-50/50 dark:border-red-900/50 dark:bg-red-950/20 px-3 py-1.5 text-xs text-red-600 hover:text-red-700 cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Descartar
                    </button>
                  )}
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="px-5 py-10 text-center text-sm text-muted-foreground">
              Nenhum ativo encontrado com os filtros aplicados.
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t px-5 py-3">
          <span className="text-xs text-muted-foreground">
            Mostrando {filtered.length} de {ativosList.length} ativos
          </span>
          <div className="flex items-center gap-1">
            <button className="grid h-8 w-8 place-items-center rounded-md border text-muted-foreground hover:bg-muted cursor-pointer">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button className="grid h-8 w-8 place-items-center rounded-md bg-foreground text-xs font-semibold text-background">
              1
            </button>
            <button className="grid h-8 w-8 place-items-center rounded-md border text-muted-foreground hover:bg-muted cursor-pointer">
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
                  {(() => {
                    const ViewIcon = getIconForCategory(viewAtivo.categoria);
                    return <ViewIcon className="h-6 w-6" />;
                  })()}
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
                {viewAtivo.expand?.fornecedor_locacao?.nome && (
                  <Detail label="Fornecedor de Locação" value={viewAtivo.expand.fornecedor_locacao.nome} />
                )}
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

              {/* Linha do Tempo / Histórico do Ativo */}
              <div className="mt-6 border-t pt-5">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                  Histórico / Linha do Tempo
                </div>
                {historicoLogs.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic">Nenhum registro de auditoria encontrado para este ativo.</p>
                ) : (
                  <div className="space-y-3.5 pl-1.5 relative border-l border-zinc-200 dark:border-zinc-800 ml-1">
                    {historicoLogs.map((log) => (
                      <div key={log.id} className="relative pl-4 text-xs">
                        <div className="absolute -left-[7px] top-1.5 h-2 w-2 rounded-full bg-zinc-400 dark:bg-zinc-600" />
                        <div className="flex items-center justify-between gap-2 text-[10px] text-muted-foreground font-medium mb-0.5">
                          <span>{new Date(log.created).toLocaleString("pt-BR").slice(0, 16)}</span>
                          <span className={`inline-block rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${getActionBadgeClass(log.acao)}`}>
                            {log.acao}
                          </span>
                        </div>
                        <p className="text-foreground/90 font-medium leading-relaxed">{log.descricao}</p>
                      </div>
                    ))}
                  </div>
                )}
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

      {/* Imprimir em Lote Dialog */}
      <Dialog open={isBatchPrintOpen} onOpenChange={setIsBatchPrintOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Imprimir em Lote</DialogTitle>
            <DialogDescription>
              Selecione os filtros abaixo para gerar uma folha compacta de etiquetas QR Code.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">
                Filtrar por Categoria
              </label>
              <select
                value={printCategoria}
                onChange={(e) => setPrintCategoria(e.target.value)}
                className="w-full rounded-lg border bg-background px-3.5 py-2.5 text-sm focus:border-info focus:outline-none"
              >
                <option value="">Todas as Categorias</option>
                {categoriasDb.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">
                Filtrar por Localização / Setor
              </label>
              <select
                value={printSetor}
                onChange={(e) => setPrintSetor(e.target.value)}
                className="w-full rounded-lg border bg-background px-3.5 py-2.5 text-sm focus:border-info focus:outline-none"
              >
                <option value="">Todos os Setores</option>
                {setores.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div className="rounded-lg bg-muted p-3 text-xs text-muted-foreground flex justify-between items-center">
              <span>Etiquetas a serem geradas:</span>
              <span className="font-semibold text-foreground text-sm">{matchingPrintCount}</span>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <button
              type="button"
              onClick={() => setIsBatchPrintOpen(false)}
              className="rounded-lg border px-4 py-2.5 text-sm font-semibold hover:bg-muted cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handlePrintBatch}
              disabled={matchingPrintCount === 0}
              className="rounded-lg bg-foreground px-4 py-2.5 text-sm font-semibold text-background hover:opacity-90 disabled:opacity-50 cursor-pointer"
            >
              Imprimir Lote
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmar Descarte de Ativo Dialog */}
      <Dialog open={isDisposalOpen} onOpenChange={setIsDisposalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirmar Descarte de Ativo</DialogTitle>
            <DialogDescription>
              Tem certeza de que deseja descartar este ativo? Esta ação alterará o status para
              Descarte e registrará a justificativa na auditoria.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {disposalAtivo && (
              <div className="rounded-lg bg-muted p-3 text-xs space-y-1">
                <div>
                  <span className="font-semibold">Ativo:</span> {disposalAtivo.nome}
                </div>
                <div>
                  <span className="font-semibold">Patrimônio:</span> {disposalAtivo.patrimonio}
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">
                Motivo do Descarte <span className="text-destructive">*</span>
              </label>
              <textarea
                value={disposalReason}
                onChange={(e) => setDisposalReason(e.target.value)}
                placeholder="Ex: Equipamento queimado sem conserto, Obsolescência, etc."
                rows={3}
                className="w-full rounded-lg border bg-background px-3.5 py-2.5 text-sm focus:border-info focus:outline-none resize-y"
                required
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <button
              type="button"
              onClick={() => setIsDisposalOpen(false)}
              className="rounded-lg border px-4 py-2.5 text-sm font-semibold hover:bg-muted cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleConfirmDisposal}
              disabled={!disposalReason.trim()}
              className="rounded-lg bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 text-sm font-semibold disabled:opacity-50 cursor-pointer"
            >
              Confirmar Descarte
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Invisible Print Layout (shows only under @media print) */}
      {ativosParaImprimir.length > 0 && (
        <div id="print-area">
          {ativosParaImprimir.map((ativo) => (
            <div
              key={ativo.id}
              className="flex flex-col items-center justify-between border border-zinc-300 p-3 rounded-lg text-center h-[180px] bg-white text-black"
            >
              {/* Header compact logo */}
              <div className="flex items-center gap-1 border-b border-zinc-200 pb-1.5 w-full justify-center">
                <Package className="h-3.5 w-3.5 text-black shrink-0" />
                <span className="text-[10px] font-bold tracking-tight uppercase">BitEstoque</span>
              </div>
              {/* QR Code */}
              <div className="flex-1 flex items-center justify-center p-1">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(
                    `ATIVO:${ativo.id}|PAT:${ativo.patrimonio}|SN:${ativo.serie}`,
                  )}`}
                  alt={`QR Code ${ativo.patrimonio}`}
                  className="w-20 h-20"
                />
              </div>
              {/* Footer */}
              <div className="w-full pt-1.5 border-t border-zinc-200">
                <div className="text-[9px] font-semibold text-zinc-800 truncate max-w-full px-1">
                  {ativo.nome}
                </div>
                <div className="text-[9px] font-mono font-bold text-zinc-600 mt-0.5">
                  {ativo.patrimonio}
                </div>
              </div>
            </div>
          ))}
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
