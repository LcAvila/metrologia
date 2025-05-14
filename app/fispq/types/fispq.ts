export type FISPQStatus = 'valid' | 'expiring' | 'expired';

export interface FISPQ {
  id: string;
  produto: string;
  fabricante: string;
  numeroCas?: string;
  setor: string;
  tipoRisco?: string;
  validade: Date | string; // Aceita tanto Date quanto string para maior flexibilidade
  arquivoUrl: string;
  criadoEm: Date | string;
  status?: FISPQStatus; // Status calculado da FISPQ
}

export interface FISPQFormData extends Omit<FISPQ, 'id' | 'criadoEm'> {
  arquivo: File | null;
}

export type FISPQFilter = {
  produto?: string;
  fabricante?: string;
  numeroCas?: string;
  setor?: string;
  tipoRisco?: string;
  validadeInicio?: Date;
  validadeFim?: Date;
};
