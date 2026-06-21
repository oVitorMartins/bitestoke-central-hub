import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { Key, Plus, Search, X, ChevronLeft, ChevronRight, Download } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { toast } from "sonner";
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
  software: string;
  chavesCompradas: number;
  chavesEmUso: number;
  valor: string;
  expiracao: string;
};

const initialLicencas: Licenca[] = [
  {
    id: "l1",
    software: "Office 365 Enterprise",
    chavesCompradas: 150,
    chavesEmUso: 124,
    valor: "R$ 4.500,00",
    expiracao: "2027-03-15",
  },
  {
    id: "l2",
    software: "Kaspersky Endpoint Security",
    chavesCompradas: 200,
    chavesEmUso: 185,
    valor: "R$ 2.800,00",
    expiracao: "2026-12-01",
  },
  {
    id: "l3",
    software: "Adobe Creative Cloud",
    chavesCompradas: 20,
    chavesEmUso: 18,
    valor: "R$ 3.200,00",
    expiracao: "2026-08-30",
  },
  {
    id: "l4",
    software: "Zoom Business",
    chavesCompradas: 50,
    chavesEmUso: 42,
    valor: "R$ 1.500,00",
    expiracao: "2027-01-10",
  },
];

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
  const [licencas, setLicencas] = useState<Licenca[]>(initialLicencas);
  const [busca, setBusca] = useState("");
  const [currentUser, setCurrentUser] = useState<{ nome: string; perfil: string } | null>(null);

  // Modal registration states
  const [isNewLicenceOpen, setIsNewLicenceOpen] = useState(false);
  const [newLicenceSoftware, setNewLicenceSoftware] = useState("");
  const [newLicenceChavesCompradas, setNewLicenceChavesCompradas] = useState<number | "">("");
  const [newLicenceChavesEmUso, setNewLicenceChavesEmUso] = useState<number | "">("");
  const [newLicenceValor, setNewLicenceValor] = useState("");
  const [newLicenceExpiracao, setNewLicenceExpiracao] = useState("");

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

  const handleAddLicence = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLicenceSoftware.trim()) {
      toast.error("Preencha o nome do software.");
      return;
    }

    const item: Licenca = {
      id: "l_" + Date.now(),
      software: newLicenceSoftware.trim(),
      chavesCompradas: Number(newLicenceChavesCompradas) || 0,
      chavesEmUso: Number(newLicenceChavesEmUso) || 0,
      valor: newLicenceValor.trim() || "R$ 0,00",
      expiracao: newLicenceExpiracao || "N/A",
    };

    setLicencas((prev) => [...prev, item]);
    setIsNewLicenceOpen(false);
    toast.success("Licença cadastrada com sucesso!");

    setNewLicenceSoftware("");
    setNewLicenceChavesCompradas("");
    setNewLicenceChavesEmUso("");
    setNewLicenceValor("");
    setNewLicenceExpiracao("");
  };

  const filtered = useMemo(() => {
    const q = busca.trim().toLowerCase();
    return licencas.filter((l) => {
      if (q) {
        return l.software.toLowerCase().includes(q);
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
      l.software,
      l.chavesCompradas,
      l.chavesEmUso,
      l.valor,
      l.expiracao,
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
              </tr>
            </thead>
            <tbody>
              {filtered.map((l) => (
                <tr key={l.id} className="border-t">
                  <td className="px-5 py-4 font-semibold text-foreground">{l.software}</td>
                  <td className="px-3 py-4 text-muted-foreground">{l.chavesCompradas}</td>
                  <td className="px-3 py-4 text-muted-foreground">{l.chavesEmUso}</td>
                  <td className="px-3 py-4 text-muted-foreground">{l.valor}</td>
                  <td className="px-3 py-4 text-muted-foreground">{l.expiracao}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr className="border-t">
                  <td colSpan={5} className="px-5 py-10 text-center text-sm text-muted-foreground">
                    Nenhuma licença encontrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View for Licenses */}
        <div className="block md:hidden divide-y">
          {filtered.map((l) => (
            <div key={l.id} className="p-4 space-y-2">
              <div className="font-semibold text-foreground text-sm">{l.software}</div>
              <div className="grid grid-cols-2 gap-2 text-xs pt-1 text-muted-foreground">
                <div>
                  <span className="block font-medium">Chaves:</span>
                  <span className="text-foreground">
                    {l.chavesEmUso} / {l.chavesCompradas}
                  </span>
                </div>
                <div>
                  <span className="block font-medium">Valor:</span>
                  <span className="text-foreground">{l.valor}</span>
                </div>
                <div className="col-span-2">
                  <span className="block font-medium">Data de Expiração:</span>
                  <span className="text-foreground">{l.expiracao}</span>
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Nenhuma licença encontrada.
            </div>
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
                onChange={(e) => setNewLicenceValor(e.target.value)}
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
    </AppShell>
  );
}
