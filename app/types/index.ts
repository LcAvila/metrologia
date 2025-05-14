/**
 * Arquivo centralizado de tipos e interfaces do projeto
 * Aqui estão definidos os tipos comuns usados em múltiplos lugares da aplicação
 */

// Interface para documentos (certificados, FISPQs, fichas de emergência, etc.)
export interface Documento {
  id: string;
  tipo: string;
  nome: string;
  numero?: string;
  setor?: string;
  validade?: string;
  arquivoUrl: string;
  criadoEm?: string;
}

// Interface para certificados de calibração
export interface Certificado {
  id: string;
  equipmentId: string;
  equipmentName: string;
  certificateNumber: string;
  issueDate: string;
  expirationDate: string;
  calibrationDate: string;
  fileName: string;
  fileUrl: string;
  status: 'valid' | 'expired' | 'expiring';
  sector?: string;
  fileObject?: File; // Propriedade opcional para armazenar o objeto File temporariamente
}

// Interface para equipamentos
export interface Equipamento {
  id: string;
  type: string;
  sector: string;
  status: string;
  nextCalibration: string;
  model?: string;
  serialNumber?: string;
  calibrationHistory?: Certificado[];
}

// Interface para usuários
export interface Usuario {
  id: string;
  email: string;
  nome: string;
  tipo_usuario: 'admin' | 'metrologista' | 'quimico';
  matricula?: string;
  created_at?: string;
}

// Interface para FISPQs
export interface FISPQ {
  id: string;
  produto: string;
  fabricante: string;
  numeroCas?: string;
  setor: string;
  tipoRisco?: string;
  validade: string;
  arquivoUrl: string;
  criadoEm: string;
}

// Interface para filtros de FISPQ
export interface FISPQFilter {
  produto?: string;
  fabricante?: string;
  numeroCas?: string;
  setor?: string;
  tipoRisco?: string;
  validadeInicio?: Date;
  validadeFim?: Date;
}

// Interface para Fichas de Emergência
export interface FichaEmergencia {
  id?: string;
  produto: string;
  setor: string;
  tipoRisco?: string;
  dataEmissao: string;
  arquivoUrl: string;
  criadoEm?: string;
}

// Tipos de documentos suportados pelo sistema
export type TipoDocumento = 'certificado' | 'fispq' | 'emergencia' | 'laudo';

// Setores padrão da empresa
export const SETORES = [
  "Injetoras",
  "Ferramentaria",
  "Controle da Qualidade",
  "Point Matic",
  "Montagem 1 (M1)",
  "Almoxarifado 1 (ALM 1)",
  "Almoxarifado 2 (ALM 2)",
  "Depósito de Produtos Acabados (DPA)",
  "Manutenção"
];
