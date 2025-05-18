'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FichaEmergencia, FichaEmergenciaStatistics } from '../../fdu/types/fichaEmergencia';
import { fichaEmergenciaService } from '../../fdu/services/fichaEmergenciaService';
import { HiSearch, HiFilter, HiChevronDown, HiX, HiDocumentText, HiDownload, 
         HiRefresh, HiExclamationCircle } from 'react-icons/hi';
import { HiExclamationTriangle } from 'react-icons/hi2';
import VisualizarPdf from '../../components/VisualizarPdf';
import { formatarData, calcularStatusData } from '../../utils/formatters';

const PublicFichaEmergenciaCard = ({ ficha }: { ficha: FichaEmergencia }) => {
  const [showPdf, setShowPdf] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Calcular o status da ficha com base na validade
  const status = calcularStatusData(ficha.validade);
  
  const handleViewPdf = () => {
    try {
      if (!ficha.arquivoUrl) {
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
      if (!ficha.arquivoUrl) {
        setError('URL do arquivo não disponível');
        return;
      }
      
      window.open(ficha.arquivoUrl, '_blank');
    } catch (err) {
      console.error('Erro ao baixar arquivo:', err);
      setError('Erro ao baixar o arquivo. Tente novamente mais tarde.');
    }
  };
  
  // Função para obter a cor com base no status da validade
  const getStatusColor = () => {
    if (status === 'expired') return 'red';
    if (status === 'expiring') return 'yellow';
    return 'purple';
  };
  
  const statusColor = getStatusColor();

  return (
    <>
      <motion.div 
        className="bg-gray-900/70 border border-gray-800 rounded-xl p-5 relative overflow-hidden hover:border-purple-800/50 transition-colors"
        whileHover={{ y: -5 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <div className={`absolute top-3 right-3 px-2 py-1 bg-${statusColor}-500/20 border border-${statusColor}-500/30 rounded-full text-xs text-${statusColor}-400 flex items-center gap-1`}>
          <HiExclamationTriangle className={`text-${statusColor}-400`} />
          {status === 'expired' ? 'Expirado' : status === 'expiring' ? 'Expirando' : 'Emergência'}
        </div>
        
        <div className="flex items-start">
          <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center mr-4">
            <HiExclamationTriangle className="text-2xl text-purple-400" />
          </div>
          
          <div className="flex-1">
            <h3 className="text-lg font-medium text-white mb-1">{ficha.produto}</h3>
            <p className="text-sm text-gray-400">Nome: {ficha.nome}</p>
            
            <div className="mt-3 grid grid-cols-2 gap-2">
              <div>
                <p className="text-xs text-gray-500">Número ONU</p>
                <p className="text-sm text-white">{ficha.numeroOnu}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Data de Criação</p>
                <p className="text-sm text-white">{formatarData(ficha.criadoEm)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Classe de Risco</p>
                <p className="text-sm text-white">{ficha.classeRisco}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Validade</p>
                <p className={`text-sm ${status === 'expired' ? 'text-red-400' : status === 'expiring' ? 'text-yellow-400' : 'text-white'}`}>
                  {formatarData(ficha.validade)}
                </p>
              </div>
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
            className="px-3 py-1.5 bg-purple-900/30 hover:bg-purple-800/40 text-purple-400 rounded-lg text-sm flex items-center gap-1 transition-colors"
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
          filePath={ficha.arquivoUrl} 
          onClose={() => setShowPdf(false)} 
          title={`Ficha de Emergência - ${ficha.produto}`} 
        />
      )}
    </>
  );
};

export default function PublicFichaEmergenciaList() {
  const [fichas, setFichas] = useState<FichaEmergencia[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    nome: '',
    produto: '',
    numeroOnu: '',
    classeRisco: ''
  });
  const [stats, setStats] = useState<FichaEmergenciaStatistics>({
    total: 0, 
    setores: 0, 
    expirando: 0, 
    vencidas: 0, 
    classesRisco: 0 
  });

  useEffect(() => {
    loadFichas();
    loadStats();
  }, []);

  const loadFichas = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fichaEmergenciaService.publicList();
      setFichas(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar fichas de emergência:', error);
      setError(error.message || 'Falha ao carregar fichas de emergência. Tente novamente mais tarde.');
      setFichas([]);
    } finally {
      setLoading(false);
    }
  };
  
  const handleRefresh = () => {
    loadFichas();
    loadStats();
  };

  const loadStats = async () => {
    try {
      const data = await fichaEmergenciaService.getPublicStatistics();
      setStats(data);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
      // Em caso de erro, mantenha os valores padrão
      setStats({ 
        total: 0, 
        setores: 0, 
        expirando: 0, 
        vencidas: 0, 
        classesRisco: 0 
      });
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const data = await fichaEmergenciaService.publicList(filters);
      setFichas(data || []);
    } catch (error: any) {
      console.error('Erro ao pesquisar fichas de emergência:', error);
      setError(error.message || 'Falha ao pesquisar fichas. Tente novamente.');
      setFichas([]);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setFilters({
      nome: '',
      produto: '',
      numeroOnu: '',
      classeRisco: ''
    });
    // Recarregar os dados sem filtros
    loadFichas();
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-900/70 border border-gray-800 rounded-xl p-5">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">Fichas de Emergência</h2>
            <p className="text-sm text-gray-400">
              Consulte as {stats.total} Fichas de Emergência disponíveis.
              {stats.expirando > 0 && (
                <span className="ml-2 text-yellow-400 font-medium">
                  ({stats.expirando} expirando nos próximos 30 dias)
                </span>
              )}
              {stats.vencidas > 0 && (
                <span className="ml-2 text-red-400 font-medium">
                  ({stats.vencidas} vencidas)
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
            <div className="w-10 h-10 rounded-full bg-purple-600/20 flex items-center justify-center mr-3">
              <HiExclamationTriangle className="text-xl text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Total de Fichas</p>
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
              <HiFilter className="text-purple-400" /> Filtros
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
                    <label className="block text-sm text-gray-400 mb-1">Nome</label>
                    <input
                      type="text"
                      name="nome"
                      value={filters.nome}
                      onChange={handleFilterChange}
                      className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white"
                      placeholder="Nome da ficha"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Número ONU</label>
                    <input
                      type="text"
                      name="numeroOnu"
                      value={filters.numeroOnu}
                      onChange={handleFilterChange}
                      className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white"
                      placeholder="Número ONU"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Classe de Risco</label>
                    <input
                      type="text"
                      name="classeRisco"
                      value={filters.classeRisco}
                      onChange={handleFilterChange}
                      className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white"
                      placeholder="Classe de risco"
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
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-1"
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
          <div className="w-12 h-12 border-t-2 border-b-2 border-purple-500 rounded-full animate-spin"></div>
        </div>
      ) : fichas.length === 0 ? (
        <div className="bg-gray-900/70 border border-gray-800 rounded-xl p-8 text-center">
          <HiExclamationTriangle className="text-gray-500 text-5xl mx-auto mb-4" />
          <h3 className="text-xl text-gray-400">Nenhuma Ficha de Emergência encontrada</h3>
          <p className="text-gray-500 mt-2">Tente ajustar os filtros ou entre em contato com a equipe de química.</p>
          {Object.values(filters).some(f => f !== '') && (
            <button 
              onClick={clearFilters}
              className="mt-4 px-4 py-2 bg-purple-900/30 hover:bg-purple-800/40 text-purple-400 rounded-lg text-sm inline-flex items-center gap-1 transition-colors"
            >
              <HiX /> Limpar filtros
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {fichas.map(ficha => (
              <motion.div
                key={ficha.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <PublicFichaEmergenciaCard ficha={ficha} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
