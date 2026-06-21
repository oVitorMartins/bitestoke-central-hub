import { Laptop, Monitor, Router as RouterIcon, Printer } from "lucide-react";

export type Status = "Estoque" | "Em Uso" | "Em Manutenção" | "Descarte";
export type Criticidade = "Baixa" | "Média" | "Alta" | "Crítica";

export type Ativo = {
  id: string;
  nome: string;
  specs: string;
  icon: typeof Laptop;
  marcaModelo: string;
  categoria: string;
  patrimonio: string;
  serie: string;
  status: Status;
  localizacao: string;
  dataAquisicao: string;
  valor: string;
  notaFiscal: string;
  criticidade: Criticidade;
  observacoes: string;
};

export const categorias = ["Notebook", "Monitor", "Rede", "Periféricos"] as const;
export const statusList: Status[] = ["Estoque", "Em Uso", "Em Manutenção", "Descarte"];
export const setores = ["TI", "RH", "TI - Almoxarifado", "Operações"] as const;

export const ativos: Ativo[] = [
  {
    id: "1",
    nome: "Notebook Lenovo P15",
    specs: "Core i9 · 32GB RAM",
    icon: Laptop,
    marcaModelo: "Lenovo / ThinkPad P15",
    categoria: "Notebook",
    patrimonio: "PAT-2023-001",
    serie: "SN-LNV-P15-0091",
    status: "Em Uso",
    localizacao: "TI",
    dataAquisicao: "12/03/2023",
    valor: "R$ 18.450,00",
    notaFiscal: "NF-998877",
    criticidade: "Alta",
    observacoes: "Notebook destinado ao time de engenharia. Possui dock station na estação 12.",
  },
  {
    id: "2",
    nome: 'Monitor Dell 27"',
    specs: "4K Resolution · UltraSharp",
    icon: Monitor,
    marcaModelo: "Dell / U2723QE",
    categoria: "Monitor",
    patrimonio: "PAT-2023-045",
    serie: "SN-DELL-U27-2231",
    status: "Em Manutenção",
    localizacao: "RH",
    dataAquisicao: "05/07/2023",
    valor: "R$ 4.290,00",
    notaFiscal: "NF-101545",
    criticidade: "Média",
    observacoes: "Em manutenção devido a pixels travados na região superior direita.",
  },
  {
    id: "3",
    nome: "Cisco ISR 4331",
    specs: "Roteador Enterprise",
    icon: RouterIcon,
    marcaModelo: "Cisco / ISR 4331",
    categoria: "Rede",
    patrimonio: "PAT-2023-089",
    serie: "SN-CSC-ISR-7781",
    status: "Estoque",
    localizacao: "TI - Almoxarifado",
    dataAquisicao: "18/01/2023",
    valor: "R$ 22.900,00",
    notaFiscal: "NF-554120",
    criticidade: "Crítica",
    observacoes: "Reserva técnica para a filial centro. Lacre original intacto.",
  },
  {
    id: "4",
    nome: "HP LaserJet Pro",
    specs: "Impressora Multifuncional",
    icon: Printer,
    marcaModelo: "HP / LaserJet Pro M428",
    categoria: "Periféricos",
    patrimonio: "PAT-2022-112",
    serie: "SN-HP-LJP-4412",
    status: "Descarte",
    localizacao: "Operações",
    dataAquisicao: "22/09/2022",
    valor: "R$ 2.180,00",
    notaFiscal: "NF-330021",
    criticidade: "Baixa",
    observacoes: "Equipamento depreciado e com fusor defeituoso. Aguardando coleta para descarte.",
  },
];

export function getAtivo(id: string): Ativo | undefined {
  return ativos.find((a) => a.id === id);
}

export type Auditoria = {
  data: string;
  responsavel: string;
  ativo: string;
  movimentacao: string;
};

export const auditoria: Auditoria[] = [
  { data: "21/06/2026 14:32", responsavel: "Vitor Santos", ativo: "AST-2026-001", movimentacao: "Alterou status de Disponível para Em Uso" },
  { data: "21/06/2026 11:08", responsavel: "Camila Ribeiro", ativo: "AST-2026-014", movimentacao: "Cadastrou novo ativo (Monitor LG UltraWide)" },
  { data: "20/06/2026 17:45", responsavel: "Bruno Almeida", ativo: "AST-2025-098", movimentacao: "Transferiu ativo do setor TI para Financeiro" },
  { data: "20/06/2026 09:21", responsavel: "Vitor Santos", ativo: "AST-2025-072", movimentacao: "Alterou status de Em Uso para Em Manutenção" },
  { data: "19/06/2026 16:10", responsavel: "Larissa Costa", ativo: "AST-2024-203", movimentacao: "Atribuiu ativo ao colaborador João Pedro (RH)" },
  { data: "19/06/2026 10:02", responsavel: "Bruno Almeida", ativo: "AST-2025-145", movimentacao: "Atualizou localização para Almoxarifado Central" },
  { data: "18/06/2026 15:58", responsavel: "Camila Ribeiro", ativo: "AST-2025-061", movimentacao: "Editou número da nota fiscal e valor de aquisição" },
  { data: "18/06/2026 08:40", responsavel: "Vitor Santos", ativo: "AST-2026-007", movimentacao: "Concluiu manutenção e alterou status para Disponível" },
];
