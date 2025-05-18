'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiSearch, HiFilter, HiChevronDown, HiX, HiCalendar, 
         HiRefresh, HiWrenchScrewdriver, HiExclamationCircle } from 'react-icons/hi';
import { HiWrenchScrewdriver as HiWrenchIcon } from 'react-icons/hi2';
import { supabase } from '../../lib/supabaseClient';
import { formatarData, calcularStatusData } from '../../utils/formatters';

// Interface para equipamentos
interface Equipamento {
  id: number;
  numero_serie: string;
  tipo: string;
  marca: string;
  modelo: string;
  setor: string;
  proxima_calibracao: string;
  status: string;
  certificado_url?: string;
}

// Componente de cartão para equipamento individual
const EquipamentoCard = ({ equipamento }: { equipamento: Equipamento }) => {
  // Calcular o status com base na data de calibração
  const status = calcularStatusData(equipamento.proxima_calibracao);
  
  // Função para obter a cor com base no status da validade
  const getStatusColor = () => {
    if (status === 'expired') return 'bg-red-100 text-red-800 border-red-200';
    if (status === 'expiring') return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-green-100 text-green-800 border-green-200';
  };
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700 transition-all hover:shadow-lg"
    >
      <div className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center mb-2">
              <HiWrenchIcon className="h-5 w-5 text-blue-500 mr-2" />
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                {equipamento.tipo} {equipamento.marca}
              </h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
              <span className="font-medium">Modelo:</span> {equipamento.modelo}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
              <span className="font-medium">N° Série:</span> {equipamento.numero_serie}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
              <span className="font-medium">Setor:</span> {equipamento.setor}
            </p>
          </div>
          
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor()} border`}>
            {status === 'expired' ? 'Calibração Vencida' : 
             status === 'expiring' ? 'Vence em Breve' : 'Calibrado'}
          </div>
        </div>
        
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            <HiCalendar className="mr-1" />
            <span>Próxima Calibração: {formatarData(equipamento.proxima_calibracao)}</span>
          </div>
          
          {equipamento.certificado_url && (
            <a 
              href={equipamento.certificado_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-blue-500 hover:text-blue-700 flex items-center"
            >
              Ver Certificado
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// Componente principal que lista os equipamentos
const PublicEquipamentosList = () => {
  const [equipamentos, setEquipamentos] = useState<Equipamento[]>([]);
  const [filteredEquipamentos, setFilteredEquipamentos] = useState<Equipamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedSetor, setSelectedSetor] = useState('Todos');
  const [selectedTipo, setSelectedTipo] = useState('Todos');
  const [selectedStatus, setSelectedStatus] = useState('Todos');
  
  // Listas para filtros
  const setores = ['Todos', 'Qualidade', 'Produção', 'Manutenção', 'Laboratório', 'Outros'];
  const tipos = ['Todos', 'Paquímetro', 'Micrômetro', 'Balança', 'Manômetro', 'Outros'];
  const statusOptions = ['Todos', 'Calibrado', 'Vence em Breve', 'Calibração Vencida'];
  
  // Buscar dados do supabase
  useEffect(() => {
    const fetchEquipamentos = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('equipamentos')
          .select('*')
          .order('proxima_calibracao', { ascending: true });
          
        if (error) throw error;
        
        if (data) {
          setEquipamentos(data);
          setFilteredEquipamentos(data);
        }
      } catch (err: any) {
        console.error('Erro ao buscar equipamentos:', err.message);
        setError('Não foi possível carregar os equipamentos. Por favor, tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchEquipamentos();
  }, []);
  
  // Aplicar filtros quando as seleções mudarem
  useEffect(() => {
    let filtered = [...equipamentos];
    
    // Aplicar filtro de busca
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(equip => 
        equip.tipo.toLowerCase().includes(term) ||
        equip.modelo.toLowerCase().includes(term) ||
        equip.numero_serie.toLowerCase().includes(term) ||
        equip.marca.toLowerCase().includes(term)
      );
    }
    
    // Aplicar filtro de setor
    if (selectedSetor !== 'Todos') {
      filtered = filtered.filter(equip => equip.setor === selectedSetor);
    }
    
    // Aplicar filtro de tipo
    if (selectedTipo !== 'Todos') {
      filtered = filtered.filter(equip => equip.tipo === selectedTipo);
    }
    
    // Aplicar filtro de status
    if (selectedStatus !== 'Todos') {
      filtered = filtered.filter(equip => {
        const status = calcularStatusData(equip.proxima_calibracao);
        if (selectedStatus === 'Calibrado' && status === 'valid') return true;
        if (selectedStatus === 'Vence em Breve' && status === 'expiring') return true;
        if (selectedStatus === 'Calibração Vencida' && status === 'expired') return true;
        return false;
      });
    }
    
    setFilteredEquipamentos(filtered);
  }, [searchTerm, selectedSetor, selectedTipo, selectedStatus, equipamentos]);
  
  const resetFilters = () => {
    setSearchTerm('');
    setSelectedSetor('Todos');
    setSelectedTipo('Todos');
    setSelectedStatus('Todos');
    setFilterOpen(false);
  };
  
  if (error) {
    return (
      <div className="w-full p-6 text-center">
        <div className="mx-auto w-16 h-16 mb-4 flex items-center justify-center rounded-full bg-red-100">
          <HiExclamationCircle className="w-8 h-8 text-red-500" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Erro ao carregar</h3>
        <p className="text-gray-500 dark:text-gray-400 mb-6">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 inline-flex items-center"
        >
          <HiRefresh className="mr-2" /> Tentar novamente
        </button>
      </div>
    );
  }
  
  return (
    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-800">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <h2 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white flex items-center">
          <HiWrenchIcon className="mr-2 h-6 w-6 text-blue-500" />
          Equipamentos de Metrologia
        </h2>
        
        <div className="flex flex-col md:flex-row gap-2">
          {/* Barra de busca */}
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar equipamento..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full md:w-64 pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <HiSearch className="absolute left-3 top-2.5 text-gray-400" />
            {searchTerm && (
              <button 
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                onClick={() => setSearchTerm('')}
              >
                <HiX />
              </button>
            )}
          </div>
          
          {/* Botão de filtro */}
          <button
            onClick={() => setFilterOpen(!filterOpen)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <HiFilter />
            <span>Filtros</span>
            <HiChevronDown className={`transform transition-transform ${filterOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>
      
      {/* Painel de filtros */}
      <AnimatePresence>
        {filterOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mb-6 overflow-hidden"
          >
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Filtro de Setor */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Setor
                  </label>
                  <select
                    value={selectedSetor}
                    onChange={(e) => setSelectedSetor(e.target.value)}
                    className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
                  >
                    {setores.map((setor) => (
                      <option key={setor} value={setor}>{setor}</option>
                    ))}
                  </select>
                </div>
                
                {/* Filtro de Tipo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Tipo de Equipamento
                  </label>
                  <select
                    value={selectedTipo}
                    onChange={(e) => setSelectedTipo(e.target.value)}
                    className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
                  >
                    {tipos.map((tipo) => (
                      <option key={tipo} value={tipo}>{tipo}</option>
                    ))}
                  </select>
                </div>
                
                {/* Filtro de Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Status de Calibração
                  </label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
                  >
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="mt-4 flex justify-end">
                <button
                  onClick={resetFilters}
                  className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                >
                  Limpar Filtros
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Lista de equipamentos */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : filteredEquipamentos.length === 0 ? (
        <div className="text-center py-12">
          <HiWrenchIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">
            Nenhum equipamento encontrado
          </h3>
          <p className="mt-1 text-gray-500 dark:text-gray-400">
            Tente ajustar seus filtros ou buscar outro termo.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEquipamentos.map((equipamento) => (
            <EquipamentoCard key={equipamento.id} equipamento={equipamento} />
          ))}
        </div>
      )}
    </div>
  );
};

export default PublicEquipamentosList;
