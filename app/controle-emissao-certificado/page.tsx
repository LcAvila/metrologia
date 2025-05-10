"use client";
import Layout from '../components/Layout';
import { useState, useEffect, FormEvent, useCallback } from 'react';
import Link from 'next/link';
import { generateCertificateNumber, incrementCertificateNumber } from '../services/certificateService';
import { useTheme } from '../context/ThemeContext';
import { FaClipboardCheck, FaCalendarAlt, FaTools, FaBuilding, FaIdCard, FaTrash, FaEdit, FaCheck, FaFilter } from 'react-icons/fa';
import DatePicker from '../components/DatePicker';

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

// Componente para gerar automaticamente ou permitir entrada manual do número do certificado
const CertificateNumberGenerator = ({ value, onChange, shouldRefresh }: { value: string, onChange: (value: string) => void, shouldRefresh: number }) => {
  const [isAuto, setIsAuto] = useState(true);
  
  useEffect(() => {
    // Gerar número automaticamente apenas se o modo automático estiver ativado
    if (isAuto) {
      try {
        const number = generateCertificateNumber();
        onChange(number);
      } catch (error) {
        console.error('Erro ao gerar número de certificado:', error);
        onChange('Erro');
      }
    }
  }, [onChange, shouldRefresh, isAuto]); // Atualiza quando shouldRefresh mudar ou modo mudar

  // Função para alternar entre modo automático e manual
  const toggleMode = () => {
    setIsAuto(!isAuto);
  };

  // Função para atualizar o valor manualmente
  const handleManualChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    
    // Atualizar o último número usado para que o próximo gerado automaticamente seja maior
    if (newValue.trim() !== '') {
      localStorage.setItem('lastCertificateNumber', newValue);
    }
  };

  return (
    <div className="relative">
      <input
        type="text"
        id="certificateNumber"
        value={value}
        onChange={handleManualChange}
        className={`w-full px-2 py-1.5 border border-[var(--input-border)] rounded-md bg-[var(--input-bg)] text-[var(--input-text)] focus:outline-none text-sm ${isAuto ? 'cursor-default pr-12' : ''}`}
        readOnly={isAuto}
        placeholder="Número do certificado"
      />
      <div 
        className="absolute inset-y-0 right-0 pr-2 flex items-center cursor-pointer text-[var(--primary)] hover:text-[var(--primary-hover)]"
        onClick={toggleMode}
        title={isAuto ? "Clique para editar manualmente" : "Clique para gerar automaticamente"}
      >
        <span className="text-xs font-medium px-1.5 py-0.5 rounded bg-[var(--primary-light)] text-[var(--primary)]">
          {isAuto ? "Auto" : "Manual"}
        </span>
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

  // Função para lidar com a mudança de equipamento
  const handleEquipmentChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedType = e.target.value;
    
    // Carregar equipamentos do localStorage
    let equipmentList: any[] = [];
    const storedEquipments = localStorage.getItem('equipments');
    if (storedEquipments) {
      equipmentList = JSON.parse(storedEquipments);
    }
    
    // Encontrar equipamentos do tipo selecionado
    const matchingEquipments = equipmentList.filter(eq => eq.type === selectedType);
    
    if (matchingEquipments.length > 0) {
      // Usar o primeiro equipamento encontrado (ou você pode mostrar uma lista para seleção)
      const selectedEquipment = matchingEquipments[0];
      
      setFormData(prev => ({
        ...prev,
        equipment: selectedType,
        identification: selectedEquipment.id, // Usar o ID do equipamento
        sector: selectedEquipment.sector || ''
      }));
    } else {
      // Se não encontrar equipamentos do tipo selecionado
      setFormData(prev => ({
        ...prev,
        equipment: selectedType,
        identification: '',
        sector: ''
      }));
    }
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
  
  // Estado para seleção de certificados
  const [selectedCertificates, setSelectedCertificates] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [isDeleteMultipleModalOpen, setIsDeleteMultipleModalOpen] = useState(false);
  
  // Lista de equipamentos e setores
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  
  // Interface para equipamento
  interface Equipment {
    id: string;
    type: string;
    sector: string;
    status: string;
    lastCalibration: string;
    nextCalibration: string;
    standardLocation?: string;
    currentLocation?: string;
    measurementRange?: string;
    model?: string;
    serialNumber?: string;
    manufacturer?: string;
    certificateFile?: string;
    dataRecordFile?: string;
    certificateFileObject?: File;
    dataRecordFileObject?: File;
  }
  
  // Mapeamento de tipos de equipamento para prefixos
  const equipmentTypes = [
    'Paquímetro',
    'Micrômetro Externo',
    'Micrômetro Interno',
    'Micrômetro de Profundidade',
    'Régua Milimetrada',
    'Trena Metálica',
    'Calibrador de Folga',
    'Calibrador de Rosca',
    'Calibrador Tipo Anel',
    'Calibrador Tipo Tampão',
    'Pino Padrão',
    'Balança Analítica',
    'Balança de Precisão',
    'Balança Industrial',
    'Peso Padrão',
    'Cronômetro',
    'Tacômetro',
    'Estroboscópio',
    'Termômetro Digital',
    'Termômetro Infravermelho',
    'Termômetro de Mercúrio',
    'Termopar',
    'Pirômetro',
    'Sensor RTD',
    'Sensor PT100',
    'Manômetro',
    'Vacuômetro',
    'Transdutor de Pressão',
    'Medidor de Vazão',
    'Medidor de Coluna de Líquido',
    'Projetor de Perfil',
    'Microscópio de Medição',
    'Câmera de Inspeção',
    'Rugosímetro',
    'Durômetro',
    'Refratômetro',
    'Torquímetro',
    'Medidor de Dureza Rockwell',
    'Medidor de Dureza Brinell',
    'Medidor de Dureza Vickers',
    'Medidor de Espessura Ultrassônico',
    'Medidor de Espessura de Pintura',
    'Medidor de pH',
    'Data Logger de Temperatura',
    'Data Logger de Umidade',
    'Colorímetro',
    'Espectrofotômetro'
  ];
  
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

  // Carregar certificados salvos ao iniciar
  useEffect(() => {
    const savedCertificates = localStorage.getItem('certificates');
    if (savedCertificates) {
      setCertificates(JSON.parse(savedCertificates));
    }
    
    // Sempre usar a lista de tipos de equipamento diretamente
    // Isso garante que o dropdown sempre terá opções, independente do localStorage
    const equipmentData = equipmentTypes.map((type, index) => {
      // Gerar dados simulados para cada tipo de equipamento
      return {
        id: type,
        type: type,
        sector: sectorsList[Math.floor(Math.random() * sectorsList.length)],
        status: 'ok',
        lastCalibration: '2023-01-01',
        nextCalibration: '2024-01-01'
      };
    });
    
    setEquipmentList(equipmentData);
    console.log('Lista de equipamentos carregada com', equipmentData.length, 'itens');
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
  const handleDelete = useCallback((id: string) => {
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
  
  // Função para selecionar/deselecionar todos os certificados
  const toggleSelectAll = useCallback(() => {
    if (selectAll) {
      setSelectedCertificates([]);
    } else {
      setSelectedCertificates(certificates.map(cert => cert.id));
    }
    setSelectAll(!selectAll);
  }, [certificates, selectAll]);
  
  // Função para selecionar/deselecionar um certificado
  const toggleSelectCertificate = useCallback((id: string) => {
    setSelectedCertificates(prev => {
      if (prev.includes(id)) {
        return prev.filter(certId => certId !== id);
      } else {
        return [...prev, id];
      }
    });
  }, []);
  
  // Função para excluir múltiplos certificados
  const handleDeleteMultiple = useCallback(() => {
    if (selectedCertificates.length > 0) {
      setIsDeleteMultipleModalOpen(true);
    }
  }, [selectedCertificates]);
  
  // Função para confirmar exclusão múltipla
  const confirmDeleteMultiple = useCallback(() => {
    const updatedCertificates = certificates.filter(cert => !selectedCertificates.includes(cert.id));
    setCertificates(updatedCertificates);
    
    // Salvar no localStorage
    localStorage.setItem('certificates', JSON.stringify(updatedCertificates));
    
    setIsDeleteMultipleModalOpen(false);
    setSelectedCertificates([]);
    setSelectAll(false);
  }, [certificates, selectedCertificates]);

  // Função para atualizar os campos do formulário
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    
    // Se for o campo de equipamento, preencher automaticamente o ID e o setor
    if (id === 'equipment') {
      const selectedEquipment = equipmentList.find(eq => eq.type === value);
      if (selectedEquipment) {
        setFormData(prev => ({
          ...prev,
          equipment: value,
          identification: selectedEquipment.id, // Usar o ID do equipamento, não o nome
          sector: selectedEquipment.sector
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          equipment: value
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [id]: value
      }));
    }
  }, [equipmentList]);

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
      
      // Atualizar o último número de certificado usado
      localStorage.setItem('lastCertificateNumber', formData.certificateNumber);
      
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
          <div className="mb-2 border-b border-[var(--card-border)] pb-2">
            <h2 className="text-lg font-semibold text-[var(--foreground)] flex items-center">
              <FaClipboardCheck className="mr-2 text-[var(--primary)]" /> 
              Emissão de Certificado
            </h2>
          </div>
          
          <form className="space-y-3" onSubmit={handleSubmit}>
            {/* Grid estilo planilha para os campos do formulário */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
              {/* Número de Certificado (Gerado automaticamente ou manual) */}
              <div className="col-span-2 md:col-span-1">
                <label htmlFor="certificateNumber" className="block text-sm font-medium text-[var(--foreground)] mb-1 flex items-center">
                  <FaIdCard className="mr-1 text-[var(--primary)] text-xs" /> Nº Certificado
                </label>
                <CertificateNumberGenerator 
                  value={formData.certificateNumber} 
                  onChange={handleCertificateNumberChange}
                  shouldRefresh={refreshCertNumber}
                />
              </div>
              
              {/* Data de Recebimento */}
              <div className="col-span-2 md:col-span-1">
                <DatePicker
                  id="receiveDate"
                  value={formData.receiveDate}
                  onChange={(date) => setFormData(prev => ({ ...prev, receiveDate: date }))}
                  label="Recebimento"
                  placeholder="Selecione a data"
                  icon={<FaCalendarAlt />}
                />
              </div>
              
              {/* Data de Emissão */}
              <div className="col-span-2 md:col-span-1">
                <DatePicker
                  id="issueDate"
                  value={formData.issueDate}
                  onChange={(date) => setFormData(prev => ({ ...prev, issueDate: date }))}
                  label="Emissão"
                  placeholder="Selecione a data"
                  icon={<FaCalendarAlt />}
                />
              </div>
              
              {/* Equipamento */}
              <div className="col-span-4 md:col-span-2">
                <label htmlFor="equipment" className="block text-sm font-medium text-[var(--foreground)] mb-1 flex items-center">
                  <FaTools className="mr-1 text-[var(--primary)] text-xs" /> Equipamento
                </label>
                <select
                  id="equipment"
                  value={formData.equipment}
                  onChange={handleChange}
                  className="w-full px-2 py-1.5 border border-[var(--input-border)] rounded-md bg-[var(--input-bg)] text-[var(--input-text)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] focus:ring-offset-1 transition-colors duration-200 text-sm"
                >
                  <option value="">Selecione um equipamento</option>
                  {equipmentTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              
              {/* Identificação */}
              <div className="col-span-2 md:col-span-1">
                <label htmlFor="identification" className="block text-sm font-medium text-[var(--foreground)] mb-1 flex items-center">
                  <FaIdCard className="mr-1 text-[var(--primary)] text-xs" /> ID
                </label>
                <input 
                  type="text" 
                  id="identification" 
                  value={formData.identification}
                  onChange={handleChange}
                  className="w-full px-2 py-1.5 border border-[var(--input-border)] rounded-md bg-[var(--input-bg)] text-[var(--input-text)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] focus:ring-offset-1 transition-colors duration-200 text-sm"
                  placeholder="ID"
                />
              </div>
              
              {/* Setor */}
              <div className="col-span-4 md:col-span-2">
                <label htmlFor="sector" className="block text-sm font-medium text-[var(--foreground)] mb-1 flex items-center">
                  <FaBuilding className="mr-1 text-[var(--primary)] text-xs" /> Setor
                </label>
                <select
                  id="sector"
                  value={formData.sector}
                  onChange={handleChange}
                  className="w-full px-2 py-1.5 border border-[var(--input-border)] rounded-md bg-[var(--input-bg)] text-[var(--input-text)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] focus:ring-offset-1 transition-colors duration-200 text-sm"
                >
                  <option value="">Selecione um setor</option>
                  {sectorsList.map(sector => (
                    <option key={sector} value={sector}>{sector}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="pt-2">
              <button 
                type="submit" 
                className="w-full bg-[var(--primary)] text-white py-1.5 px-3 text-sm rounded-md hover:bg-[var(--primary-hover)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] focus:ring-offset-1 font-medium transition-all duration-300 shadow-sm hover:shadow flex items-center justify-center"
              >
                <FaClipboardCheck className="mr-1.5 text-sm" />
                {isEditing ? 'Atualizar Certificado' : 'Emitir Certificado'}
              </button>
            </div>
          </form>
        </div>
        
        {/* Tabela de Certificados */}
        <div className="bg-[var(--card-bg)] p-4 rounded-lg shadow border border-[var(--card-border)]">
          <div className="flex justify-between items-center mb-2 border-b border-[var(--card-border)] pb-2">
            <h2 className="text-lg font-semibold text-[var(--foreground)] flex items-center">
              <FaClipboardCheck className="mr-2 text-[var(--primary)] text-sm" /> 
              Certificados Emitidos
            </h2>
            <div className="flex items-center space-x-2">
              {selectedCertificates.length > 0 && (
                <button
                  onClick={handleDeleteMultiple}
                  className="bg-red-100 text-red-600 hover:bg-red-200 text-xs font-medium py-1 px-2 rounded flex items-center transition-colors duration-200"
                >
                  <FaTrash className="mr-1 text-xs" />
                  Excluir ({selectedCertificates.length})
                </button>
              )}
              <span className="bg-[var(--primary-light)] text-[var(--primary)] text-xs font-medium py-1 px-2 rounded-full">
                {certificates.length} certificados
              </span>
            </div>
          </div>
          
          {certificates.length === 0 ? (
            <p className="text-[var(--muted)] italic text-sm">Nenhum certificado cadastrado.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-[var(--card-border)]">
                <thead>
                  <tr className="bg-[var(--card-header-bg)]">
                    <th className="px-2 py-1.5 text-left">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectAll}
                          onChange={toggleSelectAll}
                          className="h-3.5 w-3.5 rounded border-[var(--input-border)] text-[var(--primary)] focus:ring-[var(--primary)]"
                        />
                      </div>
                    </th>
                    <th className="px-2 py-1.5 text-left text-xs font-medium text-[var(--foreground-secondary)] uppercase tracking-wider">Nº Certificado</th>
                    <th className="px-2 py-1.5 text-left text-xs font-medium text-[var(--foreground-secondary)] uppercase tracking-wider">Equipamento</th>
                    <th className="px-2 py-1.5 text-left text-xs font-medium text-[var(--foreground-secondary)] uppercase tracking-wider">Setor</th>
                    <th className="px-2 py-1.5 text-left text-xs font-medium text-[var(--foreground-secondary)] uppercase tracking-wider">Recebimento</th>
                    <th className="px-2 py-1.5 text-left text-xs font-medium text-[var(--foreground-secondary)] uppercase tracking-wider">Emissão</th>
                    <th className="px-2 py-1.5 text-right text-xs font-medium text-[var(--foreground-secondary)] uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--card-border)]">
                  {certificates.map((cert) => (
                    <tr key={cert.id} className={`hover:bg-[var(--hover-bg)] ${selectedCertificates.includes(cert.id) ? 'bg-[var(--selected-row-bg)]' : ''}`}>
                      <td className="px-2 py-1.5 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedCertificates.includes(cert.id)}
                          onChange={() => toggleSelectCertificate(cert.id)}
                          className="h-3.5 w-3.5 rounded border-[var(--input-border)] text-[var(--primary)] focus:ring-[var(--primary)]"
                        />
                      </td>
                      <td className="px-2 py-1.5 whitespace-nowrap text-xs text-[var(--foreground)]">{cert.certificateNumber}</td>
                      <td className="px-2 py-1.5 whitespace-nowrap text-xs text-[var(--foreground)]">{cert.equipment}</td>
                      <td className="px-2 py-1.5 whitespace-nowrap text-xs text-[var(--foreground)]">{cert.sector}</td>
                      <td className="px-2 py-1.5 whitespace-nowrap text-xs text-[var(--foreground)]">{cert.receiveDate}</td>
                      <td className="px-2 py-1.5 whitespace-nowrap text-xs text-[var(--foreground)]">{cert.issueDate}</td>
                      <td className="px-2 py-1.5 whitespace-nowrap text-right">
                        <button
                          onClick={() => editCertificate(cert.id)}
                          className="text-[var(--primary)] hover:text-[var(--primary-hover)] mr-2 text-xs"
                          title="Editar"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(cert.id)}
                          className="text-red-500 hover:text-red-700 text-xs"
                          title="Excluir"
                        >
                          <FaTrash />
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
      
      {/* Modal de confirmação de exclusão */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[var(--card-bg)] p-4 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-semibold mb-3 text-[var(--foreground)]">Confirmar Exclusão</h3>
            <p className="mb-4 text-[var(--foreground)]">Tem certeza que deseja excluir este certificado?</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-3 py-1.5 border border-[var(--card-border)] rounded-md text-[var(--foreground)] hover:bg-[var(--hover-bg)] text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                className="px-3 py-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal de confirmação de exclusão múltipla */}
      {isDeleteMultipleModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[var(--card-bg)] p-4 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-semibold mb-3 text-[var(--foreground)]">Confirmar Exclusão Múltipla</h3>
            <p className="mb-4 text-[var(--foreground)]">
              Tem certeza que deseja excluir {selectedCertificates.length} certificado(s)?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsDeleteMultipleModalOpen(false)}
                className="px-3 py-1.5 border border-[var(--card-border)] rounded-md text-[var(--foreground)] hover:bg-[var(--hover-bg)] text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDeleteMultiple}
                className="px-3 py-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm flex items-center"
              >
                <FaTrash className="mr-1.5 text-xs" />
                Excluir {selectedCertificates.length} item(ns)
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
