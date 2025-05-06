"use client";
import { useState, useEffect, useRef, ChangeEvent } from 'react';
import Layout from '../components/Layout';
import { useTheme } from '../context/ThemeContext';
import Link from 'next/link';
import InputFileUpload from '../components/InputFileUpload'; // Adicionando a importação

// Interface para o certificado
interface Certificate {
  id: string;
  equipmentId: string;
  equipmentName: string;
  certificateNumber: string;
  issueDate: string;
  expirationDate: string;
  calibrationDate: string;
  fileName: string;
  fileUrl: string;
  status: 'valid' | 'expired' | 'expiring';
}

export default function Certificados() {
  const { theme } = useTheme();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [filteredCertificates, setFilteredCertificates] = useState<Certificate[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEquipment, setSelectedEquipment] = useState<string>('');
  const [equipmentList, setEquipmentList] = useState<{id: string, name: string}[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Formulário para upload de certificado
  const [newCertificate, setNewCertificate] = useState<Omit<Certificate, 'id' | 'fileUrl' | 'status'>>({ 
    equipmentId: '',
    equipmentName: '',
    certificateNumber: '',
    issueDate: '',
    expirationDate: '',
    calibrationDate: '',
    fileName: ''
  });

  // Carregar certificados e equipamentos do localStorage ao iniciar
  useEffect(() => {
    const savedCertificates = localStorage.getItem('calibrationCertificates');
    if (savedCertificates) {
      const parsedCertificates = JSON.parse(savedCertificates);
      setCertificates(parsedCertificates);
      setFilteredCertificates(parsedCertificates);
    }
    
    // Carregar lista de equipamentos (simulado)
    const equipmentData = [
      { id: 'eq1', name: 'Paquímetro Digital' },
      { id: 'eq2', name: 'Micrômetro Externo' },
      { id: 'eq3', name: 'Balança Analítica' },
      { id: 'eq4', name: 'Termômetro Digital' },
      { id: 'eq5', name: 'Medidor de Pressão' }
    ];
    setEquipmentList(equipmentData);
  }, []);

  // Filtrar certificados com base na pesquisa e equipamento selecionado
  useEffect(() => {
    let results = certificates;
    
    if (searchTerm) {
      results = results.filter(cert => 
        cert.certificateNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cert.equipmentName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedEquipment) {
      results = results.filter(cert => cert.equipmentId === selectedEquipment);
    }
    
    setFilteredCertificates(results);
  }, [searchTerm, selectedEquipment, certificates]);

  // Atualizar status dos certificados com base na data de validade
  useEffect(() => {
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);
    
    const updatedCertificates = certificates.map(cert => {
      const expirationDate = new Date(cert.expirationDate);
      let status: 'valid' | 'expired' | 'expiring' = 'valid';
      
      if (expirationDate < today) {
        status = 'expired';
      } else if (expirationDate <= thirtyDaysFromNow) {
        status = 'expiring';
      }
      
      return { ...cert, status };
    });
    
    setCertificates(updatedCertificates);
    localStorage.setItem('calibrationCertificates', JSON.stringify(updatedCertificates));
  }, []);

  // Manipular mudanças no formulário de upload
  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'equipmentId') {
      const selectedEquip = equipmentList.find(eq => eq.id === value);
      setNewCertificate(prev => ({
        ...prev,
        [name]: value,
        equipmentName: selectedEquip?.name || ''
      }));
    } else {
      setNewCertificate(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Manipular upload de arquivo
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewCertificate(prev => ({
        ...prev,
        fileName: file.name
      }));
    }
  };

  // Salvar novo certificado
  const handleSaveCertificate = () => {
    // Simular URL do arquivo (em produção, seria um link real após upload)
    const fileUrl = `data:application/pdf;base64,${Math.random().toString(36).substring(2)}`;
    
    const today = new Date();
    const expirationDate = new Date(newCertificate.expirationDate);
    let status: 'valid' | 'expired' | 'expiring' = 'valid';
    
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);
    
    if (expirationDate < today) {
      status = 'expired';
    } else if (expirationDate <= thirtyDaysFromNow) {
      status = 'expiring';
    }
    
    const certificate: Certificate = {
      ...newCertificate,
      id: Date.now().toString(),
      fileUrl,
      status
    };
    
    const updatedCertificates = [...certificates, certificate];
    setCertificates(updatedCertificates);
    localStorage.setItem('calibrationCertificates', JSON.stringify(updatedCertificates));
    
    // Resetar formulário e fechar modal
    setNewCertificate({ 
      equipmentId: '',
      equipmentName: '',
      certificateNumber: '',
      issueDate: '',
      expirationDate: '',
      calibrationDate: '',
      fileName: ''
    });
    setShowUploadModal(false);
  };

  // Gerar relatório de certificados
  const generateReport = () => {
    const reportData = filteredCertificates.map(cert => ({
      'Número do Certificado': cert.certificateNumber,
      'Equipamento': cert.equipmentName,
      'Data de Calibração': cert.calibrationDate,
      'Data de Validade': cert.expirationDate,
      'Status': cert.status === 'valid' ? 'Válido' : cert.status === 'expired' ? 'Expirado' : 'Expirando'
    }));
    
    // Em produção, isso geraria um PDF ou Excel
    // Por enquanto, apenas mostra no console
    console.log('Relatório de Certificados:', reportData);
    alert('Relatório gerado! Verifique o console.');
  };

  // Obter histórico de calibrações para um equipamento
  const getCalibrationHistory = (equipmentId: string) => {
    return certificates
      .filter(cert => cert.equipmentId === equipmentId)
      .sort((a, b) => new Date(b.calibrationDate).getTime() - new Date(a.calibrationDate).getTime());
  };

  // Renderizar status do certificado com cores
  const renderStatus = (status: 'valid' | 'expired' | 'expiring') => {
    switch (status) {
      case 'valid':
        return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Válido</span>;
      case 'expired':
        return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">Expirado</span>;
      case 'expiring':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">Expirando</span>;
    }
  };

  return (
    <Layout title="Certificados">
      {/* Barra de ferramentas */}
      <div className="bg-[var(--card-bg)] p-4 rounded-lg shadow border border-[var(--card-border)] mb-4 flex flex-col md:flex-row justify-between items-center gap-3">
        <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
          {/* Pesquisa */}
          <div className="relative w-full md:w-64">
            <input
              type="text"
              placeholder="Buscar certificados..."
              className="w-full px-3 py-2 border border-[var(--input-border)] rounded-md bg-[var(--input-bg)] text-[var(--input-text)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span className="absolute right-3 top-2.5 text-[var(--foreground-muted)]">
              🔍
            </span>
          </div>
          
          {/* Filtro por equipamento */}
          <select
            className="w-full md:w-64 px-3 py-2 border border-[var(--input-border)] rounded-md bg-[var(--input-bg)] text-[var(--input-text)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
            value={selectedEquipment}
            onChange={(e) => setSelectedEquipment(e.target.value)}
          >
            <option value="">Todos os equipamentos</option>
            {equipmentList.map(eq => (
              <option key={eq.id} value={eq.id}>{eq.name}</option>
            ))}
          </select>
        </div>
        
        <div className="flex gap-2 w-full md:w-auto justify-between md:justify-end">
          {/* Alternar visualização */}
          <div className="flex border border-[var(--input-border)] rounded-md overflow-hidden">
            <button
              className={`px-3 py-1.5 text-sm font-medium transition-colors duration-300 focus:outline-none focus:ring-1 focus:ring-inset focus:ring-[var(--primary)] ${viewMode === 'grid' ? 'bg-[var(--primary)] text-white' : 'bg-[var(--input-bg)] text-[var(--foreground)] hover:bg-[var(--background)]'}`}
              onClick={() => setViewMode('grid')}
            >
              Grid
            </button>
            <button
              className={`px-3 py-1.5 text-sm font-medium transition-colors duration-300 focus:outline-none focus:ring-1 focus:ring-inset focus:ring-[var(--primary)] ${viewMode === 'list' ? 'bg-[var(--primary)] text-white' : 'bg-[var(--input-bg)] text-[var(--foreground)] hover:bg-[var(--background)]'}`}
              onClick={() => setViewMode('list')}
            >
              Lista
            </button>
          </div>
          
          {/* Botão de relatório */}
          <button
            className="px-3 py-1.5 bg-[var(--button-secondary-bg)] text-[var(--button-secondary-text)] rounded-md hover:bg-[var(--button-secondary-hover)] transition-colors duration-300 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
            onClick={generateReport}
          >
            Gerar Relatório
          </button>
          
          {/* Botão de upload - Mantido como está, conforme solicitado */}
          <button
            className="px-3 py-1.5 bg-[var(--primary)] text-white rounded-md hover:bg-[var(--primary-hover)] transition-colors duration-300 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2"
            onClick={() => setShowUploadModal(true)}
          >
            Upload Certificado
          </button>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="bg-[var(--card-bg)] p-6 rounded-lg shadow border border-[var(--card-border)] transition-colors duration-300">
        {filteredCertificates.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-[var(--foreground-muted)] text-lg">Nenhum certificado encontrado.</p>
            <button
              className="mt-4 px-4 py-2 bg-[var(--primary)] text-white rounded-md hover:bg-[var(--primary-hover)] transition-colors duration-300 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2"
              onClick={() => setShowUploadModal(true)}
            >
              Adicionar Certificado
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCertificates.map(cert => (
              <div key={cert.id} className="border border-[var(--card-border)] rounded-lg overflow-hidden">
                <div className="p-4 border-b border-[var(--card-border)]">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-[var(--foreground)]">{cert.equipmentName}</h3>
                    {renderStatus(cert.status)}
                  </div>
                  <p className="text-sm text-[var(--foreground-muted)]">Certificado: {cert.certificateNumber}</p>
                </div>
                <div className="p-4 bg-[var(--background)]">
                  <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                    <div>
                      <p className="text-[var(--foreground-muted)]">Calibração:</p>
                      <p className="text-[var(--foreground)]">{cert.calibrationDate}</p>
                    </div>
                    <div>
                      <p className="text-[var(--foreground-muted)]">Validade:</p>
                      <p className="text-[var(--foreground)]">{cert.expirationDate}</p>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <button 
                      className="text-sm text-[var(--primary)] hover:underline focus:outline-none focus:ring-1 focus:ring-[var(--primary)] rounded"
                      onClick={() => {
                        const history = getCalibrationHistory(cert.equipmentId);
                        console.log(`Histórico de calibrações para ${cert.equipmentName}:`, history);
                        alert(`Histórico de calibrações para ${cert.equipmentName} disponível no console.`);
                      }}
                    >
                      Ver histórico
                    </button>
                    <a 
                      href={cert.fileUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-[var(--primary)] hover:underline focus:outline-none focus:ring-1 focus:ring-[var(--primary)] rounded"
                    >
                      Visualizar PDF
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[var(--card-border)]">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[var(--foreground-muted)] uppercase tracking-wider">Equipamento</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[var(--foreground-muted)] uppercase tracking-wider">Certificado</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[var(--foreground-muted)] uppercase tracking-wider">Calibração</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[var(--foreground-muted)] uppercase tracking-wider">Validade</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[var(--foreground-muted)] uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-[var(--foreground-muted)] uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--card-border)]">
                {filteredCertificates.map(cert => (
                  <tr key={cert.id}>
                    <td className="px-4 py-3 text-sm text-[var(--foreground)]">{cert.equipmentName}</td>
                    <td className="px-4 py-3 text-sm text-[var(--foreground)]">{cert.certificateNumber}</td>
                    <td className="px-4 py-3 text-sm text-[var(--foreground)]">{cert.calibrationDate}</td>
                    <td className="px-4 py-3 text-sm text-[var(--foreground)]">{cert.expirationDate}</td>
                    <td className="px-4 py-3 text-sm">{renderStatus(cert.status)}</td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex space-x-2">
                        <button 
                          className="text-[var(--primary)] hover:underline text-sm focus:outline-none focus:ring-1 focus:ring-[var(--primary)] rounded"
                          onClick={() => {
                            const history = getCalibrationHistory(cert.equipmentId);
                            console.log(`Histórico de calibrações para ${cert.equipmentName}:`, history);
                            alert(`Histórico de calibrações para ${cert.equipmentName} disponível no console.`);
                          }}
                        >
                          Histórico
                        </button>
                        <a 
                          href={cert.fileUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-[var(--primary)] hover:underline text-sm focus:outline-none focus:ring-1 focus:ring-[var(--primary)] rounded"
                        >
                          Visualizar
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de Upload */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[var(--card-bg)] rounded-lg shadow-lg w-full max-w-md p-6">
            <h2 className="text-xl font-semibold text-[var(--foreground)] mb-4">Upload de Certificado</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Equipamento</label>
                <select
                  name="equipmentId"
                  className="w-full px-3 py-2 border border-[var(--input-border)] rounded-md bg-[var(--input-bg)] text-[var(--input-text)]"
                  value={newCertificate.equipmentId}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Selecione um equipamento</option>
                  {equipmentList.map(eq => (
                    <option key={eq.id} value={eq.id}>{eq.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Número do Certificado</label>
                <input
                  type="text"
                  name="certificateNumber"
                  className="w-full px-3 py-2 border border-[var(--input-border)] rounded-md bg-[var(--input-bg)] text-[var(--input-text)]"
                  value={newCertificate.certificateNumber}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Data de Calibração</label>
                  <input
                    type="date"
                    name="calibrationDate"
                    className="w-full px-3 py-2 border border-[var(--input-border)] rounded-md bg-[var(--input-bg)] text-[var(--input-text)]"
                    value={newCertificate.calibrationDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Data de Emissão</label>
                  <input
                    type="date"
                    name="issueDate"
                    className="w-full px-3 py-2 border border-[var(--input-border)] rounded-md bg-[var(--input-bg)] text-[var(--input-text)]"
                    value={newCertificate.issueDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Data de Validade</label>
                <input
                  type="date"
                  name="expirationDate"
                  className="w-full px-3 py-2 border border-[var(--input-border)] rounded-md bg-[var(--input-bg)] text-[var(--input-text)]"
                  value={newCertificate.expirationDate}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Arquivo do Certificado</label>
                <div className="flex items-center">
                  <InputFileUpload onChange={handleFileChange} name="certificateFile" accept=".pdf,.jpg,.jpeg,.png" />
                  <span className="ml-3 text-sm text-[var(--foreground-muted)] truncate">
                    {newCertificate.fileName || "Nenhum arquivo selecionado"}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button
                className="px-4 py-2 bg-[var(--button-secondary-bg)] text-[var(--button-secondary-text)] rounded-md hover:bg-[var(--button-secondary-hover)] transition-colors duration-300 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                onClick={() => setShowUploadModal(false)}
              >
                Cancelar
              </button>
              <button
                className="px-4 py-2 bg-[var(--primary)] text-white rounded-md hover:bg-[var(--primary-hover)] transition-colors duration-300 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleSaveCertificate}
                disabled={!newCertificate.equipmentId || !newCertificate.certificateNumber || !newCertificate.expirationDate || !newCertificate.fileName}
              >
                Salvar Certificado
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
    )
  };