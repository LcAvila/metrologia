'use client';
import { useEffect, useState } from 'react';

interface ScriptLoaderProps {
  src: string;
  strategy?: 'beforeInteractive' | 'afterInteractive' | 'lazyOnload';
  onLoad?: () => void;
  onError?: () => void;
}

/**
 * Componente para carregamento otimizado de scripts externos
 * Implementa diferentes estratégias de carregamento para melhorar o desempenho
 */
export default function ScriptLoader({
  src,
  strategy = 'afterInteractive',
  onLoad,
  onError
}: ScriptLoaderProps) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Não carregue scripts no servidor
    if (typeof window === 'undefined') return;

    // Verificar se o script já existe
    const existingScript = document.querySelector(`script[src="${src}"]`);
    if (existingScript) {
      setLoaded(true);
      return;
    }

    const loadScript = () => {
      const script = document.createElement('script');
      script.src = src;
      script.async = true;

      script.onload = () => {
        setLoaded(true);
        if (onLoad) onLoad();
      };

      script.onerror = () => {
        if (onError) onError();
      };

      document.body.appendChild(script);
    };

    // Implementar diferentes estratégias de carregamento
    if (strategy === 'beforeInteractive') {
      // Carregar imediatamente
      loadScript();
    } else if (strategy === 'afterInteractive') {
      // Carregar após a interatividade da página
      if (document.readyState === 'complete') {
        loadScript();
      } else {
        window.addEventListener('load', loadScript);
        return () => window.removeEventListener('load', loadScript);
      }
    } else if (strategy === 'lazyOnload') {
      // Carregar quando o navegador estiver ocioso ou após um atraso
      if ('requestIdleCallback' in window) {
        (window as any).requestIdleCallback(loadScript);
      } else {
        setTimeout(loadScript, 1500);
      }
    }
  }, [src, strategy, onLoad, onError]);

  return null;
}