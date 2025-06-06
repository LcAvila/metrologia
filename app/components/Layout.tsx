'use client';
import { ReactNode, memo, useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import { useTheme } from '../context/ThemeContext';
import { NotificationProvider } from '../context/NotificationContext';

interface LayoutProps {
  children: ReactNode;
  title: string;
}

// Usando memo para evitar renderizações desnecessárias do componente Layout
const Layout = memo(function Layout({ children, title }: LayoutProps) {
  const { theme } = useTheme();
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  
  // Detectar mudanças na sidebar através de um observador de mutação
  useEffect(() => {
    const sidebarElement = document.querySelector('.sidebar') as HTMLElement;
    if (!sidebarElement) return;
    
    // Verificar a largura inicial da sidebar
    const checkSidebarWidth = () => {
      const sidebarWidth = sidebarElement.offsetWidth;
      setSidebarExpanded(sidebarWidth > 70); // Se for maior que 70px, consideramos expandida
    };
    
    // Verificar imediatamente
    checkSidebarWidth();
    
    // Configurar um observador para detectar mudanças na classe da sidebar
    const observer = new MutationObserver(checkSidebarWidth);
    observer.observe(sidebarElement, { attributes: true, attributeFilter: ['class'] });
    
    return () => observer.disconnect();
  }, []);
  
  return (
    <div className={`flex min-h-screen transition-colors duration-300 relative ${theme === 'dark' ? 'bg-slate-950' : 'bg-[var(--background)]'}`}>
      <div className="background-grid"></div>
      <div className="background-blur"></div>
      <Sidebar title={title} />

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${sidebarExpanded ? 'md:ml-64' : 'md:ml-16'} pt-14 sm:pt-16 md:pt-0 relative z-10 max-w-full`}>
        <main className="p-2 sm:p-3 md:p-5 overflow-x-hidden">
          <h1 className={`text-base sm:text-xl md:text-2xl font-bold mb-2 sm:mb-3 md:mb-5 ${theme === 'dark' ? 'text-[var(--foreground)]' : 'text-[var(--foreground)]'}`}>{title}</h1>
          {children}
        </main>
      </div>
    </div>
  );
});

export default Layout;