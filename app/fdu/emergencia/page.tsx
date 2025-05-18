'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabaseClient';
import { fichaEmergenciaService } from '../services/fichaEmergenciaService';
import { FichaEmergencia, FichaEmergenciaFilter, FichaEmergenciaFormData } from '../types/fichaEmergencia';
import {
  HiChevronLeft,
  HiShieldExclamation,
  HiX,
  HiCheck,
  HiPlus,
  HiViewList,
  HiFilter,
  HiTrash,
  HiPencil,
  HiEye,
  HiDownload,
  HiTag,
  HiIdentification,
  HiExclamation,
  HiOfficeBuilding,
  HiCalendar,
  HiOutlineExclamation
} from 'react-icons/hi';

// Animações
const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemAnimation = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 15
    }
  }
};

// Componente de Consulta de Fichas
interface ConsultaFichasProps {
  fichas: FichaEmergencia[];
  loading: boolean;
  filtros: FichaEmergenciaFilter;
  showFilters: boolean;
  toggleFilters: () => void;
  handleFilterChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  clearFilters: () => void;
  startEdit: (id: string) => void;
  confirmDelete: (id: string, nome: string) => void;
  openViewModal: (url: string) => void;
  setores: string[];
  classesRisco: string[];
}

function ConsultaFichas({
  fichas,
  loading,
  filtros,
  showFilters,
  toggleFilters,
  handleFilterChange,
  clearFilters,
  startEdit,
  confirmDelete,
  openViewModal,
  setores,
  classesRisco
}: ConsultaFichasProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeIn}
      className="space-y-6"
    >
      {/* Painel de filtros e ações */}
      <div className="flex items-center justify-between">
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={toggleFilters}
            className={`flex items-center px-3 py-2 rounded-lg ${showFilters ? 'bg-blue-600/40 text-blue-300' : 'bg-blue-600/20 text-gray-300 hover:bg-blue-600/30'}`}
          >
            <HiFilter className="h-4 w-4 mr-2" />
            {showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
          </button>
        </div>
        <div>
          <span className="text-sm text-gray-400">
            Total: <span className="text-blue-400 font-medium">{fichas.length}</span> {fichas.length === 1 ? 'ficha' : 'fichas'}
          </span>
        </div>
      </div>
      
      {/* Painel de filtros */}
      {showFilters && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="border border-gray-700/60 rounded-lg bg-gray-800/50 p-4"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {/* Filtro por nome */}
            <div>
              <label htmlFor="filtro-nome" className="block text-sm font-medium text-gray-300 mb-1">
                Nome da Ficha
              </label>
              <input
                type="text"
                id="filtro-nome"
                name="nome"
                value={filtros.nome || ''}
                onChange={handleFilterChange}
                className="shadow-sm bg-gray-900/70 focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-700 rounded-md text-white"
                placeholder="Buscar por nome"
              />
            </div>
            
            {/* Filtro por produto */}
            <div>
              <label htmlFor="filtro-produto" className="block text-sm font-medium text-gray-300 mb-1">
                Produto
              </label>
              <input
                type="text"
                id="filtro-produto"
                name="produto"
                value={filtros.produto || ''}
                onChange={handleFilterChange}
                className="shadow-sm bg-gray-900/70 focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-700 rounded-md text-white"
                placeholder="Buscar por produto"
              />
            </div>
            
            {/* Filtro por Número ONU */}
            <div>
              <label htmlFor="filtro-numeroOnu" className="block text-sm font-medium text-gray-300 mb-1">
                Número ONU
              </label>
              <input
                type="text"
                id="filtro-numeroOnu"
                name="numeroOnu"
                value={filtros.numeroOnu || ''}
                onChange={handleFilterChange}
                className="shadow-sm bg-gray-900/70 focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-700 rounded-md text-white"
                placeholder="Ex: 1219"
              />
            </div>
            
            {/* Filtro por Classe de Risco */}
            <div>
              <label htmlFor="filtro-classeRisco" className="block text-sm font-medium text-gray-300 mb-1">
                Classe de Risco
              </label>
              <select
                id="filtro-classeRisco"
                name="classeRisco"
                value={filtros.classeRisco || ''}
                onChange={handleFilterChange}
                className="shadow-sm bg-gray-900/70 focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-700 rounded-md text-white"
              >
                <option value="">Todas as classes</option>
                {classesRisco.map((classe) => (
                  <option key={classe} value={classe}>
                    {classe}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Filtro por Setor */}
            <div>
              <label htmlFor="filtro-setor" className="block text-sm font-medium text-gray-300 mb-1">
                Setor
              </label>
              <select
                id="filtro-setor"
                name="setor"
                value={filtros.setor || ''}
                onChange={handleFilterChange}
                className="shadow-sm bg-gray-900/70 focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-700 rounded-md text-white"
              >
                <option value="">Todos os setores</option>
                {setores.map((setor) => (
                  <option key={setor} value={setor}>
                    {setor}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={clearFilters}
              className="flex items-center px-3 py-2 border border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-300 bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500"
            >
              <HiX className="mr-2 h-4 w-4" />
              Limpar Filtros
            </button>
          </div>
        </motion.div>
      )}
      
      {/* Lista de fichas */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-3 text-blue-400 font-medium">Carregando...</span>
        </div>
      ) : fichas.length > 0 ? (
        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {fichas.map((ficha) => (
            <motion.div 
              key={ficha.id} 
              variants={itemAnimation}
              className="bg-gray-800/50 border border-gray-700/80 rounded-lg overflow-hidden hover:bg-gray-800/80 transition-colors"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-medium text-white line-clamp-2">{ficha.nome}</h3>
                  
                  {/* Menu de opções */}
                  <div className="flex space-x-1">
                    <button 
                      onClick={() => openViewModal(ficha.arquivoUrl)}
                      className="p-1.5 text-blue-400 hover:bg-blue-900/30 rounded-full transition-colors"
                      title="Visualizar"
                    >
                      <HiEye className="h-5 w-5" />
                    </button>
                    <button 
                      onClick={() => startEdit(ficha.id)}
                      className="p-1.5 text-green-400 hover:bg-green-900/30 rounded-full transition-colors"
                      title="Editar"
                    >
                      <HiPencil className="h-5 w-5" />
                    </button>
                    <button 
                      onClick={() => confirmDelete(ficha.id, ficha.nome)}
                      className="p-1.5 text-red-400 hover:bg-red-900/30 rounded-full transition-colors"
                      title="Excluir"
                    >
                      <HiTrash className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm">
                  <p className="flex items-center text-gray-300">
                    <HiTag className="h-4 w-4 mr-2 text-blue-400" />
                    <span className="text-gray-400 font-medium">Produto:</span> 
                    <span className="ml-1">{ficha.produto}</span>
                  </p>
                  
                  {ficha.numeroOnu && (
                    <p className="flex items-center text-gray-300">
                      <HiIdentification className="h-4 w-4 mr-2 text-blue-400" />
                      <span className="text-gray-400 font-medium">Número ONU:</span> 
                      <span className="ml-1">{ficha.numeroOnu}</span>
                    </p>
                  )}
                  
                  {ficha.classeRisco && (
                    <p className="flex items-center text-gray-300">
                      <HiExclamation className="h-4 w-4 mr-2 text-blue-400" />
                      <span className="text-gray-400 font-medium">Classe de Risco:</span> 
                      <span className="ml-1">{ficha.classeRisco}</span>
                    </p>
                  )}
                  
                  {ficha.setor && (
                    <p className="flex items-center text-gray-300">
                      <HiOfficeBuilding className="h-4 w-4 mr-2 text-blue-400" />
                      <span className="text-gray-400 font-medium">Setor:</span> 
                      <span className="ml-1">{ficha.setor}</span>
                    </p>
                  )}
                  
                  <p className="flex items-center text-gray-300">
                    <HiCalendar className="h-4 w-4 mr-2 text-blue-400" />
                    <span className="text-gray-400 font-medium">Validade:</span>
                    <span className="ml-1">
                      {ficha.validade instanceof Date 
                      ? ficha.validade.toLocaleDateString('pt-BR')
                      : new Date(ficha.validade).toLocaleDateString('pt-BR')}
                    </span>
                  </p>
                </div>
                
                <div className="mt-4 flex justify-end">
                  <a 
                    href={ficha.arquivoUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500"
                  >
                    <HiDownload className="mr-2 h-4 w-4" />
                    Baixar
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <div className="bg-gray-800/50 border border-gray-700/80 rounded-lg p-8 text-center">
          <HiOutlineExclamation className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-200">Nenhuma ficha de emergência encontrada</h3>
          <p className="text-gray-400 mt-1 mb-4">Cadastre novas fichas ou ajuste seus filtros de busca</p>
        </div>
      )}
    </motion.div>
  );
}

// Modal de Visualização de PDF
interface ViewPdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileUrl: string | null;
}

function ViewPdfModal({ isOpen, onClose, fileUrl }: ViewPdfModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-900 opacity-75"></div>
        </div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div 
          className="inline-block align-bottom rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full"
        >
          <div className="bg-gray-800 border border-gray-700 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg leading-6 font-medium text-white">Visualizar Documento</h3>
                  <button
                    type="button"
                    className="bg-gray-700 rounded-md text-gray-400 hover:text-white focus:outline-none"
                    onClick={onClose}
                  >
                    <span className="sr-only">Fechar</span>
                    <HiX className="h-6 w-6" />
                  </button>
                </div>
                <div className="mt-2 bg-gray-700 rounded-lg overflow-hidden">
                  {fileUrl ? (
                    <iframe 
                      src={fileUrl} 
                      className="w-full h-[70vh]" 
                      title="PDF Preview"
                    />
                  ) : (
                    <div className="p-4 text-center text-gray-300">
                      <p>Não foi possível carregar o documento.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FichasEmergenciaPage() {
  const router = useRouter();
  
  // Estados
  const [activeTab, setActiveTab] = useState<'cadastro' | 'consulta'>('consulta');
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Estados para gerenciamento de fichas
  const [fichas, setFichas] = useState<FichaEmergencia[]>([]);
  const [filtros, setFiltros] = useState<FichaEmergenciaFilter>({});
  const [showFilters, setShowFilters] = useState(false);
  
  // Estado para visualização de PDF
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  
  // Dados para seletores
  const setores = [
    'Produção',
    'Laboratório',
    'Almoxarifado',
    'Expedição',
    'Transporte'
  ];
  
  const classesRisco = [
    'Classe 1 - Explosivos',
    'Classe 2 - Gases',
    'Classe 3 - Líquidos Inflamáveis',
    'Classe 4 - Sólidos Inflamáveis',
    'Classe 5 - Substâncias Oxidantes',
    'Classe 6 - Substâncias Tóxicas',
    'Classe 7 - Materiais Radioativos',
    'Classe 8 - Substâncias Corrosivas', 
    'Classe 9 - Substâncias Perigosas Diversas'
  ];

  // Verificar autenticação ao carregar a página
  useEffect(() => {
    async function checkUser() {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
    }
    checkUser();
  }, []);

  // Buscar fichas ao carregar a página ou mudar filtros
  useEffect(() => {
    if (user) {
      fetchFichas();
    }
  }, [filtros, user]);
  
  // Função para buscar fichas de emergência
  async function fetchFichas() {
    setLoading(true);
    try {
      const data = await fichaEmergenciaService.list(filtros);
      setFichas(data);
    } catch (error: any) {
      setError(`Erro ao buscar fichas de emergência: ${error.message}`);
      console.error("Erro ao buscar fichas de emergência:", error);
    } finally {
      setLoading(false);
    }
  }
  
  // Função para abrir modal de visualização
  const openViewModal = (url: string) => {
    setSelectedFile(url);
    setIsViewModalOpen(true);
  };

  // Função para alternar exibição de filtros
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };
  
  // Função para lidar com mudanças nos filtros
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFiltros(prev => ({ ...prev, [name]: value }));
  };
  
  // Função para limpar filtros
  const clearFilters = () => {
    setFiltros({});
    setShowFilters(false);
  };

  // Função temporária para edição (será implementada completamente depois)
  const startEdit = (id: string) => {
    setError("Função de edição será implementada em breve.");
  };

  // Função temporária para exclusão (será implementada completamente depois)
  const confirmDelete = (id: string, nome: string) => {
    setError("Função de exclusão será implementada em breve.");
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      {/* Header com botão de voltar */}
      <div className="bg-gray-800/80 backdrop-blur-lg border-b border-gray-700 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link 
            href="/fdu" 
            className="flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors"
          >
            <HiChevronLeft className="text-xl" />
            <span>Voltar ao Dashboard</span>
          </Link>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setActiveTab(activeTab === "cadastro" ? "consulta" : "cadastro")}
              className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg transition-colors ${activeTab === "cadastro" ? "bg-blue-600/20 text-blue-300" : "bg-blue-600/10 text-gray-300 hover:bg-blue-600/20 hover:text-blue-300"}`}
            >
              {activeTab === "cadastro" ? (
                <>
                  <HiViewList className="text-lg" />
                  <span>Ver Consulta</span>
                </>
              ) : (
                <>
                  <HiPlus className="text-lg" />
                  <span>Novo Cadastro</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col space-y-6">
          {/* Área de alerta para mensagens */}
          {(error || success) && (
            <motion.div 
              initial="hidden"
              animate="visible"
              variants={fadeIn}
              className={`p-4 rounded-lg ${error ? 'bg-red-900/30 border border-red-700' : 'bg-green-900/30 border border-green-700'}`}
            >
              <div className="flex items-center space-x-3">
                {error ? (
                  <div className="p-2 rounded-full bg-red-500/20">
                    <HiX className="text-xl text-red-400" />
                  </div>
                ) : (
                  <div className="p-2 rounded-full bg-green-500/20">
                    <HiCheck className="text-xl text-green-400" />
                  </div>
                )}
                <p className={error ? "text-red-300" : "text-green-300"}>
                  {error || success}
                </p>
                <button 
                  onClick={() => error ? setError(null) : setSuccess(null)}
                  className={`ml-auto p-1 rounded-full ${error ? 'hover:bg-red-800/50' : 'hover:bg-green-800/50'}`}
                >
                  <HiX className="text-lg" />
                </button>
              </div>
            </motion.div>
          )}

          {/* Título da Página */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="flex items-center space-x-3 mb-6"
          >
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <HiShieldExclamation className="text-2xl text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-white">
                {activeTab === "cadastro" ? "Nova" : "Gerenciar"} Ficha de Emergência
              </h1>
              <p className="text-gray-400 text-sm">
                {activeTab === "cadastro"
                  ? "Cadastre uma nova ficha de emergência no sistema"
                  : "Consulte e gerencie as fichas de emergência cadastradas"}
              </p>
            </div>
          </motion.div>
        
          {/* Conteúdo da aba ativa */}
          <div className="pb-6">
            {activeTab === 'cadastro' ? (
              <div className="bg-gray-800/50 border border-gray-700/80 rounded-lg p-6">
                <p className="text-gray-300">Formulário de cadastro será implementado aqui.</p>
              </div>
            ) : (
              <ConsultaFichas 
                fichas={fichas}
                loading={loading}
                filtros={filtros}
                showFilters={showFilters}
                toggleFilters={toggleFilters}
                handleFilterChange={handleFilterChange}
                clearFilters={clearFilters}
                startEdit={startEdit}
                confirmDelete={confirmDelete}
                openViewModal={openViewModal}
                setores={setores}
                classesRisco={classesRisco}
              />
            )}
          </div>
        </div>
      </div>

      {/* Modal de visualização */}
      <ViewPdfModal 
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        fileUrl={selectedFile}
      />

      {/* Rodapé */}
      <footer className="bg-gray-800 text-gray-400 py-4 mt-auto border-t border-gray-700">
        <div className="container mx-auto px-4 text-center text-sm">
          {new Date().getFullYear()} - Sistema de Gerenciamento de FDUs
        </div>
      </footer>
    </div>
  );
}
