import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Plus, QrCode, X, Monitor } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { auditoria, ativos } from "@/lib/ativos";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { toast } from "sonner";
import { pb } from "@/lib/pocketbase";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

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

function Dashboard() {
  const navigate = useNavigate();
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [logs, setLogs] = useState<any[]>([]);
  const [ativosDb, setAtivosDb] = useState<any[]>([]);
  const [licencasDb, setLicencasDb] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setIsLoading(true);
        const [ativosRecord, licencasRecord, auditoriaRecord] = await Promise.all([
          pb.collection('ativos').getFullList({ expand: 'categoria,setor', $autoCancel: false }),
          pb.collection('licencas').getFullList({ $autoCancel: false }),
          pb.collection("auditoria").getFullList({
            sort: "-created",
            expand: "usuario,ativo_vinculado",
            $autoCancel: false,
          })
        ]);
        setAtivosDb(ativosRecord);
        setLicencasDb(licencasRecord);
        setLogs(auditoriaRecord);
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  const totalAtivos = ativosDb.length;
  const emUso = ativosDb.filter((a) => a.status === "Em Uso" || a.status === "Uso").length;
  const emManutencao = ativosDb.filter((a) => a.status === "Em Manutenção" || a.status === "Manutenção").length;
  const licencasAtivas = licencasDb.reduce((acc, curr) => acc + (curr.chaves_em_uso || 0), 0);

  const pctEmUso = totalAtivos ? Math.round((emUso / totalAtivos) * 100) : 0;
  const pctEmManutencao = totalAtivos ? Math.round((emManutencao / totalAtivos) * 100) : 0;

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {
      "Em Uso": 0,
      "Em Manutenção": 0,
      "Estoque": 0,
      "Descarte": 0
    };
    ativosDb.forEach((a) => {
      const s = (a.status === "Em Estoque" || a.status === "Estoque" || a.status === "Disponível") ? "Estoque" : a.status;
      if (s in counts) {
        counts[s]++;
      } else {
        counts[s] = (counts[s] || 0) + 1;
      }
    });
    return counts;
  }, [ativosDb]);

  const statusPercentages = useMemo(() => {
    const total = ativosDb.length;
    if (total === 0) return [];
    
    return Object.entries(statusCounts).map(([status, count]) => ({
      status,
      count,
      pct: Math.round((count / total) * 100)
    }));
  }, [statusCounts, ativosDb]);

  const conicGradientString = useMemo(() => {
    if (ativosDb.length === 0) return "bg-muted";
    let accum = 0;
    const slices = statusPercentages.map((item) => {
      const color = 
        item.status === "Em Uso" ? "#64748b" :
        item.status === "Em Manutenção" ? "#d97706" :
        item.status === "Estoque" ? "#18181b" : "#e11d48";
      const start = accum;
      accum += item.pct;
      return `${color} ${start}% ${accum}%`;
    });
    return `conic-gradient(${slices.join(", ")})`;
  }, [statusPercentages, ativosDb]);

  const setorCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    ativosDb.forEach((a) => {
      const s = a.expand?.setor?.nome || "Não Informado";
      counts[s] = (counts[s] || 0) + 1;
    });
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    const total = ativosDb.length;

    return sorted.slice(0, 5).map(([nome, count]) => ({
      nome,
      quantidade: count,
      percentual: total ? Math.round((count / total) * 100) : 0
    }));
  }, [ativosDb]);

  const handleScanSuccess = useCallback(
    (decodedText: string) => {
      setIsScannerOpen(false);

      // Try to parse ATIVO:id|...
      let activeId = decodedText;
      if (decodedText.startsWith("ATIVO:")) {
        const parts = decodedText.split("|");
        activeId = parts[0].replace("ATIVO:", "");
      }

      const found = ativosDb.find(
        (a) =>
          a.id.toLowerCase() === activeId.toLowerCase() ||
          a.codigo_patrimonio.toLowerCase() === decodedText.toLowerCase(),
      );

      if (found) {
        toast.success("Ativo identificado!");
        navigate({ to: "/inventario/editar/$id", params: { id: found.id } });
      } else {
        toast.error("Ativo não cadastrado no sistema.");
      }
    },
    [navigate, ativosDb],
  );

  return (
    <AppShell>
      {/* Metric cards */}
      {isLoading ? (
        <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse rounded-2xl border bg-card p-5 h-[145px] flex flex-col justify-between">
              <div className="h-4 w-24 bg-muted rounded animate-pulse" />
              <div className="h-10 w-16 bg-muted rounded animate-pulse" />
              <div className="h-3 w-full bg-muted rounded animate-pulse" />
            </div>
          ))}
        </div>
      ) : (
        <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard label="Total de Ativos" value={totalAtivos.toLocaleString("pt-BR")} />
          <MetricCard
            label="Em Uso"
            value={emUso.toLocaleString("pt-BR")}
            footer={
              <div className="space-y-1.5">
                <div className="h-1.5 w-full rounded-full bg-zinc-100 dark:bg-zinc-800">
                  <div className="h-full rounded-full bg-slate-600 dark:bg-slate-400" style={{ width: `${pctEmUso}%` }} />
                </div>
                <div className="text-xs text-muted-foreground">{pctEmUso}% da capacidade</div>
              </div>
            }
          />
          <MetricCard
            label="Em Manutenção"
            value={emManutencao.toLocaleString("pt-BR")}
            valueColor="text-amber-600 dark:text-amber-500"
            badge={
              <span className="rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-bold tracking-wider text-amber-600 border border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/50">
                ALERTA
              </span>
            }
            footer={<div className="text-xs text-muted-foreground">{pctEmManutencao}% em reparos</div>}
          />
          <MetricCard
            label="Licenças Ativas"
            value={licencasAtivas.toLocaleString("pt-BR")}
            badge={
              <span className="rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-bold tracking-wider text-blue-600 border border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900/50">
                LICENÇAS
              </span>
            }
            footer={<div className="text-xs text-muted-foreground">Chaves em uso no momento</div>}
          />
        </div>
      )}

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
        <button
          onClick={() => setIsScannerOpen(true)}
          className="group flex items-center gap-4 rounded-2xl border bg-card p-5 text-left transition-colors hover:bg-muted cursor-pointer"
        >
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-muted">
            <QrCode className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="font-semibold">Escanear QR Code</div>
            <div className="text-xs text-muted-foreground">
              Escanear um dispositivo para visualizar ou editar
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
                {logs.slice(0, 5).map((log, i) => {
                  const asset = log.expand?.ativo_vinculado;
                  const user = log.expand?.usuario;
                  return (
                    <tr key={i} className="border-t">
                      <td className="py-3.5 pr-4 text-muted-foreground whitespace-nowrap">
                        {new Date(log.created).toLocaleString("pt-BR").slice(0, 16)}
                      </td>
                      <td className="py-3.5 pr-4 font-medium text-foreground">{user?.nome || "Sistema / Admin"}</td>
                      <td className="py-3.5 pr-4 font-mono text-xs">{asset ? `${asset.nome} (${asset.codigo_patrimonio})` : "Ativo Excluído"}</td>
                      <td className="py-3.5 text-muted-foreground">
                        <span className={`inline-flex items-center gap-1.5 rounded px-2 py-0.5 text-[10px] font-bold mr-2 uppercase ${getActionBadgeClass(log.acao)}`}>
                          {log.acao}
                        </span>
                        {log.descricao}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile View */}
          <div className="block md:hidden space-y-3">
            {logs.slice(0, 5).map((log, i) => {
              const asset = log.expand?.ativo_vinculado;
              const user = log.expand?.usuario;
              return (
                <div key={i} className="rounded-xl border bg-card p-4 space-y-2 text-sm">
                  <div className="flex items-center justify-between border-b pb-2">
                    <span className="font-mono text-xs font-semibold text-foreground">
                      {asset ? `${asset.nome} (${asset.codigo_patrimonio})` : "Ativo Excluído"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(log.created).toLocaleString("pt-BR").slice(0, 16)}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                    <div>
                      <span className="text-muted-foreground block font-medium">Responsável:</span>
                      <span className="text-foreground font-semibold">{user?.nome || "Sistema / Admin"}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block font-medium">Movimentação:</span>
                      <span className="text-foreground">
                        <span className={`inline-block rounded px-1.5 py-0.5 text-[9px] font-bold mr-1.5 uppercase ${getActionBadgeClass(log.acao)}`}>
                          {log.acao}
                        </span>
                        {log.descricao}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Charts Column */}
        <section className="space-y-4">
          {/* Card Pizza Status */}
          <div className="rounded-2xl border bg-card p-5">
            <h2 className="mb-4 font-semibold">Gráfico por Status</h2>
            {isLoading ? (
              <div className="animate-pulse space-y-4">
                <div className="h-28 w-28 rounded-full bg-muted mx-auto animate-pulse" />
                <div className="h-10 w-full bg-muted rounded animate-pulse" />
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <div className="relative flex items-center justify-center shrink-0">
                  <div className="h-24 w-24 rounded-full border border-border" style={{ background: conicGradientString }} />
                  <div className="absolute h-14 w-14 rounded-full bg-card" />
                </div>
                <div className="space-y-1.5 text-xs">
                  {statusPercentages.map((item) => {
                    const color = 
                      item.status === "Em Uso" ? "bg-slate-500" :
                      item.status === "Em Manutenção" ? "bg-amber-600" :
                      item.status === "Estoque" ? "bg-zinc-900 dark:bg-zinc-100" : "bg-rose-600";
                    return (
                      <div key={item.status} className="flex items-center gap-2">
                        <span className={`h-2.5 w-2.5 rounded-full ${color}`} />
                        <span className="font-semibold text-foreground">{item.status}:</span>
                        <span className="text-muted-foreground">{item.count} ({item.pct}%)</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Card Setores Barras */}
          <div className="rounded-2xl border bg-card p-5">
            <h2 className="mb-4 font-semibold">Gráfico por Setor</h2>
            {isLoading ? (
              <div className="animate-pulse space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="space-y-1">
                    <div className="h-3 w-24 bg-muted rounded animate-pulse" />
                    <div className="h-2 w-full bg-muted rounded animate-pulse" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {setorCounts.map((s) => (
                  <div key={s.nome} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-foreground truncate max-w-[120px]">{s.nome}</span>
                      <span className="text-muted-foreground">{s.quantidade} ativos ({s.percentual}%)</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-slate-600 dark:bg-slate-400"
                        style={{ width: `${s.percentual}%` }}
                      />
                    </div>
                  </div>
                ))}
                {setorCounts.length === 0 && (
                  <p className="text-center text-xs text-muted-foreground">Nenhum setor disponível.</p>
                )}
              </div>
            )}
          </div>
        </section>
      </div>
      <QrScannerDialog
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanSuccess={handleScanSuccess}
      />
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

function QrScannerDialog({
  isOpen,
  onClose,
  onScanSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (text: string) => void;
}) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(() => {
      const html5QrCode = new Html5Qrcode("reader");
      scannerRef.current = html5QrCode;

      html5QrCode
        .start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 220, height: 220 },
          },
          (decodedText) => {
            html5QrCode
              .stop()
              .then(() => {
                onScanSuccess(decodedText);
              })
              .catch((err) => {
                console.error("Failed to stop scanner:", err);
                onScanSuccess(decodedText);
              });
          },
          () => {},
        )
        .catch((err) => {
          console.error("Failed to start scanner:", err);
          setError(
            "Não foi possível acessar a câmera. Certifique-se de dar as permissões necessárias.",
          );
        });
    }, 300);

    return () => {
      clearTimeout(timer);
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current
          .stop()
          .catch((err) => console.error("Failed to stop scanner on unmount:", err));
      }
    };
  }, [isOpen, onScanSuccess]);

  const handleClose = async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      try {
        await scannerRef.current.stop();
      } catch (err) {
        console.error("Failed to stop scanner on close:", err);
      }
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="w-screen h-screen max-w-none md:max-w-[400px] md:h-auto left-0 top-0 translate-x-0 translate-y-0 md:left-[50%] md:top-[50%] md:translate-x-[-50%] md:translate-y-[-50%] rounded-none md:rounded-2xl p-6 flex flex-col justify-between md:justify-start">
        <DialogHeader className="shrink-0">
          <DialogTitle>Escanear QR Code</DialogTitle>
          <DialogDescription>
            Posicione o QR Code do patrimônio dentro da área demarcada.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-1 flex-col items-center justify-center py-4 space-y-6">
          <div className="relative w-full max-w-[280px] aspect-square overflow-hidden rounded-2xl border-2 border-dashed border-muted-foreground/30 bg-black flex items-center justify-center shadow-inner">
            <div id="reader" className="w-full h-full" />

            {!error && (
              <div className="absolute inset-0 pointer-events-none border-[30px] border-black/40 flex items-center justify-center">
                <div className="w-[180px] h-[180px] border-2 border-primary rounded-lg relative overflow-hidden">
                  <div className="absolute inset-x-0 h-0.5 bg-primary/80 shadow-[0_0_8px_#3b82f6] animate-bounce top-1/2" />
                </div>
              </div>
            )}
          </div>

          {error && (
            <p className="text-xs text-destructive text-center leading-relaxed max-w-[280px] bg-destructive/10 p-3 rounded-lg border border-destructive/20">
              {error}
            </p>
          )}
        </div>

        <div className="shrink-0 w-full flex justify-center pb-4 md:pb-0">
          <button
            type="button"
            onClick={handleClose}
            className="w-full max-w-[280px] rounded-lg border bg-background hover:bg-muted text-foreground font-semibold py-3 text-sm transition-colors shadow-sm cursor-pointer"
          >
            Fechar Câmera / Cancelar
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
