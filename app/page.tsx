"use client";
import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import Layout from './components/Layout';

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
}

export default function Home() {
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sectorFilter, setSectorFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    // Usar uma função para carregar os dados do localStorage apenas uma vez
    const loadEquipments = () => {
      try {
        const storedEquipments = localStorage.getItem('equipments');
        if (storedEquipments) {
          return JSON.parse(storedEquipments);
        }
      } catch (error) {
        console.error('Erro ao carregar equipamentos:', error);
      }
      return [];
    };
    
    setEquipments(loadEquipments());
  }, []);

  // Memoizar a função getCalibrationStatus para evitar recálculos desnecessários
  const getCalibrationStatus = useCallback((nextCalibration: string) => {
    const today = new Date();
    const nextDate = new Date(nextCalibration);
    const diffTime = nextDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'expired';
    if (diffDays <= 90) return 'warning';
    return 'ok';
  }, []);
  
  // Função para formatar data - memoizada para evitar recálculos
  const formatDate = useCallback((dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  }, []);
  
  // Função para obter texto do status - memoizada para evitar recálculos
  const statusMap: Record<string, string> = useMemo(() => ({
    'available': 'Disponível',
    'maintenance': 'Em Manutenção',
    'calibration': 'Em Calibração',
    'discarded': 'Descartado'
  }), []);
  
  const getStatusText = useCallback((status: string) => {
    return statusMap[status] || status;
  }, [statusMap]);
  
  // Função para editar equipamento - otimizada para evitar renderizações desnecessárias
  const editEquipment = useCallback((id: string) => {
    const equipment = equipments.find(eq => eq.id === id);
    if (equipment) {
      localStorage.setItem('editingEquipment', JSON.stringify(equipment));
      window.location.href = '/cadastro-equipamento';
    }
  }, [equipments]);
  
  // Função para excluir equipamento - otimizada para evitar renderizações desnecessárias
  const deleteEquipment = useCallback((id: string) => {
    if (confirm('Tem certeza que deseja excluir este equipamento? Esta ação não pode ser desfeita.')) {
      const updatedEquipments = equipments.filter(eq => eq.id !== id);
      setEquipments(updatedEquipments);
      
      setTimeout(() => {
        localStorage.setItem('equipments', JSON.stringify(updatedEquipments));
      }, 0);
      
      setCurrentPage(1);
    }
  }, [equipments]);

  // Memoizar a filtragem para evitar recálculos desnecessários em cada renderização
  const filteredEquipments = useMemo(() => {
    return equipments.filter(equipment => {
      const matchesSearch = searchTerm === '' || 
        equipment.id.toLowerCase().includes(searchTerm) ||
        equipment.type.toLowerCase().includes(searchTerm) ||
        equipment.sector.toLowerCase().includes(searchTerm);
      
      const matchesStatus = statusFilter === '' || equipment.status === statusFilter;
      const matchesSector = sectorFilter === '' || equipment.sector === sectorFilter;
      const matchesType = typeFilter === '' || equipment.type === typeFilter;
      
      return matchesSearch && matchesStatus && matchesSector && matchesType;
    });
  }, [equipments, searchTerm, statusFilter, sectorFilter, typeFilter]);

  // Memoizar cálculos de paginação para evitar recálculos desnecessários
  const { startIndex, endIndex, paginatedEquipments, totalPages } = useMemo(() => {
    const startIdx = (currentPage - 1) * itemsPerPage;
    const endIdx = startIdx + itemsPerPage;
    return {
      startIndex: startIdx,
      endIndex: endIdx,
      paginatedEquipments: filteredEquipments.slice(startIdx, endIdx),
      totalPages: Math.ceil(filteredEquipments.length / itemsPerPage)
    };
  }, [filteredEquipments, currentPage, itemsPerPage]);

  return (
    <Layout title="Equipamentos">
      {/* Filters */}
      <div className="bg-[var(--card-bg)] p-4 rounded-lg shadow mb-6 transition-colors duration-300">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <input
                  type="text"
                  placeholder="Buscar equipamento..."
                  className="w-full p-2 border rounded bg-[var(--input-bg)] border-[var(--input-border)] text-[var(--input-text)] transition-colors duration-300"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value.toLowerCase());
                    setCurrentPage(1);
                  }}
                />
              </div>
              <div>
                <select 
                  className="w-full p-2 border rounded bg-[var(--input-bg)] border-[var(--input-border)] text-[var(--input-text)] transition-colors duration-300"
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="">Todos os Status</option>
                  <option value="available">Disponível</option>
                  <option value="maintenance">Em Manutenção</option>
                  <option value="calibration">Em Calibração</option>
                  <option value="discarded">Descartado</option>
                </select>
              </div>
              <div>
                <select 
                  className="w-full p-2 border rounded bg-[var(--input-bg)] border-[var(--input-border)] text-[var(--input-text)] transition-colors duration-300"
                  value={sectorFilter}
                  onChange={(e) => {
                    setSectorFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="">Todos os Setores</option>
                  <option value="Injetoras">Injetoras</option>
                  <option value="Ferramentaria">Ferramentaria</option>
                  <option value="Controle da Qualidade">Controle da Qualidade</option>
                  <option value="Point Matic">Point Matic</option>
                  <option value="M1">Montagem 1 (M1)</option>
                  <option value="ALM1">Almoxarifado 1 (ALM 1)</option>
                  <option value="ALM2">Almoxarifado 2 (ALM 2)</option>
                  <option value="DPA">Depósito de Produtos Acabados (DPA)</option>
                  <option value="Manutencao">Manutenção</option>
                </select>
              </div>
              <div>
                <select 
                  className="w-full p-2 border rounded bg-[var(--input-bg)] border-[var(--input-border)] text-[var(--input-text)] transition-colors duration-300"
                  value={typeFilter}
                  onChange={(e) => {
                    setTypeFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="">Todos os Tipos</option>
                  <option value="measurement">Medição Linear</option>
                  <option value="weight">Massa e Peso</option>
                  <option value="time">Tempo e Velocidade</option>
                  <option value="temperature">Temperatura</option>
                  <option value="pressure">Pressão e Vazão</option>
                  <option value="optical">Ópticos e Inspeção</option>
                  <option value="other">Outros</option>
                </select>
              </div>
            </div>
          </div>
          
          {/* Equipment Table */}
          <div className="bg-[var(--card-bg)] rounded-lg shadow overflow-hidden transition-colors duration-300">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray">Tipo</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray">Setor</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray">Última Calibração</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray">Próxima Calibração</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray">Ações</th>
                  </tr>
                </thead>
                <tbody className="bg-[var(--card-bg)] divide-y divide-[var(--card-border)] transition-colors duration-300">
                  {paginatedEquipments.length > 0 ? (
                    paginatedEquipments.map((equipment) => (
                      <tr 
                        key={equipment.id} 
                        className="hover:bg-[var(--card-border)] transition-colors duration-300 cursor-pointer"
                        onDoubleClick={() => {
                          setSelectedEquipment(equipment);
                          setIsModalOpen(true);
                        }}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">{equipment.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{equipment.type}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{equipment.sector}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full whitespace-normal ${
                            equipment.status === 'available' ? 'bg-green-100 text-green-800' :
                            equipment.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' :
                            equipment.status === 'calibration' ? 'bg-blue-100 text-blue-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {equipment.status === 'available' ? 'Disponível' :
                             equipment.status === 'maintenance' ? 'Em Manutenção' :
                             equipment.status === 'calibration' ? 'Em Calibração' :
                             'Descartado'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">{equipment.lastCalibration}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getCalibrationStatus(equipment.nextCalibration) === 'expired' ? 'bg-red-100 text-red-800' : getCalibrationStatus(equipment.nextCalibration) === 'warning' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                            {equipment.nextCalibration}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--muted)]">
                          <button 
                            className="text-blue-600 hover:text-blue-900 mr-3"
                            onClick={() => editEquipment(equipment.id)}
                          >
                            <i className="bx bx-edit"></i>
                          </button>
                          <button 
                            className="text-red-600 hover:text-red-900"
                            onClick={() => deleteEquipment(equipment.id)}
                          >
                            <i className="bx bx-trash"></i>
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-6 py-4 text-center text-[var(--muted)]">
                        Nenhum equipamento encontrado
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Pagination */}
          {filteredEquipments.length > 0 && (
            <div className="mt-4 flex justify-between items-center">
              <div className="text-sm text-[var(--foreground)]">
                Mostrando <span className="font-medium">{startIndex + 1}</span> a <span className="font-medium">{Math.min(endIndex, filteredEquipments.length)}</span> de <span className="font-medium">{filteredEquipments.length}</span> equipamentos
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 rounded transition-colors duration-300 ${currentPage === 1 ? 'bg-[var(--card-border)] text-[var(--muted)] cursor-not-allowed' : 'bg-[var(--button-bg)] text-[var(--button-text)] hover:bg-[var(--button-hover)]'}`}
                >
                  Anterior
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1 rounded transition-colors duration-300 ${currentPage === totalPages ? 'bg-[var(--card-border)] text-[var(--muted)] cursor-not-allowed' : 'bg-[var(--button-bg)] text-[var(--button-text)] hover:bg-[var(--button-hover)]'}`}
                >
                  Próximo
                </button>
              </div>
            </div>
          )}
                  {/* Modal de Detalhes do Equipamento */}
          {isModalOpen && selectedEquipment && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-[var(--card-bg)] rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold text-[var(--foreground)]">Detalhes do Equipamento</h2>
                  <button 
                    onClick={() => setIsModalOpen(false)}
                    className="text-[var(--muted)] hover:text-[var(--foreground)] transition-colors duration-300"
                  >
                    <i className="bx bx-x text-2xl"></i>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4 text-[var(--foreground)]">Informações Básicas</h3>
                    <div className="space-y-3">
                      <p><span className="font-medium">ID:</span> {selectedEquipment.id}</p>
                      <p><span className="font-medium">Tipo:</span> {selectedEquipment.type}</p>
                      <p><span className="font-medium">Setor:</span> {selectedEquipment.sector}</p>
                      <p><span className="font-medium">Status:</span> {getStatusText(selectedEquipment.status)}</p>
                      <p><span className="font-medium">Modelo:</span> {selectedEquipment.model || 'Não informado'}</p>
                      <p><span className="font-medium">Número de Série:</span> {selectedEquipment.serialNumber || 'Não informado'}</p>
                      <p><span className="font-medium">Fabricante:</span> {selectedEquipment.manufacturer || 'Não informado'}</p>
                      <p><span className="font-medium">Faixa de Medida:</span> {selectedEquipment.measurementRange || 'Não informado'}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-4 text-[var(--foreground)]">Calibração e Localização</h3>
                    <div className="space-y-3">
                      <p><span className="font-medium">Última Calibração:</span> {formatDate(selectedEquipment.lastCalibration)}</p>
                      <p><span className="font-medium">Próxima Calibração:</span> {formatDate(selectedEquipment.nextCalibration)}</p>
                      <p><span className="font-medium">Localização Padrão:</span> {selectedEquipment.standardLocation || 'Não informado'}</p>
                      <p><span className="font-medium">Localização Atual:</span> {selectedEquipment.currentLocation || 'Não informado'}</p>
                    </div>

                    <h3 className="text-lg font-semibold my-4 text-[var(--foreground)]">Documentos</h3>
                    <div className="space-y-3">
                      {selectedEquipment.certificateFile && (
                        <div className="flex items-center space-x-2">
                          <i className="bx bx-file text-xl"></i>
                          <a 
                            href={`/certificados/${selectedEquipment.certificateFile}`} 
                            target="_blank"
                            className="text-blue-600 hover:text-blue-800 transition-colors duration-300"
                          >
                            Certificado de Calibração
                          </a>
                        </div>
                      )}
                      {selectedEquipment.dataRecordFile && (
                        <div className="flex items-center space-x-2">
                          <i className="bx bx-spreadsheet text-xl"></i>
                          <a 
                            href={`/registros/${selectedEquipment.dataRecordFile}`} 
                            target="_blank"
                            className="text-blue-600 hover:text-blue-800 transition-colors duration-300"
                          >
                            Registro de Dados
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      editEquipment(selectedEquipment.id);
                      setIsModalOpen(false);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors duration-300"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 bg-[var(--muted)] text-[var(--foreground)] rounded hover:opacity-90 transition-colors duration-300"
                  >
                    Fechar
                  </button>
                </div>
              </div>
            </div>
          )}
        </Layout>
  );
}

