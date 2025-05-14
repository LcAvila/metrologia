/**
 * Serviço para gerenciar números de certificados
 * Implementa a lógica de geração automática de números de certificado no formato SSNNNAA
 * SS = semestre (01 ou 02)
 * NNN = número sequencial (começando com 001 para cada semestre, incrementa apenas quando um certificado é emitido)
 * AA = ano atual (últimos 2 dígitos)
 */

// Chave para armazenar os dados no localStorage
const CERTIFICATE_STORAGE_KEY = 'certificateNumbers';

// Interface para os dados armazenados
interface CertificateNumberData {
  lastSequentialNumber: number;
  lastSemester: string;
  lastYear: string;
}

/**
 * Obtém os dados armazenados sobre os números de certificados
 */
const getCertificateData = (): CertificateNumberData => {
  const storedData = localStorage.getItem(CERTIFICATE_STORAGE_KEY);
  
  if (storedData) {
    return JSON.parse(storedData);
  }
  
  // Valores padrão se não houver dados armazenados
  return {
    lastSequentialNumber: 0,
    lastSemester: '',
    lastYear: ''
  };
};

/**
 * Salva os dados dos números de certificados no localStorage
 */
const saveCertificateData = (data: CertificateNumberData): void => {
  localStorage.setItem(CERTIFICATE_STORAGE_KEY, JSON.stringify(data));
};

/**
 * Gera o próximo número de certificado no formato SSNNNAA
 * Reinicia a sequência quando muda o semestre ou o ano
 * O número sequencial só incrementa quando um certificado é emitido
 */
export const generateCertificateNumber = (): string => {
  // Determinar o semestre atual (01 para primeiro semestre, 02 para segundo semestre)
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1; // getMonth() retorna 0-11
  const currentSemester = currentMonth <= 6 ? '01' : '02';
  
  // Ano atual (últimos 2 dígitos)
  const currentYear = currentDate.getFullYear().toString().slice(-2);
  
  // Obter os dados armazenados
  const certificateData = getCertificateData();
  
  // Verificar se mudou o semestre ou o ano
  if (certificateData.lastSemester !== currentSemester || certificateData.lastYear !== currentYear) {
    // Reiniciar a sequência para o novo semestre ou ano
    certificateData.lastSequentialNumber = 1; // Começar com 1 para o novo semestre/ano
  } else if (!certificateData.lastSequentialNumber) {
    // Se não houver número sequencial definido
    certificateData.lastSequentialNumber = 1;
  }
  // Não incrementamos aqui - isso só deve acontecer quando incrementCertificateNumber() é chamado
  
  // Atualizar o semestre e ano
  certificateData.lastSemester = currentSemester;
  certificateData.lastYear = currentYear;
  
  // Formatar o número sequencial com zeros à esquerda (001, 002, etc.)
  const sequentialNumber = certificateData.lastSequentialNumber.toString().padStart(3, '0');
  
  // Salvar os dados atualizados
  saveCertificateData(certificateData);
  
  // Formatar o número do certificado: SSNNNAA
  return `${currentSemester}${sequentialNumber}${currentYear}`;
};

/**
 * Obtém o último número de certificado gerado sem incrementar o contador
 */
export const getLastCertificateNumber = (): string => {
  const certificateData = getCertificateData();
  
  // Se não houver dados armazenados, gerar um novo número
  if (!certificateData.lastSemester || !certificateData.lastYear) {
    return generateCertificateNumber();
  }
  
  // Formatar o número sequencial com zeros à esquerda
  const sequentialNumber = certificateData.lastSequentialNumber.toString().padStart(3, '0');
  
  // Retornar o último número gerado
  return `${certificateData.lastSemester}${sequentialNumber}${certificateData.lastYear}`;
};

/**
 * Incrementa o número sequencial do certificado quando um certificado é emitido
 * Deve ser chamado após salvar um novo certificado
 */
export const incrementCertificateNumber = (): void => {
  // Obter os dados armazenados
  const certificateData = getCertificateData();
  
  // Incrementar o número sequencial
  certificateData.lastSequentialNumber += 1;
  
  // Salvar os dados atualizados
  saveCertificateData(certificateData);
};