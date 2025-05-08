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
  
  // Estados para o modal de confirmação de exclusão
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [certificateToDelete, setCertificateToDelete] = useState<{id: string} | null>(null);
  
  // Estado para edição de certificado
  const [isEditing, setIsEditing] = useState(false);

  // Carregar certificados salvos ao iniciar
  useEffect(() => {
    const savedCertificates = localStorage.getItem('certificates');
    if (savedCertificates) {
      setCertificates(JSON.parse(savedCertificates));
    }
  }, []);

  // Função para editar certificado
  const editCertificate = useCallback((id: string) => {
    const certificate = certificates.find(cert => cert.id === id);
    if (certificate) {
      setFormData(certificate);
      setIsEditing(true);
      // Não atualizamos o número do certificado ao editar
    }
  }, [certificates]);
  
  // Função para excluir certificado
  const deleteCertificate = useCallback((id: string) => {
    setCertificateToDelete({ id });
    setIsDeleteModalOpen(true);
  }, []);
  
  // Função para confirmar exclusão
  const confirmDelete = useCallback(() => {
    if (certificateToDelete) {
      const updatedCertificates = certificates.filter(cert => cert.id !== certificateToDelete.id);
      setCertificates(updatedCertificates);
      
      // Salvar no localStorage
      localStorage.setItem('certificates', JSON.stringify(updatedCertificates));
      
      setIsDeleteModalOpen(false);
      setCertificateToDelete(null);
    }
  }, [certificates, certificateToDelete]);

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
    
    if (isEditing) {
      // Atualizar certificado existente
      const updatedCertificates = certificates.map(cert => 
        cert.id === formData.id ? formData : cert
      );
      setCertificates(updatedCertificates);
      localStorage.setItem('certificates', JSON.stringify(updatedCertificates));
      setIsEditing(false);
    } else {
      // Criar novo certificado
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
    }
    
    // Limpar o formulário, mantendo apenas o número do certificado se não estiver editando
    setFormData({
      id: '',
      certificateNumber: isEditing ? '' : formData.certificateNumber,
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
                  className="w-full px-1.5 py-0.5 border border-[var(--input-border)] rounded-md bg-[var(--input-bg)] text-[var(--input-text)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] focus:ring-offset-1"
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
                  className="w-full px-1.5 py-0.5 border border-[var(--input-border)] rounded-md bg-[var(--input-bg)] text-[var(--input-text)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] focus:ring-offset-1"
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
                  className="w-full px-1.5 py-0.5 border border-[var(--input-border)] rounded-md bg-[var(--input-bg)] text-[var(--input-text)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] focus:ring-offset-1"
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
                  className="w-full px-1.5 py-0.5 border border-[var(--input-border)] rounded-md bg-[var(--input-bg)] text-[var(--input-text)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] focus:ring-offset-1"
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
                  className="w-full px-1.5 py-0.5 border border-[var(--input-border)] rounded-md bg-[var(--input-bg)] text-[var(--input-text)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] focus:ring-offset-1"
                  placeholder="Setor"
                />
              </div>
            </div>
            
            <div className="pt-3">
              <button 
                type="submit" 
                className="w-full bg-[var(--primary)] text-white py-1.5 px-3 text-sm rounded-md hover:bg-[var(--primary-hover)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] focus:ring-offset-1 font-medium transition-colors duration-300"
              >
                {isEditing ? 'Atualizar Certificado' : 'Salvar Certificado'}
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
                    <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-[var(--muted)] uppercase tracking-wider">Ações</th>
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
                      <td className="px-3 py-2 whitespace-nowrap text-xs text-[var(--muted)] space-x-2">
                        <button 
                          className="p-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-1 inline-flex items-center justify-center"
                          onClick={() => editCertificate(cert.id)}
                          title="Editar"
                        >
                          <i className="bx bx-edit-alt text-lg"></i>
                        </button>
                        <button 
                          className="p-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-1 inline-flex items-center justify-center"
                          onClick={() => deleteCertificate(cert.id)}
                          title="Excluir"
                        >
                          <i className="bx bx-trash text-lg"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      
      {/* Modal de Confirmação de Exclusão */}
      {isDeleteModalOpen && certificateToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[var(--card-bg)] rounded-lg p-6 max-w-md w-full">
            <div className="flex flex-col items-center text-center mb-4">
              <div className="bg-red-100 p-3 rounded-full mb-4">
                <i className="bx bx-trash text-red-600 text-3xl"></i>
              </div>
              <h2 className="text-xl font-bold text-[var(--foreground)] mb-2">Confirmar Exclusão</h2>
              <p className="text-[var(--muted)] mb-4">
                Tem certeza que deseja excluir este certificado?
                <br />
                Esta ação não pode ser desfeita.
              </p>
            </div>
            
            <div className="flex justify-center space-x-4">
              <button 
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1"
              >
                Cancelar
              </button>
              <button 
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-1"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}