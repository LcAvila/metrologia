"use client";
import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { HiDocumentText, HiChevronRight, HiOutlineClipboardCheck, 
         HiOutlineDocumentReport, HiOutlineShieldCheck, HiArrowRight } from 'react-icons/hi';
import { HiExclamationTriangle, HiWrenchScrewdriver } from 'react-icons/hi2';
import PublicFDUList from './components/PublicFDUList';
import PublicFichaEmergenciaList from './components/PublicFichaEmergenciaList';
import PublicEquipamentosList from './components/PublicEquipamentosList';

export default function ConsultaPage() {
  const [activeTab, setActiveTab] = useState<string>("intro");

  // Componente para a tela inicial/introdução
  const IntroScreen = () => (
    <div className="max-w-5xl mx-auto">
      <div className="mb-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl font-bold mb-4 text-gray-800 dark:text-white">
            Bem-vindo à Área de Consulta Pública
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Consulte informações sobre equipamentos de metrologia, Fichas de Utilização (FDUs) 
            e Fichas de Emergência de produtos químicos.
          </p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card de Metrologia */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all"
          onClick={() => setActiveTab("metrologia")}
        >
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-2"></div>
          <div className="p-6">
            <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mb-4">
              <HiWrenchScrewdriver className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="font-bold text-xl mb-2 text-gray-800 dark:text-white">Metrologia</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Consulte informações de calibração e certificados dos equipamentos de medição.
            </p>
            <div className="flex items-center text-blue-500 font-medium">
              Ver equipamentos <HiArrowRight className="ml-1" />
            </div>
          </div>
        </motion.div>

        {/* Card de FDU */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all"
          onClick={() => setActiveTab("fdu")}
        >
          <div className="bg-gradient-to-r from-green-500 to-green-600 h-2"></div>
          <div className="p-6">
            <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mb-4">
              <HiOutlineClipboardCheck className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="font-bold text-xl mb-2 text-gray-800 dark:text-white">FDUs</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Acesse Fichas de Utilização (FDUs) para procedimentos seguros de manuseio.
            </p>
            <div className="flex items-center text-green-500 font-medium">
              Ver fichas <HiArrowRight className="ml-1" />
            </div>
          </div>
        </motion.div>

        {/* Card de Fichas de Emergência */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all"
          onClick={() => setActiveTab("emergencia")}
        >
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 h-2"></div>
          <div className="p-6">
            <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center mb-4">
              <HiExclamationTriangle className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="font-bold text-xl mb-2 text-gray-800 dark:text-white">Fichas de Emergência</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Consulte fichas de emergência para procedimentos em caso de acidentes com produtos.
            </p>
            <div className="flex items-center text-purple-500 font-medium">
              Ver fichas <HiArrowRight className="ml-1" />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Cabeçalho com o nome do projeto */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center text-center mb-4">
            <h1 className="text-3xl md:text-4xl font-bold mb-1">
              <span className="bg-gradient-to-r from-blue-500 via-teal-500 to-green-500 bg-clip-text text-transparent">AVZ</span>
              <span className="text-gray-800 dark:text-white"> Quality</span>
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-300">Precisão e Segurança em Harmonia</p>
          </div>
        </div>
      </div>

      {/* Área Restrita - link discreto */}
      <div className="absolute top-4 right-4 z-10">
        <Link
          href="/login"
          className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
        >
          Área Restrita
        </Link>
      </div>

      {/* Conteúdo principal */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <AnimatePresence mode="wait">
          {activeTab === "intro" && (
            <motion.div
              key="intro"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <IntroScreen />
            </motion.div>
          )}

          {activeTab === "metrologia" && (
            <motion.div
              key="metrologia"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="mb-4">
                <button
                  onClick={() => setActiveTab("intro")}
                  className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-800 font-medium transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
                  </svg>
                  Voltar para Início
                </button>
              </div>
              <PublicEquipamentosList />
            </motion.div>
          )}

          {activeTab === "fdu" && (
            <motion.div
              key="fdu"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="mb-4">
                <button
                  onClick={() => setActiveTab("intro")}
                  className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-800 font-medium transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
                  </svg>
                  Voltar para Início
                </button>
              </div>
              <PublicFDUList />
            </motion.div>
          )}

          {activeTab === "emergencia" && (
            <motion.div
              key="emergencia"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="mb-4">
                <button
                  onClick={() => setActiveTab("intro")}
                  className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-800 font-medium transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
                  </svg>
                  Voltar para Início
                </button>
              </div>
              <PublicFichaEmergenciaList />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Rodapé - igual ao do admin e fixo na parte inferior */}
      <footer className="fixed bottom-0 left-0 right-0 py-3 px-4 bg-black/80 backdrop-blur-sm border-t border-gray-800 text-center text-gray-400 text-sm z-10">
        <div className="max-w-7xl mx-auto">
          <p>Sistema de Documentação Técnica &copy; {new Date().getFullYear()} - Todos os direitos reservados</p>
          <div className="flex flex-wrap justify-center gap-4 mt-1 text-xs">
            <Link href="/politica-privacidade" className="hover:text-gray-200 transition-colors">Política de Privacidade</Link>
            <Link href="/termos-uso" className="hover:text-gray-200 transition-colors">Termos de Uso</Link>
            <Link href="/faq" className="hover:text-gray-200 transition-colors">FAQ</Link>
            <span className="text-blue-400">Desenvolvido por Lucas Ávila</span>
          </div>
        </div>
      </footer>
    </div>
  );
}