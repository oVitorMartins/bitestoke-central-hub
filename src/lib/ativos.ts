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
  expand?: any;
};

export type CategoriaObjeto = {
  id: string;
  nome: string;
};

export const CATEGORIAS_PADRAO: CategoriaObjeto[] = [
  { id: "cat_desktop", nome: "Desktop" },
  { id: "cat_notebook", nome: "Notebook" },
  { id: "cat_monitor", nome: "Monitor" },
  { id: "cat_impressora", nome: "Impressora" },
  { id: "cat_tablet", nome: "Tablet" },
  { id: "cat_servidor", nome: "Servidor" },
  { id: "cat_rede", nome: "Rede" },
  { id: "cat_nobreak", nome: "No-break" },
  { id: "cat_leitor", nome: "Leitor" },
  { id: "cat_televisao", nome: "Televisão" },
  { id: "cat_camera", nome: "Câmera" },
  { id: "cat_telefone", nome: "Telefone" },
];

export const categorias = CATEGORIAS_PADRAO.map((c) => c.nome);
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
  {
    id: "5",
    nome: "Notebook Dell Latitude 3420",
    specs: "Core i5 · 16GB RAM · 256GB SSD",
    icon: Laptop,
    marcaModelo: "Dell / Latitude 3420",
    categoria: "Notebook",
    patrimonio: "PAT-2024-001",
    serie: "SN-DLL-LAT-9921",
    status: "Em Uso",
    localizacao: "RH",
    dataAquisicao: "10/01/2024",
    valor: "R$ 5.500,00",
    notaFiscal: "NF-443311",
    criticidade: "Média",
    observacoes: "Entregue configurado com a imagem padrão do RH.",
  },
  {
    id: "6",
    nome: "MacBook Pro M3 Max",
    specs: "Apple M3 Max · 64GB RAM · 1TB SSD",
    icon: Laptop,
    marcaModelo: "Apple / MacBook Pro 16",
    categoria: "Notebook",
    patrimonio: "PAT-2024-002",
    serie: "SN-APL-MBP-3341",
    status: "Em Uso",
    localizacao: "TI",
    dataAquisicao: "15/02/2024",
    valor: "R$ 34.900,00",
    notaFiscal: "NF-778899",
    criticidade: "Alta",
    observacoes: "Equipamento premium de alta performance destinado à diretoria de produto.",
  },
  {
    id: "7",
    nome: 'Monitor LG UltraWide 29"',
    specs: "FullHD · IPS · 75Hz",
    icon: Monitor,
    marcaModelo: "LG / 29WK600",
    categoria: "Monitor",
    patrimonio: "PAT-2024-003",
    serie: "SN-LGE-29W-8872",
    status: "Estoque",
    localizacao: "TI - Almoxarifado",
    dataAquisicao: "20/03/2024",
    valor: "R$ 1.890,00",
    notaFiscal: "NF-123456",
    criticidade: "Baixa",
    observacoes: "Monitor extra no estoque do almoxarifado para substituições rápidas.",
  },
  {
    id: "8",
    nome: "Switch Cisco Catalyst 2960",
    specs: "24 Portas Gigabit · PoE",
    icon: RouterIcon,
    marcaModelo: "Cisco / WS-C2960X",
    categoria: "Rede",
    patrimonio: "PAT-2024-004",
    serie: "SN-CSC-SWI-0019",
    status: "Em Uso",
    localizacao: "Operações",
    dataAquisicao: "05/04/2024",
    valor: "R$ 12.400,00",
    notaFiscal: "NF-987654",
    criticidade: "Crítica",
    observacoes: "Switch principal do rack de distribuição do segundo andar. Não desligar.",
  },
  {
    id: "9",
    nome: "Impressora Brother L2540",
    specs: "Laser Monocromática · Duplex",
    icon: Printer,
    marcaModelo: "Brother / DCP-L2540DW",
    categoria: "Periféricos",
    patrimonio: "PAT-2024-005",
    serie: "SN-BTH-PRN-5561",
    status: "Em Uso",
    localizacao: "RH",
    dataAquisicao: "18/05/2024",
    valor: "R$ 1.950,00",
    notaFiscal: "NF-654321",
    criticidade: "Média",
    observacoes: "Instalada na recepção do RH. Limpeza e troca de toner feitas recentemente.",
  },
  {
    id: "10",
    nome: "Notebook ThinkPad T14",
    specs: "AMD Ryzen 7 · 16GB RAM · 512GB SSD",
    icon: Laptop,
    marcaModelo: "Lenovo / ThinkPad T14 G4",
    categoria: "Notebook",
    patrimonio: "PAT-2024-006",
    serie: "SN-LNV-T14-4456",
    status: "Estoque",
    localizacao: "TI - Almoxarifado",
    dataAquisicao: "25/06/2024",
    valor: "R$ 9.800,00",
    notaFiscal: "NF-112233",
    criticidade: "Média",
    observacoes: "Notebook de reposição pronto para uso. Imagem corporativa já instalada.",
  },
  {
    id: "11",
    nome: "Monitor Samsung Odyssey G5",
    specs: '34" Curvo · WQHD · 165Hz',
    icon: Monitor,
    marcaModelo: "Samsung / Odyssey G5 LC34",
    categoria: "Monitor",
    patrimonio: "PAT-2024-007",
    serie: "SN-SAM-ODS-9901",
    status: "Em Uso",
    localizacao: "TI",
    dataAquisicao: "12/07/2024",
    valor: "R$ 3.450,00",
    notaFiscal: "NF-445566",
    criticidade: "Média",
    observacoes: "Monitor destinado ao desenvolvedor sênior da equipe de DevOps.",
  },
  {
    id: "12",
    nome: "Fortinet FortiGate 60F",
    specs: "Firewall UTM · Security Gateway",
    icon: RouterIcon,
    marcaModelo: "Fortinet / FG-60F",
    categoria: "Rede",
    patrimonio: "PAT-2024-008",
    serie: "SN-FTN-FW-0056",
    status: "Em Uso",
    localizacao: "TI",
    dataAquisicao: "01/08/2024",
    valor: "R$ 8.900,00",
    notaFiscal: "NF-990088",
    criticidade: "Crítica",
    observacoes: "Firewall principal da borda de rede. Proteção de borda IPS/IDS ativa.",
  },
  {
    id: "13",
    nome: "Access Point UniFi U6-Pro",
    specs: "Wi-Fi 6 · Dual-Band · MIMO",
    icon: RouterIcon,
    marcaModelo: "Ubiquiti / UniFi U6-Pro",
    categoria: "Rede",
    patrimonio: "PAT-2024-009",
    serie: "SN-UBQ-AP-6677",
    status: "Em Uso",
    localizacao: "Operações",
    dataAquisicao: "10/09/2024",
    valor: "R$ 1.500,00",
    notaFiscal: "NF-334455",
    criticidade: "Alta",
    observacoes: "Instalado no teto do salão principal de operações. Alimentação via switch PoE.",
  },
  {
    id: "14",
    nome: "Scanner Kodak Alaris S2050",
    specs: "Scanner Duplex de Mesa",
    icon: Printer,
    marcaModelo: "Kodak Alaris / S2050",
    categoria: "Periféricos",
    patrimonio: "PAT-2024-010",
    serie: "SN-KDK-SCN-4491",
    status: "Estoque",
    localizacao: "TI - Almoxarifado",
    dataAquisicao: "18/10/2024",
    valor: "R$ 3.800,00",
    notaFiscal: "NF-556677",
    criticidade: "Baixa",
    observacoes: "Scanner aguardando distribuição para o setor financeiro ou contábil.",
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
  {
    data: "21/06/2026 14:32",
    responsavel: "Vitor Santos",
    ativo: "AST-2026-001",
    movimentacao: "Alterou status de Disponível para Em Uso",
  },
  {
    data: "21/06/2026 11:08",
    responsavel: "Camila Ribeiro",
    ativo: "AST-2026-014",
    movimentacao: "Cadastrou novo ativo (Monitor LG UltraWide)",
  },
  {
    data: "20/06/2026 17:45",
    responsavel: "Bruno Almeida",
    ativo: "AST-2025-098",
    movimentacao: "Transferiu ativo do setor TI para Financeiro",
  },
  {
    data: "20/06/2026 09:21",
    responsavel: "Vitor Santos",
    ativo: "AST-2025-072",
    movimentacao: "Alterou status de Em Uso para Em Manutenção",
  },
  {
    data: "19/06/2026 16:10",
    responsavel: "Larissa Costa",
    ativo: "AST-2024-203",
    movimentacao: "Atribuiu ativo ao colaborador João Pedro (RH)",
  },
  {
    data: "19/06/2026 10:02",
    responsavel: "Bruno Almeida",
    ativo: "AST-2025-145",
    movimentacao: "Atualizou localização para Almoxarifado Central",
  },
  {
    data: "18/06/2026 15:58",
    responsavel: "Camila Ribeiro",
    ativo: "AST-2025-061",
    movimentacao: "Editou número da nota fiscal e valor de aquisição",
  },
  {
    data: "18/06/2026 08:40",
    responsavel: "Vitor Santos",
    ativo: "AST-2026-007",
    movimentacao: "Concluiu manutenção e alterou status para Disponível",
  },
];
