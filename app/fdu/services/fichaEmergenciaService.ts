import { FichaEmergencia, FichaEmergenciaFilter } from '../types/fichaEmergencia';
import { supabase } from '../../lib/supabaseClient';
import { storageService } from '../../services/storageService';
import { calcularStatusData } from '../../utils/formatters';

export const fichaEmergenciaService = {
  async create(ficha: Omit<FichaEmergencia, 'id' | 'criadoEm'>, arquivo: File): Promise<FichaEmergencia> {
    try {
      // Verificar se o usuário está autenticado
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Usuário não autenticado. Faça login para continuar.');
      }
      
      // Verificar se o bucket existe
      const bucketName = 'fichas_emergencia';
      const exists = await storageService.bucketExists(bucketName);
      if (!exists) {
        throw new Error('O bucket fichas_emergencia não existe no Supabase. Por favor, crie manualmente no painel administrativo.');
      }
      
      // Fazer upload do arquivo usando o serviço unificado
      const filePath = await storageService.uploadFile(arquivo, bucketName);
      
      // Obter a URL pública do arquivo
      const arquivoUrl = storageService.getPublicUrl(bucketName, filePath);
        
      // Remover o campo 'arquivo' do objeto ficha, se existir
      // pois ele não existe na tabela do banco de dados
      const { arquivo: _, ...fichaData } = ficha as any;
      
      // Salvar os dados no banco de dados - configurado para ser público na consulta
      const { data, error } = await supabase
        .from('fichas_emergencia')
        .insert({
          ...fichaData,
          arquivoUrl,
          criadoEm: new Date().toISOString(),
          // Adicionar user_id para RLS
          user_id: session.user.id
        })
        .select()
        .single();

      if (error) {
        console.error('Erro ao inserir no banco de dados:', error);
        throw new Error('Erro ao salvar os dados. Verifique se você tem permissões na tabela fichas_emergencia.');
      }
      
      return data;
    } catch (error) {
      console.error('Erro ao criar Ficha de Emergência:', error);
      throw error;
    }
  },

  async update(id: string, ficha: Partial<FichaEmergencia>, arquivo?: File): Promise<FichaEmergencia> {
    let arquivoUrl = ficha.arquivoUrl;

    if (arquivo) {
      if (arquivo.size === 0) {
        throw new Error('Arquivo inválido ou vazio.');
      }
      
      // Verificar se o bucket existe
      const bucketName = 'fichas_emergencia';
      const exists = await storageService.bucketExists(bucketName);
      if (!exists) {
        throw new Error('O bucket fichas_emergencia não existe no Supabase. Por favor, crie manualmente no painel administrativo.');
      }
      
      // Fazer upload do novo arquivo usando o serviço unificado
      const filePath = await storageService.uploadFile(arquivo, bucketName);
      
      // Obter a URL pública do arquivo
      arquivoUrl = storageService.getPublicUrl(bucketName, filePath);
    }

    // Atualizar registro
    const { data, error } = await supabase
      .from('fichas_emergencia')
      .update({ ...ficha, arquivoUrl })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('fichas_emergencia')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async getById(id: string): Promise<FichaEmergencia | null> {
    const { data, error } = await supabase
      .from('fichas_emergencia')
      .select()
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async list(filter?: FichaEmergenciaFilter) {
    try {
      let query = supabase.from('fichas_emergencia').select();

      if (filter) {
        if (filter.nome) {
          query = query.ilike('nome', `%${filter.nome}%`);
        }
        if (filter.produto) {
          query = query.ilike('produto', `%${filter.produto}%`);
        }
        if (filter.numeroOnu) {
          query = query.eq('numeroOnu', filter.numeroOnu);
        }
        if (filter.classeRisco) {
          query = query.eq('classeRisco', filter.classeRisco);
        }
        
        // Temporariamente desativando filtros de validade até que a estrutura do banco seja atualizada
        // Os filtros abaixo serão ativados novamente quando a coluna 'validade' existir na tabela
        /*
        if (filter.validadeInicio) {
          const dataInicio = new Date(filter.validadeInicio);
          query = query.gte('validade', dataInicio.toISOString());
        }
        if (filter.validadeFim) {
          const dataFim = new Date(filter.validadeFim);
          query = query.lte('validade', dataFim.toISOString());
        }
        */
      }

      const { data, error } = await query.order('criadoEm', { ascending: false });
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao listar fichas de emergência:', error);
      return [];
    }
  },

  async getStatistics() {
    try {
      const { data: totalFichas, error: countError } = await supabase
        .from('fichas_emergencia')
        .select('id', { count: 'exact' });

      if (countError) throw countError;
      
      // Retornar estatísticas básicas sem consultar a coluna validade temporariamente
      // até que a estrutura do banco seja atualizada
      return {
        total: totalFichas?.length || 0,
        expirando: 0,
        vencidas: 0,
        setores: 0,
        classesRisco: 0
      };
    } catch (error) {
      console.error('Erro ao obter estatísticas de fichas de emergência:', error);
      return {
        total: 0,
        expirando: 0,
        vencidas: 0,
        setores: 0,
        classesRisco: 0
      };
    }
  },

  // Método para uso público sem autenticação
  async publicList(filter?: FichaEmergenciaFilter) {
    try {
      // Construir a query do Supabase
      let query = supabase.from('fichas_emergencia').select();
  
      if (filter) {
        if (filter.nome) {
          query = query.ilike('nome', `%${filter.nome}%`);
        }
        if (filter.produto) {
          query = query.ilike('produto', `%${filter.produto}%`);
        }
        if (filter.numeroOnu) {
          query = query.eq('numeroOnu', filter.numeroOnu);
        }
        if (filter.classeRisco) {
          query = query.eq('classeRisco', filter.classeRisco);
        }
        if (filter.validadeInicio) {
          const dataInicio = new Date(filter.validadeInicio);
          query = query.gte('validade', dataInicio.toISOString());
        }
        if (filter.validadeFim) {
          const dataFim = new Date(filter.validadeFim);
          query = query.lte('validade', dataFim.toISOString());
        }
      }
  
      const { data, error } = await query.order('criadoEm', { ascending: false });
      if (error) {
        console.error('Erro ao buscar Fichas de Emergência públicas:', error.message);
        throw new Error(`Falha ao buscar Fichas de Emergência: ${error.message}`);
      }
      
      // Adicionar status baseado na validade
      const fichasWithStatus = data?.map(ficha => ({
        ...ficha,
        status: calcularStatusData(ficha.validade)
      })) || [];
      
      return fichasWithStatus;
    } catch (err) {
      console.error('Erro não tratado ao buscar Fichas de Emergência públicas:', err);
      return [];
    }
  },
  
  async getPublicStatistics() {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Obter total de fichas
      const { data: totalFichas, error: countError } = await supabase
        .from('fichas_emergencia')
        .select('id', { count: 'exact' });

      if (countError) {
        console.error('Erro ao contar Fichas de Emergência:', countError.message);
        throw new Error(`Falha ao obter estatísticas: ${countError.message}`);
      }

      // Obter fichas expirando em 30 dias
      const thirtyDaysLater = new Date(today);
      thirtyDaysLater.setDate(today.getDate() + 30);
      
      const { data: expiringFichas, error: expiringError } = await supabase
        .from('fichas_emergencia')
        .select('id, validade')
        .gte('validade', today.toISOString())
        .lte('validade', thirtyDaysLater.toISOString());

      if (expiringError) {
        console.error('Erro ao buscar Fichas de Emergência expirando:', expiringError.message);
      }

      // Obter fichas vencidas
      const { data: expiredFichas, error: expiredError } = await supabase
        .from('fichas_emergencia')
        .select('id')
        .lt('validade', today.toISOString());

      if (expiredError) {
        console.error('Erro ao buscar Fichas de Emergência vencidas:', expiredError.message);
      }

      // Obter setores únicos
      const { data: setores, error: setoresError } = await supabase
        .from('fichas_emergencia')
        .select('setor, classeRisco');

      if (setoresError) {
        console.error('Erro ao buscar setores:', setoresError.message);
      }

      // Preparar classes de risco únicas
      const uniqueClassesRisco = setores ? [...new Set(setores.filter(s => s.classeRisco).map(s => s.classeRisco))] : [];
      const uniqueSetores = setores ? [...new Set(setores.filter(s => s.setor).map(s => s.setor))] : [];

      return {
        total: totalFichas?.length || 0,
        expirando: expiringFichas?.length || 0,
        vencidas: expiredFichas?.length || 0,
        setores: uniqueSetores.length,
        classesRisco: uniqueClassesRisco.length
      };
    } catch (err) {
      console.error('Erro não tratado ao obter estatísticas de Fichas de Emergência:', err);
      return { 
        total: 0, 
        setores: 0, 
        expirando: 0, 
        vencidas: 0, 
        classesRisco: 0 
      };
    }
  }
};
