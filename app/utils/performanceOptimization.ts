/**
 * Utilitários para otimização de performance
 * Este arquivo contém funções para melhorar o desempenho da aplicação
 */

/**
 * Função de debounce para limitar a frequência de execução de funções
 * Útil para eventos como scroll, resize, input, etc.
 * @param func Função a ser executada
 * @param wait Tempo de espera em ms
 * @param immediate Se verdadeiro, executa a função imediatamente
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number = 300,
  immediate: boolean = false
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function(this: any, ...args: Parameters<T>): void {
    const context = this;
    
    const later = function() {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    
    const callNow = immediate && !timeout;
    
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    
    if (callNow) func.apply(context, args);
  };
}

/**
 * Função de throttle para limitar a frequência de execução de funções
 * Diferente do debounce, garante que a função seja executada regularmente
 * @param func Função a ser executada
 * @param limit Limite de tempo em ms
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number = 300
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false;
  
  return function(this: any, ...args: Parameters<T>): void {
    const context = this;
    
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

/**
 * Função para memoização de resultados de funções puras
 * Útil para cálculos pesados que são chamados frequentemente com os mesmos parâmetros
 * @param func Função a ser memoizada
 * @param resolver Função opcional para resolver a chave do cache
 */
export function memoize<T extends (...args: any[]) => any>(
  func: T,
  resolver?: (...args: Parameters<T>) => string
): (...args: Parameters<T>) => ReturnType<T> {
  const cache = new Map<string, ReturnType<T>>();
  
  return function(this: any, ...args: Parameters<T>): ReturnType<T> {
    const key = resolver ? resolver(...args) : JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key)!;
    }
    
    const result = func.apply(this, args);
    cache.set(key, result);
    
    return result;
  };
}

/**
 * Função para adiar a execução de tarefas não críticas
 * Útil para operações pesadas que não precisam ser executadas imediatamente
 * @param func Função a ser executada
 * @param delay Atraso em ms
 */
export function deferTask<T extends (...args: any[]) => any>(
  func: T,
  delay: number = 0
): (...args: Parameters<T>) => Promise<ReturnType<T>> {
  return function(this: any, ...args: Parameters<T>): Promise<ReturnType<T>> {
    return new Promise(resolve => {
      if ('requestIdleCallback' in window) {
        (window as any).requestIdleCallback(() => {
          const result = func.apply(this, args);
          resolve(result);
        });
      } else {
        setTimeout(() => {
          const result = func.apply(this, args);
          resolve(result);
        }, delay);
      }
    });
  };
}

/**
 * Hook para detectar quando um componente está visível na tela
 * Útil para implementar lazy loading de componentes
 * @param callback Função a ser executada quando o elemento estiver visível
 * @param options Opções do IntersectionObserver
 */
export function setupIntersectionObserver(
  elementRef: React.RefObject<HTMLElement>,
  callback: (isVisible: boolean) => void,
  options: IntersectionObserverInit = { threshold: 0.1 }
): () => void {
  if (typeof window === 'undefined') return () => {};
  
  const observer = new IntersectionObserver(entries => {
    const [entry] = entries;
    callback(entry.isIntersecting);
  }, options);
  
  if (elementRef.current) {
    observer.observe(elementRef.current);
  }
  
  return () => {
    if (elementRef.current) {
      observer.unobserve(elementRef.current);
    }
    observer.disconnect();
  };
}