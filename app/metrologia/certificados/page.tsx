"use client";
import { useState, useEffect, useRef, ChangeEvent } from 'react';
import Layout from '../../components/Layout';
import { useTheme } from '../../context/ThemeContext';
import Link from 'next/link';
import InputFileUpload from '../../components/InputFileUpload';
import { getPublicUrl } from '../../lib/getPublicUrl';

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
  sector?: string; // Setor do equipamento
  fileObject?: File; // Propriedade opcional para armazenar o objeto File temporariamente
}

export default function Certificados() {
  const { theme } = useTheme();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [filteredCertificates, setFilteredCertificates] = useState<Certificate[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEquipment, setSelectedEquipment] = useState<string>('');
  const [equipmentList, setEquipmentList] = useState<{id: string, name: string, sector?: string}[]>([]);
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
    fileName: '',
    fileObject: undefined,
    sector: '' // Adicionando campo para setor
  });
  
  // Estado para armazenar o setor selecionado
  const [selectedSector, setSelectedSector] = useState<string>('');

  // Lista de setores disponíveis
  const sectorsList = [
    "Injetoras",
    "Ferramentaria",
    "Controle da Qualidade",
    "Point Matic",
    "Montagem 1 (M1)",
    "Almoxarifado 1 (ALM 1)",
    "Almoxarifado 2 (ALM 2)",
    "Depósito de Produtos Acabados (DPA)",
    "Manutenção"
  ];

  // Lista de tipos de equipamentos
  const equipmentTypes = [
    { value: "measurement", label: "Medição Linear" },
    { value: "weight", label: "Massa e Peso" },
    { value: "time", label: "Tempo e Velocidade" },
    { value: "temperature", label: "Temperatura" },
    { value: "pressure", label: "Pressão e Vazão" },
    { value: "optical", label: "Ópticos e Inspeção" },
    { value: "other", label: "Outros" }
  ];

  // Carregar certificados e equipamentos do localStorage ao iniciar
  useEffect(() => {
    const savedCertificates = localStorage.getItem('calibrationCertificates');
    if (savedCertificates) {
      const parsedCertificates = JSON.parse(savedCertificates);
      setCertificates(parsedCertificates);
      setFilteredCertificates(parsedCertificates);
    }
    
    // Carregar lista de equipamentos reais do localStorage
    try {
      const storedEquipments = localStorage.getItem('equipments');
      if (storedEquipments) {
        const parsedEquipments = JSON.parse(storedEquipments);
        // Transformar os equipamentos no formato necessário para o dropdown
        const formattedEquipments = parsedEquipments.map((eq: any) => ({
          id: eq.id,
          name: `${eq.id} - ${eq.type}`,
          sector: eq.sector || ''
        }));
        setEquipmentList(formattedEquipments);
      } else {
        // Fallback para dados simulados se não houver equipamentos salvos
        const equipmentData = [
          { id: 'eq1', name: 'Paquímetro Digital', sector: 'Controle da Qualidade' },
          { id: 'eq2', name: 'Micrômetro Externo', sector: 'Ferramentaria' },
          { id: 'eq3', name: 'Balança Analítica', sector: 'Injetoras' },
          { id: 'eq4', name: 'Termômetro Digital', sector: 'Manutenção' },
          { id: 'eq5', name: 'Medidor de Pressão', sector: 'Point Matic' }
        ];
        setEquipmentList(equipmentData);
      }
    } catch (error) {
      console.error('Erro ao carregar equipamentos:', error);
      // Fallback para dados simulados em caso de erro
      const equipmentData = [
        { id: 'eq1', name: 'Paquímetro Digital', sector: 'Controle da Qualidade' },
        { id: 'eq2', name: 'Micrômetro Externo', sector: 'Ferramentaria' },
        { id: 'eq3', name: 'Balança Analítica', sector: 'Injetoras' },
        { id: 'eq4', name: 'Termômetro Digital', sector: 'Manutenção' },
        { id: 'eq5', name: 'Medidor de Pressão', sector: 'Point Matic' }
      ];
      setEquipmentList(equipmentData);
    }
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
    
    // O tratamento específico para equipmentId foi movido para o onChange do select
    // para também atualizar o setor automaticamente
    setNewCertificate(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Manipular upload de arquivo
  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Armazenar temporariamente o arquivo para upload posterior
      setNewCertificate(prev => ({
        ...prev,
        fileName: file.name,
        fileObject: file // Armazenar o objeto File para upload posterior
      }));
    }
  };

  // Salvar novo certificado
  const handleSaveCertificate = async () => {
  if (newCertificate.fileObject) {
    try {
      // Upload direto para o Supabase Storage
      const { uploadToStorage } = await import('../../lib/uploadToStorage');
      const filePath = await uploadToStorage(newCertificate.fileObject, 'certificados');

      // Log do novo certificado antes de salvar
      console.log('Novo certificado antes de salvar:', newCertificate);

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

      const newCert = {
        ...newCertificate,
        id: Date.now().toString(), // Gerar um id único
        status,
        fileUrl: filePath
      };

      const updatedCertificates = [...certificates, newCert];
      setCertificates(updatedCertificates);
      
      // Salvar no localStorage
      localStorage.setItem('calibrationCertificates', JSON.stringify(updatedCertificates));

      // Log após o salvamento
      console.log('Certificados salvos no localStorage:', updatedCertificates);

      // Resetar formulário
      setNewCertificate({
        equipmentId: '',
        equipmentName: '',
        certificateNumber: '',
        issueDate: '',
        expirationDate: '',
        calibrationDate: '',
        fileName: '',
        sector: '',
        fileObject: undefined
      });
      setSelectedSector('');
      setShowUploadModal(false);
    } catch (error: any) {
      alert('Erro ao fazer upload do arquivo: ' + (error.message || 'Erro desconhecido'));
    }
  } else {
    alert('Por favor, selecione um arquivo para upload.');
  }
    if (newCertificate.fileObject) {
      try {
        // Upload direto para o Supabase Storage
        const { uploadToStorage } = await import('../../lib/uploadToStorage');
        const filePath = await uploadToStorage(newCertificate.fileObject, 'certificados');

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
          fileUrl: filePath, // Salva o caminho do Storage
          status,
          sector: newCertificate.sector, // Inclui o setor no certificado
          fileObject: undefined
        };

        const updatedCertificates = [...certificates, certificate];
        setCertificates(updatedCertificates);
        localStorage.setItem('calibrationCertificates', JSON.stringify(updatedCertificates));
        setNewCertificate({
          equipmentId: '',
          equipmentName: '',
          certificateNumber: '',
          issueDate: '',
          expirationDate: '',
          calibrationDate: '',
          fileName: '',
          sector: '',
          fileObject: undefined
        });
        setSelectedSector('');
        setShowUploadModal(false);
      } catch (error: any) {
        alert('Erro ao fazer upload do arquivo: ' + (error.message || 'Erro desconhecido'));
      }
    } else {
      alert('Por favor, selecione um arquivo para upload.');
    }
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
      default:
        return null;
    }
  }

  return (
    <Layout title="Certificados">
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
                  </div>
                  <div>
                    <p className="text-[var(--foreground-muted)]">Validade:</p>
                    <p className="text-[var(--foreground)]">{cert.expirationDate}</p>
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
                      href={getPublicUrl(cert.fileUrl)}
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
                          href={getPublicUrl(cert.fileUrl)}
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
  {/* Modal de Upload - dentro do fragmento do return */}
  {showUploadModal && (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[var(--card-bg)] rounded-lg shadow-lg w-full max-w-md p-6">
        <h2 className="text-xl font-semibold text-[var(--foreground)] mb-4">Upload de Certificado</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Equipamento</label>
              <select
                name="equipmentId"
                className="w-full px-3 py-2 border border-[var(--input-border)] rounded-md bg-[var(--input-bg)] text-[var(--input-text)]"
                value={newCertificate.equipmentId}
                onChange={(e) => {
                  const selectedEquip = equipmentList.find(eq => eq.id === e.target.value);
                  setNewCertificate(prev => ({
                    ...prev,
                    equipmentId: e.target.value,
                    equipmentName: selectedEquip?.name || '',
                    sector: selectedEquip?.sector || ''
                  }));
                  setSelectedSector(selectedEquip?.sector || '');
                }}
                required
              >
                <option value="">Selecione um equipamento</option>
                {equipmentList.map(eq => (
                  <option key={eq.id} value={eq.id}>{eq.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Setor</label>
              <select
                name="sector"
                className="w-full px-3 py-2 border border-[var(--input-border)] rounded-md bg-[var(--input-bg)] text-[var(--input-text)]"
                value={newCertificate.sector}
                onChange={(e) => {
                  setNewCertificate(prev => ({
                    ...prev,
                    sector: e.target.value
                  }));
                  setSelectedSector(e.target.value);
                }}
                required
              >
                <option value="">Selecione um setor</option>
                {sectorsList.map(sector => (
                  <option key={sector} value={sector}>{sector}</option>
                ))}
              </select>
            </div>
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
}
