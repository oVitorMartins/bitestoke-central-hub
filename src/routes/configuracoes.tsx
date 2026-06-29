import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, type FormEvent } from "react";
import { Plus, Trash2, Pencil, Users, Building2, Tag, Truck, Monitor, Key } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { pb } from "@/lib/pocketbase";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/configuracoes")({
  head: () => ({
    meta: [
      { title: "Configurações — BitEstoque" },
      {
        name: "description",
        content: "Gerencie usuários, setores, categorias e fornecedores do sistema.",
      },
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

type Usuario = {
  id: string;
  name: string;
  email: string;
  perfil: "Admin" | "Gestor" | "Técnico";
  created: string;
};

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

      {/* Desktop view (visible from md and up) */}
      <div className="hidden md:grid gap-5 lg:grid-cols-[220px_1fr]">
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
          {tab === "setores" && <SetoresTab />}
          {tab === "categorias" && <CategoriasTab />}
          {tab === "fornecedores" && <FornecedoresTab />}
        </section>
      </div>

      {/* Mobile restriction message (visible on screens smaller than md) */}
      <div className="flex md:hidden flex-col items-center justify-center text-center p-8 border bg-card rounded-2xl min-h-[350px] space-y-4">
        <div className="grid h-16 w-16 place-items-center rounded-full bg-muted text-muted-foreground">
          <Monitor className="h-8 w-8" />
        </div>
        <div className="space-y-2 max-w-sm">
          <h2 className="text-lg font-bold text-foreground">Acesso Restrito ao Desktop</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Por motivos de segurança e usabilidade, a aba de Configurações está disponível apenas
            para computadores. Por favor, acesse através de um desktop.
          </p>
        </div>
      </div>
    </AppShell>
  );
}

function UsuariosTab() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [perfil, setPerfil] = useState<"Admin" | "Técnico">("Técnico");
  const [senha, setSenha] = useState("");
  const [senhaConfirm, setSenhaConfirm] = useState("");

  // Modal redefinição de senha direta states
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [resetUser, setResetUser] = useState<Usuario | null>(null);
  const [novaSenha, setNovaSenha] = useState("");
  const [novaSenhaConfirm, setNovaSenhaConfirm] = useState("");

  const fetchUsuarios = async () => {
    try {
      setLoading(true);
      const records = await pb.collection("users").getFullList<Usuario>({
        sort: "-created",
        $autoCancel: false,
      });
      setUsuarios(records);
    } catch (err) {
      console.error("Failed to fetch users", err);
      toast.error("Erro ao carregar usuários.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  function handleNovo() {
    setNome("");
    setEmail("");
    setPerfil("Técnico");
    setSenha("");
    setSenhaConfirm("");
    setIsModalOpen(true);
  }

  const handleRemover = async (id: string) => {
    try {
      await pb.collection("users").delete(id);
      toast.success("Usuário removido com sucesso.");
      fetchUsuarios();
    } catch (err) {
      console.error("Failed to delete user", err);
      toast.error("Erro ao remover usuário.");
    }
  };

  const handleOpenResetModal = (u: Usuario) => {
    setResetUser(u);
    setNovaSenha("");
    setNovaSenhaConfirm("");
    setIsResetModalOpen(true);
  };

  const handleConfirmResetSenha = async (e: FormEvent) => {
    e.preventDefault();
    if (!resetUser) return;

    if (!novaSenha || !novaSenhaConfirm) {
      toast.error("Por favor, preencha todos os campos.");
      return;
    }

    if (novaSenha !== novaSenhaConfirm) {
      toast.error("As senhas não coincidem.");
      return;
    }

    if (novaSenha.length < 8) {
      toast.error("A nova senha deve ter no mínimo 8 caracteres.");
      return;
    }

    try {
      await pb.collection("users").update(
        resetUser.id,
        {
          password: novaSenha,
          passwordConfirm: novaSenhaConfirm,
        },
        { $autoCancel: false },
      );

      toast.success("Senha do usuário atualizada com sucesso!");
      setIsResetModalOpen(false);

      // Reset
      setNovaSenha("");
      setNovaSenhaConfirm("");
      setResetUser(null);
    } catch (err: any) {
      console.error("Failed to update password", err);
      toast.error(err.message || "Erro ao atualizar a senha.");
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!nome.trim() || !email.trim() || !senha) {
      toast.error("Preencha todos os campos obrigatórios.");
      return;
    }

    if (senha !== senhaConfirm) {
      toast.error("As senhas não coincidem.");
      return;
    }

    if (senha.length < 8) {
      toast.error("A senha deve ter no mínimo 8 caracteres.");
      return;
    }

    try {
      await pb.collection("users").create(
        {
          email: email.trim(),
          password: senha,
          passwordConfirm: senhaConfirm,
          name: nome.trim(),
          perfil: perfil,
          emailVisibility: true,
        },
        { $autoCancel: false },
      );

      toast.success("Usuário cadastrado com sucesso.");
      setIsModalOpen(false);

      // Reset
      setNome("");
      setEmail("");
      setSenha("");
      setSenhaConfirm("");
      setPerfil("Técnico");

      fetchUsuarios();
    } catch (err: any) {
      console.error("Failed to create user", err);
      toast.error(err.message || "Erro ao cadastrar usuário. Verifique as credenciais.");
    }
  };

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
          className="inline-flex items-center gap-2 rounded-lg bg-foreground px-4 py-2.5 text-sm font-semibold text-background hover:opacity-90 cursor-pointer"
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
              <th className="px-4 py-3 text-left">Data de Criação</th>
              <th className="px-4 py-3 text-left">Perfil</th>
              <th className="px-4 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr className="border-t">
                <td colSpan={5} className="px-4 py-8 text-center text-sm text-muted-foreground">
                  Carregando usuários...
                </td>
              </tr>
            ) : usuarios.map((u) => (
              <tr key={u.id} className="border-t">
                <td className="px-4 py-3 font-semibold">{u.name || (u as any).nome || "N/A"}</td>
                <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {u.created ? u.created.slice(0, 10) : "N/A"}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                      u.perfil === "Admin"
                        ? "bg-violet-bg text-violet ring-1 ring-violet/30"
                        : u.perfil === "Gestor"
                          ? "bg-warning-bg text-warning ring-1 ring-warning/30"
                          : "bg-info-bg text-info ring-1 ring-info/30"
                    }`}
                  >
                    {u.perfil || "Técnico"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-1">
                    <button
                      onClick={() => handleOpenResetModal(u)}
                      className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
                      aria-label="Redefinir Senha"
                      title="Redefinir Senha"
                    >
                      <Key className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleRemover(u.id)}
                      className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-danger cursor-pointer"
                      aria-label="Remover"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!loading && usuarios.length === 0 && (
              <tr className="border-t">
                <td colSpan={5} className="px-4 py-8 text-center text-sm text-muted-foreground">
                  Nenhum usuário cadastrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Cadastrar Novo Usuário</DialogTitle>
            <DialogDescription>
              Preencha as informações abaixo para criar um novo usuário.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Nome Completo</label>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex: João Silva"
                className="w-full rounded-lg border bg-background px-3.5 py-2.5 text-sm placeholder:text-muted-foreground/70 focus:border-info focus:outline-none"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">E-mail</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Ex: joao@hospital.com"
                className="w-full rounded-lg border bg-background px-3.5 py-2.5 text-sm placeholder:text-muted-foreground/70 focus:border-info focus:outline-none"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">
                Perfil de Acesso
              </label>
              <select
                value={perfil}
                onChange={(e) => setPerfil(e.target.value as "Admin" | "Técnico")}
                className="w-full rounded-lg border bg-background px-3.5 py-2.5 text-sm focus:border-info focus:outline-none"
              >
                <option value="Admin">Admin</option>
                <option value="Técnico">Técnico</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">
                Senha Inicial
              </label>
              <input
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="Mínimo 8 caracteres"
                className="w-full rounded-lg border bg-background px-3.5 py-2.5 text-sm placeholder:text-muted-foreground/70 focus:border-info focus:outline-none"
                required
                minLength={8}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">
                Confirmar Senha
              </label>
              <input
                type="password"
                value={senhaConfirm}
                onChange={(e) => setSenhaConfirm(e.target.value)}
                placeholder="Digite a senha novamente"
                className="w-full rounded-lg border bg-background px-3.5 py-2.5 text-sm placeholder:text-muted-foreground/70 focus:border-info focus:outline-none"
                required
                minLength={8}
              />
            </div>

            <DialogFooter className="pt-4 gap-2 sm:gap-0">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
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

      {/* Redefinir Senha Direta Dialog */}
      <Dialog open={isResetModalOpen} onOpenChange={setIsResetModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Redefinir Senha</DialogTitle>
            <DialogDescription>
              Defina uma nova senha para o usuário <strong className="text-foreground">{resetUser?.name || (resetUser as any)?.nome}</strong>.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleConfirmResetSenha} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Nova Senha</label>
              <input
                type="password"
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
                placeholder="Mínimo 8 caracteres"
                className="w-full rounded-lg border bg-background px-3.5 py-2.5 text-sm placeholder:text-muted-foreground/70 focus:border-info focus:outline-none"
                required
                minLength={8}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Confirmar Nova Senha</label>
              <input
                type="password"
                value={novaSenhaConfirm}
                onChange={(e) => setNovaSenhaConfirm(e.target.value)}
                placeholder="Repita a nova senha"
                className="w-full rounded-lg border bg-background px-3.5 py-2.5 text-sm placeholder:text-muted-foreground/70 focus:border-info focus:outline-none"
                required
                minLength={8}
              />
            </div>

            <DialogFooter className="pt-4 gap-2 sm:gap-0">
              <button
                type="button"
                onClick={() => setIsResetModalOpen(false)}
                className="rounded-lg border px-4 py-2.5 text-sm font-semibold hover:bg-muted cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="rounded-lg bg-foreground px-4 py-2.5 text-sm font-semibold text-background hover:opacity-90 cursor-pointer"
              >
                Redefinir Senha
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
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

function FornecedoresTab() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [nome, setNome] = useState("");
  const [contato, setContato] = useState("");

  const fetchItems = async () => {
    try {
      setLoading(true);
      const records = await pb.collection("fornecedores").getFullList({
        sort: "nome",
        $autoCancel: false,
      });
      setItems(records);
    } catch (err) {
      console.error("Failed to fetch fornecedores", err);
      toast.error("Erro ao carregar fornecedores.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  async function add(e: FormEvent) {
    e.preventDefault();
    const n = nome.trim();
    if (!n) return;

    if (items.some((i) => i.nome.toLowerCase() === n.toLowerCase())) {
      toast.error("Este fornecedor já existe.");
      return;
    }

    try {
      await pb.collection("fornecedores").create(
        { nome: n, contato: contato.trim() || "" },
        { $autoCancel: false }
      );
      setNome("");
      setContato("");
      toast.success(`${n} adicionado com sucesso!`);
      fetchItems();
    } catch (err) {
      console.error("Failed to create fornecedor", err);
      toast.error("Erro ao adicionar fornecedor.");
    }
  }

  async function remove(id: string, name: string) {
    try {
      await pb.collection("fornecedores").delete(id);
      toast.success(`${name} removido.`);
      fetchItems();
    } catch (err) {
      console.error("Failed to delete fornecedor", err);
      toast.error("Erro ao remover fornecedor.");
    }
  }

  return (
    <>
      <header className="mb-4">
        <h2 className="text-lg font-semibold">Fornecedores de Locação</h2>
        <p className="text-sm text-muted-foreground">Empresas parceiras de locação de equipamentos.</p>
      </header>

      <form onSubmit={add} className="mb-4 flex flex-col sm:flex-row gap-2">
        <input
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Nome da empresa locadora"
          className="flex-1 rounded-lg border bg-background px-3.5 py-2.5 text-sm placeholder:text-muted-foreground/70 focus:border-info focus:outline-none"
          required
        />
        <input
          value={contato}
          onChange={(e) => setContato(e.target.value)}
          placeholder="Contato / E-mail / Telefone (Opcional)"
          className="flex-1 rounded-lg border bg-background px-3.5 py-2.5 text-sm placeholder:text-muted-foreground/70 focus:border-info focus:outline-none"
        />
        <button
          type="submit"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-foreground px-4 py-2.5 text-sm font-semibold text-background hover:opacity-90 cursor-pointer shrink-0"
        >
          <Plus className="h-4 w-4" /> Cadastrar Empresa
        </button>
      </form>

      <ul className="divide-y rounded-xl border">
        {loading ? (
          <li className="px-4 py-8 text-center text-sm text-muted-foreground">
            Carregando fornecedores...
          </li>
        ) : (
          items.map((item) => (
            <li key={item.id} className="flex items-center justify-between px-4 py-3 text-sm">
              <div className="flex flex-col">
                <span className="font-medium text-foreground">{item.nome}</span>
                {item.contato && (
                  <span className="text-xs text-muted-foreground">{item.contato}</span>
                )}
              </div>
              <button
                onClick={() => remove(item.id, item.nome)}
                className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-danger cursor-pointer"
                aria-label={`Remover ${item.nome}`}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))
        )}
        {!loading && items.length === 0 && (
          <li className="px-4 py-8 text-center text-sm text-muted-foreground">
            Nenhum fornecedor cadastrado.
          </li>
        )}
      </ul>
    </>
  );
}

type PocketBaseItem = {
  id: string;
  nome: string;
  created: string;
};

function SetoresTab() {
  const [items, setItems] = useState<PocketBaseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [novo, setNovo] = useState("");

  const fetchItems = async () => {
    try {
      setLoading(true);
      const records = await pb.collection("setores").getFullList<PocketBaseItem>({
        sort: "nome",
        $autoCancel: false,
      });
      setItems(records);
    } catch (err) {
      console.error("Failed to fetch setores", err);
      toast.error("Erro ao carregar setores.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  async function add(e: FormEvent) {
    e.preventDefault();
    const v = novo.trim();
    if (!v) return;

    if (items.some((i) => i.nome.toLowerCase() === v.toLowerCase())) {
      toast.error("Este setor já existe.");
      return;
    }

    try {
      await pb.collection("setores").create({ nome: v }, { $autoCancel: false });
      setNovo("");
      toast.success(`${v} adicionado com sucesso!`);
      fetchItems();
    } catch (err) {
      console.error("Failed to create setor", err);
      toast.error("Erro ao adicionar setor.");
    }
  }

  async function remove(id: string, name: string) {
    try {
      await pb.collection("setores").delete(id);
      toast.success(`${name} removido.`);
      fetchItems();
    } catch (err) {
      console.error("Failed to delete setor", err);
      toast.error("Erro ao remover setor.");
    }
  }

  return (
    <>
      <header className="mb-4">
        <h2 className="text-lg font-semibold">Setores</h2>
        <p className="text-sm text-muted-foreground">Setores do hospital usados para localização dos ativos.</p>
      </header>

      <form onSubmit={add} className="mb-4 flex gap-2">
        <input
          value={novo}
          onChange={(e) => setNovo(e.target.value)}
          placeholder="Adicionar novo setor (ex: Pronto-Socorro)"
          className="flex-1 rounded-lg border bg-background px-3.5 py-2.5 text-sm placeholder:text-muted-foreground/70 focus:border-info focus:outline-none"
        />
        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-lg bg-foreground px-4 py-2.5 text-sm font-semibold text-background hover:opacity-90 cursor-pointer"
        >
          <Plus className="h-4 w-4" /> Adicionar
        </button>
      </form>

      <ul className="divide-y rounded-xl border">
        {loading ? (
          <li className="px-4 py-8 text-center text-sm text-muted-foreground">
            Carregando setores...
          </li>
        ) : (
          items.map((item) => (
            <li key={item.id} className="flex items-center justify-between px-4 py-3 text-sm">
              <span className="font-medium text-foreground">{item.nome}</span>
              <button
                onClick={() => remove(item.id, item.nome)}
                className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-danger cursor-pointer"
                aria-label={`Remover ${item.nome}`}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))
        )}
        {!loading && items.length === 0 && (
          <li className="px-4 py-8 text-center text-sm text-muted-foreground">
            Nenhum setor cadastrado.
          </li>
        )}
      </ul>
    </>
  );
}

function CategoriasTab() {
  const [items, setItems] = useState<PocketBaseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [novo, setNovo] = useState("");

  const fetchItems = async () => {
    try {
      setLoading(true);
      const records = await pb.collection("categorias").getFullList<PocketBaseItem>({
        sort: "nome",
        $autoCancel: false,
      });
      setItems(records);
    } catch (err) {
      console.error("Failed to fetch categorias", err);
      toast.error("Erro ao carregar categorias.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  async function add(e: FormEvent) {
    e.preventDefault();
    const v = novo.trim();
    if (!v) return;

    if (items.some((i) => i.nome.toLowerCase() === v.toLowerCase())) {
      toast.error("Esta categoria já existe.");
      return;
    }

    try {
      await pb.collection("categorias").create({ nome: v }, { $autoCancel: false });
      setNovo("");
      toast.success(`${v} adicionado com sucesso!`);
      fetchItems();
    } catch (err) {
      console.error("Failed to create categoria", err);
      toast.error("Erro ao adicionar categoria.");
    }
  }

  async function remove(id: string, name: string) {
    try {
      await pb.collection("categorias").delete(id);
      toast.success(`${name} removido.`);
      fetchItems();
    } catch (err) {
      console.error("Failed to delete categoria", err);
      toast.error("Erro ao remover categoria.");
    }
  }

  return (
    <>
      <header className="mb-4">
        <h2 className="text-lg font-semibold">Categorias</h2>
        <p className="text-sm text-muted-foreground">Tipos de ativos disponíveis no inventário.</p>
      </header>

      <form onSubmit={add} className="mb-4 flex gap-2">
        <input
          value={novo}
          onChange={(e) => setNovo(e.target.value)}
          placeholder="Adicionar nova categoria (ex: Servidor)"
          className="flex-1 rounded-lg border bg-background px-3.5 py-2.5 text-sm placeholder:text-muted-foreground/70 focus:border-info focus:outline-none"
        />
        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-lg bg-foreground px-4 py-2.5 text-sm font-semibold text-background hover:opacity-90 cursor-pointer"
        >
          <Plus className="h-4 w-4" /> Adicionar
        </button>
      </form>

      <ul className="divide-y rounded-xl border">
        {loading ? (
          <li className="px-4 py-8 text-center text-sm text-muted-foreground">
            Carregando categorias...
          </li>
        ) : (
          items.map((item) => (
            <li key={item.id} className="flex items-center justify-between px-4 py-3 text-sm">
              <span className="font-medium text-foreground">{item.nome}</span>
              <button
                onClick={() => remove(item.id, item.nome)}
                className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-danger cursor-pointer"
                aria-label={`Remover ${item.nome}`}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))
        )}
        {!loading && items.length === 0 && (
          <li className="px-4 py-8 text-center text-sm text-muted-foreground">
            Nenhuma categoria cadastrada.
          </li>
        )}
      </ul>
    </>
  );
}
