"use client";
import React, { useState, useEffect } from "react";
import { fichaEmergenciaService } from "../services/fichaEmergenciaService";
import { FichaEmergencia, FichaEmergenciaFilter } from "../types/fichaEmergencia";
import InputFileUpload from "../../components/InputFileUpload";
import DatePicker from "../../components/DatePicker";
import { TextField, Button, MenuItem, CircularProgress, IconButton, Alert, Snackbar, Chip } from "@mui/material";
import { HiDownload, HiEye, HiRefresh, HiExclamationCircle, HiSearch } from "react-icons/hi";
import { formatarData, calcularStatusData } from "../../utils/formatters";
import VisualizarPdf from "../../components/VisualizarPdf";
import { FichaEmergenciaStatistics } from '../types/fichaEmergencia';

const setores = ["Laboratório", "Produção", "Qualidade", "Segurança", "Outros"];
const tiposRisco = ["Inflamável", "Tóxico", "Corrosivo", "Explosivo", "Outros"];

import Layout from '../../components/Layout';

export default function EmergenciaPage() {
  // Formulário com estado inicial adequado
  const [form, setForm] = useState<Omit<FichaEmergencia, 'id' | 'criadoEm' | 'arquivoUrl'> & { arquivo?: File }>({
    nome: '',
    produto: '',
    numeroOnu: '',
    classeRisco: '',
    validade: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  // Listagem
  const [fichas, setFichas] = useState<FichaEmergencia[]>([]);
  const [filtros, setFiltros] = useState<FichaEmergenciaFilter>({});
  const [fetching, setFetching] = useState(false);
  
  // Estatísticas
  const [stats, setStats] = useState<FichaEmergenciaStatistics>({
    total: 0,
    setores: 0,
    expirando: 0,
    vencidas: 0,
    classesRisco: 0
  });
  
  // Modal de visualização de PDF
  const [selectedPdf, setSelectedPdf] = useState<string | null>(null);
  const [showPdf, setShowPdf] = useState(false);
  
  // Estado do tipo de arquivo
  const [uploadFileName, setUploadFileName] = useState<string>('');

  // Buscar fichas e estatísticas
  const fetchFichas = async () => {
    setFetching(true);
    try {
      const data = await fichaEmergenciaService.list(filtros);
      setFichas(data || []);
    } catch (e: any) {
      console.error('Erro ao buscar fichas:', e);
      setError('Não foi possível carregar as fichas. Tente novamente mais tarde.');
    } finally {
      setFetching(false);
    }
  };
  
  const loadStats = async () => {
    try {
      const statsData = await fichaEmergenciaService.getStatistics();
      // Completar os campos ausentes conforme a interface FichaEmergenciaStatistics
      setStats({
        total: statsData.total || 0,
        setores: 0, // Campo ausente no retorno do serviço
        expirando: statsData.expirando || 0,
        vencidas: 0, // Campo ausente no retorno do serviço
        classesRisco: statsData.classesRisco || 0
      });
    } catch (err: any) {
      console.error('Erro ao carregar estatísticas:', err);
      // Em caso de erro, manter os valores padrão
      setStats({
        total: 0,
        setores: 0,
        expirando: 0,
        vencidas: 0,
        classesRisco: 0
      });
    }
  };
  
  useEffect(() => { 
    fetchFichas(); 
    loadStats();
  }, []);
  
  useEffect(() => {
    fetchFichas();
  }, [filtros]);

  // Handlers
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setForm({ ...form, arquivo: file });
      setUploadFileName(file.name || ''); // Armazenar o nome do arquivo separadamente
    }
  };
  
  const handleDateChange = (date: string) => {
    setForm({ ...form, validade: date });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      if (!form.produto || !form.nome || !form.classeRisco || !form.validade || !form.arquivo) {
        setError("Preencha todos os campos obrigatórios.");
        setLoading(false);
        return;
      }
      
      // Validar o arquivo
      if (form.arquivo?.size === 0) {
        setError("O arquivo selecionado está vazio.");
        setLoading(false);
        return;
      }
      
      if (form.arquivo?.type !== "application/pdf") {
        setError("O arquivo deve ser um PDF.");
        setLoading(false);
        return;
      }
      
      // Criar um objeto com os dados da ficha, garantindo que o campo validade seja string
      const fichaData = {
        nome: form.nome,
        produto: form.produto,
        numeroOnu: form.numeroOnu || '',
        classeRisco: form.classeRisco,
        validade: form.validade,
        arquivoUrl: ""
      };
      
      // Fazer o upload com a tipagem correta
      await fichaEmergenciaService.create(fichaData, form.arquivo as File);
      
      setSuccess(true);
      // Limpar o formulário com valores iniciais corretos
      setForm({
        nome: '',
        produto: '',
        numeroOnu: '',
        classeRisco: '',
        validade: '',
      });
      fetchFichas();
      loadStats();
    } catch (e: any) {
      console.error('Erro ao cadastrar ficha:', e);
      setError(e.message || "Erro ao cadastrar ficha. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };
  
  const handleFiltroChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFiltros({ ...filtros, [e.target.name]: e.target.value });
  };
  
  const handleRefresh = () => {
    fetchFichas();
    loadStats();
  };
  
  const handleViewPdf = (url: string) => {
    setSelectedPdf(url);
    setShowPdf(true);
  };
  
  const handleClosePdf = () => {
    setShowPdf(false);
    setSelectedPdf(null);
  };

  return (
    <Layout title="Fichas de Emergência">
      <div className="w-full max-w-7xl mx-auto flex flex-col gap-8 pt-6 pb-12">
        {/* Estatísticas */}
        <section className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Estatísticas</h2>
            <Button 
              onClick={handleRefresh}
              variant="outlined" 
              startIcon={<HiRefresh className="w-5 h-5" />}
              size="small"
            >
              Atualizar
            </Button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-700 rounded-lg p-4">
              <p className="text-sm text-gray-400">Total de Fichas</p>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
            </div>
            <div className="bg-gray-700 rounded-lg p-4">
              <p className="text-sm text-gray-400">Classes de Risco</p>
              <p className="text-2xl font-bold text-white">{stats.classesRisco}</p>
            </div>
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="flex items-center">
                <p className="text-sm text-gray-400 mr-2">Expirando em 30 dias</p>
                <div className="text-xs p-1 rounded-full text-white bg-yellow-600 flex items-center justify-center w-5 h-5">
                  {stats.expirando}
                </div>
              </div>
              <p className="text-2xl font-bold text-yellow-400">{stats.expirando}</p>
            </div>
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="flex items-center">
                <p className="text-sm text-gray-400 mr-2">Vencidas</p>
                <div className="text-xs p-1 rounded-full text-white bg-red-600 flex items-center justify-center w-5 h-5">
                  {stats.vencidas}
                </div>
              </div>
              <p className="text-2xl font-bold text-red-400">{stats.vencidas}</p>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Coluna da esquerda: Formulário e filtros */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* Formulário de cadastro */}
            <section className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white flex items-center">
                <span>Nova Ficha de Emergência</span>
              </h2>
              
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <TextField label="Nome da Ficha" name="nome" value={form.nome || ''} onChange={handleChange} required fullWidth size="small" />
                <TextField label="Produto" name="produto" value={form.produto || ''} onChange={handleChange} required fullWidth size="small" />
                <TextField label="Número ONU" name="numeroOnu" value={form.numeroOnu || ''} onChange={handleChange} fullWidth size="small" />
                <TextField select label="Classe de Risco" name="classeRisco" value={form.classeRisco || ''} onChange={handleChange} required fullWidth size="small">
                  <MenuItem value="">Selecione</MenuItem>
                  {tiposRisco.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                </TextField>
                <DatePicker id="validade" value={typeof form.validade === 'string' ? form.validade : ''} onChange={handleDateChange} label="Validade" required />
                <InputFileUpload name="arquivo" label="Ficha (PDF)" accept="application/pdf" onFileChange={handleFileChange} fileName={uploadFileName} />
                
                <div className="flex items-center gap-4 mt-2">
                  <Button 
                    type="submit" 
                    variant="contained" 
                    color="primary" 
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {loading ? <CircularProgress size={20} /> : "Cadastrar"}
                  </Button>
                </div>
              </form>
              
              {error && (
                <Alert severity="error" className="mt-4">
                  {error}
                </Alert>
              )}
              
              {success && (
                <Alert severity="success" className="mt-4">
                  Ficha de emergência cadastrada com sucesso!
                </Alert>
              )}
            </section>

            {/* Filtros */}
            <section className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white flex items-center">
                <HiSearch className="mr-2" />
                <span>Filtros</span>
              </h2>
              <div className="flex flex-col gap-3">
                <TextField label="Nome / Produto" name="produto" value={filtros.produto || ''} onChange={handleFiltroChange} size="small" fullWidth />
                <TextField label="Número ONU" name="numeroOnu" value={filtros.numeroOnu || ''} onChange={handleFiltroChange} size="small" fullWidth />
                <TextField select label="Classe de Risco" name="classeRisco" value={filtros.classeRisco || ''} onChange={handleFiltroChange} size="small" fullWidth>
                  <MenuItem value="">Todas</MenuItem>
                  {tiposRisco.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                </TextField>
              </div>
            </section>
          </div>

          {/* Coluna da direita: Listagem de fichas */}
          <section className="lg:col-span-3 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center">
                <span>Fichas de Emergência</span>
                <Chip 
                  label={fichas.length} 
                  size="small" 
                  className="ml-2 bg-blue-500 text-white"
                />
              </h2>
              <Button 
                variant="outlined" 
                startIcon={<HiRefresh className="w-5 h-5" />}
                size="small"
                onClick={handleRefresh}
              >
                Atualizar
              </Button>
            </div>

            {fetching ? (
              <div className="p-12 flex justify-center">
                <CircularProgress />
                <p className="ml-2 text-gray-500">Carregando fichas...</p>
              </div>
            ) : fichas.length === 0 ? (
              <div className="p-12 flex flex-col items-center justify-center text-center">
                <HiExclamationCircle className="w-12 h-12 text-gray-400 mb-4" />
                <p className="text-gray-500">Nenhuma ficha de emergência encontrada.</p>
                <p className="text-gray-400 text-sm mt-1">Utilize o formulário ao lado para cadastrar novas fichas.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <div className="grid gap-4">
                  {fichas.map((ficha) => {
                    const status = calcularStatusData(ficha.validade);
                    return (
                      <div key={ficha.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 hover:shadow-md transition-shadow">
                        <div className="flex flex-col md:flex-row justify-between">
                          <div className="mb-2 md:mb-0">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white">{ficha.nome}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{ficha.produto}</p>
                          </div>
                          <div className="flex items-start space-x-2">
                            {status === 'expired' && (
                              <Chip 
                                label="Vencida" 
                                size="small"
                                className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                              />
                            )}
                            {status === 'expiring' && (
                              <Chip 
                                label="Expirando" 
                                size="small"
                                className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                              />
                            )}
                            {status === 'valid' && (
                              <Chip 
                                label="Válida" 
                                size="small"
                                className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                              />
                            )}
                            <Chip 
                              label={ficha.classeRisco} 
                              size="small"
                              className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                            />
                          </div>
                        </div>
                        
                        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Número ONU</p>
                            <p className="font-medium text-gray-800 dark:text-gray-200">{ficha.numeroOnu || '-'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Classe de Risco</p>
                            <p className="font-medium text-gray-800 dark:text-gray-200">{ficha.classeRisco}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Validade</p>
                            <p className={`font-medium ${status === 'expired' ? 'text-red-500' : status === 'expiring' ? 'text-yellow-500' : 'text-gray-800 dark:text-gray-200'}`}>
                              {formatarData(ficha.validade)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Ações</p>
                            <div className="flex space-x-2">
                              <IconButton 
                                size="small" 
                                onClick={() => handleViewPdf(ficha.arquivoUrl)}
                                className="text-blue-600 hover:text-blue-800"
                              >
                                <HiEye className="w-5 h-5" />
                              </IconButton>
                              <IconButton 
                                size="small" 
                                component="a" 
                                href={ficha.arquivoUrl} 
                                download
                                className="text-green-600 hover:text-green-800"
                              >
                                <HiDownload className="w-5 h-5" />
                              </IconButton>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </section>
        </div>
      </div>

      {/* Modal de visualização de PDF */}
      {showPdf && selectedPdf && (
        <VisualizarPdf 
          filePath={selectedPdf} 
          onClose={() => setShowPdf(false)}
          title="Ficha de Emergência"
        />
      )}

      {/* Snackbar de sucesso/erro */}
      <Snackbar 
        open={success} 
        autoHideDuration={4000} 
        onClose={() => setSuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity="success" variant="filled">
          Ficha de emergência cadastrada com sucesso!
        </Alert>
      </Snackbar>
    </Layout>
  );
}
