import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Info, ShoppingCart, AlignLeft, Tag, QrCode, ChevronDown, X } from "lucide-react";
import { useState, useRef, useEffect, type FormEvent, type ChangeEvent } from "react";
import { toast } from "sonner";
import { CATEGORIAS_PADRAO } from "@/lib/ativos";
import { pb, createAuditLog } from "@/lib/pocketbase";

export const Route = createFileRoute("/inventario/novo")({
  component: NovoAtivoPage,
});

const statusOptions = ["Estoque", "Em Uso", "Em Manutenção", "Descarte"] as const;
type Status = (typeof statusOptions)[number];

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string | null;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-semibold text-foreground">
        {label} {required && <span className="text-danger">*</span>}
      </label>
      {children}
      {error && <p className="text-xs font-medium text-danger">{error}</p>}
    </div>
  );
}

const inputBase =
  "w-full rounded-lg border bg-background px-3.5 py-2.5 text-sm placeholder:text-muted-foreground/70 focus:outline-none";
const inputCls = `${inputBase} focus:border-info`;
const inputErrorCls = `${inputBase} border-danger focus:border-danger`;

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
  hasError,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  hasError?: boolean;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${hasError ? inputErrorCls : inputCls} appearance-none pr-9`}
      >
        <option value="">Selecione...</option>
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
    </div>
  );
}

function SelectWithId({
  value,
  onChange,
  options,
  hasError,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { id: string; nome: string }[];
  hasError?: boolean;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${hasError ? inputErrorCls : inputCls} appearance-none pr-9`}
      >
        <option value="">Selecione...</option>
        {options.map((o) => (
          <option key={o.id} value={o.id}>{o.nome}</option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
    </div>
  );
}

// Currency mask helpers — store cents, render as BRL
function formatBRL(cents: number): string {
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function parseDigits(s: string): number {
  const d = s.replace(/\D/g, "");
  return d ? parseInt(d, 10) : 0;
}

function NovoAtivoPage() {
  const navigate = useNavigate();

  // form values
  const [nome, setNome] = useState("");
  const [patrimonio, setPatrimonio] = useState("");
  const [categoria, setCategoria] = useState("");
  const [categoriasDb, setCategoriasDb] = useState<{ id: string; nome: string }[]>([]);

  useEffect(() => {
    async function fetchCategorias() {
      try {
        const records = await pb.collection("categorias").getFullList({ $autoCancel: false });
        setCategoriasDb(records.map((r) => ({ id: r.id, nome: r.nome })));
      } catch (err) {
        console.error("Failed to fetch categories from PocketBase", err);
        setCategoriasDb(CATEGORIAS_PADRAO.map((c) => ({ id: c.id, nome: c.nome })));
      }
    }
    fetchCategorias();
  }, []);
  const [localizacao, setLocalizacao] = useState("");
  const [setoresDb, setSetoresDb] = useState<{ id: string; nome: string }[]>([]);

  useEffect(() => {
    async function fetchSetores() {
      try {
        const records = await pb.collection("setores").getFullList({ $autoCancel: false });
        setSetoresDb(records.map((r) => ({ id: r.id, nome: r.nome })));
      } catch (err) {
        console.error("Failed to fetch sectors from PocketBase", err);
      }
    }
    fetchSetores();
  }, []);
  const [status, setStatus] = useState<Status | "">("");
  const [criticidade, setCriticidade] = useState("Baixa");
  const [alugado, setAlugado] = useState(false);
  const [fornecedor, setFornecedor] = useState("");
  const [fornecedoresDb, setFornecedoresDb] = useState<{ id: string; nome: string }[]>([]);

  useEffect(() => {
    async function fetchFornecedores() {
      try {
        const records = await pb.collection("fornecedores").getFullList({ $autoCancel: false });
        setFornecedoresDb(records.map((r) => ({ id: r.id, nome: r.nome })));
      } catch (err) {
        console.error("Failed to fetch suppliers from PocketBase", err);
      }
    }
    fetchFornecedores();
  }, []);
  const [valorCents, setValorCents] = useState(0);
  const [marcaModelo, setMarcaModelo] = useState("");
  const [serie, setSerie] = useState("");
  const [notaFiscal, setNotaFiscal] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [dataAquisicao, setDataAquisicao] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  function onValorChange(e: ChangeEvent<HTMLInputElement>) {
    setValorCents(parseDigits(e.target.value));
  }



  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (isSubmitting) return;

    const newErrors: Record<string, string> = {};
    if (!nome.trim()) newErrors.nome = "Informe o nome do ativo.";
    if (!patrimonio.trim()) newErrors.patrimonio = "Informe o código de patrimônio.";
    if (!categoria) newErrors.categoria = "Selecione a categoria.";
    if (!localizacao) newErrors.localizacao = "Selecione a localização.";
    if (!status) newErrors.status = "Selecione o status atual.";

    if (alugado && !fornecedor) {
      newErrors.fornecedor = "Selecione a empresa locadora.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Preencha os campos obrigatórios.", {
        description: "Revise os campos destacados em vermelho.",
      });
      return;
    }

    setErrors({});
    setIsSubmitting(true);
    
    try {
      const categoryObj = categoriasDb.find((c) => c.nome === categoria);
      const categoriaId = categoryObj ? categoryObj.id : "";

      const nomeDoEstado = nome;
      const patrimonioDoEstado = patrimonio;
      const idDaCategoriaSelecionada = categoriaId;
      const statusSelecionado = (status === "Estoque" || !status) ? "Em Estoque" : status;

      const createdRecord = await pb.collection('ativos').create({
        nome: nomeDoEstado,
        codigo_patrimonio: patrimonioDoEstado,
        categoria: idDaCategoriaSelecionada,
        status: statusSelecionado,
        setor: localizacao || null,
        marca_modelo: marcaModelo,
        numero_serie: serie,
        data_aquisicao: dataAquisicao ? new Date(dataAquisicao).toISOString() : null,
        valor: valorCents / 100,
        nota_fiscal: notaFiscal,
        criticidade,
        alugado,
        fornecedor_locacao: alugado ? (fornecedor || null) : null,
        observacoes,
      }, {
        $autoCancel: false
      });

      await createAuditLog(
        createdRecord.id,
        "Cadastro",
        `Dispositivo ${nomeDoEstado} (Patrimônio: ${patrimonioDoEstado}) foi cadastrado no sistema e inserido no estoque.`
      );

      toast.success("Ativo cadastrado com sucesso!", {
        description: nome,
      });
      navigate({ to: "/inventario" });
    } catch (err: any) {
      console.error("Erro detalhado do PocketBase:", err?.data || err);
      console.error("Failed to save asset in PocketBase", err);
      toast.error("Erro ao cadastrar ativo no banco de dados.", {
        description: err instanceof Error ? err.message : "Erro desconhecido",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AppShell>
      <form onSubmit={handleSubmit} noValidate>
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
          {/* LEFT */}
          <div className="space-y-5">
            <Card icon={Info} title="Informações Básicas">
              <div className="space-y-4">
                <Field label="Nome do Ativo" required error={errors.nome}>
                  <input
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    className={errors.nome ? inputErrorCls : inputCls}
                    placeholder="Ex: Macbook Pro 16' M3"
                  />
                </Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Marca / Modelo">
                    <input
                      name="marcaModelo"
                      value={marcaModelo}
                      onChange={(e) => setMarcaModelo(e.target.value)}
                      className={`${inputCls} font-mono`}
                      placeholder="Ex: Apple / A2780"
                    />
                  </Field>
                  <Field label="Número de Série (S/N)">
                    <input
                      name="serie"
                      value={serie}
                      onChange={(e) => setSerie(e.target.value)}
                      className={`${inputCls} font-mono`}
                      placeholder="EX: C02XG1..."
                    />
                  </Field>
                </div>
                <Field label="Código de Patrimônio" required error={errors.patrimonio}>
                  <div className="flex gap-2">
                    <input
                      value={patrimonio}
                      onChange={(e) => setPatrimonio(e.target.value)}
                      className={`${errors.patrimonio ? inputErrorCls : inputCls} flex-1 font-mono`}
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
                    <input
                      type="date"
                      name="dataAquisicao"
                      value={dataAquisicao}
                      onChange={(e) => setDataAquisicao(e.target.value)}
                      className={inputCls}
                    />
                  </Field>
                  <Field label="Valor do Ativo">
                    <input
                      inputMode="numeric"
                      value={formatBRL(valorCents)}
                      onChange={onValorChange}
                      className={inputCls}
                      placeholder="R$ 0,00"
                    />
                  </Field>
                </div>
                <Field label="Número da Nota Fiscal / Contrato">
                  <input
                    name="notaFiscal"
                    value={notaFiscal}
                    onChange={(e) => setNotaFiscal(e.target.value)}
                    className={inputCls}
                    placeholder={
                      alugado ? "Ex: Número do Contrato de Locação" : "Ex: NF-123456 / CTR-2024-01"
                    }
                  />
                </Field>
                <label className="flex items-center gap-2.5 pt-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={alugado}
                    onChange={(e) => setAlugado(e.target.checked)}
                    className="h-4 w-4 rounded border-border accent-violet"
                  />
                  <span className="text-sm font-semibold text-foreground">
                    Este ativo é alugado?
                  </span>
                </label>
                {alugado && (
                  <Field label="Empresa Locadora / Fornecedor" required error={errors.fornecedor}>
                    <SelectWithId
                      value={fornecedor}
                      onChange={setFornecedor}
                      options={fornecedoresDb}
                      hasError={!!errors.fornecedor}
                    />
                  </Field>
                )}
              </div>
            </Card>

            <Card icon={AlignLeft} title="Observações">
              <textarea
                name="observacoes"
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                rows={5}
                className={`${inputCls} resize-y`}
                placeholder="Detalhes adicionais, histórico de problemas ou especificações técnicas..."
              />
            </Card>
          </div>

          {/* RIGHT */}
          <div className="space-y-5">


            <Card icon={Tag} title="Classificação">
              <div className="space-y-4">
                <Field label="Categoria" required error={errors.categoria}>
                  <Select
                    value={categoria}
                    onChange={setCategoria}
                    hasError={!!errors.categoria}
                    options={categoriasDb.map((c) => c.nome)}
                  />
                </Field>
                <Field label="Localização" required error={errors.localizacao}>
                  <SelectWithId
                    value={localizacao}
                    onChange={setLocalizacao}
                    hasError={!!errors.localizacao}
                    options={setoresDb}
                  />
                </Field>
                <Field label="Status Atual" required error={errors.status}>
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
                              : errors.status
                                ? "border-danger/60 bg-background text-muted-foreground hover:bg-muted"
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

        <div className="mt-6 flex items-center justify-between border-t pt-5">
          <p className="text-xs text-muted-foreground">
            ↻ Campos obrigatórios marcados com <span className="text-danger">*</span>
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
              disabled={isSubmitting}
              className="rounded-lg bg-foreground px-5 py-2.5 text-sm font-semibold text-background hover:opacity-90 disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? "Salvando..." : "Salvar Ativo"}
            </button>
          </div>
        </div>
      </form>
    </AppShell>
  );
}
