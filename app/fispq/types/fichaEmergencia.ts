export type FichaEmergenciaStatus = 'valid' | 'expiring' | 'expired';

export interface FichaEmergencia {
  id: string;
  nome: string;
  produto: string;
  numeroOnu: string;
  classeRisco: string;
  validade: Date | string; // Aceita tanto Date quanto string para maior flexibilidade
  arquivoUrl: string;
  criadoEm: Date | string;
  user_id?: string; // Para políticas RLS do Supabase
  status?: FichaEmergenciaStatus; // Status calculado da ficha
  setor?: string; // Campo opcional para setor
}

export interface FichaEmergenciaFormData extends Omit<FichaEmergencia, 'id' | 'criadoEm' | 'user_id'> {
  arquivo: File | null;
}

export type FichaEmergenciaFilter = {
  nome?: string;
  produto?: string;
  numeroOnu?: string;
  classeRisco?: string;
  validadeInicio?: Date;
  validadeFim?: Date;
  setor?: string;
};

export interface FichaEmergenciaStatistics {
  total: number;
  setores: number;
  expirando: number;
  vencidas: number;
  classesRisco: number;
}
