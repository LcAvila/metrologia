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
  HiSearch,
  HiExclamation,
  HiClipboardCheck,
  HiCog,
  HiLogout,
  HiUser
} from 'react-icons/hi';
import { supabase } from '../lib/supabaseClient';
import { fispqService } from './services/fispqService';
import { fichaEmergenciaService } from './services/fichaEmergenciaService';
import { FISPQ } from './types/fispq';
import { FichaEmergencia } from './types/fichaEmergencia';

export default function FISPQPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    fispq: {
      total: 0,
      expirando: 0,
      setores: 0
    },
    fichaEmergencia: {
      total: 0,
      expirando: 0,
      classesRisco: 0
    }
  });
  const [recentFispqs, setRecentFispqs] = useState<FISPQ[]>([]);
  const [expiringFispqs, setExpiringFispqs] = useState<FISPQ[]>([]);
  const [recentFichas, setRecentFichas] = useState<FichaEmergencia[]>([]);
  
  useEffect(() => {
    checkUser();
    loadDashboardData();
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
    } finally {
      setLoading(false);
    }
  }

  async function loadDashboardData() {
    try {
      // Carregar estatísticas
      const fispqStats = await fispqService.getStatistics();
      const fichaStats = await fichaEmergenciaService.getStatistics();
      
      setStats({
        fispq: fispqStats,
        fichaEmergencia: fichaStats
      });

      // Carregar FISPQs recentes
      const fispqs = await fispqService.list();
      setRecentFispqs(fispqs.slice(0, 5));
      
      // Filtrar FISPQs expirando
      const expiringDocs = fispqs.filter(f => f.status === 'expiring');
      setExpiringFispqs(expiringDocs.slice(0, 5));
      
      // Carregar Fichas de Emergência recentes
      const fichas = await fichaEmergenciaService.list();
      setRecentFichas(fichas.slice(0, 5));
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
    }
  }

  async function handleLogout() {
    try {
      await supabase.auth.signOut();
      router.push('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center">
        <div className="w-16 h-16 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Componente de card de estatística
  const StatCard = ({ title, value, icon: Icon, color }: { title: string; value: number; icon: React.ElementType; color: string }) => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-${color}/20 shadow-lg`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm font-medium mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-white">{value}</h3>
        </div>
        <div className={`p-3 rounded-full bg-${color}/20 text-${color}`}>
          <Icon className="text-2xl" />
        </div>
      </div>
    </motion.div>
  );

  // Componente de card de ação rápida
  const ActionCard = ({ title, description, icon: Icon, href, color }: { title: string; description: string; icon: React.ElementType; href: string; color: string }) => (
    <Link href={href}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.03, y: -5 }}
        transition={{ duration: 0.2 }}
        className={`bg-gray-800/30 hover:bg-${color}/10 backdrop-blur-sm p-6 rounded-xl border border-gray-700 hover:border-${color}/30 shadow-lg cursor-pointer h-full transition-all duration-300`}
      >
        <div className={`p-3 rounded-full bg-${color}/20 text-${color} w-fit mb-4`}>
          <Icon className="text-2xl" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
        <p className="text-gray-400 text-sm">{description}</p>
      </motion.div>
    </Link>
  );

  // Componente de linha para documento (FISPQ ou Ficha de Emergência)
  const DocumentRow = ({ doc, type }: { doc: any; type: 'fispq' | 'ficha' }) => {
    const statusColors = {
      valid: 'text-green-400',
      expiring: 'text-yellow-400',
      expired: 'text-red-400'
    };

    const formatDate = (date: string | Date) => {
      return new Date(date).toLocaleDateString('pt-BR');
    };

    return (
      <div className="border-b border-gray-700 py-3 px-4 hover:bg-gray-800/30 rounded-lg transition-colors">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className={`rounded-full p-2 ${type === 'fispq' ? 'bg-blue-900/30' : 'bg-purple-900/30'}`}>
              {type === 'fispq' ? <HiBeaker className="text-blue-400" /> : <HiShieldExclamation className="text-purple-400" />}
            </div>
            <div>
              <h4 className="font-medium text-white">{doc.produto || doc.nome}</h4>
              <p className="text-sm text-gray-400">{doc.fabricante || doc.fornecedor}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className={`text-sm ${statusColors[doc.status || 'valid']}`}>
              {formatDate(doc.validade)}
            </span>
            <Link 
              href={type === 'fispq' ? `/fispq/editar/${doc.id}` : `/fispq/ficha-emergencia/editar/${doc.id}`}
              className="text-gray-400 hover:text-blue-400 transition-colors"
            >
              <HiCog />
            </Link>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      {/* Header */}
      <header className="sticky top-0 z-30 w-full py-4 px-6 md:px-10 bg-black/40 backdrop-blur-sm border-b border-gray-800 flex justify-between items-center shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
            <HiBeaker className="text-xl" />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
            Painel do Químico
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
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold text-white mb-2"
          >
            Dashboard
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
          <StatCard 
            title="Total de FISPQs" 
            value={stats.fispq.total} 
            icon={HiDocumentText} 
            color="blue"
          />
          <StatCard 
            title="FISPQs Expirando" 
            value={stats.fispq.expirando} 
            icon={HiExclamation} 
            color="yellow"
          />
          <StatCard 
            title="Fichas de Emergência" 
            value={stats.fichaEmergencia.total} 
            icon={HiShieldExclamation} 
            color="purple"
          />
          <StatCard 
            title="Setores" 
            value={stats.fispq.setores} 
            icon={HiBeaker} 
            color="green"
          />
        </div>

        {/* Ações Rápidas */}
        <h2 className="text-xl font-bold text-white mb-4 border-b border-gray-800 pb-2">Ações Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <ActionCard 
            title="Nova FISPQ" 
            description="Cadastre uma nova ficha de informação de segurança de produto químico" 
            icon={HiPlus} 
            href="/fispq/cadastro" 
            color="blue"
          />
          <ActionCard 
            title="Nova Ficha de Emergência" 
            description="Adicione uma nova ficha de emergência para transporte" 
            icon={HiPlus} 
            href="/fispq/emergencia" 
            color="purple"
          />
          <ActionCard 
            title="Buscar Documentos" 
            description="Procure por documentos cadastrados no sistema" 
            icon={HiSearch} 
            href="/fispq/fisqps" 
            color="green"
          />
        </div>

        {/* Documentos Recentes e Expirando */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* FISPQs Recentes */}
          <div>
            <div className="flex items-center justify-between mb-4 border-b border-gray-800 pb-2">
              <h2 className="text-xl font-bold text-white">FISPQs Recentes</h2>
              <Link href="/fispq/fisqps" className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
                Ver todas
              </Link>
            </div>
            <div className="bg-gray-900/30 backdrop-blur-sm rounded-xl border border-gray-800 overflow-hidden">
              {recentFispqs.length > 0 ? (
                <div>
                  {recentFispqs.map((fispq) => (
                    <DocumentRow key={fispq.id} doc={fispq} type="fispq" />
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-gray-400">
                  Nenhuma FISPQ cadastrada ainda
                </div>
              )}
            </div>
          </div>

          {/* Documentos Expirando */}
          <div>
            <div className="flex items-center justify-between mb-4 border-b border-gray-800 pb-2">
              <h2 className="text-xl font-bold text-white">Documentos Expirando</h2>
            </div>
            <div className="bg-gray-900/30 backdrop-blur-sm rounded-xl border border-gray-800 overflow-hidden">
              {expiringFispqs.length > 0 ? (
                <div>
                  {expiringFispqs.map((fispq) => (
                    <DocumentRow key={fispq.id} doc={fispq} type="fispq" />
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-gray-400">
                  Nenhum documento expirando nos próximos 30 dias
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Fichas de Emergência Recentes */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4 border-b border-gray-800 pb-2">
            <h2 className="text-xl font-bold text-white">Fichas de Emergência Recentes</h2>
            <Link href="/fispq/ficha-emergencia" className="text-sm text-purple-400 hover:text-purple-300 transition-colors">
              Ver todas
            </Link>
          </div>
          <div className="bg-gray-900/30 backdrop-blur-sm rounded-xl border border-gray-800 overflow-hidden">
            {recentFichas.length > 0 ? (
              <div>
                {recentFichas.map((ficha) => (
                  <DocumentRow key={ficha.id} doc={ficha} type="ficha" />
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-gray-400">
                Nenhuma ficha de emergência cadastrada ainda
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
