import { createFileRoute, Link, useNavigate, notFound } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Info, ShoppingCart, AlignLeft, Tag, QrCode, ChevronDown, X } from "lucide-react";
import { useState, useRef, useEffect, type FormEvent, type ChangeEvent } from "react";
import { getAtivo, CATEGORIAS_PADRAO } from "@/lib/ativos";
import { pb, createAuditLog } from "@/lib/pocketbase";
import { toast } from "sonner";

export const Route = createFileRoute("/inventario/editar/$id")({
  loader: async ({ params }) => {
    try {
      const record = await pb.collection("ativos").getOne(params.id, {
        expand: "categoria",
        $autoCancel: false,
      });

      const displayStatus = (record.status === "Em Estoque" || record.status === "Estoque") ? "Estoque" : record.status;
      const categoryName = record.expand?.categoria?.nome || record.categoria_nome || "";

      const mappedAtivo = {
        id: record.id,
        nome: record.nome || "",
        specs: record.marca_modelo || record.observacoes || "",
        marcaModelo: record.marca_modelo || "",
        categoria: categoryName,
        patrimonio: record.codigo_patrimonio || "",
        serie: record.numero_serie || "",
        status: displayStatus,
        localizacao: record.localizacao || "TI",
        dataAquisicao: record.data_aquisicao ? new Date(record.data_aquisicao).toLocaleDateString("pt-BR") : "",
        valor: record.valor ? record.valor.toString() : "",
        notaFiscal: record.nota_fiscal || "",
        criticidade: record.criticidade || "Baixa",
        observacoes: record.observacoes || "",
      };

      return { ativo: mappedAtivo };
    } catch (err) {
      console.error("Failed to load asset from PocketBase for editing", err);
      const fallback = getAtivo(params.id);
      if (!fallback) throw notFound();
      const { icon, ...serializableAtivo } = fallback;
      return { ativo: serializableAtivo };
    }
  },
  component: EditarAtivoPage,
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

function mapStatus(s: string): Status {
  if (s === "Em Uso" || s === "Em Manutenção" || s === "Estoque" || s === "Descarte") return s;
  if (s === "Manutenção") return "Em Manutenção";
  if (s === "Aguardando Descarte") return "Descarte";
  if (s === "Disponível") return "Estoque";
  return "Estoque";
}

function formatBRL(cents: number): string {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
function parseDigits(s: string): number {
  const d = s.replace(/\D/g, "");
  return d ? parseInt(d, 10) : 0;
}

// "12/03/2024" or "R$ 1.234,56" → numbers
function initialCentsFromValor(v: string): number {
  return parseDigits(v);
}
// Convert "DD/MM/AAAA" to "AAAA-MM-DD" for <input type="date">
function toISODate(s: string): string {
  const m = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  return m ? `${m[3]}-${m[2]}-${m[1]}` : "";
}

function EditarAtivoPage() {
  const navigate = useNavigate();
  const { ativo } = Route.useLoaderData();

  const [nome, setNome] = useState(ativo.nome);
  const [patrimonio, setPatrimonio] = useState(ativo.patrimonio);
  const [status, setStatus] = useState<Status | "">(mapStatus(ativo.status));
  const [categoria, setCategoria] = useState(ativo.categoria);
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
  const [localizacao, setLocalizacao] = useState(ativo.localizacao);
  const [criticidade, setCriticidade] = useState<string>(ativo.criticidade);
  const [alugado, setAlugado] = useState(false);
  const [fornecedor, setFornecedor] = useState("Locaweb Corp");
  const [valorCents, setValorCents] = useState(initialCentsFromValor(ativo.valor));
  const [dataAquisicao, setDataAquisicao] = useState(toISODate(ativo.dataAquisicao));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [marcaModelo, setMarcaModelo] = useState(ativo.marcaModelo || "");
  const [serie, setSerie] = useState(ativo.serie || "");
  const [notaFiscal, setNotaFiscal] = useState(ativo.notaFiscal || "");
  const [observacoes, setObservacoes] = useState(ativo.observacoes || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fornecedores = [
    "Locaweb Corp",
    "Arklok Outsourcing",
    "Simpress",
    "Fornecedor Hospitalar SP",
  ];

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

      const data = {
        nome,
        codigo_patrimonio: patrimonio,
        status: status === "Estoque" ? "Em Estoque" : status,
        categoria: categoriaId || null,
        categoria_nome: categoria,
        marca_modelo: marcaModelo,
        numero_serie: serie,
        data_aquisicao: dataAquisicao ? new Date(dataAquisicao).toISOString() : null,
        valor: valorCents / 100,
        nota_fiscal: notaFiscal,
        criticidade,
        alugado,
        fornecedor: alugado ? fornecedor : null,
        observacoes: observacoes,
      };

      await pb.collection("ativos").update(ativo.id, data, { $autoCancel: false });

      // Create logs based on event mapping
      const mappedNewStatus = status === "Estoque" ? "Em Estoque" : status;
      const mappedOldStatus = ativo.status === "Estoque" ? "Em Estoque" : ativo.status;

      // 1. Mudança de Setor / Localidade
      if (ativo.localizacao !== localizacao) {
        await createAuditLog(ativo.id, "Movimentação", `Ativo transferido para o setor ${localizacao}.`);
      }

      // 2. Mudança de Status Geral
      if (mappedOldStatus !== mappedNewStatus) {
        await createAuditLog(ativo.id, "Alteração de Status", `Status alterado de ${mappedOldStatus} para ${mappedNewStatus}.`);
      }

      // 3. Mudança de Características
      const characteristicsChanges: string[] = [];
      if (ativo.nome !== nome) {
        characteristicsChanges.push(`Nome "${ativo.nome}" foi alterado para "${nome}"`);
      }
      if (ativo.categoria !== categoria) {
        characteristicsChanges.push(`Categoria "${ativo.categoria}" foi alterada para "${categoria}"`);
      }
      if (ativo.patrimonio !== patrimonio) {
        characteristicsChanges.push(`Patrimônio "${ativo.patrimonio}" foi alterado para "${patrimonio}"`);
      }

      if (characteristicsChanges.length > 0) {
        await createAuditLog(ativo.id, "Edição", characteristicsChanges.join(", ") + ".");
      }

      toast.success("Ativo atualizado com sucesso!", { description: nome });
      navigate({ to: "/inventario" });
    } catch (err) {
      console.error("Failed to update asset in PocketBase", err);
      toast.error("Erro ao atualizar ativo no banco de dados.", {
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
            <span className="text-foreground">Editar Ativo</span>
          </nav>
          <h1 className="text-3xl font-bold tracking-tight">Editar Ativo</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Atualize as informações do ativo <span className="font-mono">{ativo.patrimonio}</span>.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1fr_400px]">
          <div className="space-y-5">
            <Card icon={Info} title="Informações Básicas">
              <div className="space-y-4">
                <Field label="Nome do Ativo" required error={errors.nome}>
                  <input
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    className={errors.nome ? inputErrorCls : inputCls}
                  />
                </Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Marca / Modelo">
                    <input
                      name="marcaModelo"
                      value={marcaModelo}
                      onChange={(e) => setMarcaModelo(e.target.value)}
                      className={`${inputCls} font-mono`}
                    />
                  </Field>
                  <Field label="Número de Série (S/N)">
                    <input
                      name="serie"
                      value={serie}
                      onChange={(e) => setSerie(e.target.value)}
                      className={`${inputCls} font-mono`}
                    />
                  </Field>
                </div>
                <Field label="Código de Patrimônio" required error={errors.patrimonio}>
                  <div className="flex gap-2">
                    <input
                      value={patrimonio}
                      onChange={(e) => setPatrimonio(e.target.value)}
                      className={`${errors.patrimonio ? inputErrorCls : inputCls} flex-1 font-mono`}
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
                  <Field label="Empresa Locadora / Fornecedor">
                    <Select value={fornecedor} onChange={setFornecedor} options={fornecedores} />
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
              />
            </Card>
          </div>

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
                  <Select
                    value={localizacao}
                    onChange={setLocalizacao}
                    hasError={!!errors.localizacao}
                    options={[
                      "TI",
                      "RH",
                      "TI - Almoxarifado",
                      "Operações",
                      "Sede Principal - Bloco A",
                    ]}
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
              {isSubmitting ? "Salvando..." : "Salvar Alterações"}
            </button>
          </div>
        </div>
      </form>
    </AppShell>
  );
}
