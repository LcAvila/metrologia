'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FDU } from '../../fdu/types/fdu';
import { fduService } from '../../fdu/services/fduService';
import { FiSearch, FiFilter, FiChevronDown, FiX, FiFileText,
         FiAlertCircle, FiRefreshCw, FiList, FiInfo, FiEye, FiAlertTriangle } from 'react-icons/fi';
import { formatarData } from '../../utils/formatters';

// Modal para exibir detalhes da FDU
interface FDUDetailModalProps {
  fdu: FDU | null;
  onClose: () => void;
}

const FDUDetailModal = ({ fdu, onClose }: FDUDetailModalProps) => {
  if (!fdu) return null;
  
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 border border-gray-700 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">{fdu.produto}</h2>
              <p className="text-gray-400 flex items-center gap-2">
                <FiFileText className="text-blue-400" /> 
                <span>Ficha de Utilização de Dispositivo (FDU)</span>
              </p>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-gray-700 rounded-full transition-colors"
            >
              <FiX className="text-gray-400 hover:text-white" size={24} />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-1">Informações do Produto</h3>
                <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4 space-y-3">
                  <div>
                    <span className="text-gray-500 text-sm">Nome do Produto</span>
                    <p className="text-white font-medium">{fdu.produto}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 text-sm">Fabricante</span>
                    <p className="text-white">{fdu.fabricante}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 text-sm">Número CAS</span>
                    <p className="text-white">{fdu.numeroCas || 'Não informado'}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 text-sm">Tipo de Risco</span>
                    <p className="text-white">{fdu.tipoRisco || 'Não informado'}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-1">Localização e Uso</h3>
                <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4 space-y-3">
                  <div>
                    <span className="text-gray-500 text-sm">Setor Responsável</span>
                    <p className="text-white">{fdu.setor}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 text-sm">Data de Cadastro</span>
                    <p className="text-white">{formatarData(fdu.criadoEm)}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-1">Informações Detalhadas</h3>
                <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4 space-y-3">
                  {fdu.id && (
                    <div>
                      <span className="text-gray-500 text-sm">ID do Documento</span>
                      <p className="text-white font-mono text-xs">{fdu.id}</p>
                    </div>
                  )}
                  {fdu.descricao && (
                    <div>
                      <span className="text-gray-500 text-sm">Descrição</span>
                      <p className="text-white">{fdu.descricao}</p>
                    </div>
                  )}
                  {fdu.instrucoes && (
                    <div>
                      <span className="text-gray-500 text-sm">Instruções de Uso</span>
                      <p className="text-white">{fdu.instrucoes}</p>
                    </div>
                  )}
                  {fdu.precaucoes && (
                    <div>
                      <span className="text-gray-500 text-sm">Precauções</span>
                      <p className="text-white">{fdu.precaucoes}</p>
                    </div>
                  )}
                </div>
              </div>
              
              {fdu.composicao && (
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-1">Composição</h3>
                  <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4">
                    <p className="text-white whitespace-pre-line">{fdu.composicao}</p>
                  </div>
                </div>
              )}
              
              {/* Renderiza todas as outras propriedades disponíveis */}
              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-1">Informações Adicionais</h3>
                <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4 space-y-3">
                  {Object.entries(fdu).map(([key, value]) => {
                    // Pula propriedades já exibidas ou vazias
                    if (['id', 'produto', 'fabricante', 'setor', 'numeroCas', 'tipoRisco', 'criadoEm', 
                         'validade', 'arquivoUrl', 'descricao', 'instrucoes', 'precaucoes', 'composicao'].includes(key) || 
                        !value) {
                      return null;
                    }
                    
                    return (
                      <div key={key}>
                        <span className="text-gray-500 text-sm">{key.charAt(0).toUpperCase() + key.slice(1)}</span>
                        <p className="text-white">{typeof value === 'string' ? value : JSON.stringify(value)}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente principal que lista as FDUs públicas
const PublicFDUList = () => {
  const [fdus, setFdus] = useState<FDU[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState({
    produto: '',
    fabricante: '',
    setor: '',
    tipoRisco: ''
  });
  const [availableSetores, setAvailableSetores] = useState<string[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    expirando: 0,
    setores: 0
  });
  const [selectedFdu, setSelectedFdu] = useState<FDU | null>(null);

  useEffect(() => {
    loadFDUs();
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const stats = await fduService.getPublicStatistics();
      setStats(stats);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const loadFDUs = async () => {
    try {
      setLoading(true);
      const data = await fduService.publicList(filters);
      setFdus(data);
      
      // Extrair setores únicos para os filtros
      const setores = [...new Set(data.map(f => f.setor))];
      setAvailableSetores(setores);
    } catch (error) {
      console.error('Erro ao carregar FDUs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };
  
  const handleViewDetails = (fdu: FDU) => {
    setSelectedFdu(fdu);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadFDUs();
  };

  const clearFilters = () => {
    setFilters({
      produto: '',
      fabricante: '',
      setor: '',
      tipoRisco: ''
    });
    setTimeout(() => loadFDUs(), 0);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Consulta Pública de FDUs</h2>
        <button
          onClick={() => setFiltersOpen(!filtersOpen)}
          className="flex items-center gap-1 px-3 py-2 bg-blue-900/20 hover:bg-blue-900/30 text-blue-400 rounded-lg"
        >
          <FiFilter /> Filtros <FiChevronDown className={`transition-transform ${filtersOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-800/50 rounded-xl p-5 flex flex-col justify-between border border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-full bg-blue-800/30 flex items-center justify-center text-blue-400">
              <FiFileText className="text-xl" />
            </div>
            <h3 className="text-lg font-medium text-white">Total de FDUs</h3>
          </div>
          <p className="text-3xl font-bold text-white">{stats.total}</p>
        </div>
        
        <div className="bg-gray-800/50 rounded-xl p-5 flex flex-col justify-between border border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-full bg-gray-800/30 flex items-center justify-center text-gray-400">
              <FiList className="text-xl" />
            </div>
            <h3 className="text-lg font-medium text-white">Setores</h3>
          </div>
          <p className="text-3xl font-bold text-white">{stats.setores}</p>
        </div>
      </div>

      <AnimatePresence>
        {filtersOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="bg-gray-800/50 p-5 rounded-xl border border-gray-700">
              <h3 className="text-lg font-medium mb-3">Filtros de Pesquisa</h3>
              
              <form onSubmit={handleSearch} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label htmlFor="produto" className="block text-sm font-medium mb-1 text-gray-400">
                      Produto
                    </label>
                    <input
                      type="text"
                      id="produto"
                      name="produto"
                      value={filters.produto}
                      onChange={handleInputChange}
                      className="w-full p-2 bg-gray-900/50 border border-gray-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-white"
                      placeholder="Nome do produto"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="fabricante" className="block text-sm font-medium mb-1 text-gray-400">
                      Fabricante
                    </label>
                    <input
                      type="text"
                      id="fabricante"
                      name="fabricante"
                      value={filters.fabricante}
                      onChange={handleInputChange}
                      className="w-full p-2 bg-gray-900/50 border border-gray-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-white"
                      placeholder="Nome do fabricante"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="setor" className="block text-sm font-medium mb-1 text-gray-400">
                      Setor
                    </label>
                    <select
                      id="setor"
                      name="setor"
                      value={filters.setor}
                      onChange={handleInputChange}
                      className="w-full p-2 bg-gray-900/50 border border-gray-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-white"
                    >
                      <option value="">Todos os setores</option>
                      {availableSetores.map(setor => (
                        <option key={setor} value={setor}>{setor}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="tipoRisco" className="block text-sm font-medium mb-1 text-gray-400">
                      Tipo de Risco
                    </label>
                    <input
                      type="text"
                      id="tipoRisco"
                      name="tipoRisco"
                      value={filters.tipoRisco}
                      onChange={handleInputChange}
                      className="w-full p-2 bg-gray-900/50 border border-gray-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-white"
                      placeholder="Tipo de risco"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg flex items-center gap-1"
                  >
                    <FiX /> Limpar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-1"
                  >
                    <FiSearch /> Buscar
                  </button>
                  <button
                    type="button"
                    onClick={loadFDUs}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-1"
                  >
                    <FiRefreshCw /> Atualizar
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-12 h-12 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
        </div>
      ) : fdus.length === 0 ? (
        <div className="bg-gray-800/50 rounded-xl p-8 text-center border border-gray-700">
          <h3 className="text-xl text-gray-400">Nenhuma FDU encontrada</h3>
          <p className="text-gray-500 mt-2">Tente ajustar os filtros ou volte mais tarde.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-700 bg-gray-800/50">
          <div className="overflow-x-auto">
            <table className="w-full whitespace-nowrap">
              <thead>
                <tr className="bg-gray-900/50 border-b border-gray-700">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Produto</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Fabricante</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Setor</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Número CAS</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Detalhes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {fdus.map((fdu) => (
                  <tr 
                    key={fdu.id} 
                    className="hover:bg-gray-700/30 transition-colors cursor-pointer"
                    onClick={() => handleViewDetails(fdu)}
                  >
                    <td className="px-4 py-3 text-sm text-white">{fdu.produto}</td>
                    <td className="px-4 py-3 text-sm text-gray-300">{fdu.fabricante}</td>
                    <td className="px-4 py-3 text-sm text-gray-300">{fdu.setor}</td>
                    <td className="px-4 py-3 text-sm text-gray-300">{fdu.numeroCas || 'N/A'}</td>
                    <td className="px-4 py-3 text-sm text-right">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewDetails(fdu);
                        }} 
                        className="p-1 bg-blue-900/30 rounded-lg text-blue-400 hover:bg-blue-800/40 transition-colors"
                        title="Ver detalhes completos"
                      >
                        <FiEye size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {selectedFdu && (
        <FDUDetailModal fdu={selectedFdu} onClose={() => setSelectedFdu(null)} />
      )}
    </div>
  );
};

export default PublicFDUList;
