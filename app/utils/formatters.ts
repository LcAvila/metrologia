/**
 * Utilitários para formatação de dados e validação
 */

/**
 * Formata uma data para exibição em formato brasileiro (DD/MM/YYYY)
 * @param dateString String de data (formato ISO ou americano)
 */
export const formatarData = (dateString: string | Date | null | undefined): string => {
  if (!dateString) return '-';
  
  try {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return date.toLocaleDateString('pt-BR', { 
      timeZone: 'UTC' 
    });
  } catch (error) {
    console.error('Erro ao formatar data:', error);
    return dateString?.toString() || '-';
  }
};

/**
 * Converte data formato DD/MM/YYYY para YYYY-MM-DD (formato ISO)
 */
export const converterParaISODate = (dataString: string): string => {
  if (!dataString) return '';
  
  try {
    const partes = dataString.split('/');
    if (partes.length !== 3) return dataString;
    
    return `${partes[2]}-${partes[1]}-${partes[0]}`;
  } catch (error) {
    console.error('Erro ao converter data para ISO:', error);
    return dataString;
  }
};

/**
 * Formata o status do certificado ou equipamento para exibição
 */
export const formatarStatus = (status: string): { texto: string; classe: string } => {
  switch (status.toLowerCase()) {
    case 'valid':
    case 'available':
    case 'válido':
      return { texto: 'Válido', classe: 'text-green-500' };
    
    case 'expiring':
    case 'expirating':
    case 'expirando':
      return { texto: 'Expirando', classe: 'text-yellow-500' };
    
    case 'expired':
    case 'vencido':
      return { texto: 'Vencido', classe: 'text-red-500' };
    
    case 'unavailable':
    case 'indisponivel':
    case 'indisponível':
      return { texto: 'Indisponível', classe: 'text-gray-500' };
    
    default:
      return { texto: status, classe: 'text-gray-500' };
  }
};

/**
 * Valida se uma data está expirada, expirando em 30 dias ou válida
 */
export const calcularStatusData = (dataExpiracao: string | Date): 'valid' | 'expiring' | 'expired' => {
  try {
    const dataExp = typeof dataExpiracao === 'string' ? new Date(dataExpiracao) : dataExpiracao;
    const hoje = new Date();
    
    // Remover horas, minutos e segundos das datas para comparação apenas de dias
    hoje.setHours(0, 0, 0, 0);
    dataExp.setHours(0, 0, 0, 0);
    
    if (dataExp < hoje) {
      return 'expired';
    }
    
    // Calcular diferença em dias
    const diffTime = dataExp.getTime() - hoje.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 30) {
      return 'expiring';
    }
    
    return 'valid';
  } catch (error) {
    console.error('Erro ao calcular status da data:', error);
    return 'expired'; // Assume expirado em caso de erro
  }
};

/**
 * Formata um número para moeda brasileira
 */
export const formatarMoeda = (valor: number): string => {
  return valor.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
};

/**
 * Formata o nome de um arquivo para exibição (limita o tamanho e mantém a extensão)
 */
export const formatarNomeArquivo = (nomeCompleto: string, tamanhoMax: number = 20): string => {
  if (!nomeCompleto) return '';
  if (nomeCompleto.length <= tamanhoMax) return nomeCompleto;
  
  const extensao = nomeCompleto.split('.').pop() || '';
  const nome = nomeCompleto.substring(0, nomeCompleto.lastIndexOf('.'));
  
  const nomeEncurtado = nome.substring(0, tamanhoMax - extensao.length - 3) + '...';
  return `${nomeEncurtado}.${extensao}`;
};

/**
 * Remove acentos de uma string
 */
export const removerAcentos = (texto: string): string => {
  return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
};

/**
 * Filtra objetos por texto em múltiplas propriedades
 */
export const filtrarPorTexto = <T extends object>(
  itens: T[], 
  textoBusca: string, 
  propriedades: (keyof T)[]
): T[] => {
  if (!textoBusca.trim()) return itens;
  
  const termoBusca = removerAcentos(textoBusca.toLowerCase());
  
  return itens.filter(item => {
    return propriedades.some(prop => {
      const valor = item[prop];
      if (valor === null || valor === undefined) return false;
      
      const textoValor = removerAcentos(String(valor).toLowerCase());
      return textoValor.includes(termoBusca);
    });
  });
};
