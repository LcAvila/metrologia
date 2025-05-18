export type FDUStatus = 'valid' | 'expiring' | 'expired';

export interface FDU {
  id: string;
  produto: string;
  fabricante: string;
  numeroCas?: string;
  setor: string;
  tipoRisco?: string;
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
