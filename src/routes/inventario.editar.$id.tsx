import { createFileRoute, Link, useNavigate, notFound } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import {
  Info,
  ShoppingCart,
  AlignLeft,
  Tag,
  QrCode,
  ChevronDown,
  X,
  User,
  Printer,
} from "lucide-react";
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

      const displayStatus =
        record.status === "Em Estoque" || record.status === "Estoque" ? "Estoque" : record.status;
      const categoryName = record.expand?.categoria?.nome || record.categoria_nome || "";

      const mappedAtivo = {
        id: record.id,
        nome: record.nome || "",
        specs: record.marca_modelo || record.observacoes || "",
        marcaModelo: record.marca_modelo || "",
        categoria: categoryName,
        patrimonio: record.codigo_patrimonio || "",
        serie: record.num_serie || record.numero_serie || "",
        status: displayStatus,
        localizacao: record.setor || record.localizacao || "",
        dataAquisicao: record.data_aquisicao
          ? new Date(record.data_aquisicao).toLocaleDateString("pt-BR")
          : "",
        valor:
          (record.valor_ativo !== undefined ? record.valor_ativo : record.valor) !== undefined
            ? (record.valor_ativo !== undefined ? record.valor_ativo : record.valor).toString()
            : "",
        notaFiscal: record.nota_fiscal || "",
        criticidade: record.criticidade || "Baixa",
        observacoes: record.observacoes || "",
        is_alugado: record.is_alugado || record.alugado || false,
        fornecedor_locacao: record.fornecedor_locacao || record.fornecedor || "",
        is_emprestimo: record.is_emprestimo || false,
        emprestimo_colaborador: record.emprestimo_colaborador || "",
        emprestimo_data_saida: record.emprestimo_data_saida
          ? record.emprestimo_data_saida.substring(0, 10)
          : "",
        emprestimo_data_devolucao: record.emprestimo_data_devolucao
          ? record.emprestimo_data_devolucao.substring(0, 10)
          : "",
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
          <option key={o.id} value={o.id}>
            {o.nome}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
    </div>
  );
}

function mapStatus(s: string): Status {
  if (
    s === "Em Uso" ||
    s === "Em Manutenção" ||
    s === "Estoque" ||
    s === "Descarte" ||
    s === "Empréstimo"
  )
    return s;
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

  const [criticidade, setCriticidade] = useState<string>(ativo.criticidade);
  const [alugado, setAlugado] = useState(ativo.is_alugado || false);
  const [fornecedor, setFornecedor] = useState(ativo.fornecedor_locacao || "");
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

  const [valorCents, setValorCents] = useState(initialCentsFromValor(ativo.valor));
  const [dataAquisicao, setDataAquisicao] = useState(toISODate(ativo.dataAquisicao));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [marcaModelo, setMarcaModelo] = useState(ativo.marcaModelo || "");
  const [serie, setSerie] = useState(ativo.serie || "");
  const [notaFiscal, setNotaFiscal] = useState(ativo.notaFiscal || "");
  const [observacoes, setObservacoes] = useState(ativo.observacoes || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isEmprestimo, setIsEmprestimo] = useState(ativo.is_emprestimo || false);
  const [emprestimoColaborador, setEmprestimoColaborador] = useState(
    ativo.emprestimo_colaborador || "",
  );
  const [emprestimoDataSaida, setEmprestimoDataSaida] = useState(
    ativo.emprestimo_data_saida || new Date().toLocaleDateString("sv-SE"),
  );
  const [emprestimoDataDevolucao, setEmprestimoDataDevolucao] = useState(
    ativo.emprestimo_data_devolucao || "",
  );

  const handlePrintTermo = () => {
    if (!emprestimoColaborador.trim() || !emprestimoDataSaida || !emprestimoDataDevolucao) {
      toast.error(
        "Por favor, preencha todos os campos do fluxo de empréstimo antes de gerar o termo.",
      );
      return;
    }
    toast("Gerando Termo de Responsabilidade...");
    setTimeout(() => {
      window.print();
    }, 300);
  };

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
    if (!nome.trim()) {
      newErrors.nome = "Informe o nome do ativo.";
    } else if (nome.length > 30) {
      newErrors.nome = "O nome deve ter no máximo 30 caracteres.";
    }

    if (!patrimonio.trim()) {
      newErrors.patrimonio = "Informe o código de patrimônio.";
    } else if (patrimonio.length > 10) {
      newErrors.patrimonio = "O patrimônio deve ter no máximo 10 caracteres.";
    }

    if (!serie.trim()) newErrors.serie = "Informe o número de série.";
    if (!categoria) newErrors.categoria = "Selecione a categoria.";
    if (!localizacao) newErrors.localizacao = "Selecione a localização.";
    if (!status) newErrors.status = "Selecione o status atual.";

    if (alugado && !fornecedor) {
      newErrors.fornecedor = "Selecione a empresa locadora.";
    }

    if (isEmprestimo) {
      if (!emprestimoColaborador.trim()) {
        newErrors.emprestimoColaborador = "Informe o nome do colaborador.";
      }
      if (!emprestimoDataSaida) {
        newErrors.emprestimoDataSaida = "Informe a data do empréstimo.";
      }
      if (!emprestimoDataDevolucao) {
        newErrors.emprestimoDataDevolucao = "Informe a previsão de devolução.";
      }
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
      // Validate duplicate patrimonio
      const dupPatrimonio = await pb.collection("ativos").getList(1, 1, {
        filter: `codigo_patrimonio = '${patrimonio.trim()}' && id != '${ativo.id}'`,
        $autoCancel: false,
      });
      if (dupPatrimonio.items.length > 0) {
        newErrors.patrimonio = "Código de patrimônio já cadastrado em outro ativo.";
      }

      // Validate duplicate serial number
      const dupSerie = await pb.collection("ativos").getList(1, 1, {
        filter: `num_serie = '${serie.trim()}' && id != '${ativo.id}'`,
        $autoCancel: false,
      });
      if (dupSerie.items.length > 0) {
        newErrors.serie = "Número de série já cadastrado em outro ativo.";
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        toast.error("Erro ao validar dados.", {
          description: "Existem campos inválidos ou duplicados.",
        });
        setIsSubmitting(false);
        return;
      }

      const categoryObj = categoriasDb.find((c) => c.nome === categoria);
      const categoriaId = categoryObj ? categoryObj.id : "";

      const data = {
        nome,
        codigo_patrimonio: patrimonio,
        status: isEmprestimo ? "Empréstimo" : status === "Estoque" ? "Em Estoque" : status,
        categoria: categoriaId || null,
        categoria_nome: categoria,
        setor: localizacao || null,
        marca_modelo: marcaModelo,
        num_serie: serie,
        data_aquisicao: dataAquisicao ? new Date(dataAquisicao).toISOString() : null,
        valor_ativo: valorCents / 100,
        nota_fiscal: notaFiscal,
        criticidade,
        is_alugado: alugado,
        fornecedor_locacao: alugado ? fornecedor || null : null,
        observacoes: observacoes,
        is_emprestimo: isEmprestimo,
        emprestimo_colaborador: isEmprestimo ? emprestimoColaborador : "",
        emprestimo_data_saida:
          isEmprestimo && emprestimoDataSaida ? new Date(emprestimoDataSaida).toISOString() : null,
        emprestimo_data_devolucao:
          isEmprestimo && emprestimoDataDevolucao
            ? new Date(emprestimoDataDevolucao).toISOString()
            : null,
      };

      await pb.collection("ativos").update(ativo.id, data, { $autoCancel: false });

      // Create logs based on event mapping
      const mappedNewStatus = isEmprestimo
        ? "Empréstimo"
        : status === "Estoque"
          ? "Em Estoque"
          : status;
      const mappedOldStatus = ativo.status === "Estoque" ? "Em Estoque" : ativo.status;

      // 1. Mudança de Setor / Localidade
      if (ativo.localizacao !== localizacao) {
        await createAuditLog(
          ativo.id,
          "Movimentação",
          `Ativo transferido para o setor ${localizacao}.`,
        );
      }

      // 2. Mudança de Status Geral
      if (mappedOldStatus !== mappedNewStatus) {
        await createAuditLog(
          ativo.id,
          "Alteração de Status",
          `Status alterado de ${mappedOldStatus} para ${mappedNewStatus}.`,
        );
      }

      // 3. Mudança de Características
      const characteristicsChanges: string[] = [];
      if (ativo.nome !== nome) {
        characteristicsChanges.push(`Nome "${ativo.nome}" foi alterado para "${nome}"`);
      }
      if (ativo.categoria !== categoria) {
        characteristicsChanges.push(
          `Categoria "${ativo.categoria}" foi alterada para "${categoria}"`,
        );
      }
      if (ativo.patrimonio !== patrimonio) {
        characteristicsChanges.push(
          `Patrimônio "${ativo.patrimonio}" foi alterado para "${patrimonio}"`,
        );
      }

      if (ativo.is_emprestimo !== isEmprestimo) {
        characteristicsChanges.push(
          isEmprestimo
            ? `Ativo emprestado para o colaborador "${emprestimoColaborador}"`
            : "Empréstimo finalizado (Ativo devolvido)",
        );
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
                    maxLength={30}
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
                  <Field label="Número de Série (S/N)" required error={errors.serie}>
                    <input
                      name="serie"
                      value={serie}
                      onChange={(e) => setSerie(e.target.value)}
                      className={`${errors.serie ? inputErrorCls : inputCls} font-mono`}
                    />
                  </Field>
                </div>
                <Field label="Código de Patrimônio" required error={errors.patrimonio}>
                  <div className="flex gap-2">
                    <input
                      value={patrimonio}
                      onChange={(e) => setPatrimonio(e.target.value)}
                      className={`${errors.patrimonio ? inputErrorCls : inputCls} flex-1 font-mono`}
                      maxLength={10}
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

            <Card icon={User} title="Fluxo de Empréstimo">
              <div className="space-y-4">
                <label className="flex items-center gap-2.5 pt-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isEmprestimo}
                    onChange={(e) => setIsEmprestimo(e.target.checked)}
                    className="h-4 w-4 rounded border-border accent-violet"
                  />
                  <span className="text-sm font-semibold text-foreground">
                    Este ativo está emprestado? (Home Office / Eventos)
                  </span>
                </label>

                {isEmprestimo && (
                  <div className="space-y-4 border-t border-dashed pt-4">
                    <Field
                      label="Nome do Colaborador / Destinatário"
                      required
                      error={errors.emprestimoColaborador}
                    >
                      <input
                        value={emprestimoColaborador}
                        onChange={(e) => setEmprestimoColaborador(e.target.value)}
                        className={errors.emprestimoColaborador ? inputErrorCls : inputCls}
                        placeholder="Ex: João Silva"
                      />
                    </Field>

                    <div className="grid grid-cols-2 gap-4">
                      <Field label="Data de Empréstimo" required error={errors.emprestimoDataSaida}>
                        <input
                          type="date"
                          value={emprestimoDataSaida}
                          onChange={(e) => setEmprestimoDataSaida(e.target.value)}
                          className={errors.emprestimoDataSaida ? inputErrorCls : inputCls}
                        />
                      </Field>
                      <Field
                        label="Previsão de Devolução"
                        required
                        error={errors.emprestimoDataDevolucao}
                      >
                        <input
                          type="date"
                          value={emprestimoDataDevolucao}
                          onChange={(e) => setEmprestimoDataDevolucao(e.target.value)}
                          className={errors.emprestimoDataDevolucao ? inputErrorCls : inputCls}
                        />
                      </Field>
                    </div>

                    <button
                      type="button"
                      onClick={handlePrintTermo}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800 transition-colors cursor-pointer"
                    >
                      <Printer className="h-4 w-4" />
                      Gerar Termo de Empréstimo (PDF)
                    </button>
                  </div>
                )}
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
              {isSubmitting ? "Salvando..." : "Salvar Alterações"}
            </button>
          </div>
        </div>
      </form>

      {/* Invisible Print Layout for Termo de Responsabilidade */}
      {isEmprestimo && (
        <div
          id="print-area-termo"
          className="hidden print:block font-sans text-black max-w-4xl mx-auto p-8 bg-white border border-zinc-200 rounded-lg"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b pb-4 mb-6">
            <div className="flex items-center gap-2.5">
              <img
                src="/logo_bit_estoque_preto-removebg-preview.png"
                alt="HMS Logo"
                className="h-10 w-auto object-contain"
              />
              <span className="text-xl font-bold tracking-tight uppercase">HMS - TI</span>
            </div>
            <div className="text-right text-xs text-zinc-500">
              Data de Emissão: {new Date().toLocaleDateString("pt-BR")}
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-lg font-bold uppercase tracking-wide">
              TERMO DE RESPONSABILIDADE E EMPRÉSTIMO DE ATIVO DE TI
            </h1>
          </div>

          {/* Body content */}
          <div className="space-y-6 text-sm leading-relaxed text-zinc-800">
            <p>
              Por este instrumento, declaramos que o colaborador abaixo identificado recebeu, a
              título de empréstimo para fins de trabalho/atividades institucionais, o equipamento de
              tecnologia da informação de propriedade do <strong>HMS - TI</strong>, comprometendo-se
              a zelar pelo seu bom estado de conservação e funcionamento, nos termos descritos neste
              documento.
            </p>

            {/* Colaborador / Fluxo info */}
            <div className="bg-zinc-50 p-4 rounded-lg border border-zinc-200 space-y-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1">
                Informações do Beneficiário & Prazo
              </h2>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                <div>
                  <strong className="text-zinc-500">Colaborador / Destinatário:</strong>
                  <div className="text-zinc-900 font-semibold text-sm mt-0.5">
                    {emprestimoColaborador}
                  </div>
                </div>
                <div>
                  <strong className="text-zinc-500">Técnico Responsável:</strong>
                  <div className="text-zinc-900 font-semibold text-sm mt-0.5">
                    {pb.authStore.model?.name || pb.authStore.model?.username || "Técnico de TI"}
                  </div>
                </div>
                <div>
                  <strong className="text-zinc-500">Data de Empréstimo:</strong>
                  <div className="text-zinc-900 font-semibold text-sm mt-0.5">
                    {emprestimoDataSaida
                      ? new Date(emprestimoDataSaida + "T00:00:00").toLocaleDateString("pt-BR")
                      : "-"}
                  </div>
                </div>
                <div>
                  <strong className="text-zinc-500">Previsão de Devolução:</strong>
                  <div className="text-zinc-900 font-semibold text-sm mt-0.5">
                    {emprestimoDataDevolucao
                      ? new Date(emprestimoDataDevolucao + "T00:00:00").toLocaleDateString("pt-BR")
                      : "-"}
                  </div>
                </div>
              </div>
            </div>

            {/* Ativo info */}
            <div className="bg-zinc-50 p-4 rounded-lg border border-zinc-200 space-y-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-1">
                Especificações do Equipamento
              </h2>
              <div className="grid grid-cols-3 gap-4 text-xs">
                <div>
                  <strong className="text-zinc-500">Nome do Ativo:</strong>
                  <div className="text-zinc-900 font-semibold text-sm mt-0.5">{nome}</div>
                </div>
                <div>
                  <strong className="text-zinc-500">Código de Patrimônio:</strong>
                  <div className="text-zinc-900 font-mono font-semibold text-sm mt-0.5">
                    {patrimonio}
                  </div>
                </div>
                <div>
                  <strong className="text-zinc-500">Número de Série:</strong>
                  <div className="text-zinc-900 font-mono font-semibold text-sm mt-0.5">
                    {serie}
                  </div>
                </div>
              </div>
            </div>

            {/* Clauses */}
            <div className="space-y-3 text-[11px] text-zinc-600 border-t pt-4">
              <p>
                <strong>Cláusula 1ª:</strong> O equipamento destina-se exclusivamente ao uso em
                atividades profissionais de interesse do HMS.
              </p>
              <p>
                <strong>Cláusula 2ª:</strong> O colaborador assume total responsabilidade civil e
                criminal pela guarda, conservação e uso adequado do equipamento. Em caso de perda,
                furto, roubo ou danos decorrentes de negligência ou mau uso, o colaborador poderá
                ser responsabilizado pelas despesas de conserto ou reposição.
              </p>
              <p>
                <strong>Cláusula 3ª:</strong> O colaborador compromete-se a devolver o equipamento
                nas mesmas condições em que o recebeu na data estipulada de devolução ou
                imediatamente quando solicitado pelo setor de TI.
              </p>
            </div>

            {/* Signatures */}
            <div className="grid grid-cols-2 gap-8 pt-16 text-center text-xs">
              <div className="space-y-1">
                <div className="border-t border-zinc-400 pt-2 w-3/4 mx-auto font-semibold">
                  Assinatura do Técnico
                </div>
                <div className="text-[10px] text-zinc-500">HMS - TI</div>
              </div>
              <div className="space-y-1">
                <div className="border-t border-zinc-400 pt-2 w-3/4 mx-auto font-semibold">
                  Assinatura do Colaborador
                </div>
                <div className="text-[10px] text-zinc-500 font-semibold">
                  {emprestimoColaborador}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
