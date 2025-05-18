'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/app/lib/supabaseClient';
import { motion } from 'framer-motion';
import { HiDocumentAdd, HiChevronLeft, HiExclamation, HiCheck, HiDownload, HiRefresh } from 'react-icons/hi';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export default function ImportarFDUs() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isQuimico, setIsQuimico] = useState(false);
  const [loading, setLoading] = useState(false);
  const [importStatus, setImportStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // No modo de manutenção, não fazemos verificação de sessão

  const handleImport = async () => {
    setLoading(true);
    setImportStatus('loading');
    setError(null);
    
    try {
      const response = await fetch('/api/importar-fdus');
      const data = await response.json();
      
      if (data.success) {
        setImportStatus('success');
        setResult(data.results);
      } else {
        setImportStatus('error');
        setError(data.error || 'Erro desconhecido durante a importação');
      }
    } catch (e: any) {
      setImportStatus('error');
      setError(`Erro ao conectar com o servidor: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      {/* Botão flutuante para voltar ao painel (apenas para admin) */}
      {isAdmin && (
        <div className="fixed bottom-6 right-6 z-30">
          <motion.button
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileHover={{ scale: 1.05 }}
            onClick={() => router.push('/admin/dashboard')}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 rounded-full py-3 px-5 text-white shadow-lg transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            <span>Voltar ao Painel</span>
          </motion.button>
        </div>
      )}
      
      {/* Header com botão de voltar */}
      <div className="bg-gray-800/80 backdrop-blur-lg border-b border-gray-700 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link 
            href="/fdu" 
            className="flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors"
          >
            <HiChevronLeft className="text-xl" />
            <span>Voltar ao Dashboard FDU</span>
          </Link>
        </div>
      </div>
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className="flex flex-col space-y-6"
        >
          {/* Cabeçalho */}
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-purple-600/20 rounded-xl">
              <HiDocumentAdd className="text-3xl text-purple-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Importação em Lote de FDUs</h1>
              <p className="text-gray-400">
                Importar os dados da planilha de controle para o sistema
              </p>
            </div>
          </div>
          
          {/* Conteúdo principal */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 shadow-lg">
            <div className="space-y-6">
              <div className="border-b border-gray-700 pb-4">
                <h2 className="text-xl font-semibold text-white mb-2">Planilha de Origem</h2>
                <p className="text-gray-300">
                  A importação utilizará os dados da planilha <span className="font-semibold text-blue-300">RS 4.4.6-11 - Controle e Distribuição das FDS Rev-01.xlsx</span> que está disponível no sistema.
                </p>
              </div>
              
              <div className="space-y-3">
                <h3 className="text-lg font-medium text-white">Informações da Importação</h3>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-start space-x-2">
                    <HiCheck className="text-green-400 mt-1 flex-shrink-0" />
                    <span>Os produtos serão importados com todas as informações disponíveis na planilha</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <HiCheck className="text-green-400 mt-1 flex-shrink-0" />
                    <span>Serão criados registros para os 193 produtos identificados nas 12 abas da planilha</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <HiExclamation className="text-yellow-400 mt-1 flex-shrink-0" />
                    <span>Os arquivos PDF das FDUs não são importados automaticamente e deverão ser anexados manualmente após a importação</span>
                  </li>
                </ul>
              </div>
              
              {/* Status e Resultados */}
              {importStatus !== 'idle' && (
                <div className={`p-4 rounded-lg ${
                  importStatus === 'loading' ? 'bg-blue-900/30 border border-blue-700' : 
                  importStatus === 'success' ? 'bg-green-900/30 border border-green-700' : 
                  'bg-red-900/30 border border-red-700'
                }`}>
                  <div className="flex items-center space-x-3 mb-2">
                    {importStatus === 'loading' ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-400"></div>
                        <h3 className="font-medium text-blue-300">Importando dados...</h3>
                      </>
                    ) : importStatus === 'success' ? (
                      <>
                        <div className="p-1 rounded-full bg-green-500/20">
                          <HiCheck className="text-xl text-green-400" />
                        </div>
                        <h3 className="font-medium text-green-300">Importação concluída</h3>
                      </>
                    ) : (
                      <>
                        <div className="p-1 rounded-full bg-red-500/20">
                          <HiExclamation className="text-xl text-red-400" />
                        </div>
                        <h3 className="font-medium text-red-300">Erro na importação</h3>
                      </>
                    )}
                  </div>
                  
                  {importStatus === 'success' && result && (
                    <div className="mt-3 text-green-200">
                      <p>Total de registros: <span className="font-semibold">{result.total}</span></p>
                      <p>Importados com sucesso: <span className="font-semibold">{result.success}</span></p>
                      <p>Erros: <span className="font-semibold">{result.errors}</span></p>
                      
                      {result.errors > 0 && (
                        <div className="mt-2">
                          <p className="font-semibold mb-1">Detalhes dos erros:</p>
                          <div className="max-h-40 overflow-y-auto bg-gray-900/50 rounded p-2 text-sm">
                            {result.errorDetails.map((error: string, index: number) => (
                              <p key={index} className="text-red-300">{error}</p>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {importStatus === 'error' && error && (
                    <p className="text-red-300">{error}</p>
                  )}
                </div>
              )}
              
              {/* Botões de ação */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-700">
                {importStatus === 'success' ? (
                  <Link
                    href="/fdu"
                    className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg text-white font-medium transition-colors flex items-center space-x-2"
                  >
                    <HiCheck className="text-lg" />
                    <span>Concluir</span>
                  </Link>
                ) : (
                  <button
                    onClick={handleImport}
                    disabled={false} // Botão sempre habilitado para teste
                    className="px-6 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-white font-medium transition-colors flex items-center space-x-2"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Importando...</span>
                      </>
                    ) : (
                      <>
                        <HiDownload className="text-lg" />
                        <span>Iniciar Importação</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
          
          {/* Instruções adicionais */}
          {importStatus === 'success' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-blue-900/20 border border-blue-800 rounded-xl p-6"
            >
              <h3 className="text-lg font-medium text-white mb-3">Próximos Passos</h3>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-start space-x-2">
                  <div className="bg-blue-500/20 p-1 rounded-full mt-0.5">
                    <span className="text-blue-400 text-sm font-bold">1</span>
                  </div>
                  <span>Acesse a lista de FDUs para verificar os registros importados</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="bg-blue-500/20 p-1 rounded-full mt-0.5">
                    <span className="text-blue-400 text-sm font-bold">2</span>
                  </div>
                  <span>Anexe os arquivos PDF das FDUs para cada produto usando a função de edição</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="bg-blue-500/20 p-1 rounded-full mt-0.5">
                    <span className="text-blue-400 text-sm font-bold">3</span>
                  </div>
                  <span>Atualize as informações adicionais conforme necessário</span>
                </li>
              </ul>
              
              <div className="mt-4">
                <Link
                  href="/fdu/fdu"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-white font-medium transition-colors inline-flex items-center space-x-2"
                >
                  <HiRefresh className="text-lg" />
                  <span>Ir para Lista de FDUs</span>
                </Link>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
