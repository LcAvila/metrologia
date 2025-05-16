'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { fichaEmergenciaService } from '../services/fichaEmergenciaService';
import { FichaEmergencia } from '../types/fichaEmergencia';
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
  HiIdentification
} from 'react-icons/hi';

export default function CadastroFichaEmergencia() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    produto: '',
    numeroOnu: '',
    classeRisco: '',
    validade: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // Um ano a partir de hoje
    arquivoUrl: '',
    arquivo: null as File | null
  });
  const [error, setError] = useState<string | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);

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

  useEffect(() => {
    checkUser();
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!formData.nome.trim()) {
      setError('Por favor, informe o nome da ficha de emergência.');
      return;
    }

    if (!formData.produto.trim()) {
      setError('Por favor, informe o nome do produto.');
      return;
    }

    if (!formData.numeroOnu.trim()) {
      setError('Por favor, informe o número ONU do produto.');
      return;
    }

    if (!formData.classeRisco.trim()) {
      setError('Por favor, selecione a classe de risco.');
      return;
    }

    if (!formData.arquivo) {
      setError('Por favor, selecione um arquivo PDF para a ficha de emergência.');
      return;
    }

    setLoading(true);
    try {
      // O arquivo deve ser passado como segundo parâmetro separado
      await fichaEmergenciaService.create({
        nome: formData.nome,
        produto: formData.produto,
        numeroOnu: formData.numeroOnu,
        classeRisco: formData.classeRisco,
        validade: formData.validade.toISOString(),
        arquivoUrl: '' // Será preenchido pelo serviço
      }, formData.arquivo as File);
      
      setSuccess(true);
      setFormData({
        nome: '',
        produto: '',
        numeroOnu: '',
        classeRisco: '',
        validade: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        arquivoUrl: '',
        arquivo: null
      });
      setFilePreview(null);
      
      // Aguardar um pouco para mostrar a mensagem de sucesso
      setTimeout(() => {
        router.push('/fispq');
      }, 1500);
      
    } catch (err: any) {
      console.error('Erro ao cadastrar Ficha de Emergência:', err);
      setError(err.message || 'Erro ao cadastrar ficha. Por favor, tente novamente.');
    } finally {
      setLoading(false);
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
      
      // Verificar tamanho (máximo 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('O arquivo é muito grande. O tamanho máximo permitido é 10MB.');
        return;
      }
      
      setFormData({
        ...formData,
        arquivo: file
      });
      
      // Criar URL para preview do arquivo
      const fileURL = URL.createObjectURL(file);
      setFilePreview(fileURL);
      setError(null);
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  }

  function handleDateChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { value } = e.target;
    setFormData({
      ...formData,
      validade: new Date(value)
    });
  }

  function handleClearFile() {
    setFormData({
      ...formData,
      arquivo: null
    });
    setFilePreview(null);
  }

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <header className="bg-[var(--card-bg)] shadow-sm border-b border-[var(--border)]">
        <div className="container mx-auto p-4 flex justify-between items-center">
          <Link href="/fispq" className="flex items-center text-[var(--primary)] hover:text-[var(--primary-dark)] transition-colors">
            <HiArrowLeft className="mr-2" />
            <span>Voltar ao Dashboard</span>
          </Link>
          <h1 className="text-xl font-bold text-[var(--text)]">
            <HiShieldExclamation className="inline mr-2 text-[var(--primary)]" />
            Cadastro de Ficha de Emergência
          </h1>
        </div>
      </header>

      <div className="container mx-auto p-4">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-[var(--card-bg)] p-6 rounded-lg shadow-md border border-[var(--border)]"
        >
          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md flex items-start"
            >
              <HiExclamation className="text-red-500 mr-2 text-xl flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </motion.div>
          )}

          {success && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded-md flex items-start"
            >
              <HiCheck className="text-green-500 mr-2 text-xl flex-shrink-0 mt-0.5" />
              <span>Ficha de emergência cadastrada com sucesso! Redirecionando...</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2 text-[var(--text-secondary)]">
                  <HiIdentification className="inline mr-1 text-[var(--primary)]" />
                  Nome da Ficha*
                </label>
                <input
                  type="text"
                  name="nome"
                  value={formData.nome}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-[var(--border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary)] bg-[var(--input-bg)] text-[var(--text)]"
                  placeholder="Ex: Ficha de Emergência Acetona"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-[var(--text-secondary)]">
                  <HiTag className="inline mr-1 text-[var(--primary)]" />
                  Produto*
                </label>
                <input
                  type="text"
                  name="produto"
                  value={formData.produto}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-[var(--border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary)] bg-[var(--input-bg)] text-[var(--text)]"
                  placeholder="Ex: Acetona"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-[var(--text-secondary)]">
                  Número ONU*
                </label>
                <input
                  type="text"
                  name="numeroOnu"
                  value={formData.numeroOnu}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-[var(--border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary)] bg-[var(--input-bg)] text-[var(--text)]"
                  placeholder="Ex: 1090"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-[var(--text-secondary)]">
                  Classe de Risco*
                </label>
                <div className="relative">
                  <select
                    name="classeRisco"
                    value={formData.classeRisco}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-[var(--border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary)] bg-[var(--input-bg)] text-[var(--text)] appearance-none"
                    required
                  >
                    <option value="">Selecione uma classe de risco</option>
                    {classesRisco.map((classe, index) => (
                      <option key={index} value={classe}>{classe}</option>
                    ))}
                    <option value="outro">Outro (especificar)</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-[var(--text-secondary)]">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                    </svg>
                  </div>
                </div>
                {formData.classeRisco === 'outro' && (
                  <input
                    type="text"
                    name="classeRiscoCustom"
                    placeholder="Especifique a classe de risco"
                    className="w-full mt-2 px-4 py-2 border border-[var(--border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary)] bg-[var(--input-bg)] text-[var(--text)]"
                    onChange={(e) => setFormData({...formData, classeRisco: e.target.value})}
                    required
                  />
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-[var(--text-secondary)]">
                  <HiCalendar className="inline mr-1 text-[var(--primary)]" />
                  Validade*
                </label>
                <input
                  type="date"
                  name="validade"
                  value={formData.validade instanceof Date ? formData.validade.toISOString().split('T')[0] : ''}
                  onChange={handleDateChange}
                  className="w-full px-4 py-2 border border-[var(--border)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--primary)] bg-[var(--input-bg)] text-[var(--text)]"
                  required
                />
              </div>
            </div>

            <div className="bg-[var(--bg-muted)] p-4 rounded-md border border-dashed border-[var(--border)]">
              <label className="block text-sm font-medium mb-3 text-[var(--text-secondary)]">
                <HiUpload className="inline mr-1 text-[var(--primary)]" />
                Arquivo da Ficha de Emergência (PDF)*
              </label>
              
              {!formData.arquivo ? (
                <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-[var(--border)] rounded-md cursor-pointer hover:bg-[var(--bg)] transition-colors"
                     onClick={() => document.getElementById('file-upload')?.click()}
                >
                  <HiUpload className="text-3xl text-[var(--primary)] mb-2" />
                  <p className="text-sm text-[var(--text-secondary)] mb-1">Clique ou arraste para fazer upload</p>
                  <p className="text-xs text-[var(--text-tertiary)]">Somente arquivos PDF (máx. 10MB)</p>
                  <input
                    id="file-upload"
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
              ) : (
                <div className="flex items-center justify-between p-4 bg-[var(--card-bg)] border border-[var(--border)] rounded-md">
                  <div className="flex items-center overflow-hidden">
                    <svg className="w-8 h-8 text-red-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                    </svg>
                    <div className="overflow-hidden">
                      <p className="text-sm text-[var(--text)] truncate font-medium">{formData.arquivo.name}</p>
                      <p className="text-xs text-[var(--text-tertiary)]">
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
                        className="p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
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
                      className="p-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                      title="Remover arquivo"
                    >
                      <HiX className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-4 border-t border-[var(--border)]">
              <button
                type="button"
                onClick={() => router.push('/fispq')}
                className="px-4 py-2 mr-2 border border-[var(--border)] text-[var(--text)] rounded-md hover:bg-[var(--bg)] transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-[var(--primary)] text-white rounded-md shadow-sm hover:bg-[var(--primary-dark)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-colors"
              >
                <HiCheck className="mr-2" />
                {loading ? 'Salvando...' : 'Salvar Ficha'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
