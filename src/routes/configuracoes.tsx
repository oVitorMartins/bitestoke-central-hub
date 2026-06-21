import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Plus, Trash2, Users, Building2, Tag, Truck } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/configuracoes")({
  head: () => ({
    meta: [
      { title: "Configurações — AssetTrack IT" },
      { name: "description", content: "Gerencie usuários, setores, categorias e fornecedores do sistema." },
    ],
  }),
  component: ConfiguracoesPage,
});

type TabId = "usuarios" | "setores" | "categorias" | "fornecedores";

const tabs: { id: TabId; label: string; icon: typeof Users }[] = [
  { id: "usuarios", label: "Usuários", icon: Users },
  { id: "setores", label: "Setores", icon: Building2 },
  { id: "categorias", label: "Categorias", icon: Tag },
  { id: "fornecedores", label: "Fornecedores de Locação", icon: Truck },
];

type Usuario = { id: string; nome: string; email: string; perfil: "Admin" | "Técnico" };

function ConfiguracoesPage() {
  const [tab, setTab] = useState<TabId>("usuarios");

  return (
    <AppShell>
      <div className="mb-5">
        <h1 className="text-2xl font-bold tracking-tight">Configurações</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Gerencie cadastros de apoio do sistema de inventário.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[220px_1fr]">
        {/* Vertical tabs */}
        <nav className="flex flex-row gap-2 overflow-x-auto rounded-2xl border bg-card p-2 lg:flex-col lg:overflow-visible">
          {tabs.map((t) => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                  active
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="whitespace-nowrap">{t.label}</span>
              </button>
            );
          })}
        </nav>

        <section className="rounded-2xl border bg-card p-5">
          {tab === "usuarios" && <UsuariosTab />}
          {tab === "setores" && (
            <ListTab
              title="Setores"
              description="Setores do hospital usados para localização dos ativos."
              placeholder="Adicionar novo setor (ex: Pronto-Socorro)"
              initial={["TI", "Pronto-Socorro", "Administrativo", "Enfermaria", "UTI"]}
            />
          )}
          {tab === "categorias" && (
            <ListTab
              title="Categorias"
              description="Tipos de ativos disponíveis no inventário."
              placeholder="Adicionar nova categoria (ex: Servidor)"
              initial={["Notebook", "Monitor", "Servidor", "Rede", "Periféricos"]}
            />
          )}
          {tab === "fornecedores" && (
            <ListTab
              title="Fornecedores de Locação"
              description="Empresas parceiras de locação de equipamentos."
              placeholder="Adicionar nova empresa locadora"
              initial={["Locaweb Corp", "Arklok Outsourcing", "Simpress", "Fornecedor Hospitalar SP"]}
              buttonLabel="Cadastrar Empresa"
            />
          )}
        </section>
      </div>
    </AppShell>
  );
}

function UsuariosTab() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([
    { id: "u1", nome: "Vitor Santos", email: "vitor.santos@hospital.com", perfil: "Admin" },
    { id: "u2", nome: "Camila Ribeiro", email: "camila.ribeiro@hospital.com", perfil: "Técnico" },
  ]);

  function handleNovo() {
    toast.info("Abrir cadastro de novo usuário (mock).");
  }

  function handleRemover(id: string) {
    setUsuarios((prev) => prev.filter((u) => u.id !== id));
    toast.success("Usuário removido.");
  }

  return (
    <>
      <header className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Usuários</h2>
          <p className="text-sm text-muted-foreground">
            Equipe com acesso ao sistema de inventário.
          </p>
        </div>
        <button
          onClick={handleNovo}
          className="inline-flex items-center gap-2 rounded-lg bg-foreground px-4 py-2.5 text-sm font-semibold text-background hover:opacity-90"
        >
          <Plus className="h-4 w-4" /> Novo Usuário
        </button>
      </header>

      <div className="overflow-hidden rounded-xl border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/40 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              <th className="px-4 py-3 text-left">Nome</th>
              <th className="px-4 py-3 text-left">E-mail</th>
              <th className="px-4 py-3 text-left">Perfil</th>
              <th className="px-4 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u) => (
              <tr key={u.id} className="border-t">
                <td className="px-4 py-3 font-semibold">{u.nome}</td>
                <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                      u.perfil === "Admin"
                        ? "bg-violet-bg text-violet ring-1 ring-violet/30"
                        : "bg-info-bg text-info ring-1 ring-info/30"
                    }`}
                  >
                    {u.perfil}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => handleRemover(u.id)}
                    className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-danger"
                    aria-label="Remover"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
            {usuarios.length === 0 && (
              <tr className="border-t">
                <td colSpan={4} className="px-4 py-8 text-center text-sm text-muted-foreground">
                  Nenhum usuário cadastrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

function ListTab({
  title,
  description,
  placeholder,
  initial,
  buttonLabel = "Adicionar",
}: {
  title: string;
  description: string;
  placeholder: string;
  initial: string[];
  buttonLabel?: string;
}) {
  const [items, setItems] = useState<string[]>(initial);
  const [novo, setNovo] = useState("");

  function add(e: FormEvent) {
    e.preventDefault();
    const v = novo.trim();
    if (!v) return;
    if (items.some((i) => i.toLowerCase() === v.toLowerCase())) {
      toast.error("Este item já existe.");
      return;
    }
    setItems((prev) => [...prev, v]);
    setNovo("");
    toast.success(`${v} adicionado com sucesso!`);
  }

  function remove(item: string) {
    setItems((prev) => prev.filter((i) => i !== item));
    toast.success(`${item} removido.`);
  }

  return (
    <>
      <header className="mb-4">
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </header>

      <form onSubmit={add} className="mb-4 flex gap-2">
        <input
          value={novo}
          onChange={(e) => setNovo(e.target.value)}
          placeholder={placeholder}
          className="flex-1 rounded-lg border bg-background px-3.5 py-2.5 text-sm placeholder:text-muted-foreground/70 focus:border-info focus:outline-none"
        />
        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-lg bg-foreground px-4 py-2.5 text-sm font-semibold text-background hover:opacity-90"
        >
          <Plus className="h-4 w-4" /> {buttonLabel}
        </button>
      </form>

      <ul className="divide-y rounded-xl border">
        {items.map((item) => (
          <li key={item} className="flex items-center justify-between px-4 py-3 text-sm">
            <span className="font-medium text-foreground">{item}</span>
            <button
              onClick={() => remove(item)}
              className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-danger"
              aria-label={`Remover ${item}`}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </li>
        ))}
        {items.length === 0 && (
          <li className="px-4 py-8 text-center text-sm text-muted-foreground">
            Nenhum item cadastrado.
          </li>
        )}
      </ul>
    </>
  );
}
