/**
 * Configurações e utilitários para otimização de recursos estáticos
 * Este arquivo contém funções para otimizar o carregamento de assets
 */

// Configurações para precarregamento de recursos críticos
export const CRITICAL_RESOURCES = {
  // Fontes essenciais que devem ser carregadas com prioridade
  FONTS: [
    // Adicione aqui as fontes críticas para a aplicação
  ],
  // Imagens críticas que devem ser carregadas com prioridade
  IMAGES: [
    '/assets/compactor.png',
    '/assets/logo.png'
  ]
};

/**
 * Gera tags de preload para recursos críticos
 * @returns Array de strings HTML para inserção no head
 */
export function generatePreloadTags(): string[] {
  const tags: string[] = [];
  
  // Preload de fontes críticas
  CRITICAL_RESOURCES.FONTS.forEach(font => {
    tags.push(`<link rel="preload" href="${font}" as="font" type="font/woff2" crossorigin="anonymous">`);
  });
  
  // Preload de imagens críticas
  CRITICAL_RESOURCES.IMAGES.forEach(image => {
    tags.push(`<link rel="preload" href="${image}" as="image">`);
  });
  
  return tags;
}

/**
 * Otimiza o carregamento de imagens com técnica de blur-up
 * @param src URL da imagem
 * @param width Largura da imagem
 * @param height Altura da imagem
 * @returns Objeto com propriedades otimizadas para next/image
 */
export function getOptimizedImageProps(src: string, width?: number, height?: number) {
  return {
    src,
    width: width || undefined,
    height: height || undefined,
    loading: 'lazy' as 'lazy' | 'eager',
    placeholder: 'blur' as 'blur' | 'empty',
    blurDataURL: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZWVlZWVlIi8+PC9zdmc+',
  };
}

/**
 * Função para carregar recursos sob demanda
 * @param url URL do recurso a ser carregado
 * @param type Tipo do recurso (script, style, image)
 * @returns Promise que resolve quando o recurso é carregado
 */
export function loadResourceOnDemand(url: string, type: 'script' | 'style' | 'image'): Promise<Event> {
  return new Promise((resolve, reject) => {
    let element: HTMLElement;
    
    switch (type) {
      case 'script':
        element = document.createElement('script');
        (element as HTMLScriptElement).src = url;
        (element as HTMLScriptElement).async = true;
        break;
      
      case 'style':
        element = document.createElement('link');
        (element as HTMLLinkElement).rel = 'stylesheet';
        (element as HTMLLinkElement).href = url;
        break;
      
      case 'image':
        element = document.createElement('img');
        (element as HTMLImageElement).src = url;
        break;
      
      default:
        reject(new Error(`Tipo de recurso não suportado: ${type}`));
        return;
    }
    
    element.onload = (event) => resolve(event);
    element.onerror = (error) => reject(error);
    
    if (type === 'script' || type === 'style') {
      document.head.appendChild(element);
    }
  });
}

/**
 * Função para otimizar SVGs inline
 * @param svgContent Conteúdo SVG como string
 * @returns SVG otimizado
 */
export function optimizeSvg(svgContent: string): string {
  // Remover comentários
  let optimized = svgContent.replace(/<!--[\s\S]*?-->/g, '');
  
  // Remover espaços em branco desnecessários
  optimized = optimized.replace(/\s+/g, ' ');
  
  // Remover atributos desnecessários
  optimized = optimized.replace(/\s?data-name="[^"]*"/g, '');
  
  return optimized;
}