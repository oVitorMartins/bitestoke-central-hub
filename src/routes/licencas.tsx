import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { Key, Plus, Search, X, ChevronLeft, ChevronRight, Download, Pencil, Trash2 } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { toast } from "sonner";
import { pb } from "@/lib/pocketbase";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

type Licenca = {
  id: string;
  nome_software: string;
  chaves_compradas: number;
  chaves_em_uso: number;
  preco: number;
  data_expiracao: string;
};

function formatCurrencyBRL(value: string): string {
  const cleanValue = value.replace(/\D/g, "");
  if (!cleanValue) return "";
  const numberValue = parseFloat(cleanValue) / 100;
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(numberValue);
}

function parseCurrencyBRL(value: string): number {
  const cleanValue = value.replace(/\D/g, "");
  if (!cleanValue) return 0;
  return parseFloat(cleanValue) / 100;
}

export const Route = createFileRoute("/licencas")({
  head: () => ({
    meta: [
      { title: "Licenças — BitEstoque" },
      {
        name: "description",
        content: "Gestão e controle de licenças de software e SaaS da corporação.",
      },
    ],
  }),
  component: LicencasPage,
});

function LicencasPage() {
  const [licencas, setLicencas] = useState<Licenca[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [currentUser, setCurrentUser] = useState<{ nome: string; perfil: string } | null>(null);

  // Modal registration states
  const [isNewLicenceOpen, setIsNewLicenceOpen] = useState(false);
  const [newLicenceSoftware, setNewLicenceSoftware] = useState("");
  const [newLicenceChavesCompradas, setNewLicenceChavesCompradas] = useState<number | "">("");
  const [newLicenceChavesEmUso, setNewLicenceChavesEmUso] = useState<number | "">("");
  const [newLicenceValor, setNewLicenceValor] = useState("");
  const [newLicenceExpiracao, setNewLicenceExpiracao] = useState("");

  // Modal edit states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editLicenceId, setEditLicenceId] = useState("");
  const [editLicenceSoftware, setEditLicenceSoftware] = useState("");
  const [editLicenceChavesCompradas, setEditLicenceChavesCompradas] = useState<number | "">("");
  const [editLicenceChavesEmUso, setEditLicenceChavesEmUso] = useState<number | "">("");
  const [editLicenceValor, setEditLicenceValor] = useState("");
  const [editLicenceExpiracao, setEditLicenceExpiracao] = useState("");

  // Modal delete states
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [licenceToDelete, setLicenceToDelete] = useState<Licenca | null>(null);

  const handleOpenEdit = (l: Licenca) => {
    setEditLicenceId(l.id);
    setEditLicenceSoftware(l.nome_software);
    setEditLicenceChavesCompradas(l.chaves_compradas);
    setEditLicenceChavesEmUso(l.chaves_em_uso);
    setEditLicenceValor(formatCurrencyBRL(String(Math.round((l.preco || 0) * 100))));
    setEditLicenceExpiracao(l.data_expiracao ? l.data_expiracao.slice(0, 10) : "");
    setIsEditModalOpen(true);
  };

  const handleUpdateLicence = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editLicenceSoftware.trim()) {
      toast.error("Preencha o nome do software.");
      return;
    }

    const cleanPrice = parseCurrencyBRL(editLicenceValor);

    try {
      const data = {
        nome_software: editLicenceSoftware.trim(),
        chaves_compradas: Number(editLicenceChavesCompradas) || 0,
        chaves_em_uso: Number(editLicenceChavesEmUso) || 0,
        preco: cleanPrice,
        data_expiracao: editLicenceExpiracao || null,
      };

      await pb.collection("licencas").update(editLicenceId, data);
      toast.success("Licença atualizada com sucesso!");
      setIsEditModalOpen(false);
      fetchLicencas();
    } catch (err) {
      console.error("Failed to update license", err);
      toast.error("Erro ao atualizar licença. Verifique os dados.");
    }
  };

  const handleOpenDelete = (l: Licenca) => {
    setLicenceToDelete(l);
    setIsDeleteOpen(true);
  };

  const handleDeleteLicence = async () => {
    if (!licenceToDelete) return;
    try {
      await pb.collection("licencas").delete(licenceToDelete.id);
      toast.success("Licença excluída com sucesso!");
      setIsDeleteOpen(false);
      setLicenceToDelete(null);
      fetchLicencas();
    } catch (err) {
      console.error("Failed to delete license", err);
      toast.error("Erro ao excluir licença.");
    }
  };

  const fetchLicencas = async () => {
    try {
      setLoading(true);
      const records = await pb.collection("licencas").getFullList<Licenca>({
        sort: "-created",
        $autoCancel: false,
      });
      setLicencas(records);
    } catch (err) {
      console.error("Failed to fetch licenses", err);
      toast.error("Erro ao carregar licenças.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLicencas();
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

  const handleAddLicence = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLicenceSoftware.trim()) {
      toast.error("Preencha o nome do software.");
      return;
    }

    const cleanPrice = parseCurrencyBRL(newLicenceValor);

    try {
      const data = {
        nome_software: newLicenceSoftware.trim(),
        chaves_compradas: Number(newLicenceChavesCompradas) || 0,
        chaves_em_uso: Number(newLicenceChavesEmUso) || 0,
        preco: cleanPrice,
        data_expiracao: newLicenceExpiracao || null,
      };

      await pb.collection("licencas").create(data);
      toast.success("Licença cadastrada com sucesso!");
      setIsNewLicenceOpen(false);

      // Clear form
      setNewLicenceSoftware("");
      setNewLicenceChavesCompradas("");
      setNewLicenceChavesEmUso("");
      setNewLicenceValor("");
      setNewLicenceExpiracao("");

      // Refresh list
      fetchLicencas();
    } catch (err) {
      console.error("Failed to create license", err);
      toast.error("Erro ao cadastrar licença. Verifique os dados.");
    }
  };

  const filtered = useMemo(() => {
    const q = busca.trim().toLowerCase();
    return licencas.filter((l) => {
      if (q) {
        return l.nome_software?.toLowerCase().includes(q) || false;
      }
      return true;
    });
  }, [licencas, busca]);

  const handleExportCsv = () => {
    const headers = [
      "Nome do Software",
      "Chaves Compradas",
      "Chaves em Uso",
      "Valor da Assinatura",
      "Data de Expiração",
    ];
    const rows = filtered.map((l) => [
      l.nome_software,
      l.chaves_compradas,
      l.chaves_em_uso,
      new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(l.preco || 0),
      l.data_expiracao ? l.data_expiracao.slice(0, 10) : "",
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
    link.setAttribute("download", "licencas_bitestoque.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Licenças exportadas com sucesso!");
  };

  return (
    <AppShell>
      {/* Header */}
      <div className="mb-5 flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-muted">
            <Key className="h-5 w-5 text-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Licenças de Software</h1>
            <p className="text-xs text-muted-foreground">
              Gerencie chaves compradas, assinaturas SaaS e expiração das licenças.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCsv}
            className="inline-flex items-center gap-2 rounded-lg border bg-card px-4 py-2.5 text-sm font-medium hover:bg-muted cursor-pointer"
          >
            <Download className="h-4 w-4" /> Exportar
          </button>
          <button
            onClick={() => setIsNewLicenceOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-foreground text-background px-4 py-2.5 text-sm font-semibold hover:opacity-90 cursor-pointer"
          >
            <Plus className="h-4 w-4" /> Novo Software
          </button>
        </div>
      </div>

      {/* Search Filter */}
      <div className="mb-5 relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar por nome do software..."
          className="w-full rounded-2xl border bg-card py-2.5 pl-10 pr-4 text-sm placeholder:text-muted-foreground/70 focus:border-info focus:outline-none"
        />
      </div>

      {/* Content Table */}
      <section className="rounded-2xl border bg-card">
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/40 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                <th className="px-5 py-4 text-left">Nome do Software</th>
                <th className="px-3 py-4 text-left">Chaves Compradas</th>
                <th className="px-3 py-4 text-left">Chaves em Uso</th>
                <th className="px-3 py-4 text-left">Valor da Assinatura</th>
                <th className="px-3 py-4 text-left">Data de Expiração</th>
                <th className="px-3 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr className="border-t">
                  <td colSpan={6} className="px-5 py-10 text-center text-sm text-muted-foreground">
                    Carregando licenças...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr className="border-t">
                  <td colSpan={6} className="px-5 py-10 text-center text-sm text-muted-foreground">
                    Nenhuma licença encontrada.
                  </td>
                </tr>
              ) : (
                filtered.map((l) => (
                  <tr key={l.id} className="border-t">
                    <td className="px-5 py-4 font-semibold text-foreground">{l.nome_software}</td>
                    <td className="px-3 py-4 text-muted-foreground">{l.chaves_compradas}</td>
                    <td className="px-3 py-4 text-muted-foreground">{l.chaves_em_uso}</td>
                    <td className="px-3 py-4 text-muted-foreground">
                      {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
                        l.preco || 0,
                      )}
                    </td>
                    <td className="px-3 py-4 text-muted-foreground">
                      {l.data_expiracao ? l.data_expiracao.slice(0, 10) : "N/A"}
                    </td>
                    <td className="px-3 py-4 text-right">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => handleOpenEdit(l)}
                          className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
                          aria-label="Editar"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleOpenDelete(l)}
                          className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-red-700 cursor-pointer"
                          aria-label="Excluir"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View for Licenses */}
        <div className="block md:hidden divide-y">
          {loading ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Carregando licenças...
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Nenhuma licença encontrada.
            </div>
          ) : (
            filtered.map((l) => (
              <div key={l.id} className="p-4 space-y-2">
                <div className="font-semibold text-foreground text-sm">{l.nome_software}</div>
                <div className="grid grid-cols-2 gap-2 text-xs pt-1 text-muted-foreground">
                  <div>
                    <span className="block font-medium">Chaves:</span>
                    <span className="text-foreground">
                      {l.chaves_em_uso} / {l.chaves_compradas}
                    </span>
                  </div>
                  <div>
                    <span className="block font-medium">Valor:</span>
                    <span className="text-foreground">
                      {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
                        l.preco || 0,
                      )}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="block font-medium">Data de Expiração:</span>
                    <span className="text-foreground">
                      {l.data_expiracao ? l.data_expiracao.slice(0, 10) : "N/A"}
                    </span>
                  </div>
                  <div className="col-span-2 flex justify-end gap-2 pt-2 border-t mt-1">
                    <button
                      onClick={() => handleOpenEdit(l)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md border text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
                    >
                      <Pencil className="h-3.5 w-3.5" /> Editar
                    </button>
                    <button
                      onClick={() => handleOpenDelete(l)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md border text-xs font-medium text-red-600 hover:bg-red-50 cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Excluir
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t px-5 py-3.5">
          <span className="text-xs text-muted-foreground">
            Mostrando {filtered.length} de {licencas.length} licenças
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

      {/* Cadastrar Licença Dialog */}
      <Dialog open={isNewLicenceOpen} onOpenChange={setIsNewLicenceOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Cadastrar Nova Licença</DialogTitle>
            <DialogDescription>
              Preencha os dados da licença de software / SaaS abaixo.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddLicence} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">
                Nome do Software <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                value={newLicenceSoftware}
                onChange={(e) => setNewLicenceSoftware(e.target.value)}
                placeholder="Ex: Office 365 Enterprise"
                className="w-full rounded-lg border bg-background px-3.5 py-2.5 text-sm focus:border-info focus:outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">
                  Chaves Compradas
                </label>
                <input
                  type="number"
                  value={newLicenceChavesCompradas}
                  onChange={(e) =>
                    setNewLicenceChavesCompradas(
                      e.target.value === "" ? "" : Number(e.target.value),
                    )
                  }
                  placeholder="Ex: 100"
                  className="w-full rounded-lg border bg-background px-3.5 py-2.5 text-sm focus:border-info focus:outline-none"
                  min={0}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Chaves em Uso</label>
                <input
                  type="number"
                  value={newLicenceChavesEmUso}
                  onChange={(e) =>
                    setNewLicenceChavesEmUso(e.target.value === "" ? "" : Number(e.target.value))
                  }
                  placeholder="Ex: 85"
                  className="w-full rounded-lg border bg-background px-3.5 py-2.5 text-sm focus:border-info focus:outline-none"
                  min={0}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">
                Valor da Assinatura
              </label>
              <input
                type="text"
                value={newLicenceValor}
                onChange={(e) => setNewLicenceValor(formatCurrencyBRL(e.target.value))}
                placeholder="Ex: R$ 4.500,00"
                className="w-full rounded-lg border bg-background px-3.5 py-2.5 text-sm focus:border-info focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">
                Data de Expiração
              </label>
              <input
                type="date"
                value={newLicenceExpiracao}
                onChange={(e) => setNewLicenceExpiracao(e.target.value)}
                className="w-full rounded-lg border bg-background px-3.5 py-2.5 text-sm focus:border-info focus:outline-none"
              />
            </div>

            <DialogFooter className="pt-4 gap-2 sm:gap-0">
              <button
                type="button"
                onClick={() => setIsNewLicenceOpen(false)}
                className="rounded-lg border px-4 py-2.5 text-sm font-semibold hover:bg-muted cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="rounded-lg bg-foreground px-4 py-2.5 text-sm font-semibold text-background hover:opacity-90 cursor-pointer"
              >
                Cadastrar
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Editar Licença Dialog */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Editar Licença</DialogTitle>
            <DialogDescription>
              Modifique os dados da licença de software / SaaS selecionada.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleUpdateLicence} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">
                Nome do Software <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                value={editLicenceSoftware}
                onChange={(e) => setEditLicenceSoftware(e.target.value)}
                placeholder="Ex: Office 365 Enterprise"
                className="w-full rounded-lg border bg-background px-3.5 py-2.5 text-sm focus:border-info focus:outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">
                  Chaves Compradas
                </label>
                <input
                  type="number"
                  value={editLicenceChavesCompradas}
                  onChange={(e) =>
                    setEditLicenceChavesCompradas(
                      e.target.value === "" ? "" : Number(e.target.value),
                    )
                  }
                  placeholder="Ex: 100"
                  className="w-full rounded-lg border bg-background px-3.5 py-2.5 text-sm focus:border-info focus:outline-none"
                  min={0}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Chaves em Uso</label>
                <input
                  type="number"
                  value={editLicenceChavesEmUso}
                  onChange={(e) =>
                    setEditLicenceChavesEmUso(e.target.value === "" ? "" : Number(e.target.value))
                  }
                  placeholder="Ex: 85"
                  className="w-full rounded-lg border bg-background px-3.5 py-2.5 text-sm focus:border-info focus:outline-none"
                  min={0}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">
                Valor da Assinatura
              </label>
              <input
                type="text"
                value={editLicenceValor}
                onChange={(e) => setEditLicenceValor(formatCurrencyBRL(e.target.value))}
                placeholder="Ex: R$ 4.500,00"
                className="w-full rounded-lg border bg-background px-3.5 py-2.5 text-sm focus:border-info focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">
                Data de Expiração
              </label>
              <input
                type="date"
                value={editLicenceExpiracao}
                onChange={(e) => setEditLicenceExpiracao(e.target.value)}
                className="w-full rounded-lg border bg-background px-3.5 py-2.5 text-sm focus:border-info focus:outline-none"
              />
            </div>

            <DialogFooter className="pt-4 gap-2 sm:gap-0">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="rounded-lg border px-4 py-2.5 text-sm font-semibold hover:bg-muted cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="rounded-lg bg-foreground px-4 py-2.5 text-sm font-semibold text-background hover:opacity-90 cursor-pointer"
              >
                Salvar Alterações
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Confirmar Exclusão Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Excluir Licença</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir a licença do software{" "}
              <strong className="text-foreground">{licenceToDelete?.nome_software}</strong>? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-4 gap-2 sm:gap-0">
            <button
              type="button"
              onClick={() => setIsDeleteOpen(false)}
              className="rounded-lg border px-4 py-2.5 text-sm font-semibold hover:bg-muted cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleDeleteLicence}
              className="rounded-lg bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 text-sm font-semibold cursor-pointer"
            >
              Excluir
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
