'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { fispqService } from '../services/fispqService';
import { FISPQFormData } from '../types/fispq';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabaseClient';
import { 
  HiDocumentAdd, 
  HiUpload, 
  HiX, 
  HiCheck, 
  HiExclamation, 
  HiOfficeBuilding, 
  HiBeaker,
  HiCalendar,
  HiOutlineDocumentSearch,
  HiOutlineChevronLeft
} from 'react-icons/hi';

export default function CadastroFISPQ() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [setores, setSetores] = useState<string[]>([]);
  const [formData, setFormData] = useState<FISPQFormData>({
    produto: '',
    fabricante: '',
    numeroCas: '',
    setor: '',
    tipoRisco: '',
    validade: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // Um ano a partir de hoje
    arquivoUrl: '',
    arquivo: null
  });
  const [error, setError] = useState<string | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);

  // Lista de tipos de risco comuns
  const tiposRisco = [
    'Inflamável',
    'Corrosivo',
    'Oxidante',
    'Tóxico',
    'Explosivo',
    'Irritante',
    'Nocivo',
    'Sensibilizante',
    'Cancerígeno',
    'Mutagênico',
    'Perigoso para o ambiente'
  ];
  
  // Lista de setores predefinidos
  const setoresPredefinidos = [
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

  useEffect(() => {
    checkUser();
    loadSetores();
  }, []);

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
  
  async function loadSetores() {
    try {
      // Buscar setores existentes
      const { data } = await supabase
        .from('fispqs')
        .select('setor')
        .order('setor');
      
      if (data && data.length > 0) {
        // Obter setores únicos do banco de dados
        const uniqueSetores = [...new Set(data.map(item => item.setor))].filter(Boolean);
        // Combinar com os setores predefinidos sem duplicar
        const allSetores = [...new Set([...uniqueSetores, ...setoresPredefinidos])].sort();
        setSetores(allSetores);
      } else {
        // Usar apenas os setores predefinidos se não houver dados no banco
        setSetores(setoresPredefinidos);
      }
    } catch (error) {
      console.error('Erro ao carregar setores:', error);
      // Em caso de erro, ainda usar os setores predefinidos
      setSetores(setoresPredefinidos);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!formData.produto.trim()) {
      setError('Por favor, informe o nome do produto.');
      return;
    }

    if (!formData.fabricante.trim()) {
      setError('Por favor, informe o fabricante.');
      return;
    }

    if (!formData.setor.trim()) {
      setError('Por favor, selecione ou informe o setor.');
      return;
    }

    if (!formData.arquivo) {
      setError('Por favor, selecione um arquivo PDF para a FISPQ.');
      return;
    }

    setLoading(true);

    try {
      await fispqService.create(formData, formData.arquivo);
      
      // Sucesso
      setSuccess(true);
      
      // Limpar o formulário
      setFormData({
        produto: '',
        fabricante: '',
        numeroCas: '',
        setor: '',
        tipoRisco: '',
        validade: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        arquivoUrl: '',
        arquivo: null
      });
      setFilePreview(null);
      
      // Redirecionar após 2 segundos
      setTimeout(() => {
        router.push('/fispq');
      }, 2000);
    } catch (error: any) {
      console.error('Erro ao cadastrar FISPQ:', error);
      setError(error.message || 'Erro ao cadastrar FISPQ. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }

  function handleDateChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { value } = e.target;
    if (value) {
      setFormData(prev => ({ ...prev, validade: new Date(value) }));
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
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
      
      setFormData(prev => ({ ...prev, arquivo: file }));
      
      // Criar URL para visualização do PDF
      const fileURL = URL.createObjectURL(file);
      setFilePreview(fileURL);
      
      // Limpar erros anteriores
      setError(null);
    }
  }

  function handleClearFile() {
    setFormData(prev => ({ ...prev, arquivo: null }));
    if (filePreview) {
      URL.revokeObjectURL(filePreview);
    }
    setFormData(prev => ({ 
      ...prev, 
      arquivo: null 
    }));
    setFilePreview(null);
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      {/* Header com botão de voltar */}
      <div className="bg-gray-800/80 backdrop-blur-lg border-b border-gray-700 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link 
            href="/fispq" 
            className="flex items-center space-x-2 text-white hover:text-blue-400 transition-colors"
          >
            <HiOutlineChevronLeft className="text-xl" />
            <span>Voltar ao Dashboard</span>
          </Link>
          
          <div className="flex items-center space-x-3">
            <Link 
              href="/fispq/consulta" 
              className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/40 rounded-lg flex items-center space-x-1 text-sm transition-colors"
            >
              <HiOutlineDocumentSearch className="text-lg" />
              <span>Consultar FISPQs</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col space-y-6">
          {/* Cabeçalho do formulário */}
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-600/20 rounded-xl">
              <HiDocumentAdd className="text-3xl text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">
                Cadastro de FISPQ
              </h1>
              <p className="text-gray-400 mt-1">
                Preencha os campos abaixo para cadastrar uma nova Ficha de Informações de Segurança de Produtos Químicos.
              </p>
            </div>
          </div>

          {/* Alertas de erro e sucesso */}
          {error && (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-red-900/30 border border-red-500 text-red-100 px-4 py-3 rounded-lg flex items-center"
            >
              <HiExclamation className="text-red-500 mr-2 text-xl flex-shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}

          {success && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-green-900/30 border border-green-500 text-green-100 px-4 py-3 rounded-lg flex items-center"
            >
              <HiCheck className="text-green-500 mr-2 text-xl flex-shrink-0" />
              <span>FISPQ cadastrada com sucesso!</span>
            </motion.div>
          )}

          {/* Card do formulário */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-gray-800/70 backdrop-blur-lg rounded-xl border border-gray-700/80 shadow-xl overflow-hidden p-6"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">
                    <HiBeaker className="inline mr-1 text-blue-400" />
                    Nome do Produto*
                  </label>
                  <input
                    type="text"
                    name="produto"
                    value={formData.produto}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-800/50 text-white"
                    placeholder="Ex: Ácido Sulfúrico"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">
                    <HiOfficeBuilding className="inline mr-1 text-blue-400" />
                    Fabricante*
                  </label>
                  <input
                    type="text"
                    name="fabricante"
                    value={formData.fabricante}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-800/50 text-white"
                    placeholder="Ex: Empresa XYZ"
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
                    value={formData.numeroCas}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-800/50 text-white"
                    placeholder="Ex: 7664-93-9"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">
                    Setor*
                  </label>
                  <div className="relative">
                    <select
                      name="setor"
                      value={formData.setor}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-800/50 text-white appearance-none"
                      required
                    >
                      <option value="">Selecione um setor</option>
                      {setores.map((setor, index) => (
                        <option key={index} value={setor}>{setor}</option>
                      ))}
                      <option value="outro">Outro (especificar)</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                      <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                      </svg>
                    </div>
                  </div>
                  {formData.setor === 'outro' && (
                    <input
                      type="text"
                      name="setorCustom"
                      placeholder="Especifique o setor"
                      className="w-full mt-2 px-4 py-2 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-800/50 text-white"
                      onChange={(e) => setFormData({...formData, setor: e.target.value})}
                      required
                    />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">
                    Tipo de Risco <span className="text-xs text-gray-400">(opcional)</span>
                  </label>
                  <select
                    name="tipoRisco"
                    value={formData.tipoRisco}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-800/50 text-white appearance-none"
                  >
                    <option value="">Selecione um tipo de risco</option>
                    {tiposRisco.map((risco, index) => (
                      <option key={index} value={risco}>{risco}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-300">
                    <HiCalendar className="inline mr-1 text-blue-400" />
                    Validade*
                  </label>
                  <input
                    type="date"
                    name="validade"
                    value={formData.validade instanceof Date ? formData.validade.toISOString().split('T')[0] : ''}
                    onChange={handleDateChange}
                    className="w-full px-4 py-2 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-800/50 text-white"
                    required
                  />
                </div>
              </div>

              <div className="bg-gray-900/50 p-4 rounded-lg border border-dashed border-gray-700">
                <label className="block text-sm font-medium mb-3 text-gray-300">
                  <HiUpload className="inline mr-1 text-blue-400" />
                  Arquivo FISPQ (PDF)*
                </label>
                
                {!formData.arquivo ? (
                  <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-700 rounded-lg cursor-pointer hover:bg-gray-800/50 transition-colors"
                       onClick={() => document.getElementById('file-upload')?.click()}
                  >
                    <HiUpload className="text-3xl text-blue-400 mb-2" />
                    <p className="text-sm text-gray-300 mb-1">Clique ou arraste para fazer upload</p>
                    <p className="text-xs text-gray-400">Somente arquivos PDF (máx. 10MB)</p>
                    <input
                      id="file-upload"
                      type="file"
                      accept=".pdf,application/pdf"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-4 bg-gray-800/70 border border-gray-700 rounded-lg">
                    <div className="flex items-center overflow-hidden">
                      <svg className="w-8 h-8 text-red-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                      </svg>
                      <div className="overflow-hidden">
                        <p className="text-sm text-white truncate font-medium">{formData.arquivo.name}</p>
                        <p className="text-xs text-gray-400">
                          {(formData.arquivo.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      {filePreview && (
                        <a 
                          href={filePreview} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                          title="Visualizar PDF"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={handleClearFile}
                        className="p-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                        title="Remover arquivo"
                      >
                        <HiX className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-6 mt-4 border-t border-gray-700/50">
                <button
                  type="button"
                  onClick={() => router.push('/fispq')}
                  className="px-4 py-2.5 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors flex items-center"
                >
                  <HiX className="mr-2" />
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-colors"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Salvando...
                    </>
                  ) : (
                    <>
                      <HiCheck className="mr-2" />
                      Salvar FISPQ
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
