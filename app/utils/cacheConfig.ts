/**
 * Configurações de cache para otimização de desempenho
 * Este arquivo contém funções e constantes para gerenciar o cache da aplicação
 */

// Duração do cache em segundos para diferentes tipos de dados
export const CACHE_DURATIONS = {
  // Cache de curta duração para dados que mudam com frequência
  SHORT: 60 * 5, // 5 minutos
  // Cache de média duração para dados que mudam ocasionalmente
  MEDIUM: 60 * 60, // 1 hora
  // Cache de longa duração para dados que raramente mudam
  LONG: 60 * 60 * 24, // 24 horas
  // Cache permanente para dados estáticos
  PERMANENT: 60 * 60 * 24 * 30, // 30 dias
};

/**
 * Função para obter dados do cache local
 * @param key Chave do cache
 * @returns Dados armazenados ou null se não existir ou estiver expirado
 */
export function getFromCache<T>(key: string): T | null {
  try {
    const item = localStorage.getItem(`cache_${key}`);
    if (!item) return null;
    
    const { value, expiry } = JSON.parse(item);
    
    // Verificar se o cache expirou
    if (expiry && Date.now() > expiry) {
      localStorage.removeItem(`cache_${key}`);
      return null;
    }
    
    return value as T;
  } catch (error) {
    console.error('Erro ao recuperar do cache:', error);
    return null;
  }
}

/**
 * Função para armazenar dados no cache local
 * @param key Chave do cache
 * @param value Valor a ser armazenado
 * @param duration Duração do cache em segundos
 */
export function setInCache<T>(key: string, value: T, duration: number = CACHE_DURATIONS.MEDIUM): void {
  try {
    const expiry = duration > 0 ? Date.now() + (duration * 1000) : null;
    const item = JSON.stringify({ value, expiry });
    localStorage.setItem(`cache_${key}`, item);
  } catch (error) {
    console.error('Erro ao armazenar no cache:', error);
  }
}

/**
 * Função para limpar um item específico do cache
 * @param key Chave do cache a ser removida
 */
export function clearCacheItem(key: string): void {
  localStorage.removeItem(`cache_${key}`);
}

/**
 * Função para limpar todo o cache da aplicação
 * @param prefix Prefixo opcional para limpar apenas um grupo de itens
 */
export function clearAllCache(prefix?: string): void {
  if (prefix) {
    // Limpar apenas itens com o prefixo especificado
    Object.keys(localStorage)
      .filter(key => key.startsWith(`cache_${prefix}`))
      .forEach(key => localStorage.removeItem(key));
  } else {
    // Limpar todos os itens de cache
    Object.keys(localStorage)
      .filter(key => key.startsWith('cache_'))
      .forEach(key => localStorage.removeItem(key));
  }
}

/**
 * Hook para gerenciar o cache de forma reativa
 * Pode ser expandido para usar com React Query ou SWR se necessário
 */
export function setupCacheCleanup(): void {
  // Limpar caches expirados ao iniciar a aplicação
  try {
    Object.keys(localStorage)
      .filter(key => key.startsWith('cache_'))
      .forEach(key => {
        const item = localStorage.getItem(key);
        if (!item) return;
        
        try {
          const { expiry } = JSON.parse(item);
          if (expiry && Date.now() > expiry) {
            localStorage.removeItem(key);
          }
        } catch (e) {
          // Se não conseguir analisar o item, remova-o
          localStorage.removeItem(key);
        }
      });
  } catch (error) {
    console.error('Erro ao limpar cache expirado:', error);
  }
}