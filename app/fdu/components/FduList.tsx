'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FDU } from '../types/fdu';
import { fduService } from '../services/fduService';
import FDUCard from './FduCard';
import { HiSearch, HiFilter, HiChevronDown, HiX } from 'react-icons/hi';

interface FDUListProps {
  isAdmin?: boolean;
  showFilters?: boolean;
  limit?: number;
}

const FDUList: React.FC<FDUListProps> = ({ isAdmin = false, showFilters = true, limit }) => {
  const [fdus, setFdus] = useState<FDU[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState({
    produto: '',
    fabricante: '',
    setor: '',
    tipoRisco: ''
  });

  useEffect(() => {
    loadFDUs();
  }, []);

  const loadFDUs = async () => {
    try {
      setLoading(true);
      let data;
      
      // Se o usuário for admin, usa o método normal, senão usa o método público
      if (isAdmin) {
        data = await fduService.list(filters);
      } else {
        data = await fduService.publicList(filters);
      }
      
      // Se houver um limite, aplica-o
      if (limit && data.length > limit) {
        data = data.slice(0, limit);
      }
      
      setFdus(data);
    } catch (error) {
      console.error('Erro ao carregar FDUs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta FDU?')) {
      try {
        await fduService.delete(id);
        loadFDUs();
      } catch (error) {
        console.error('Erro ao excluir FDU:', error);
      }
    }
  };

  const handleEdit = (id: string) => {
    window.location.href = `/fdu/editar/${id}`;
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadFDUs();
  };

  const applyFilters = () => {
    loadFDUs();
    setFilters({
      produto: '',
      fabricante: '',
      setor: '',
      tipoRisco: ''
    });
  };

  return (
    <div className="space-y-6">
      {showFilters && (
        <div className="bg-gray-900/70 border border-gray-800 rounded-xl p-5 overflow-hidden">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-white flex items-center gap-2">
              <HiFilter className="text-blue-400" /> Filtros
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
                    onClick={applyFilters}
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
      )}

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-12 h-12 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
        </div>
      ) : fdus.length === 0 ? (
        <div className="bg-gray-900/70 border border-gray-800 rounded-xl p-8 text-center">
          <h3 className="text-xl text-gray-400">Nenhuma FDU encontrada</h3>
          <p className="text-gray-500 mt-2">Tente ajustar os filtros ou cadastre novas FDUs.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {fdus.map((fdu) => (
            <FDUCard
              key={fdu.id}
              fdu={fdu}
              isAdmin={isAdmin}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default FDUList;
