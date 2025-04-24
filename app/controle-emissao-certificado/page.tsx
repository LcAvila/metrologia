"use client";
import Layout from '../components/Layout';
import { useState, useEffect, FormEvent, useCallback } from 'react';
import Link from 'next/link';
import { generateCertificateNumber, incrementCertificateNumber } from '../services/certificateService';
import { useTheme } from '../context/ThemeContext';

// Interface para o certificado
interface Certificate {
  id: string;
  certificateNumber: string;
  receiveDate: string;
  equipment: string;
  identification: string;
  sector: string;
  issueDate: string;
}

// Componente para gerar automaticamente o número do certificado
const CertificateNumberGenerator = ({ value, onChange, shouldRefresh }: { value: string, onChange: (value: string) => void, shouldRefresh: number }) => {
  useEffect(() => {
    try {
      const number = generateCertificateNumber();
      onChange(number);
    } catch (error) {
      console.error('Erro ao gerar número de certificado:', error);
      onChange('Erro');
    }
  }, [onChange, shouldRefresh]); // Atualiza quando shouldRefresh mudar

  return (
    <div className="relative">
      <input
        type="text"
        id="certificateNumber"
        value={value}
        className="w-full px-1.5 py-0.5 border border-[var(--input-border)] rounded-md bg-[var(--input-bg)] text-[var(--input-text)] focus:outline-none cursor-default"
        readOnly
      />
      <div className="absolute inset-y-0 right-0 pr-1.5 flex items-center pointer-events-none">
        <span className="text-[var(--foreground-muted)] text-xs">Auto</span>
      </div>
    </div>
  );
};

export default function ControleEmissaoCertificado() {
  const { theme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [refreshCertNumber, setRefreshCertNumber] = useState(0); // Estado para forçar atualização do número
  const handleCertificateNumberChange = useCallback((value: string) => {
    setFormData(prev => ({ ...prev, certificateNumber: value }));
  }, []);

  const [formData, setFormData] = useState<Certificate>({
    id: '',
    certificateNumber: '',
    receiveDate: '',
    equipment: '',
    identification: '',
    sector: '',
    issueDate: ''
  });
  const [certificates, setCertificates] = useState<Certificate[]>([]);

  // Carregar certificados salvos ao iniciar
  useEffect(() => {
    const savedCertificates = localStorage.getItem('certificates');
    if (savedCertificates) {
      setCertificates(JSON.parse(savedCertificates));
    }
  }, []);

  // Função para atualizar os campos do formulário
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  }, []);

  // Função para salvar o certificado
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    const newCertificate: Certificate = {
      ...formData,
      id: Date.now().toString() // ID único baseado no timestamp
    };
    
    const updatedCertificates = [...certificates, newCertificate];
    setCertificates(updatedCertificates);
    
    // Salvar no localStorage
    localStorage.setItem('certificates', JSON.stringify(updatedCertificates));
    
    // Incrementar o número do certificado após salvar
    incrementCertificateNumber();
    
    // Forçar atualização do número do certificado
    setRefreshCertNumber(prev => prev + 1);
    
    // Limpar o formulário, mantendo apenas o número do certificado
    setFormData({
      id: '',
      certificateNumber: formData.certificateNumber,
      receiveDate: '',
      equipment: '',
      identification: '',
      sector: '',
      issueDate: ''
    });
  };

  return (
    <Layout title="Controle de Emissão de Certificado">
      {/* Main Content */}
      <div className="flex-1 transition-all duration-300">
        {/* Content */}
        <div className="bg-[var(--card-bg)] p-4 rounded-lg shadow mb-4 border border-[var(--card-border)]">
          <form className="space-y-3" onSubmit={handleSubmit}>
            {/* Grid estilo planilha para os campos do formulário */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-1">
              {/* Número de Certificado (Gerado automaticamente) */}
              <div className="col-span-2 md:col-span-1">
                <label htmlFor="certificateNumber" className="block font-medium text-[var(--foreground)] mb-0.5">Nº Certificado</label>
                <CertificateNumberGenerator 
                  value={formData.certificateNumber} 
                  onChange={handleCertificateNumberChange}
                  shouldRefresh={refreshCertNumber}
                />
              </div>
              
              {/* Data de Recebimento */}
              <div className="col-span-1 md:col-span-1">
                <label htmlFor="receiveDate" className="block font-medium text-[var(--foreground)] mb-0.5">Recebimento</label>
                <input 
                  type="date" 
                  id="receiveDate" 
                  value={formData.receiveDate}
                  onChange={handleChange}
                  className="w-full px-1.5 py-0.5 border border-[var(--input-border)] rounded-md bg-[var(--input-bg)] text-[var(--input-text)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                />
              </div>
              
              {/* Data de Emissão */}
              <div className="col-span-1 md:col-span-1">
                <label htmlFor="issueDate" className="block font-medium text-[var(--foreground)] mb-0.5">Emissão</label>
                <input 
                  type="date" 
                  id="issueDate" 
                  value={formData.issueDate}
                  onChange={handleChange}
                  className="w-full px-1.5 py-0.5 border border-[var(--input-border)] rounded-md bg-[var(--input-bg)] text-[var(--input-text)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                />
              </div>
              
              {/* Equipamento */}
              <div className="col-span-2 md:col-span-1">
                <label htmlFor="equipment" className="block font-medium text-[var(--foreground)] mb-0.5">Equipamento</label>
                <input 
                  type="text" 
                  id="equipment" 
                  value={formData.equipment}
                  onChange={handleChange}
                  className="w-full px-1.5 py-0.5 border border-[var(--input-border)] rounded-md bg-[var(--input-bg)] text-[var(--input-text)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                  placeholder="Nome do equipamento"
                />
              </div>
              
              {/* Identificação */}
              <div className="col-span-2 md:col-span-1">
                <label htmlFor="identification" className="block font-medium text-[var(--foreground)] mb-0.5">ID</label>
                <input 
                  type="text" 
                  id="identification" 
                  value={formData.identification}
                  onChange={handleChange}
                  className="w-full px-1.5 py-0.5 border border-[var(--input-border)] rounded-md bg-[var(--input-bg)] text-[var(--input-text)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                  placeholder="ID"
                />
              </div>
              
              {/* Setor */}
              <div className="col-span-2 md:col-span-1">
                <label htmlFor="sector" className="block font-medium text-[var(--foreground)] mb-0.5">Setor</label>
                <input 
                  type="text" 
                  id="sector" 
                  value={formData.sector}
                  onChange={handleChange}
                  className="w-full px-1.5 py-0.5 border border-[var(--input-border)] rounded-md bg-[var(--input-bg)] text-[var(--input-text)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                  placeholder="Setor"
                />
              </div>
            </div>
            
            <div className="pt-3">
              <button 
                type="submit" 
                className="w-full bg-[var(--primary)] text-white py-1.5 px-3 text-sm rounded-md hover:bg-[var(--primary-hover)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] focus:ring-offset-1"
              >
                Salvar Certificado
              </button>
            </div>
          </form>
        </div>
        
        {/* Tabela de certificados cadastrados */}
        <div className="bg-[var(--card-bg)] p-4 rounded-lg shadow border border-[var(--card-border)]">
          <h2 className="text-lg font-semibold mb-3 text-[var(--foreground)]">Certificados Cadastrados</h2>
          
          {certificates.length === 0 ? (
            <p className="text-[var(--muted)] italic text-sm">Nenhum certificado cadastrado.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-[var(--card-border)]">
                <thead className="bg-[var(--background-muted)] bg-opacity-50">
                  <tr>
                    <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-[var(--muted)] uppercase tracking-wider">Nº Certificado</th>
                    <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-[var(--muted)] uppercase tracking-wider">Equipamento</th>
                    <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-[var(--muted)] uppercase tracking-wider">Identificação</th>
                    <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-[var(--muted)] uppercase tracking-wider">Setor</th>
                    <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-[var(--muted)] uppercase tracking-wider">Recebimento</th>
                    <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-[var(--muted)] uppercase tracking-wider">Emissão</th>
                  </tr>
                </thead>
                <tbody className="bg-[var(--card-bg)] divide-y divide-[var(--card-border)]">
                  {certificates.map((cert) => (
                    <tr key={cert.id}>
                      <td className="px-3 py-2 whitespace-nowrap text-xs font-medium text-[var(--foreground)]">{cert.certificateNumber}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-xs text-[var(--muted)]">{cert.equipment}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-xs text-[var(--muted)]">{cert.identification}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-xs text-[var(--muted)]">{cert.sector}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-xs text-[var(--muted)]">{cert.receiveDate}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-xs text-[var(--muted)]">{cert.issueDate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}