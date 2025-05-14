import { useState } from 'react';
import { HiExclamation, HiOutlineChevronDown } from 'react-icons/hi';

interface AlertItemProps {
  title: string;
  items: { id: string; nome: string; data: string; tipo: string }[];
}

const AlertItem: React.FC<AlertItemProps> = ({ title, items }) => {
  const [isOpen, setIsOpen] = useState(true);
  
  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden mb-4">
      <button 
        className="w-full p-4 flex justify-between items-center text-left"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h3 className="text-md font-semibold text-white flex items-center gap-2">
          <HiExclamation className="text-yellow-500" /> {title} <span className="text-yellow-500 text-sm">({items.length})</span>
        </h3>
        <HiOutlineChevronDown className={`text-white transition-transform ${isOpen ? 'transform rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="divide-y divide-gray-800/50">
          {items.length === 0 ? (
            <div className="p-4 text-center text-gray-400">
              Nenhum item para exibir
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="p-3 hover:bg-gray-800/20 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white">{item.nome}</p>
                    <p className="text-xs text-gray-400">{item.tipo}</p>
                  </div>
                  <div className="text-xs px-2 py-1 rounded-full bg-yellow-900/20 text-yellow-400">
                    {new Date(item.data).toLocaleDateString('pt-BR')}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default AlertItem;
