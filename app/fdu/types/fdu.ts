export type FDUStatus = 'valid' | 'expiring' | 'expired';

export interface FDU {
  id: string;
  produto: string; // Nome Comercial
  nomeTecnico?: string; // Nome Técnico/Substância Química
  fabricante: string;
  numeroCas?: string; // Número CAS
  classificacaoGHS?: string; // Classificação GHS da Mistura ou Substância
  classeRisco?: string; // Classe de Risco
  localArmazenamento?: string; // Local de Armazenamento
  setor: string; // Local de Utilização
  possuiFispq?: boolean; // Possui FISPQ?
  epiNecessario?: string; // EPI Necessário
  medidasPreventivas?: string; // Medidas Preventivas
  destinacaoProduto?: string; // Destinação do Produto Químico
  tipoRisco?: string; // Campo existente anteriormente
  validade: Date | string; // Aceita tanto Date quanto string para maior flexibilidade
  arquivoUrl: string;
  criadoEm: Date | string;
  status?: FDUStatus; // Status calculado da FDU
}

export interface FDUFormData extends Omit<FDU, 'id' | 'criadoEm'> {
  arquivo: File | null;
}

export type FDUFilter = {
  produto?: string;
  fabricante?: string;
  numeroCas?: string;
  setor?: string;
  tipoRisco?: string;
  validadeInicio?: Date;
  validadeFim?: Date;
};
