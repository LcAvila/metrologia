'use client';
import { Suspense, lazy, ComponentType, ReactNode } from 'react';

interface LazyComponentProps {
  component: () => Promise<{ default: ComponentType<any> }>;
  fallback?: ReactNode;
  props?: Record<string, any>;
}

/**
 * Componente para carregamento lazy de componentes pesados
 * Melhora o desempenho inicial da página carregando componentes apenas quando necessário
 */
export default function LazyComponent({
  component,
  fallback = <div className="animate-pulse bg-gray-200 rounded-md h-32 w-full"></div>,
  props = {}
}: LazyComponentProps) {
  // Usando lazy() do React para carregar o componente sob demanda
  const LazyLoadedComponent = lazy(component);

  return (
    <Suspense fallback={fallback}>
      <LazyLoadedComponent {...props} />
    </Suspense>
  );
}

/**
 * HOC (High Order Component) para facilitar a criação de componentes lazy
 * Exemplo de uso: 
 * const LazyChart = withLazy(() => import('./Chart'));
 */
export function withLazy<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>
) {
  return function WithLazy(props: any) {
    return <LazyComponent component={importFunc} props={props} />;
  };
}