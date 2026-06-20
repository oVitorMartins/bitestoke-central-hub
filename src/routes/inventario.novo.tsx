import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import {
  Info,
  ShoppingCart,
  AlignLeft,
  Tag,
  Camera,
  QrCode,
  Calendar,
  ChevronDown,
} from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/inventario/novo")({
  component: NovoAtivoPage,
});

const statusOptions = ["Disponível", "Em Uso", "Manutenção", "Baixado"] as const;
type Status = (typeof statusOptions)[number];

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-semibold text-foreground">{label}</label>
      {children}
    </div>
  );
}

const inputCls =
  "w-full rounded-lg border bg-background px-3.5 py-2.5 text-sm placeholder:text-muted-foreground/70 focus:border-info focus:outline-none";

function Card({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border bg-card p-5">
      <header className="mb-4 flex items-center gap-2">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <h2 className="text-base font-semibold">{title}</h2>
      </header>
      {children}
    </section>
  );
}

function Select({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${inputCls} appearance-none pr-9`}
      >
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
    </div>
  );
}

function NovoAtivoPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<Status>("Disponível");
  const [categoria, setCategoria] = useState("Computadores / Laptops");
  const [localizacao, setLocalizacao] = useState("Sede Principal - Bloco A");
  const [criticidade, setCriticidade] = useState("Baixa");
  const [alugado, setAlugado] = useState(false);
  const [fornecedor, setFornecedor] = useState("Locaweb Corp");

  const fornecedores = [
    "Locaweb Corp",
    "Arklok Outsourcing",
    "Simpress",
    "Fornecedor Hospitalar SP",
  ];

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const entries = Object.fromEntries(fd.entries()) as Record<string, string>;
    const payload = {
      ...entries,
      status,
      categoria,
      localizacao,
      criticidade,
    };
    // eslint-disable-next-line no-console
    console.log("Novo ativo (mock):", payload);
    toast.success("Ativo cadastrado com sucesso!", {
      description: entries.nome || "Registro salvo no inventário.",
    });
    navigate({ to: "/inventario" });
  }

  return (
    <AppShell>
      <form onSubmit={handleSubmit}>
      {/* Breadcrumb + title */}
      <div className="mb-6">
        <nav className="mb-2 flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          <Link to="/inventario" className="hover:text-foreground">
            Inventário
          </Link>
          <span>›</span>
          <span className="text-foreground">Novo Ativo</span>
        </nav>
        <h1 className="text-3xl font-bold tracking-tight">Cadastrar Novo Ativo</h1>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_400px]">
        {/* LEFT COLUMN */}
        <div className="space-y-5">
          <Card icon={Info} title="Informações Básicas">
            <div className="space-y-4">
              <Field label="Nome do Ativo">
                <input name="nome" className={inputCls} placeholder="Ex: Macbook Pro 16' M3" />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Marca / Modelo">
                  <input name="marcaModelo" className={`${inputCls} font-mono`} placeholder="Ex: Apple / A2780" />
                </Field>
                <Field label="Número de Série (S/N)">
                  <input name="serie" className={`${inputCls} font-mono`} placeholder="EX: C02XG1..." />
                </Field>
              </div>
              <Field label="Código de Patrimônio">
                <div className="flex gap-2">
                  <input
                    name="patrimonio"
                    className={`${inputCls} flex-1 font-mono`}
                    placeholder="Ex: AST-2024-001"
                  />
                  <button
                    type="button"
                    className="grid h-[42px] w-[42px] place-items-center rounded-lg border bg-muted text-foreground hover:bg-muted/70"
                    aria-label="Escanear QR Code"
                  >
                    <QrCode className="h-4 w-4" />
                  </button>
                </div>
              </Field>
            </div>
          </Card>

          <Card icon={ShoppingCart} title="Informações de Compra">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Data de Aquisição">
                  <div className="relative">
                    <input
                      type="text"
                      className={inputCls}
                      placeholder="dd/mm/aaaa"
                    />
                    <Calendar className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  </div>
                </Field>
                <Field label="Valor do Ativo">
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                      R$
                    </span>
                    <input className={`${inputCls} pl-10`} placeholder="0,00" />
                  </div>
                </Field>
              </div>
              <Field label="Número da Nota Fiscal / Contrato">
                <input className={inputCls} placeholder="Ex: NF-123456 / CTR-2024-01" />
              </Field>
            </div>
          </Card>

          <Card icon={AlignLeft} title="Observações">
            <textarea
              rows={5}
              className={`${inputCls} resize-y`}
              placeholder="Detalhes adicionais, histórico de problemas ou especificações técnicas..."
            />
          </Card>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-5">
          <button
            type="button"
            className="flex h-[200px] w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-border bg-muted/50 text-muted-foreground transition-colors hover:bg-muted"
          >
            <Camera className="h-7 w-7" />
            <span className="text-[11px] font-semibold uppercase tracking-wider">
              Adicionar Foto
            </span>
          </button>

          <Card icon={Tag} title="Classificação">
            <div className="space-y-4">
              <Field label="Categoria">
                <Select
                  value={categoria}
                  onChange={setCategoria}
                  options={[
                    "Computadores / Laptops",
                    "Monitores",
                    "Periféricos",
                    "Mobiliário",
                    "Outros",
                  ]}
                />
              </Field>
              <Field label="Localização">
                <Select
                  value={localizacao}
                  onChange={setLocalizacao}
                  options={[
                    "Sede Principal - Bloco A",
                    "Sede Principal - Bloco B",
                    "Filial - Centro",
                    "Almoxarifado",
                  ]}
                />
              </Field>
              <Field label="Status Atual">
                <div className="grid grid-cols-2 gap-2.5">
                  {statusOptions.map((s) => {
                    const active = status === s;
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setStatus(s)}
                        className={`rounded-lg border px-3 py-2.5 text-sm font-semibold transition-colors ${
                          active
                            ? "border-violet/60 bg-violet/15 text-foreground"
                            : "border-border bg-background text-muted-foreground hover:bg-muted"
                        }`}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
              </Field>
              <Field label="Criticidade">
                <Select
                  value={criticidade}
                  onChange={setCriticidade}
                  options={["Baixa", "Média", "Alta", "Crítica"]}
                />
              </Field>
            </div>
          </Card>
        </div>
      </div>

      {/* Footer bar */}
      <div className="mt-6 flex items-center justify-between border-t pt-5">
        <p className="text-xs text-muted-foreground">
          ↻ Campos obrigatórios marcados com auto-validação
        </p>
        <div className="flex items-center gap-3">
          <Link
            to="/inventario"
            className="rounded-lg border bg-background px-5 py-2.5 text-sm font-semibold hover:bg-muted"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            className="rounded-lg bg-foreground px-5 py-2.5 text-sm font-semibold text-background hover:opacity-90"
          >
            Salvar Ativo
          </button>
        </div>
      </div>
      </form>
    </AppShell>
  );
}
