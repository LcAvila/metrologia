import { IconType } from 'react-icons';

interface ModuleCardProps {
  title: string;
  icon: IconType;
  statItems: { label: string; value: number; icon: IconType; color: string }[];
  actions: { label: string; onClick: () => void }[];
}

const ModuleCard: React.FC<ModuleCardProps> = ({ title, icon: Icon, statItems, actions }) => {
  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl border border-gray-800 shadow-lg overflow-hidden">
      <div className="p-5 border-b border-gray-800/80">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-500/10">
            <Icon className="text-blue-400 text-xl" />
          </div>
          <h3 className="text-lg font-semibold text-white">{title}</h3>
        </div>
      </div>
      
      <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {statItems.map((item, idx) => (
          <div key={idx} className="bg-gray-800/50 rounded-lg p-3 flex items-center">
            <div className={`p-2 rounded-lg ${item.color} bg-opacity-20 mr-3`}>
              <item.icon className={`text-lg ${item.color}`} />
            </div>
            <div>
              <p className="text-xs text-gray-400">{item.label}</p>
              <p className="text-xl font-semibold text-white">{item.value}</p>
            </div>
          </div>
        ))}
      </div>
      
      <div className="p-4 bg-gray-800/80 border-t border-gray-700/30 flex flex-wrap gap-2">
        {actions.map((action, idx) => (
          <button
            key={idx}
            onClick={action.onClick}
            className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-sm text-white rounded-lg transition-colors"
          >
            {action.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ModuleCard;
