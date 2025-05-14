import { supabase } from '../lib/supabaseClient';

/**
 * Serviço unificado para gerenciamento de arquivos no Supabase Storage
 * Centraliza todas as operações de armazenamento do projeto
 */
export const storageService = {
  /**
   * Faz upload de um arquivo para um bucket específico
   * @param file Arquivo a ser enviado
   * @param bucket Nome do bucket ('documentos', 'fispqs', 'fichas_emergencia')
   * @param pasta Pasta dentro do bucket (opcional)
   * @returns Caminho do arquivo no storage
   */
  async uploadFile(file: File, bucket: string, pasta?: string): Promise<string> {
    // Verificar usuário autenticado
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('Usuário não autenticado. Faça login para continuar.');
    }

    if (!file || file.size === 0) {
      throw new Error('Arquivo inválido ou vazio.');
    }

    // Gerar nome do arquivo para evitar colisões
    const timestamp = Date.now();
    const fileName = `${timestamp}_${file.name}`;
    
    // Definir o caminho do arquivo
    const filePath = pasta 
      ? `${user.id}/${pasta}/${fileName}`
      : `${user.id}/${fileName}`;

    // Upload do arquivo
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true // Permite sobrescrever se já existir
      });

    if (error) {
      console.error(`Erro ao fazer upload para ${bucket}:`, error.message || error);
      throw new Error(error.message || `Erro desconhecido ao fazer upload para ${bucket}`);
    }

    return data.path;
  },

  /**
   * Obtém a URL pública de um arquivo
   * @param bucket Nome do bucket
   * @param filePath Caminho do arquivo
   * @returns URL pública do arquivo
   */
  getPublicUrl(bucket: string, filePath: string): string {
    return supabase.storage.from(bucket).getPublicUrl(filePath).data.publicUrl;
  },

  /**
   * Baixa um arquivo do storage
   * @param bucket Nome do bucket
   * @param filePath Caminho do arquivo
   * @returns Dados do arquivo como Blob
   */
  async downloadFile(bucket: string, filePath: string): Promise<Blob> {
    const { data, error } = await supabase.storage
      .from(bucket)
      .download(filePath);

    if (error) {
      console.error(`Erro ao baixar arquivo de ${bucket}:`, error.message || error);
      throw new Error(error.message || `Erro desconhecido ao baixar arquivo de ${bucket}`);
    }

    return data;
  },

  /**
   * Remove um arquivo do storage
   * @param bucket Nome do bucket
   * @param filePath Caminho do arquivo
   */
  async removeFile(bucket: string, filePath: string): Promise<void> {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath]);

    if (error) {
      console.error(`Erro ao remover arquivo de ${bucket}:`, error.message || error);
      throw new Error(error.message || `Erro desconhecido ao remover arquivo de ${bucket}`);
    }
  },

  /**
   * Lista arquivos em um bucket/pasta
   * @param bucket Nome do bucket
   * @param pasta Pasta dentro do bucket (opcional)
   * @returns Lista de arquivos
   */
  async listFiles(bucket: string, pasta?: string): Promise<any[]> {
    const { data, error } = await supabase.storage
      .from(bucket)
      .list(pasta || '');

    if (error) {
      console.error(`Erro ao listar arquivos de ${bucket}:`, error.message || error);
      throw new Error(error.message || `Erro desconhecido ao listar arquivos de ${bucket}`);
    }

    return data || [];
  },

  /**
   * Verifica se um bucket existe
   * @param bucket Nome do bucket a verificar
   * @returns Booleano indicando se o bucket existe
   */
  async bucketExists(bucket: string): Promise<boolean> {
    try {
      const { data: buckets } = await supabase.storage.listBuckets();
      // Garantir que retorne sempre um boolean, mesmo se buckets for null ou undefined
      return !!(buckets && buckets.some(b => b.name === bucket));
    } catch (error) {
      console.error(`Erro ao verificar bucket ${bucket}:`, error);
      return false;
    }
  }
};
