'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { HiBeaker, HiDocumentText, HiShieldExclamation, HiOutlineChevronDown } from 'react-icons/hi';
import FISPQDashboard from './components/FISPQDashboard';
import FISPQList from './components/FISPQList';
import FichaEmergenciaList from './components/FichaEmergenciaList';
import { supabase } from '../lib/supabaseClient';

export default function FISPQPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUser(session.user);
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

  const TabButton = ({ id, label, icon: Icon, active }: { id: string; label: string; icon: React.ElementType; active: boolean }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`px-5 py-3 rounded-lg flex items-center gap-2 transition-colors ${active ? 'bg-gradient-to-r from-blue-900/80 to-blue-800/50 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-800/60'}`}
    >
      <Icon className={active ? 'text-blue-400' : ''} />
      <span>{label}</span>
    </button>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center">
        <div className="w-16 h-16 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      {/* Header */}
      <header className="sticky top-0 z-30 w-full py-4 px-6 md:px-10 bg-black/40 backdrop-blur-sm border-b border-gray-800 flex justify-between items-center shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center">
            <HiBeaker className="text-xl" />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            FISPQ & Fichas de Emergência
          </h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs de navegação */}
        <div className="flex flex-wrap gap-2 mb-8 border-b border-gray-800 pb-4">
          <TabButton
            id="dashboard"
            label="Dashboard"
            icon={HiDocumentText}
            active={activeTab === 'dashboard'}
          />
          <TabButton
            id="fispqs"
            label="FISPQs"
            icon={HiBeaker}
            active={activeTab === 'fispqs'}
          />
          <TabButton
            id="fichas"
            label="Fichas de Emergência"
            icon={HiShieldExclamation}
            active={activeTab === 'fichas'}
          />
        </div>

        {/* Conteúdo da tab selecionada */}
        <div className="mt-6">
          {activeTab === 'dashboard' && <FISPQDashboard />}
          {activeTab === 'fispqs' && <FISPQList isAdmin={true} />}
          {activeTab === 'fichas' && <FichaEmergenciaList isAdmin={true} />}
        </div>
      </main>
    </div>
  );
}
