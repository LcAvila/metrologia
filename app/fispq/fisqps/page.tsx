"use client";
import React, { useState, useEffect } from "react";
import { fispqService } from "../services/fispqService";
import { FISPQ, FISPQFilter } from "../types/fispq";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { TextField, Button, MenuItem, CircularProgress, IconButton } from "@mui/material";
import DatePicker from "../../components/DatePicker";
import InputFileUpload from "../../components/InputFileUpload";
import VisualizarPdf from "../../components/VisualizarPdf";
import { HiDocumentAdd, HiSearch, HiChevronLeft, HiDownload, HiFilter, HiX, HiViewList, HiPlus, HiUpload, HiPencil, HiTrash } from "react-icons/hi";

const setores = ["Laboratório", "Produção", "Qualidade", "Segurança", "Outros"];
const tiposRisco = ["Inflamável", "Tóxico", "Corrosivo", "Explosivo", "Outros"];

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

type FISPQForm = Omit<FISPQ, 'id' | 'criadoEm' | 'validade'> & { validade: string; arquivo?: File | null };

export default function FispqsPage() {
  const router = useRouter();
  
  // Estados do Formulário
  const [form, setForm] = useState<Partial<FISPQForm>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  
  // Estados de Listagem
  const [fispqs, setFispqs] = useState<FISPQ[]>([]);
  const [filtros, setFiltros] = useState<FISPQFilter>({});
  const [fetching, setFetching] = useState(false);
  
  // Estado de visualização
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState<"cadastro" | "consulta">("consulta");
  
  // Estados para edição e exclusão
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteItemName, setDeleteItemName] = useState('');

  // Buscar FISPQs
  const fetchFispqs = async () => {
    setFetching(true);
    setError(null);
    try {
      const data = await fispqService.list(filtros);
      setFispqs(data || []);
    } catch (e: any) {
      setError(`Erro ao buscar FISPQs: ${e.message}`);
    } finally {
      setFetching(false);
    }
  };
  
  useEffect(() => { 
    fetchFispqs(); 
  }, [filtros]);
  
  // Limpar filtros
  const clearFilters = () => {
    setFiltros({});
  };

  // Manipuladores de formulário
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setError(null);
    setSuccess(null);
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Verificar se é um PDF
      if (file.type !== 'application/pdf') {
        setError('Por favor, selecione apenas arquivos PDF.');
        return;
      }
      
      // Verificar tamanho (máx. 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('O arquivo é muito grande. O tamanho máximo permitido é 10MB.');
        return;
      }
      
      // Criar URL para visualização do PDF
      const fileURL = URL.createObjectURL(file);
      setFilePreview(fileURL);
      
      setForm({ ...form, arquivo: file });
    }
  };
  
  const handleDateChange = (date: string) => {
    setError(null);
    setSuccess(null);
    // Garante sempre string ou vazio
    setForm({ ...form, validade: typeof date === 'string' ? date : '' });
  };
  
  const clearForm = () => {
    setForm({});
    setError(null);
    setSuccess(null);
    setFilePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Se estiver no modo de edição, chamar a função de atualização
    if (isEditing && editingId) {
      await handleUpdate(e);
      return;
    }
    
    // Se não estiver no modo de edição, continuar com a criação
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      if (!form.produto || !form.fabricante || !form.setor || !form.validade || !form.arquivo) {
        setError("Preencha todos os campos obrigatórios.");
        setLoading(false);
        return;
      }
      
      await fispqService.create({
        produto: form.produto,
        fabricante: form.fabricante,
        numeroCas: form.numeroCas,
        setor: form.setor,
        tipoRisco: form.tipoRisco,
        validade: new Date(form.validade!),
        arquivoUrl: "",
      }, form.arquivo!);
      
      setSuccess("FISPQ cadastrada com sucesso!");
      setForm({});
      setFilePreview(null);
      
      // Redirecionar após 2 segundos
      setTimeout(() => {
        setActiveTab("consulta");
        fetchFispqs();
        setSuccess(null);
      }, 2000);
    } catch (e: any) {
      setError(`Erro ao cadastrar: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Filtros
  const handleFiltroChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFiltros({ ...filtros, [e.target.name]: e.target.value });
  };
  
  // Controlar visualização de abas
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };
  
  const changeTab = (tab: "cadastro" | "consulta") => {
    setActiveTab(tab);
    if (tab === "consulta") {
      fetchFispqs();
    }
    // Limpar modo de edição ao trocar de aba
    if (isEditing) {
      setIsEditing(false);
      setEditingId(null);
      clearForm();
    }
  };
  
  // Funções para manipular edição
  const startEdit = async (id: string) => {
    setError(null);
    setSuccess(null);
    setLoading(true);
    
    try {
      const fispq = await fispqService.getById(id);
      if (fispq) {
        setForm({
          produto: fispq.produto,
          fabricante: fispq.fabricante,
          numeroCas: fispq.numeroCas,
          setor: fispq.setor,
          tipoRisco: fispq.tipoRisco,
          validade: typeof fispq.validade === 'string' 
            ? fispq.validade.substring(0, 10) 
            : new Date(fispq.validade).toISOString().substring(0, 10)
        });
        setEditingId(id);
        setIsEditing(true);
        setActiveTab("cadastro");
      } else {
        setError("FISPQ não encontrada");
      }
    } catch (e: any) {
      setError(`Erro ao carregar dados para edição: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  const cancelEdit = () => {
    setIsEditing(false);
    setEditingId(null);
    clearForm();
  };
  
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      if (!form.produto || !form.fabricante || !form.setor || !form.validade) {
        setError("Preencha todos os campos obrigatórios.");
        setLoading(false);
        return;
      }
      
      if (!editingId) {
        setError("ID de edição não encontrado");
        setLoading(false);
        return;
      }
      
      await fispqService.update(
        editingId,
        {
          produto: form.produto,
          fabricante: form.fabricante,
          numeroCas: form.numeroCas,
          setor: form.setor,
          tipoRisco: form.tipoRisco,
          validade: new Date(form.validade!),
        },
        form.arquivo || undefined
      );
      
      setSuccess("FISPQ atualizada com sucesso!");
      setForm({});
      setFilePreview(null);
      setIsEditing(false);
      setEditingId(null);
      
      // Redirecionar após 2 segundos
      setTimeout(() => {
        setActiveTab("consulta");
        fetchFispqs();
        setSuccess(null);
      }, 2000);
    } catch (e: any) {
      setError(`Erro ao atualizar: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Funções para manipular exclusão
  const startDelete = (id: string, nome: string) => {
    setDeleteId(id);
    setDeleteItemName(nome);
    setShowDeleteModal(true);
  };
  
  const cancelDelete = () => {
    setDeleteId(null);
    setDeleteItemName('');
    setShowDeleteModal(false);
  };
  
  const confirmDelete = async () => {
    if (!deleteId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      await fispqService.delete(deleteId);
      setSuccess("FISPQ excluída com sucesso!");
      fetchFispqs();
      cancelDelete();
      
      // Limpar mensagem de sucesso após 3 segundos
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (e: any) {
      setError(`Erro ao excluir: ${e.message}`);
      cancelDelete();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      {/* Header com botão de voltar */}
      <div className="bg-gray-800/80 backdrop-blur-lg border-b border-gray-700 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link 
            href="/fispq" 
            className="flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors"
          >
            <HiChevronLeft className="text-xl" />
            <span>Voltar ao Dashboard</span>
          </Link>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={() => changeTab(activeTab === "cadastro" ? "consulta" : "cadastro")}
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
                    <HiDocumentAdd className="text-xl text-green-400" />
                  </div>
                )}
                <p className={error ? 'text-red-300' : 'text-green-300'}>{error || success}</p>
              </div>
            </motion.div>
          )}
          
          {activeTab === "cadastro" ? (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeIn}
              className="flex flex-col space-y-6"
            >
              {/* Cabeçalho do formulário */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-blue-600/20 rounded-xl">
                    {isEditing ? (
                      <HiPencil className="text-3xl text-blue-400" />
                    ) : (
                      <HiDocumentAdd className="text-3xl text-blue-400" />
                    )}
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-white">
                      {isEditing ? 'Editar FISPQ' : 'Cadastro de FISPQ'}
                    </h1>
                    <p className="text-gray-400">
                      {isEditing 
                        ? `Editando: ${form.produto || ''}` 
                        : 'Preencha os dados para cadastrar uma nova FISPQ'}
                    </p>
                  </div>
                </div>
                
                {isEditing && (
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg flex items-center space-x-2"
                  >
                    <HiX className="text-lg" />
                    <span>Cancelar edição</span>
                  </button>
                )}
              </div>
              
              {/* Formulário de cadastro com novo estilo */}
              <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 shadow-lg">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Campos principais */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-300">Produto</label>
                        <input
                          type="text"
                          name="produto"
                          value={form.produto || ''}
                          onChange={handleChange}
                          className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>
      
                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-300">Fabricante</label>
                        <input
                          type="text"
                          name="fabricante"
                          value={form.fabricante || ''}
                          onChange={handleChange}
                          className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>
      
                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-300">
                          Número CAS <span className="text-xs text-gray-400">(opcional)</span>
                        </label>
                        <input
                          type="text"
                          name="numeroCas"
                          value={form.numeroCas || ''}
                          onChange={handleChange}
                          className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-300">Setor</label>
                        <select
                          name="setor"
                          value={form.setor || ''}
                          onChange={handleChange}
                          className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        >
                          <option value="" disabled>Selecione um setor</option>
                          {setores.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
      
                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-300">
                          Tipo de Risco <span className="text-xs text-gray-400">(opcional)</span>
                        </label>
                        <select
                          name="tipoRisco"
                          value={form.tipoRisco || ''}
                          onChange={handleChange}
                          className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">Nenhum</option>
                          {tiposRisco.map((t) => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </div>
      
                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-300">Validade</label>
                        <input
                          type="date"
                          name="validade"
                          value={typeof form.validade === 'string' ? form.validade.substring(0, 10) : ''}
                          onChange={(e) => handleDateChange(e.target.value)}
                          className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Área de upload */}
                  <div className="mt-6">
                    <div className="border-t border-gray-700 pt-6">
                      <label className="block text-sm font-medium mb-4 text-gray-300">Arquivo da FISPQ</label>
                      
                      {filePreview ? (
                        <div className="border border-gray-600 rounded-lg p-4 bg-gray-800">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <div className="p-2 bg-blue-500/20 rounded-lg">
                                <HiDocumentAdd className="text-xl text-blue-400" />
                              </div>
                              <span className="text-sm text-gray-300 truncate max-w-md">{form.arquivo?.name}</span>
                            </div>
                            <button 
                              type="button" 
                              onClick={() => { setFilePreview(null); setForm({...form, arquivo: null}); }}
                              className="text-gray-400 hover:text-gray-200"
                            >
                              <HiX className="text-xl" />
                            </button>
                          </div>
                          
                          <div className="relative pt-[56.25%] bg-gray-900 rounded overflow-hidden">
                            <iframe 
                              src={filePreview} 
                              className="absolute inset-0 w-full h-full" 
                              title="Visualização do PDF"
                            />
                          </div>
                        </div>
                      ) : (
                        <div 
                          className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 transition-colors"
                          onClick={() => document.getElementById('file-upload')?.click()}
                        >
                          <HiUpload className="text-3xl text-blue-400 mb-2 mx-auto" />
                          <p className="text-sm text-gray-300 mb-1">Clique ou arraste para fazer upload</p>
                          <p className="text-xs text-gray-400">Somente arquivos PDF (máx. 10MB)</p>
                          <input
                            id="file-upload"
                            type="file"
                            accept="application/pdf"
                            onChange={handleFileChange}
                            className="hidden"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Botões de ação */}
                  <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-700">
                    <button
                      type="button"
                      onClick={isEditing ? cancelEdit : clearForm}
                      className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-gray-300 transition-colors"
                    >
                      {isEditing ? 'Cancelar' : 'Limpar'}
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className={`px-6 py-2 rounded-lg text-white font-medium transition-colors flex items-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed ${isEditing ? 'bg-green-600 hover:bg-green-500' : 'bg-blue-600 hover:bg-blue-500'}`}
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>Processando...</span>
                        </>
                      ) : isEditing ? (
                        <>
                          <HiPencil className="text-lg" />
                          <span>Atualizar FISPQ</span>
                        </>
                      ) : (
                        <>
                          <HiDocumentAdd className="text-lg" />
                          <span>Cadastrar FISPQ</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              initial="hidden"
              animate="visible"
              variants={fadeIn}
              className="flex flex-col space-y-6"
            >
              {/* Cabeçalho da consulta */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-blue-600/20 rounded-xl">
                    <HiSearch className="text-3xl text-blue-400" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-white">Consulta de FISPQs</h1>
                    <p className="text-gray-400">Visualize e filtre as FISPQs cadastradas</p>
                  </div>
                </div>
                <button
                  onClick={toggleFilters}
                  className="flex items-center space-x-2 px-3 py-2 bg-gray-700/50 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <HiFilter className="text-blue-400" />
                  <span>{showFilters ? "Ocultar Filtros" : "Mostrar Filtros"}</span>
                </button>
              </div>
              
              {/* Área de filtros */}
              {showFilters && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 shadow-lg"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-medium text-gray-300">Filtros</h2>
                    <button 
                      onClick={clearFilters}
                      className="text-sm text-gray-400 hover:text-blue-400 transition-colors"
                    >
                      Limpar filtros
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-300">Produto</label>
                      <input
                        type="text"
                        name="produto"
                        value={filtros.produto || ''}
                        onChange={handleFiltroChange}
                        className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-300">Fabricante</label>
                      <input
                        type="text"
                        name="fabricante"
                        value={filtros.fabricante || ''}
                        onChange={handleFiltroChange}
                        className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-300">Setor</label>
                      <select
                        name="setor"
                        value={filtros.setor || ''}
                        onChange={handleFiltroChange}
                        className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Todos</option>
                        {setores.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-300">Número CAS</label>
                      <input
                        type="text"
                        name="numeroCas"
                        value={filtros.numeroCas || ''}
                        onChange={handleFiltroChange}
                        className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
              
              {/* Tabela de FISPQs */}
              <div className="bg-gray-800/50 border border-gray-700 rounded-xl shadow-lg">
                {fetching ? (
                  <div className="p-12 flex justify-center items-center">
                    <div className="flex flex-col items-center">
                      <svg className="animate-spin h-10 w-10 text-blue-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <p className="text-gray-400">Carregando FISPQs...</p>
                    </div>
                  </div>
                ) : (
                  fispqs.length === 0 ? (
                    <div className="p-12 flex justify-center items-center">
                      <div className="text-center">
                        <HiSearch className="text-5xl text-gray-600 mx-auto mb-4" />
                        <h3 className="text-xl font-medium text-gray-400 mb-2">Nenhum registro encontrado</h3>
                        <p className="text-gray-500">Tente ajustar os filtros ou cadastre uma nova FISPQ</p>
                      </div>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full">
                        <thead>
                          <tr className="border-b border-gray-700 bg-gray-800/80">
                            <th className="p-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Produto</th>
                            <th className="p-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Fabricante</th>
                            <th className="p-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">CAS</th>
                            <th className="p-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Setor</th>
                            <th className="p-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Tipo de Risco</th>
                            <th className="p-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Validade</th>
                            <th className="p-4 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">PDF</th>
                            <th className="p-4 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">Ações</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                          {fispqs.map((f) => (
                            <tr key={f.id} className="hover:bg-gray-700/40 transition-colors">
                              <td className="p-4 whitespace-nowrap">
                                <div className="font-medium text-white">{f.produto}</div>
                              </td>
                              <td className="p-4 whitespace-nowrap text-gray-300">{f.fabricante}</td>
                              <td className="p-4 whitespace-nowrap text-gray-300">{f.numeroCas || '-'}</td>
                              <td className="p-4 whitespace-nowrap">
                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-900/30 text-blue-300">
                                  {f.setor}
                                </span>
                              </td>
                              <td className="p-4 whitespace-nowrap">
                                {f.tipoRisco ? (
                                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-900/30 text-yellow-300">
                                    {f.tipoRisco}
                                  </span>
                                ) : '-'}
                              </td>
                              <td className="p-4 whitespace-nowrap text-gray-300">
                                {new Date(f.validade).toLocaleDateString()}
                              </td>
                              <td className="p-4 whitespace-nowrap text-center">
                                {f.arquivoUrl ? (
                                  <a 
                                    href={f.arquivoUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center justify-center p-2 rounded-full bg-blue-900/30 text-blue-400 hover:bg-blue-900/50 transition-colors"
                                    title="Baixar PDF"
                                  >
                                    <HiDownload className="text-xl" />
                                  </a>
                                ) : '-'}
                              </td>
                              <td className="p-4 whitespace-nowrap">
                                <div className="flex items-center justify-center space-x-2">
                                  <button
                                    onClick={() => startEdit(f.id)}
                                    className="p-2 rounded-full bg-green-900/30 text-green-400 hover:bg-green-900/50 transition-colors"
                                    title="Editar FISPQ"
                                  >
                                    <HiPencil className="text-lg" />
                                  </button>
                                  <button
                                    onClick={() => startDelete(f.id, f.produto)}
                                    className="p-2 rounded-full bg-red-900/30 text-red-400 hover:bg-red-900/50 transition-colors"
                                    title="Excluir FISPQ"
                                  >
                                    <HiTrash className="text-lg" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )
                )}
              </div>
            </motion.div>
          )}
        </div>
      </div>
      {/* Modal de confirmação de exclusão */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div 
            className="bg-gray-800 border border-gray-700 rounded-xl p-6 max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center space-x-4 mb-5">
              <div className="p-3 bg-red-900/30 rounded-full">
                <HiTrash className="text-2xl text-red-400" />
              </div>
              <h3 className="text-xl font-semibold text-white">Confirmar exclusão</h3>
            </div>
            
            <p className="text-gray-300 mb-2">Tem certeza que deseja excluir a FISPQ:</p>
            <p className="text-white font-medium mb-6 p-2 bg-gray-700/50 rounded border border-gray-600">{deleteItemName}</p>
            
            <div className="border-t border-gray-700 pt-5 flex justify-end space-x-3">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors flex items-center space-x-2"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Processando...</span>
                  </>
                ) : (
                  <>
                    <HiTrash className="text-lg" />
                    <span>Excluir</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
