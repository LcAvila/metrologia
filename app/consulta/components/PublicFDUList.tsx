'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FDU } from '../../fdu/types/fdu';
import { fduService } from '../../fdu/services/fduService';
import { HiSearch, HiFilter, HiChevronDown, HiX, HiDocumentText, HiDownload, 
         HiExclamation, HiExclamationCircle, HiRefresh, HiSelector } from 'react-icons/hi';
import VisualizarPdf from '../../components/VisualizarPdf';
import { formatarData, calcularStatusData } from '../../utils/formatters';

const PublicFDUCard = ({ fdu }: { fdu: FDU }) => {
  const [showPdf, setShowPdf] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Usar o utilitário calcularStatusData para determinar o status
  const status = calcularStatusData(fdu.validade);
  
  const handleViewPdf = () => {
    try {
      if (!fdu.arquivoUrl) {
        setError('URL do arquivo não disponível');
        return;
      }
      setShowPdf(true);
    } catch (err) {
      console.error('Erro ao visualizar PDF:', err);
      setError('Erro ao abrir o visualizador de PDF');
    }
  };

  const handleDownload = () => {
    try {
      if (!fdu.arquivoUrl) {
        setError('URL do arquivo não disponível');
        return;
      }
      
      window.open(fdu.arquivoUrl, '_blank');
    } catch (err) {
      console.error('Erro ao baixar arquivo:', err);
      setError('Erro ao baixar o arquivo. Tente novamente mais tarde.');
    }
  };

  const getStatusBadge = () => {
    if (status === 'expired') {
      return (
        <div className="absolute top-3 right-3 px-2 py-1 bg-red-500/20 border border-red-500/30 rounded-full text-xs text-red-400 flex items-center gap-1">
          <HiExclamation className="text-red-400" />
          Expirado
        </div>
      );
    } else if (status === 'expiring') {
      return (
        <div className="absolute top-3 right-3 px-2 py-1 bg-yellow-500/20 border border-yellow-500/30 rounded-full text-xs text-yellow-400 flex items-center gap-1">
          <HiExclamation className="text-yellow-400" />
          Expirando
        </div>
      );
    }
    return (
      <div className="absolute top-3 right-3 px-2 py-1 bg-green-500/20 border border-green-500/30 rounded-full text-xs text-green-400 flex items-center gap-1">
        <HiDocumentText className="text-green-400" />
        Válido
      </div>
    );
  };

  return (
    <>
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-gray-800/50 rounded-xl p-5 border border-gray-700 hover:border-blue-700/50 transition-colors relative shadow-md"
      >
        {getStatusBadge()}
        
        <div className="flex items-start">
          <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center mr-4">
            <HiDocumentText className="text-2xl text-blue-400" />
          </div>
          
          <div className="flex-1">
            <h3 className="text-lg font-medium text-white mb-1">{fdu.produto}</h3>
            <p className="text-sm text-gray-400">Fabricante: {fdu.fabricante}</p>
            
            <div className="mt-3 grid grid-cols-2 gap-2">
              <div>
                <p className="text-xs text-gray-500">Setor</p>
                <p className="text-sm text-white">{fdu.setor}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Validade</p>
                <p className="text-sm text-white">{formatarData(fdu.validade)}</p>
              </div>
              {fdu.numeroCas && (
                <div>
                  <p className="text-xs text-gray-500">Número CAS</p>
                  <p className="text-sm text-white">{fdu.numeroCas}</p>
                </div>
              )}
              {fdu.tipoRisco && (
                <div>
                  <p className="text-xs text-gray-500">Tipo de Risco</p>
                  <p className="text-sm text-white">{fdu.tipoRisco}</p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {error && (
          <div className="mt-3 p-2 bg-red-900/30 border border-red-900/30 rounded-lg">
            <p className="text-sm text-red-400 flex items-center gap-1">
              <HiExclamationCircle /> {error}
            </p>
          </div>
        )}
        
        <div className="mt-4 pt-3 border-t border-gray-800 flex flex-wrap justify-end gap-2">
          <button
            onClick={handleViewPdf}
            className="px-3 py-1.5 bg-blue-900/30 hover:bg-blue-800/40 text-blue-400 rounded-lg text-sm flex items-center gap-1 transition-colors"
          >
            <HiDocumentText /> Visualizar
          </button>
          <button
            onClick={handleDownload}
            className="px-3 py-1.5 bg-green-900/30 hover:bg-green-800/40 text-green-400 rounded-lg text-sm flex items-center gap-1 transition-colors"
          >
            <HiDownload /> Baixar
          </button>
        </div>
      </motion.div>

      {showPdf && (
        <VisualizarPdf 
          filePath={fdu.arquivoUrl} 
          onClose={() => setShowPdf(false)} 
          title={`FDU - ${fdu.produto}`} 
        />
      )}
    </>
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
          <HiFilter /> Filtros <HiChevronDown className={`transition-transform ${filtersOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-800/50 rounded-xl p-5 flex flex-col justify-between border border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-full bg-blue-800/30 flex items-center justify-center text-blue-400">
              <HiDocumentText className="text-xl" />
            </div>
            <h3 className="text-lg font-medium text-white">Total de FDUs</h3>
          </div>
          <p className="text-3xl font-bold text-white">{stats.total}</p>
        </div>
        
        <div className="bg-gray-800/50 rounded-xl p-5 flex flex-col justify-between border border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-full bg-yellow-800/30 flex items-center justify-center text-yellow-400">
              <HiExclamation className="text-xl" />
            </div>
            <h3 className="text-lg font-medium text-white">Expirando</h3>
          </div>
          <p className="text-3xl font-bold text-white">{stats.expirando}</p>
        </div>
        
        <div className="bg-gray-800/50 rounded-xl p-5 flex flex-col justify-between border border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-full bg-gray-800/30 flex items-center justify-center text-gray-400">
              <HiSelector className="text-xl" />
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
                    <HiX /> Limpar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-1"
                  >
                    <HiSearch /> Buscar
                  </button>
                  <button
                    type="button"
                    onClick={loadFDUs}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-1"
                  >
                    <HiRefresh /> Atualizar
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {fdus.map(fdu => (
            <PublicFDUCard key={fdu.id} fdu={fdu} />
          ))}
        </div>
      )}
    </div>
  );
};

export default PublicFDUList;
