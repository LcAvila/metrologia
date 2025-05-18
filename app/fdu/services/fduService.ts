import { FDU, FDUFilter } from '../types/fdu';
import { supabase } from '../../lib/supabaseClient';
import { storageService } from '../../services/storageService';
import { calcularStatusData } from '../../utils/formatters';

export const fduService = {
  // Método para uso público sem autenticação
  async publicList(filter?: FDUFilter) {
    try {
      // Este método permite que usuários não autenticados vejam as FDUs
      // A configuração de RLS no Supabase permitirá acesso público de leitura
      let query = supabase.from('fdus').select();

      if (filter) {
        if (filter.produto) {
          query = query.ilike('produto', `%${filter.produto}%`);
        }
        if (filter.fabricante) {
          query = query.ilike('fabricante', `%${filter.fabricante}%`);
        }
        if (filter.numeroCas) {
          query = query.eq('numeroCas', filter.numeroCas);
        }
        if (filter.setor) {
          query = query.eq('setor', filter.setor);
        }
        if (filter.tipoRisco) {
          query = query.eq('tipoRisco', filter.tipoRisco);
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
        console.error('Erro ao buscar FDUs públicas:', error.message);
        throw new Error(`Falha ao buscar FDUs: ${error.message}`);
      }
      return data || [];
    } catch (err) {
      console.error('Erro não tratado ao buscar FDUs públicas:', err);
      return [];
    }
  },
  
  async getPublicStatistics() {
    try {
      // Estatísticas disponíveis publicamente
      const { data: totalFdus, error: countError } = await supabase
        .from('fdus')
        .select('id', { count: 'exact' });

      if (countError) {
        console.error('Erro ao contar FDUs:', countError.message);
        throw new Error(`Falha ao obter estatísticas: ${countError.message}`);
      }

      const { data: setores, error: setoresError } = await supabase
        .from('fdus')
        .select('setor');

      if (setoresError) {
        console.error('Erro ao buscar setores:', setoresError.message);
        throw new Error(`Falha ao obter estatísticas de setores: ${setoresError.message}`);
      }

      // Contar FDUs expirando
      const today = new Date();
      const { data: expiringFdus, error: expiringError } = await supabase
        .from('fdus')
        .select('id, validade')
        .gte('validade', today.toISOString())
        .lte('validade', new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString());

      if (expiringError) {
        console.error('Erro ao buscar FDUs expirando:', expiringError.message);
      }

      return {
        total: totalFdus?.length || 0,
        expirando: expiringFdus?.length || 0,
        setores: setores ? [...new Set(setores.map(s => s.setor))].length : 0
      };
    } catch (err) {
      console.error('Erro não tratado ao obter estatísticas:', err);
      return { total: 0, expirando: 0, setores: 0 };
    }
  },
  
  async create(fdu: Omit<FDU, 'id' | 'criadoEm'>, arquivo: File): Promise<FDU> {
    try {
      // Verificar se o arquivo é válido
      if (!arquivo || arquivo.size === 0) {
        throw new Error('É necessário anexar um arquivo PDF da FDU.');
      }

      // Verificar se o usuário está autenticado
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Usuário não autenticado. Faça login para continuar.');
      }
      
      // Verificar se o bucket existe e criar se não existir
      const bucketName = 'fdus';
      let exists = await storageService.bucketExists(bucketName);
      
      if (!exists) {
        // Tentar criar o bucket
        try {
          await supabase.storage.createBucket(bucketName, {
            public: true,
            fileSizeLimit: 10485760, // 10MB
          });
          exists = true;
        } catch (bucketError) {
          console.error('Erro ao criar bucket:', bucketError);
          throw new Error('Não foi possível criar o bucket de armazenamento. Entre em contato com o administrador.');
        }
      }
      
      // Fazer upload do arquivo usando o serviço unificado
      // O serviço agora sanitiza automaticamente o nome do arquivo
      // Não precisamos mais tratar o nome do arquivo aqui
      const filePath = await storageService.uploadFile(arquivo, bucketName);
      
      // Obter a URL pública do arquivo
      const arquivoUrl = storageService.getPublicUrl(bucketName, filePath);
        
      // Remover o campo 'arquivo' do objeto fdu, se existir
      // pois ele não existe na tabela do banco de dados
      const { arquivo: fileField, ...fduData } = fdu as any;
      
      // Salvar os dados no banco de dados
      const { data, error } = await supabase
        .from('fdus')
        .insert({
          ...fduData,
          arquivoUrl,
          criadoEm: new Date().toISOString(),
          // Adicionar user_id para RLS
          user_id: session.user.id
        })
        .select()
        .single();

      if (error) {
        console.error('Erro ao inserir no banco de dados:', error);
        // Tentar remover o arquivo que foi carregado já que o registro falhou
        try {
          await storageService.removeFile(bucketName, filePath);
        } catch (deleteError) {
          console.error('Erro ao excluir arquivo após falha no registro:', deleteError);
        }
        throw new Error(`Erro ao salvar os dados: ${error.message}. Verifique se você tem permissões na tabela fdus.`);
      }
      
      return data;
    } catch (error: any) {
      console.error('Erro ao criar FDU:', error);
      throw new Error(error.message || 'Erro desconhecido ao criar FDU');
    }
  },

  async update(id: string, fdu: Partial<FDU>, arquivo?: File): Promise<FDU> {
    try {
      // Verificar se o id é válido
      if (!id) {
        throw new Error('ID da FDU é obrigatório para atualização.');
      }

      // Obter o registro atual para preservar a URL do arquivo se necessário
      const { data: existingFdu, error: fetchError } = await supabase
        .from('fdus')
        .select('arquivoUrl')
        .eq('id', id)
        .single();

      if (fetchError) {
        throw new Error(`FDU não encontrada: ${fetchError.message}`);
      }

      let arquivoUrl = existingFdu.arquivoUrl;

      // Processar novo arquivo se fornecido
      if (arquivo && arquivo.size > 0) {  
        // Verificar se o bucket existe
        const bucketName = 'fdus';
        const exists = await storageService.bucketExists(bucketName);
        if (!exists) {
          throw new Error('O bucket fdus não existe. Por favor, contate o administrador.');
        }
        
        // Gerar um nome de arquivo único
        const timestamp = new Date().getTime();
        const productName = fdu.produto || 'fdu';
        const fileName = `${productName.replace(/\s+/g, '_')}_${timestamp}.pdf`;
        
        // Fazer upload do novo arquivo usando o serviço unificado
        const filePath = await storageService.uploadFile(arquivo, bucketName, fileName);
        
        // Obter a URL pública do arquivo
        arquivoUrl = storageService.getPublicUrl(bucketName, filePath);
        
        // Tentar remover o arquivo antigo se existir
        if (existingFdu.arquivoUrl) {
          try {
            // Extrair o caminho do arquivo da URL
            const oldFilePathMatch = existingFdu.arquivoUrl.match(/fdus\/(.*?)(?:\?|$)/);
            if (oldFilePathMatch && oldFilePathMatch[1]) {
              await storageService.removeFile(bucketName, oldFilePathMatch[1]);
            }
          } catch (deleteError) {
            console.warn('Aviso: Não foi possível remover o arquivo antigo:', deleteError);
            // Continuar mesmo se a exclusão falhar
          }
        }
      }

      // Atualizar registro
      const { data, error } = await supabase
        .from('fdus')
        .update({ ...fdu, arquivoUrl })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Erro ao atualizar FDU: ${error.message}`);
      }
      
      return data;
    } catch (error: any) {
      console.error('Erro ao atualizar FDU:', error);
      throw new Error(error.message || 'Erro desconhecido ao atualizar FDU');
    }
  },

  async delete(id: string): Promise<void> {
    try {
      // Obter o registro atual para obter o arquivo relacionado
      const { data: fdu, error: fetchError } = await supabase
        .from('fdus')
        .select('arquivoUrl')
        .eq('id', id)
        .single();

      if (fetchError) {
        throw new Error(`FDU não encontrada: ${fetchError.message}`);
      }

      // Excluir o registro do banco de dados
      const { error } = await supabase
        .from('fdus')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(`Erro ao excluir FDU: ${error.message}`);
      }

      // Tentar excluir o arquivo associado
      if (fdu.arquivoUrl) {
        try {
          // Extrair o caminho do arquivo da URL
          const bucketName = 'fdus';
          const filePathMatch = fdu.arquivoUrl.match(/fdus\/(.*?)(?:\?|$)/);
          
          if (filePathMatch && filePathMatch[1]) {
            await storageService.removeFile(bucketName, filePathMatch[1]);
          }
        } catch (deleteError) {
          console.warn('Aviso: Não foi possível excluir o arquivo:', deleteError);
          // Continuar mesmo se a exclusão do arquivo falhar
        }
      }
    } catch (error: any) {
      console.error('Erro ao excluir FDU:', error);
      throw new Error(error.message || 'Erro desconhecido ao excluir FDU');
    }
  },

  async getById(id: string): Promise<FDU | null> {
    try {
      if (!id) {
        throw new Error('ID da FDU é obrigatório');
      }
      
      const { data, error } = await supabase
        .from('fdus')
        .select()
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') { // Código para 'não encontrado'
          return null;
        }
        throw new Error(`Erro ao buscar FDU: ${error.message}`);
      }
      
      return data;
    } catch (error: any) {
      console.error('Erro ao buscar FDU por ID:', error);
      throw new Error(error.message || 'Erro desconhecido ao buscar FDU');
    }
  },

  async list(filter?: FDUFilter) {
    try {
      let query = supabase.from('fdus').select();

      if (filter) {
        if (filter.produto) {
          query = query.ilike('produto', `%${filter.produto}%`);
        }
        if (filter.fabricante) {
          query = query.ilike('fabricante', `%${filter.fabricante}%`);
        }
        if (filter.numeroCas) {
          query = query.eq('numeroCas', filter.numeroCas);
        }
        if (filter.setor) {
          query = query.eq('setor', filter.setor);
        }
        if (filter.tipoRisco) {
          query = query.eq('tipoRisco', filter.tipoRisco);
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
        throw new Error(`Erro ao listar FDUs: ${error.message}`);
      }
      
      // Calcular status baseado na validade para cada FDU
      const fdusWithStatus = data?.map(fdu => ({
        ...fdu,
        status: calcularStatusData(fdu.validade)
      })) || [];
      
      return fdusWithStatus;
    } catch (error: any) {
      console.error('Erro ao listar FDUs:', error);
      throw new Error(error.message || 'Erro desconhecido ao listar FDUs');
    }
  },

  async getStatistics() {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Obter total de FDUs
      const { data: totalFdus, error: countError } = await supabase
        .from('fdus')
        .select('id', { count: 'exact' });

      if (countError) {
        throw new Error(`Erro ao contar FDUs: ${countError.message}`);
      }

      // Obter FDUs expirando em 30 dias
      const thirtyDaysLater = new Date(today);
      thirtyDaysLater.setDate(today.getDate() + 30);
      
      const { data: expiringFdus, error: expiringError } = await supabase
        .from('fdus')
        .select('id, validade')
        .gte('validade', today.toISOString())
        .lte('validade', thirtyDaysLater.toISOString());

      if (expiringError) {
        throw new Error(`Erro ao buscar FDUs expirando: ${expiringError.message}`);
      }

      // Obter FDUs vencidas
      const { data: expiredFdus, error: expiredError } = await supabase
        .from('fdus')
        .select('id')
        .lt('validade', today.toISOString());

      if (expiredError) {
        throw new Error(`Erro ao buscar FDUs vencidas: ${expiredError.message}`);
      }

      // Obter setores e fabricantes para estatísticas
      const { data: setores, error: setoresError } = await supabase
        .from('fdus')
        .select('setor, fabricante');

      if (setoresError) {
        throw new Error(`Erro ao buscar setores: ${setoresError.message}`);
      }

      // Estatísticas de setores e fabricantes únicos
      const uniqueSetores = setores ? [...new Set(setores.map(s => s.setor))] : [];
      const uniqueFabricantes = setores ? [...new Set(setores.map(s => s.fabricante))] : [];

      return {
        total: totalFdus?.length || 0,
        expirando: expiringFdus?.length || 0,
        vencidas: expiredFdus?.length || 0,
        setores: uniqueSetores.length,
        setoresLista: uniqueSetores,
        fabricantes: uniqueFabricantes.length,
        fabricantesLista: uniqueFabricantes,
      };
    } catch (error: any) {
      console.error('Erro ao obter estatísticas:', error);
      throw new Error(error.message || 'Erro desconhecido ao obter estatísticas');
    }
  }
};
