import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, Lock, Eye, EyeOff, Package } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Login — BitEstoque" },
      { name: "description", content: "Acesse o painel do BitEstoque." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error("Preencha todos os campos para entrar.");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success("Bem-vindo de volta!");
      navigate({ to: "/" });
    }, 1000);
  };

  return (
    <div className="flex min-h-screen w-screen bg-background overflow-hidden">
      {/* Lado Esquerdo - Institucional (Visível apenas em telas médias e grandes) */}
      <div className="hidden md:flex md:w-1/2 bg-zinc-900 dark:bg-zinc-950 p-12 flex-col justify-between text-white relative">
        <div className="absolute inset-0 bg-radial from-zinc-800 to-transparent opacity-30 pointer-events-none" />
        <div className="flex items-center gap-3 relative z-10">
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-white text-zinc-950">
            <Package className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold tracking-tight">BitEstoque</span>
        </div>

        <div className="space-y-4 relative z-10 max-w-md">
          <h2 className="text-4xl font-extrabold tracking-tight leading-tight">
            A gestão de ativos de TI simplificada para o seu negócio.
          </h2>
          <p className="text-zinc-400 text-sm leading-relaxed">
            Monitore, edite, audite e distribua o inventário de equipamentos e licenças da sua
            empresa em um único painel ágil e intuitivo.
          </p>
        </div>

        <div className="text-xs text-zinc-500 relative z-10">
          © {new Date().getFullYear()} BitEstoque. Todos os direitos reservados.
        </div>
      </div>

      {/* Lado Direito - Formulário de Login */}
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-6 sm:p-12 bg-background">
        <div className="w-full max-w-[400px] space-y-8">
          {/* Header Mobile / Brand visible only on small screens */}
          <div className="flex flex-col items-center md:hidden mb-8 space-y-3">
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-950">
              <Package className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">BitEstoque</h1>
          </div>

          <div className="space-y-2 text-center md:text-left">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Bem-vindo ao BitEstoque
            </h1>
            <p className="text-sm text-muted-foreground">
              Insira suas credenciais para acessar o inventário
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground" htmlFor="email">
                E-mail
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground/60">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Ex: gestor@bitestoque.com"
                  className="w-full rounded-lg border bg-background pl-10 pr-3.5 py-2.5 text-sm placeholder:text-muted-foreground/50 focus:border-zinc-900 focus:outline-none dark:focus:border-zinc-100 transition-colors"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground" htmlFor="password">
                Senha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground/60">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite sua senha"
                  className="w-full rounded-lg border bg-background pl-10 pr-10 py-2.5 text-sm placeholder:text-muted-foreground/50 focus:border-zinc-900 focus:outline-none dark:focus:border-zinc-100 transition-colors"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground/60 hover:text-foreground cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-950 font-semibold py-2.5 text-sm transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>

          <p className="text-xs text-center text-muted-foreground px-4 leading-relaxed">
            Esqueceu sua senha? Solicite a redefinição ao Administrador do sistema.
          </p>
        </div>
      </div>
    </div>
  );
}
