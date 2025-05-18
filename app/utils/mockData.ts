import { Equipamento, Certificado, FDU, FichaEmergencia } from '../types';

/**
 * Dados de teste (mock) utilizados apenas em ambiente de desenvolvimento
 * Centraliza todos os dados de teste para facilitar a manutenção
 */

// Mock de equipamentos para testes
export const mockEquipamentos: Equipamento[] = [
  {
    id: "EQP-001",
    type: "Paquímetro",
    sector: "Controle da Qualidade",
    status: "available",
    nextCalibration: "2025-06-10",
    model: "Mitutoyo 530-104",
    serialNumber: "A12345"
  },
  {
    id: "EQP-002",
    type: "Micrômetro",
    sector: "Ferramentaria",
    status: "expiring",
    nextCalibration: "2025-05-15",
    model: "Starrett 436",
    serialNumber: "B98765"
  },
  {
    id: "EQP-003",
    type: "Balança",
    sector: "Montagem 1 (M1)",
    status: "expired",
    nextCalibration: "2025-04-01",
    model: "Toledo Prix 3",
    serialNumber: "C54321"
  }
];

// Mock de certificados para testes
export const mockCertificados: Certificado[] = [
  {
    id: "CERT-001",
    equipmentId: "EQP-001",
    equipmentName: "Paquímetro Digital",
    certificateNumber: "CAL-2023-001",
    issueDate: "2023-05-10",
    expirationDate: "2025-05-10",
    calibrationDate: "2023-05-05",
    fileName: "certificado_paquimetro.pdf",
    fileUrl: "/certificados/certificado_paquimetro.pdf",
    status: "valid",
    sector: "Controle da Qualidade"
  },
  {
    id: "CERT-002",
    equipmentId: "EQP-002",
    equipmentName: "Micrômetro Externo",
    certificateNumber: "CAL-2023-002",
    issueDate: "2023-06-15",
    expirationDate: "2025-06-15",
    calibrationDate: "2023-06-10",
    fileName: "certificado_micrometro.pdf",
    fileUrl: "/certificados/certificado_micrometro.pdf",
    status: "valid",
    sector: "Ferramentaria"
  },
  {
    id: "CERT-003",
    equipmentId: "EQP-003",
    equipmentName: "Balança Analítica",
    certificateNumber: "CAL-2023-003",
    issueDate: "2023-04-20",
    expirationDate: "2024-04-20",
    calibrationDate: "2023-04-15",
    fileName: "certificado_balanca.pdf",
    fileUrl: "/certificados/certificado_balanca.pdf",
    status: "expired",
    sector: "Montagem 1 (M1)"
  }
];

// Mock de FDUs para testes
export const mockFdus: FDU[] = [
  {
    id: "FDU-001",
    produto: "Acetona",
    fabricante: "Química Brasil",
    numeroCas: "67-64-1",
    setor: "Almoxarifado 1 (ALM 1)",
    tipoRisco: "Inflamável",
    validade: "2025-07-15",
    arquivoUrl: "/fdus/acetona.pdf",
    criadoEm: "2023-07-15"
  },
  {
    id: "FDU-002",
    produto: "Hidróxido de Sódio",
    fabricante: "Química Industrial",
    numeroCas: "1310-73-2",
    setor: "Controle da Qualidade",
    tipoRisco: "Corrosivo",
    validade: "2025-08-20",
    arquivoUrl: "/fdus/hidroxido_sodio.pdf",
    criadoEm: "2023-08-20"
  },
  {
    id: "FDU-003",
    produto: "Álcool Isopropílico",
    fabricante: "Solventes SA",
    numeroCas: "67-63-0",
    setor: "Montagem 1 (M1)",
    tipoRisco: "Inflamável",
    validade: "2025-06-10",
    arquivoUrl: "/fdus/alcool_isopropilico.pdf",
    criadoEm: "2023-06-10"
  }
];

// Mock de Fichas de Emergência para testes
export const mockFichasEmergencia: FichaEmergencia[] = [
  {
    id: "EMERG-001",
    produto: "Acetona",
    setor: "Almoxarifado 1 (ALM 1)",
    tipoRisco: "Inflamável",
    dataEmissao: "2023-07-20",
    arquivoUrl: "/emergencia/acetona_emergencia.pdf",
    criadoEm: "2023-07-20"
  },
  {
    id: "EMERG-002",
    produto: "Hidróxido de Sódio",
    setor: "Controle da Qualidade",
    tipoRisco: "Corrosivo",
    dataEmissao: "2023-08-25",
    arquivoUrl: "/emergencia/hidroxido_sodio_emergencia.pdf",
    criadoEm: "2023-08-25"
  },
  {
    id: "EMERG-003",
    produto: "Álcool Isopropílico",
    setor: "Montagem 1 (M1)",
    tipoRisco: "Inflamável",
    dataEmissao: "2023-06-15",
    arquivoUrl: "/emergencia/alcool_isopropilico_emergencia.pdf",
    criadoEm: "2023-06-15"
  }
];

// Utilitário para decidir quando usar dados mock (apenas em desenvolvimento)
export const shouldUseMockData = (): boolean => {
  return process.env.NODE_ENV === 'development' && (process.env.USE_MOCK_DATA === 'true');
};
