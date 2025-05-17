'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { fichaEmergenciaService } from '../services/fichaEmergenciaService';
import { FichaEmergencia, FichaEmergenciaFilter } from '../types/fichaEmergencia';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabaseClient';
import { 
  HiArrowLeft, 
  HiShieldExclamation, 
  HiUpload, 
  HiX, 
  HiCheck, 
  HiExclamation, 
  HiOfficeBuilding, 
  HiTag,
  HiCalendar,
  HiUserCircle,
  HiIdentification,
  HiSearch,
  HiFilter,
  HiChevronLeft,
  HiDownload,
  HiPencil,
  HiTrash,
  HiViewList,
  HiPlus,
  HiDocumentAdd
} from 'react-icons/hi';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export default function FichasEmergenciaPage() {
  const router = useRouter();
  
  // Estados de usuário e autenticação
  const [user, setUser] = useState<any>(null);
  
  // Estados do formulário
  const [formData, setFormData] = useState({
    nome: '',
    produto: '',
    numeroOnu: '',
    classeRisco: '',
    setor: '',
    validade: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // Um ano a partir de hoje
    arquivoUrl: '',
    arquivo: null as File | null
  });
  const [filePreview, setFilePreview] = useState<string | null>(null);
  
  // Estados de feedback
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Estados de listagem
  const [fichas, setFichas] = useState<FichaEmergencia[]>([]);
  const [filtros, setFiltros] = useState<FichaEmergenciaFilter>({});
  const [fetching, setFetching] = useState(false);
  
  // Estados de visualização
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState<"cadastro" | "consulta">("consulta");
  
  // Estados para edição e exclusão
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteItemName, setDeleteItemName] = useState('');
    // Lista de classes de risco comuns para transporte de produtos perigosos
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
      
      // Lista de setores predefinidos
      const setores = [
        'Pesquisa e Desenvolvimento',
        'Injetoras',
        'Ferramentaria',
        'Controle da Qualidade',
        'Point Matic',
        'Montagem 1 (M1)',
        'Montagem 2 (M2)',
        'Almoxarifado 1 (ALM 1)',
        'Almoxarifado 2 (ALM 2)',
        'Depósito de Produtos Acabados (DPA)'
      ];
    
      // Verificar autenticação ao carregar a página
      useEffect(() => {
        checkUser();
      }, []);
      
      // Buscar fichas ao alterar filtros
      useEffect(() => {
        if (user) {
          fetchFichas();
        }
      }, [filtros, user]);
        // Função para verificar autenticação do usuário
  async function checkUser() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUser(session.user);
        // Verificar se o usuário é químico
        const { data } = await supabase
          .from('usuarios')
          .select('tipo_usuario')
          .eq('id', session.user.id)
          .single();
        
        if (data?.tipo_usuario !== 'quimico' && data?.tipo_usuario !== 'admin') {
          console.warn('Usuário não autorizado para área de químicos');
          router.push('/unauthorized');
        }
      } else {
        console.warn('Usuário não autenticado, redirecionando...');
        router.push('/login');
      }
    } catch (error) {
      console.error('Erro ao verificar usuário:', error);
    }
  }

  // Buscar Fichas de Emergência
  const fetchFichas = async () => {
    if (!user) return;
    
    setFetching(true);
    setError(null);
    try {
      const data = await fichaEmergenciaService.list(filtros);
      setFichas(data || []);
    } catch (e: any) {
      setError(`Erro ao buscar Fichas de Emergência: ${e.message}`);
    } finally {
      setFetching(false);
    }
  };

  // Cadastrar/Editar Ficha de Emergência
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Validações básicas
      if (!formData.nome) throw new Error('Nome da ficha é obrigatório');
      if (!formData.produto) throw new Error('Produto é obrigatório');
      if (!formData.setor) throw new Error('Setor é obrigatório');
      if (!formData.validade) throw new Error('Validade é obrigatória');

      // Se for cadastro, exige arquivo
      if (!isEditing && !formData.arquivo) {
        throw new Error('Arquivo PDF da Ficha de Emergência é obrigatório');
      }

      // Preparar dados para envio
      let fichaData = { ...formData };
      delete (fichaData as any).arquivo;

      // Upload do arquivo se houver um novo
      if (formData.arquivo) {
        const filename = `ficha_emergencia_${Date.now()}_${formData.arquivo.name.replace(/\s+/g, '_')}`;
        
        // Upload para o bucket 'fichas-emergencia'
        const { data, error: uploadError } = await supabase.storage
          .from('fichas-emergencia')
          .upload(filename, formData.arquivo);

        if (uploadError) throw new Error(`Erro no upload: ${uploadError.message}`);

        // Obter URL pública
        const { data: { publicUrl } } = supabase.storage
          .from('fichas-emergencia')
          .getPublicUrl(filename);

        fichaData.arquivoUrl = publicUrl;
      }

      // Salvar no banco de dados
      if (isEditing && editingId) {
        await fichaEmergenciaService.update(editingId, fichaData);
        setSuccess('Ficha de Emergência atualizada com sucesso!');
      } else {
        // O método create requer um File não nulo
        if (formData.arquivo) {
          await fichaEmergenciaService.create(fichaData, formData.arquivo);
          setSuccess('Ficha de Emergência cadastrada com sucesso!');
        } else {
          throw new Error('Arquivo PDF da Ficha de Emergência é obrigatório');
        }
      }

      // Limpar formulário e recarregar lista
      clearForm();
      fetchFichas();
      setActiveTab('consulta');
    } catch (e: any) {
      setError(`Erro ao ${isEditing ? 'atualizar' : 'cadastrar'} Ficha de Emergência: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Excluir Ficha de Emergência
  const handleDelete = async () => {
    if (!deleteId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      await fichaEmergenciaService.delete(deleteId);
      setSuccess('Ficha de Emergência excluída com sucesso!');
      setShowDeleteModal(false);
      fetchFichas();
    } catch (e: any) {
      setError(`Erro ao excluir Ficha de Emergência: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Confirmar exclusão
  const confirmDelete = (id: string, nome: string) => {
    setDeleteId(id);
    setDeleteItemName(nome);
    setShowDeleteModal(true);
  };
  
  // Cancelar exclusão
  const cancelDelete = () => {
    setDeleteId(null);
    setDeleteItemName('');
    setShowDeleteModal(false);
  };

  // Limpar formulário de cadastro
  const clearForm = () => {
    setFormData({
      nome: '',
      produto: '',
      numeroOnu: '',
      classeRisco: '',
      setor: '',
      validade: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      arquivoUrl: '',
      arquivo: null
    });
    setFilePreview(null);
    setEditingId(null);
    setIsEditing(false);
  };

  // Limpar filtros de busca
  const clearFilters = () => {
    setFiltros({});
    setShowFilters(false);
  };

  // Alternar exibição de filtros
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  // Manipular alterações nos filtros
  const handleFiltroChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFiltros(prev => ({ ...prev, [name]: value }));
  };

  // Iniciar edição de ficha
  const startEdit = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const ficha = await fichaEmergenciaService.getById(id);
      if (ficha) {
        setFormData({
          nome: ficha.nome,
          produto: ficha.produto,
          numeroOnu: ficha.numeroOnu || '',
          classeRisco: ficha.classeRisco || '',
          setor: ficha.setor || '',
          validade: ficha.validade instanceof Date ? ficha.validade : new Date(ficha.validade),
          arquivoUrl: ficha.arquivoUrl,
          arquivo: null
        });
        setEditingId(id);
        setIsEditing(true);
        setActiveTab("cadastro");
      }
    } catch (e: any) {
      setError(`Erro ao carregar dados para edição: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Trocar a aba ativa
  const changeTab = (tab: "cadastro" | "consulta") => {
    if (tab === "cadastro") {
      // Se mudar para cadastro, limpa o formulário se não estiver editando
      if (!isEditing) {
        clearForm();
      }
    } else {
      // Se mudar para consulta, recarrega os dados
      fetchFichas();
    }
    setActiveTab(tab);
  };

  // Handler para mudança de arquivos
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      setFormData(prev => ({ ...prev, arquivo: file }));
      
      // Criar preview para PDFs
      if (file.type === 'application/pdf') {
        const fileURL = URL.createObjectURL(file);
        setFilePreview(fileURL);
      } else {
        setError('Por favor, selecione apenas arquivos PDF.');
        setFormData(prev => ({ ...prev, arquivo: null }));
        setFilePreview(null);
      }
    }
  };

  // Handler para alterações no formulário
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handler para alterações na data
  const handleDateChange = (date: Date) => {
    setFormData(prev => ({ ...prev, validade: date }));
  };

  // Cancelar edição
  const cancelEdit = () => {
    clearForm();
    setIsEditing(false);
    setSuccess(null);
    setError(null);
  };

  // Renderização do componente
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Cabeçalho */}
      <header className="bg-indigo-700 text-white shadow-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Link href="/fispq" className="text-white hover:text-indigo-200 flex items-center">
                <HiArrowLeft className="mr-2" />
                Voltar
              </Link>
              <h1 className="text-2xl font-bold flex items-center">
                <HiShieldExclamation className="mr-2" />
                Fichas de Emergência
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Conteúdo principal */}
      <main className="flex-grow container mx-auto px-4 py-6">
        {/* Mensagens de Feedback */}
        {error && (
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="mb-4 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 flex items-center justify-between"
          >
            <span className="flex items-center"><HiExclamation className="mr-2" /> {error}</span>
            <button 
              onClick={() => setError(null)} 
              className="text-red-700 hover:text-red-900"
              aria-label="Fechar mensagem"
            >
              <HiX />
            </button>
          </motion.div>
        )}

        {success && (
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="mb-4 p-4 bg-green-100 border-l-4 border-green-500 text-green-700 flex items-center justify-between"
          >
            <span className="flex items-center"><HiCheck className="mr-2" /> {success}</span>
            <button 
              onClick={() => setSuccess(null)} 
              className="text-green-700 hover:text-green-900"
              aria-label="Fechar mensagem"
            >
              <HiX />
            </button>
          </motion.div>
        )}

        {/* Navegação entre abas */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            className={`py-2 px-4 font-medium ${activeTab === "cadastro" 
              ? "text-indigo-600 border-b-2 border-indigo-600" 
              : "text-gray-500 hover:text-indigo-500"}`}
            onClick={() => changeTab("cadastro")}
          >
            <span className="flex items-center">
              <HiDocumentAdd className="mr-2" />
              {isEditing ? "Editar Ficha" : "Nova Ficha"}
            </span>
          </button>
          <button
            className={`py-2 px-4 font-medium ${activeTab === "consulta" 
              ? "text-indigo-600 border-b-2 border-indigo-600" 
              : "text-gray-500 hover:text-indigo-500"}`}
            onClick={() => changeTab("consulta")}
          >
            <span className="flex items-center">
              <HiViewList className="mr-2" />
              Consultar Fichas
            </span>
          </button>
        </div>

        {/* Conteúdo baseado na aba selecionada */}
        {activeTab === "cadastro" ? (
          /* Formulário de Cadastro/Edição */
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="bg-white shadow-md rounded-lg p-6 mb-6"
          >
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <HiDocumentAdd className="mr-2 text-indigo-600" />
              {isEditing ? "Editar Ficha de Emergência" : "Nova Ficha de Emergência"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Nome da ficha */}
              <div>
                <label htmlFor="nome" className="block text-sm font-medium text-gray-700">Nome da Ficha</label>
                <input
                  type="text"
                  id="nome"
                  name="nome"
                  value={formData.nome}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="Ex: FE Solvente Orgânico"
                  required
                />
              </div>

              {/* Produto */}
              <div>
                <label htmlFor="produto" className="block text-sm font-medium text-gray-700">Produto</label>
                <input
                  type="text"
                  id="produto"
                  name="produto"
                  value={formData.produto}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="Ex: Acetona"
                  required
                />
              </div>

              {/* Número ONU e Classe de Risco */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="numeroOnu" className="block text-sm font-medium text-gray-700">Número ONU</label>
                  <input
                    type="text"
                    id="numeroOnu"
                    name="numeroOnu"
                    value={formData.numeroOnu}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    placeholder="Ex: 1090"
                  />
                </div>
                <div>
                  <label htmlFor="classeRisco" className="block text-sm font-medium text-gray-700">Classe de Risco</label>
                  <select
                    id="classeRisco"
                    name="classeRisco"
                    value={formData.classeRisco}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  >
                    <option value="">Selecione a classe</option>
                    {classesRisco.map((classe) => (
                      <option key={classe} value={classe}>{classe}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Setor e Validade */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="setor" className="block text-sm font-medium text-gray-700">Setor</label>
                  <select
                    id="setor"
                    name="setor"
                    value={formData.setor}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  >
                    <option value="">Selecione o setor</option>
                    {setores.map((setor) => (
                      <option key={setor} value={setor}>{setor}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="validade" className="block text-sm font-medium text-gray-700">Validade</label>
                  <input
                    type="date"
                    id="validade"
                    name="validade"
                    value={formData.validade.toISOString().split('T')[0]}
                    onChange={(e) => handleDateChange(new Date(e.target.value))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>

              {/* Upload de arquivo */}
              <div>
                <label htmlFor="arquivo" className="block text-sm font-medium text-gray-700">
                  Arquivo PDF da Ficha de Emergência {!isEditing && <span className="text-red-500">*</span>}
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    <HiUpload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label htmlFor="arquivo" className="relative cursor-pointer rounded-md font-medium text-indigo-600 hover:text-indigo-500">
                        <span>Selecione um arquivo</span>
                        <input 
                          id="arquivo" 
                          name="arquivo" 
                          type="file" 
                          className="sr-only" 
                          accept=".pdf"
                          onChange={handleFileChange}
                        />
                      </label>
                      <p className="pl-1">ou arraste e solte aqui</p>
                    </div>
                    <p className="text-xs text-gray-500">PDF até 10MB</p>
                  </div>
                </div>
                {formData.arquivoUrl && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">Arquivo atual: 
                      <a 
                        href={formData.arquivoUrl} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-indigo-600 hover:text-indigo-800 ml-1"
                      >
                        Visualizar
                      </a>
                    </p>
                  </div>
                )}
                {filePreview && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">Novo arquivo selecionado: 
                      <a 
                        href={filePreview} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-indigo-600 hover:text-indigo-800 ml-1"
                      >
                        Visualizar
                      </a>
                    </p>
                  </div>
                )}
              </div>

              {/* Botões */}
              <div className="flex justify-end space-x-3 pt-4">
                {isEditing && (
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    disabled={loading}
                  >
                    Cancelar
                  </button>
                )}
                <button
                  type="submit"
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Salvando...
                    </>
                  ) : isEditing ? 'Atualizar' : 'Cadastrar'}
                </button>
              </div>
            </form>
          </motion.div>
        ) : (
          /* Lista de Fichas */
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="space-y-4"
          >
            {/* Botões e filtros */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-2 md:space-y-0 mb-4">
              <button 
                onClick={() => changeTab("cadastro")} 
                className="flex items-center bg-indigo-600 text-white px-4 py-2 rounded-md shadow-sm hover:bg-indigo-700 transition-colors"
              >
                <HiPlus className="mr-2" />
                Nova Ficha
              </button>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={toggleFilters}
                  className="flex items-center bg-white px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <HiFilter className="mr-2" />
                  {showFilters ? 'Ocultar Filtros' : 'Filtros'}
                </button>
                {showFilters && (
                  <button 
                    onClick={clearFilters}
                    className="flex items-center bg-white px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    <HiX className="mr-2" />
                    Limpar Filtros
                  </button>
                )}
              </div>
            </div>

            {/* Filtros de busca */}
            {showFilters && (
              <div className="bg-white p-4 rounded-md shadow-md mb-4">
                <h3 className="text-lg font-medium mb-3">Filtros</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="filtro-nome" className="block text-sm font-medium text-gray-700">Nome da Ficha</label>
                    <input
                      type="text"
                      id="filtro-nome"
                      name="nome"
                      value={filtros.nome || ''}
                      onChange={handleFiltroChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      placeholder="Buscar por nome"
                    />
                  </div>
                  <div>
                    <label htmlFor="filtro-produto" className="block text-sm font-medium text-gray-700">Produto</label>
                    <input
                      type="text"
                      id="filtro-produto"
                      name="produto"
                      value={filtros.produto || ''}
                      onChange={handleFiltroChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      placeholder="Buscar por produto"
                    />
                  </div>
                  <div>
                    <label htmlFor="filtro-setor" className="block text-sm font-medium text-gray-700">Setor</label>
                    <select
                      id="filtro-setor"
                      name="setor"
                      value={filtros.setor || ''}
                      onChange={handleFiltroChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    >
                      <option value="">Todos os setores</option>
                      {setores.map((setor) => (
                        <option key={setor} value={setor}>{setor}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Tabela de Listagem */}
            <div className="bg-white overflow-hidden shadow-md rounded-lg">
              {fetching ? (
                <div className="p-6 text-center">
                  <svg className="animate-spin h-10 w-10 text-indigo-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <p className="mt-2 text-sm text-gray-500">Carregando fichas...</p>
                </div>
              ) : fichas.length === 0 ? (
                <div className="p-6 text-center">
                  <HiExclamation className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">Nenhuma ficha encontrada</p>
                  {Object.keys(filtros).length > 0 && (
                    <p className="text-sm text-gray-400 mt-1">
                      Tente remover alguns filtros ou cadastre uma nova ficha.
                    </p>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Nome / Produto
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Número ONU / Classe
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Setor
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Validade
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Ações
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {fichas.map((ficha) => {
                        // Calcular se a ficha está vencida ou prestes a vencer (30 dias)
                        const dataValidade = ficha.validade instanceof Date ? ficha.validade : new Date(ficha.validade);
                        const hoje = new Date();
                        const diasParaVencer = Math.floor((dataValidade.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
                        const statusClasse = diasParaVencer < 0 ? 'bg-red-100 text-red-800' : 
                                            diasParaVencer < 30 ? 'bg-yellow-100 text-yellow-800' : 
                                            'bg-green-100 text-green-800';
                        
                        return (
                          <tr key={ficha.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex flex-col">
                                <div className="text-sm font-medium text-gray-900">{ficha.nome}</div>
                                <div className="text-sm text-gray-500">{ficha.produto}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex flex-col">
                                {ficha.numeroOnu && (
                                  <div className="text-sm text-gray-900">ONU: {ficha.numeroOnu}</div>
                                )}
                                {ficha.classeRisco && (
                                  <div className="text-sm text-gray-500">{ficha.classeRisco}</div>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{ficha.setor}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 text-xs rounded-full ${statusClasse}`}>
                                {dataValidade.toLocaleDateString('pt-BR')}
                                {diasParaVencer < 0 ? ' (Vencida)' : 
                                 diasParaVencer < 30 ? ` (${diasParaVencer} dias)` : ''}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                              <a 
                                href={ficha.arquivoUrl} 
                                target="_blank" 
                                rel="noreferrer"
                                className="text-indigo-600 hover:text-indigo-900 inline-flex items-center"
                                title="Visualizar PDF"
                              >
                                <HiDownload className="mr-1" />
                                PDF
                              </a>
                              <button
                                onClick={() => startEdit(ficha.id)}
                                className="text-green-600 hover:text-green-900 inline-flex items-center ml-2"
                                title="Editar ficha"
                              >
                                <HiPencil className="mr-1" />
                                Editar
                              </button>
                              <button
                                onClick={() => confirmDelete(ficha.id, ficha.nome)}
                                className="text-red-600 hover:text-red-900 inline-flex items-center ml-2"
                                title="Excluir ficha"
                              >
                                <HiTrash className="mr-1" />
                                Excluir
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Modal de confirmação de exclusão */}
            {showDeleteModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 max-w-md w-full">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Confirmar Exclusão</h3>
                  <p className="text-gray-500 mb-4">Tem certeza que deseja excluir a ficha de emergência <strong>"{deleteItemName}"</strong>? Esta ação não pode ser desfeita.</p>
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={cancelDelete}
                      className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      disabled={loading}
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleDelete}
                      className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      disabled={loading}
                    >
                      {loading ? 'Processando...' : 'Excluir'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </main>

      {/* Rodapé */}
      <footer className="bg-gray-100 text-gray-600 py-4">
        <div className="container mx-auto px-4 text-center text-sm">
          © {new Date().getFullYear()} - Sistema de Gerenciamento de FISPQs
        </div>
      </footer>
    </div>
  );
}