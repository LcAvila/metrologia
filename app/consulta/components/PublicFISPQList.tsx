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
        className="bg-gray-900/70 border border-gray-800 rounded-xl p-5 relative overflow-hidden hover:border-blue-800/50 transition-colors"
        whileHover={{ y: -5 }}
        transition={{ type: "spring", stiffness: 300 }}
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
                <p className="text-sm text-white">Setor: {fdu.setor}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Validade</p>
                <p className="text-sm text-white">Validade: {formatarData(fdu.validade)}</p>
              </div>
              {fdu.numeroCas && (
                <div>
                  <p className="text-xs text-gray-500">Número CAS</p>
                  <p className="text-sm text-white">CAS: {fdu.numeroCas}</p>
                </div>
              )}
              {fdu.tipoRisco && (
                <div>
                  <p className="text-xs text-gray-500">Tipo de Risco</p>
                  <p className="text-sm text-white">Tipo de Risco: {fdu.tipoRisco}</p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {error && (
          <div className="mt-2 p-2 bg-red-900/30 text-red-400 rounded-md text-sm flex items-center gap-2">
            <HiExclamationCircle />
            {error}
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

      {showPdf && fdu.arquivoUrl && (
        <VisualizarPdf 
          filePath={fdu.arquivoUrl} 
          onClose={() => setShowPdf(false)} 
          title={`FDU - ${fdu.produto}`} 
        />
      )}
    </>
  );
};

export default function PublicFDUList() {
  const [fdus, setFdus] = useState<FDU[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [stats, setStats] = useState({ total: 0, setores: 0, expirando: 0 });
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    produto: '',
    fabricante: '',
    setor: '',
    tipoRisco: '',
  });

  useEffect(() => {
    loadFDUs();
    loadStats();
  }, []);

  const loadFDUs = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fduService.publicList();
      setFdus(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar FDUs:', error);
      setError(error.message || 'Falha ao carregar as FDUs. Tente novamente mais tarde.');
      setFdus([]);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await fduService.getPublicStatistics();
      setStats(data);
    } catch (error: any) {
      console.error('Erro ao carregar estatísticas de FDUs:', error);
      // Não exibimos erro de estatísticas para o usuário
    }
  };

  const handleRefresh = () => {
    loadFDUs();
    loadStats();
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const data = await fduService.publicList(filters);
      setFdus(data || []);
    } catch (error: any) {
      console.error('Erro ao pesquisar FDUs:', error);
      setError(error.message || 'Falha ao pesquisar FDUs. Tente novamente.');
      setFdus([]);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setFilters({
      produto: '',
      fabricante: '',
      setor: '',
      tipoRisco: '',
    });
    // Recarregar os dados sem filtros
    loadFDUs();
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-900/70 border border-gray-800 rounded-xl p-5">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">Fichas de Informação (FDU)</h2>
            <p className="text-sm text-gray-400">
              Consulte as {stats.total} FDUs disponíveis em {stats.setores} setores diferentes.
              {stats.expirando > 0 && (
                <span className="ml-2 text-yellow-400 font-medium">
                  ({stats.expirando} expirando nos próximos 30 dias)
                </span>
              )}
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleRefresh}
              className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg flex items-center gap-1"
              title="Atualizar dados"
            >
              <HiRefresh /> 
            </button>
            <button
              onClick={() => setFiltersOpen(!filtersOpen)}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg flex items-center gap-1"
            >
              <HiFilter /> Filtros {filtersOpen ? <HiChevronDown className="transform rotate-180" /> : <HiChevronDown />}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div className="bg-gray-800/50 rounded-lg p-4 flex items-center">
            <div className="w-10 h-10 rounded-full bg-blue-600/20 flex items-center justify-center mr-3">
              <HiDocumentText className="text-xl text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Total de FDUs</p>
              <p className="text-xl font-semibold text-white">{stats.total}</p>
            </div>
          </div>
          
          <div className="bg-gray-800/50 rounded-lg p-4 flex items-center">
            <div className="w-10 h-10 rounded-full bg-purple-600/20 flex items-center justify-center mr-3">
              <HiDocumentText className="text-xl text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Setores</p>
              <p className="text-xl font-semibold text-white">{stats.setores}</p>
            </div>
          </div>
        </div>
        
        <div>
          <div 
            className="flex justify-between items-center cursor-pointer p-2 hover:bg-gray-800/30 rounded-lg transition-colors"
            onClick={() => setFiltersOpen(!filtersOpen)}
          >
            <h3 className="text-md font-medium text-white flex items-center gap-2">
              <HiFilter className="text-blue-400" /> Filtros
            </h3>
            <HiChevronDown className={`text-gray-400 transform transition-transform ${filtersOpen ? 'rotate-180' : ''}`} />
          </div>

          {filtersOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-3"
            >
              <form onSubmit={handleSearch} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Produto</label>
                    <input
                      type="text"
                      name="produto"
                      value={filters.produto}
                      onChange={handleFilterChange}
                      className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white"
                      placeholder="Nome do produto"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Fabricante</label>
                    <input
                      type="text"
                      name="fabricante"
                      value={filters.fabricante}
                      onChange={handleFilterChange}
                      className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white"
                      placeholder="Nome do fabricante"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Setor</label>
                    <input
                      type="text"
                      name="setor"
                      value={filters.setor}
                      onChange={handleFilterChange}
                      className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white"
                      placeholder="Setor de uso"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Tipo de Risco</label>
                    <input
                      type="text"
                      name="tipoRisco"
                      value={filters.tipoRisco}
                      onChange={handleFilterChange}
                      className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white"
                      placeholder="Tipo de risco"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg flex items-center gap-1"
                  >
                    <HiX /> Limpar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-1"
                  >
                    <HiSearch /> Pesquisar
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-900/30 border border-red-800/50 text-red-400 p-4 rounded-lg mb-6 flex items-start gap-3">
          <HiExclamationCircle className="text-xl flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium mb-1">Erro ao carregar dados</h4>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}
      
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-12 h-12 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
        </div>
      ) : !loading && fdus.length === 0 ? (
        <div className="bg-gray-900/70 border border-gray-800 rounded-xl p-8 text-center">
          <HiDocumentText className="text-gray-500 text-5xl mx-auto mb-4" />
          <h3 className="text-xl text-gray-400">Nenhuma FDU encontrada</h3>
          <p className="text-gray-500 mt-2">Tente ajustar os filtros ou entre em contato com a equipe de química.</p>
          {Object.values(filters).some(f => f !== '') && (
            <button 
              onClick={clearFilters}
              className="mt-4 px-4 py-2 bg-blue-900/30 hover:bg-blue-800/40 text-blue-400 rounded-lg text-sm inline-flex items-center gap-1 transition-colors"
            >
              <HiX /> Limpar filtros
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {fdus.map((fdu) => (
              <motion.div
                key={fdu.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <PublicFDUCard key={fdu.id} fdu={fdu} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
