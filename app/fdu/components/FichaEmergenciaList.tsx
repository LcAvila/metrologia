'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FichaEmergencia } from '../types/fichaEmergencia';
import { fichaEmergenciaService } from '../services/fichaEmergenciaService';
import FichaEmergenciaCard from './FichaEmergenciaCard';
import { HiSearch, HiFilter, HiChevronDown, HiX } from 'react-icons/hi';

interface FichaEmergenciaListProps {
  isAdmin?: boolean;
  showFilters?: boolean;
  limit?: number;
}

const FichaEmergenciaList: React.FC<FichaEmergenciaListProps> = ({ isAdmin = false, showFilters = true, limit }) => {
  const [fichas, setFichas] = useState<FichaEmergencia[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState({
    nome: '',
    produto: '',
    numeroOnu: '',
    classeRisco: ''
  });

  useEffect(() => {
    loadFichas();
  }, []);

  const loadFichas = async () => {
    try {
      setLoading(true);
      let data;
      
      // Se o usuário for admin, usa o método normal, senão usa o método público
      if (isAdmin) {
        data = await fichaEmergenciaService.list(filters);
      } else {
        data = await fichaEmergenciaService.publicList(filters);
      }
      
      // Se houver um limite, aplica-o
      if (limit && data.length > limit) {
        data = data.slice(0, limit);
      }
      
      setFichas(data);
    } catch (error) {
      console.error('Erro ao carregar Fichas de Emergência:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta Ficha de Emergência?')) {
      try {
        await fichaEmergenciaService.delete(id);
        loadFichas();
      } catch (error) {
        console.error('Erro ao excluir Ficha de Emergência:', error);
      }
    }
  };

  const handleEdit = (id: string) => {
    window.location.href = `/fdu/ficha-emergencia/editar/${id}`;
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadFichas();
  };

  const clearFilters = () => {
    setFilters({
      nome: '',
      produto: '',
      numeroOnu: '',
      classeRisco: ''
    });
    setTimeout(() => loadFichas(), 0);
  };

  return (
    <div className="space-y-6">
      {showFilters && (
        <div className="bg-gray-900/70 border border-gray-800 rounded-xl p-5 overflow-hidden">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-white flex items-center gap-2">
              <HiFilter className="text-purple-400" /> Filtros - Fichas de Emergência
            </h3>
            <button
              onClick={() => setFiltersOpen(!filtersOpen)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <HiChevronDown className={`transform transition-transform ${filtersOpen ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {filtersOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <form onSubmit={handleSearch} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Nome da Ficha</label>
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
                    <label className="block text-sm text-gray-400 mb-1">Número ONU</label>
                    <input
                      type="text"
                      name="numeroOnu"
                      value={filters.numeroOnu}
                      onChange={handleFilterChange}
                      className="w-full px-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white"
                      placeholder="Ex: 1203"
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
                      placeholder="Ex: 3"
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
      )}

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-12 h-12 border-t-2 border-b-2 border-purple-500 rounded-full animate-spin"></div>
        </div>
      ) : fichas.length === 0 ? (
        <div className="bg-gray-900/70 border border-gray-800 rounded-xl p-8 text-center">
          <h3 className="text-xl text-gray-400">Nenhuma Ficha de Emergência encontrada</h3>
          <p className="text-gray-500 mt-2">Tente ajustar os filtros ou cadastre novas fichas.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {fichas.map(ficha => (
            <FichaEmergenciaCard
              key={ficha.id}
              ficha={ficha}
              onEdit={isAdmin ? handleEdit : undefined}
              onDelete={isAdmin ? handleDelete : undefined}
              isAdmin={isAdmin}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default FichaEmergenciaList;
