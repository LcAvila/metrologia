# Otimizações para Deploy - Metrologia Compactor

Este documento descreve as otimizações implementadas para melhorar o desempenho da aplicação em produção.

## Otimizações Implementadas

### 1. Configuração do Tailwind CSS
- Atualização da configuração do Tailwind para usar a abordagem moderna de purge
- Adição de safelist para classes dinâmicas que usam variáveis CSS
- Configuração de `hoverOnlyWhenSupported` para melhorar a performance em dispositivos móveis

### 2. Configuração do Next.js
- Habilitação do modo `standalone` para otimização em ambientes de produção
- Remoção do header `X-Powered-By` por questões de segurança
- Ativação do `swcMinify` para minificação mais rápida
- Otimização de imagens com suporte a formatos modernos (AVIF, WebP)
- Habilitação de compressão Gzip
- Configurações experimentais para otimização de CSS e cache do cliente

### 3. Otimização de Componentes
- Criação do componente `OptimizedImage` para otimização automática de imagens
- Implementação do `ScriptLoader` para carregamento otimizado de scripts externos
- Adição do `LazyComponent` para carregamento sob demanda de componentes pesados

### 4. Utilitários de Performance
- Implementação de sistema de cache configurável com diferentes durações
- Funções para otimização de recursos estáticos e precarregamento
- Utilitários de performance como debounce, throttle e memoização

## Como Usar as Otimizações

### Imagens Otimizadas
Substitua as tags `<img>` por:
```tsx
import OptimizedImage from './components/OptimizedImage';

<OptimizedImage src="/caminho/para/imagem.jpg" alt="Descrição" />
```

### Carregamento Lazy de Componentes
Para componentes pesados como gráficos ou tabelas complexas:
```tsx
import { withLazy } from './components/LazyComponent';

const LazyChart = withLazy(() => import('./Chart'));

// No seu componente
<LazyChart data={chartData} />
```

### Otimização de Scripts Externos
```tsx
import ScriptLoader from './components/ScriptLoader';

<ScriptLoader src="https://exemplo.com/script.js" strategy="lazyOnload" />
```

### Utilização do Cache
```tsx
import { getFromCache, setInCache, CACHE_DURATIONS } from './utils/cacheConfig';

// Armazenar dados
setInCache('chave-dados', dados, CACHE_DURATIONS.MEDIUM);

// Recuperar dados
const dadosCache = getFromCache('chave-dados');
```

## Recomendações Adicionais

1. **Análise de Bundle**: Use ferramentas como `@next/bundle-analyzer` para identificar pacotes grandes
2. **Otimização de Fontes**: Considere usar fontes variáveis e subconjuntos de fontes
3. **Monitoramento**: Implemente ferramentas de monitoramento de performance em produção
4. **Prefetching**: Utilize o prefetching do Next.js para rotas comuns

## Próximos Passos

- Implementar estratégia de Service Worker para cache offline
- Adicionar suporte a Web Vitals para monitoramento de métricas de performance
- Otimizar ainda mais as imagens com dimensões responsivas
- Implementar estratégia de code splitting mais granular