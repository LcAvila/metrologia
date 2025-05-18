'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  HiBeaker, 
  HiDocumentText, 
  HiShieldExclamation,
  HiOutlineChevronDown,
  HiPlus,
  HiLogout,
  HiUser,
  HiChartBar,
  HiChevronRight
} from 'react-icons/hi';
import { supabase } from '../lib/supabaseClient';
import { fduService } from './services/fduService';
import { fichaEmergenciaService } from './services/fichaEmergenciaService';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export default function FDUPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [stats, setStats] = useState({
    fdu: {
      total: 0,
      expirando: 0,
      vencidas: 0,
      validas: 0
    },
    fichaEmergencia: {
      total: 0,
      expirando: 0,
      vencidas: 0,
      validas: 0
    }
  });

  useEffect(() => {
    checkUser();
    loadDashboardData();
  }, []);

  async function checkUser() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.push('/login');
        return;
      }
      
      setUser(session.user);
      
      // Verificar se o usuário é administrador
      const { data: userRoleData, error: userRoleError } = await supabase
        .from('usuarios')
        .select('role')
        .eq('id', session.user.id)
        .single();
      
      if (!userRoleError && userRoleData) {
        setIsAdmin(userRoleData.role === 'admin');
      }
    } catch (error) {
      console.error('Erro ao verificar usuário:', error);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  }

  async function loadDashboardData() {
    try {
      // Buscar estatísticas de FDUs
      const allFdus = await fduService.list({});
      
      let expiringCount = 0;
      let vencidasCount = 0;
      let validasCount = 0;
      const hoje = new Date();
      const oneMonthFromNow = new Date();
      oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);
      
      allFdus.forEach(fdu => {        
        // Verificar status baseado na validade
        const validadeDate = new Date(fdu.validade);
        if (validadeDate < hoje) {
          vencidasCount++;
        } else if (validadeDate <= oneMonthFromNow) {
          expiringCount++;
        } else {
          validasCount++;
        }
      });
      
      // Buscar estatísticas de Fichas de Emergência
      const allFichas = await fichaEmergenciaService.list({});
      let fichasExpiring = 0;
      let fichasVencidas = 0;
      let fichasValidas = 0;
      
      allFichas.forEach(ficha => {        
        // Verificar status baseado na validade
        const validadeDate = new Date(ficha.validade);
        if (validadeDate < hoje) {
          fichasVencidas++;
        } else if (validadeDate <= oneMonthFromNow) {
          fichasExpiring++;
        } else {
          fichasValidas++;
        }
      });
      
      // Atualizar estatísticas
      setStats({
        fdu: {
          total: allFdus.length,
          expirando: expiringCount,
          vencidas: vencidasCount,
          validas: validasCount
        },
        fichaEmergencia: {
          total: allFichas.length,
          expirando: fichasExpiring,
          vencidas: fichasVencidas,
          validas: fichasValidas
        }
      });
      
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
    } finally {
      setLoading(false);
    }
  }
  
  function handleLogout() {
    supabase.auth.signOut().then(() => {
      router.push('/login');
    });
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-black">
        <div className="text-white text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Carregando dados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 min-h-screen text-white">
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
      
      {/* Header */}
      <header className="sticky top-0 z-10 backdrop-blur-lg bg-gray-900/80 border-b border-gray-800 px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
            <HiBeaker className="text-xl" />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
            Painel FDU
          </h1>
        </div>

        {/* Botão de usuário e menu dropdown */}
        <div className="relative">
          <button 
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2 bg-gray-800/50 hover:bg-gray-700/50 rounded-lg py-2 px-3 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-indigo-600/50 flex items-center justify-center text-white">
              <HiUser />
            </div>
            <span className="hidden sm:inline text-sm">{user?.email}</span>
            <HiOutlineChevronDown className={`transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-xl border border-gray-700 z-30">
              <div className="p-3 border-b border-gray-700">
                <p className="text-sm font-medium text-white">Químico</p>
                <p className="text-xs text-gray-400 truncate">{user?.email}</p>
              </div>
              <div className="p-2">
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-gray-700/50 rounded flex items-center gap-2"
                >
                  <HiLogout /> Sair
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Cabeçalho do Dashboard */}
        <div className="mb-8">
          <motion.h1 
            initial={fadeIn.hidden}
            animate={fadeIn.visible}
            className="text-3xl font-bold text-white mb-2"
          >
            Dashboard FDU
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-gray-400"
          >
            Gerencie seus documentos químicos e acompanhe suas estatísticas
          </motion.p>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <motion.div 
            initial={fadeIn.hidden}
            animate={fadeIn.visible}
            transition={{ delay: 0.1 }}
            className="bg-blue-900/20 border border-blue-900/50 rounded-xl p-5 flex flex-col"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-blue-300">FDUs</h3>
              <div className="w-10 h-10 rounded-full bg-blue-900/50 flex items-center justify-center text-blue-300">
                <HiDocumentText className="text-xl" />
              </div>
            </div>
            <div className="flex items-end justify-between">
              <p className="text-3xl font-bold text-white">{stats.fdu.total}</p>
              <div className="text-sm text-right">
                <p className="text-green-400">{stats.fdu.validas} válidas</p>
                <p className="text-yellow-400">{stats.fdu.expirando} expirando</p>
                <p className="text-red-400">{stats.fdu.vencidas} vencidas</p>
              </div>
            </div>
          </motion.div>
            
          <motion.div 
            initial={fadeIn.hidden}
            animate={fadeIn.visible}
            transition={{ delay: 0.2 }}
            className="bg-purple-900/20 border border-purple-900/50 rounded-xl p-5 flex flex-col"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-purple-300">Fichas de Emergência</h3>
              <div className="w-10 h-10 rounded-full bg-purple-900/50 flex items-center justify-center text-purple-300">
                <HiShieldExclamation className="text-xl" />
              </div>
            </div>
            <div className="flex items-end justify-between">
              <p className="text-3xl font-bold text-white">{stats.fichaEmergencia.total}</p>
              <div className="text-sm text-right">
                <p className="text-green-400">{stats.fichaEmergencia.validas} válidas</p>
                <p className="text-yellow-400">{stats.fichaEmergencia.expirando} expirando</p>
                <p className="text-red-400">{stats.fichaEmergencia.vencidas} vencidas</p>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            initial={fadeIn.hidden}
            animate={fadeIn.visible}
            transition={{ delay: 0.3 }}
            className="bg-indigo-900/20 border border-indigo-900/50 rounded-xl p-5 flex flex-col lg:col-span-2"
          >
            <div className="flex items-center mb-3">
              <h3 className="text-lg font-medium text-indigo-300 mr-2">Status Geral</h3>
              <div className="w-8 h-8 rounded-full bg-indigo-900/50 flex items-center justify-center text-indigo-300">
                <HiChartBar className="text-lg" />
              </div>
            </div>
            <div className="flex-1 flex items-center justify-between gap-4">
              <div className="flex-1 bg-gray-800/50 rounded-lg p-3 text-center">
                <p className="text-green-400 text-lg font-bold">{stats.fdu.validas + stats.fichaEmergencia.validas}</p>
                <p className="text-xs text-gray-400">Documentos Válidos</p>
              </div>
              <div className="flex-1 bg-gray-800/50 rounded-lg p-3 text-center">
                <p className="text-yellow-400 text-lg font-bold">{stats.fdu.expirando + stats.fichaEmergencia.expirando}</p>
                <p className="text-xs text-gray-400">Expirando</p>
              </div>
              <div className="flex-1 bg-gray-800/50 rounded-lg p-3 text-center">
                <p className="text-red-400 text-lg font-bold">{stats.fdu.vencidas + stats.fichaEmergencia.vencidas}</p>
                <p className="text-xs text-gray-400">Vencidos</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Cards de navegação */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <Link href="/fdu/fdu">
            <motion.div 
              initial={fadeIn.hidden}
              animate={fadeIn.visible}
              transition={{ delay: 0.4 }}
              className="bg-gray-800/50 hover:bg-gray-800/70 border border-gray-700 hover:border-blue-700/50 rounded-xl p-6 transition-all cursor-pointer group h-full"
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex justify-between items-start mb-6">
                <div className="p-3 bg-blue-900/30 rounded-lg">
                  <HiDocumentText className="text-3xl text-blue-400" />
                </div>
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-900/30 text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  <HiChevronRight />
                </div>
              </div>
              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-300 transition-colors">Gerenciar FDUs</h3>
              <p className="text-gray-400 mb-4">Cadastre, consulte, edite ou exclua fichas de segurança de produtos químicos</p>
              <div className="flex items-center text-sm text-blue-400 font-medium">
                <span>Acessar módulo</span>
                <HiChevronRight className="ml-1 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.div>
          </Link>
          
          <Link href="/fdu/emergencia">
            <motion.div 
              initial={fadeIn.hidden}
              animate={fadeIn.visible}
              transition={{ delay: 0.5 }}
              className="bg-gray-800/50 hover:bg-gray-800/70 border border-gray-700 hover:border-purple-700/50 rounded-xl p-6 transition-all cursor-pointer group h-full"
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex justify-between items-start mb-6">
                <div className="p-3 bg-purple-900/30 rounded-lg">
                  <HiShieldExclamation className="text-3xl text-purple-400" />
                </div>
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-purple-900/30 text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  <HiChevronRight />
                </div>
              </div>
              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-300 transition-colors">Fichas de Emergência</h3>
              <p className="text-gray-400 mb-4">Gerencie as fichas para transporte de produtos perigosos</p>
              <div className="flex items-center text-sm text-purple-400 font-medium">
                <span>Acessar módulo</span>
                <HiChevronRight className="ml-1 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.div>
          </Link>
        </div>
      </main>
    </div>
  );
}
