import { IconType } from 'react-icons';

interface StatCardProps {
  title: string;
  value: number;
  icon: IconType;
  color: string;
  change?: number;
  subtitle?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, color, change, subtitle }) => {
  return (
    <div className={`bg-gray-900/70 border border-gray-800 rounded-xl p-5 relative overflow-hidden`}>
      <div className={`absolute top-0 right-0 w-24 h-24 -mr-6 -mt-6 rounded-full opacity-10 ${color}`}></div>
      <div className="flex justify-between items-start z-10 relative">
        <div>
          <p className="text-gray-400 text-sm font-medium mb-1">{title}</p>
          <h3 className={`text-3xl font-bold ${color}`}>{value}</h3>
          {subtitle && <p className="text-gray-400 text-xs mt-1">{subtitle}</p>}
          {change !== undefined && (
            <div className={`mt-2 inline-flex items-center text-xs ${change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {change >= 0 ? '↑' : '↓'} {Math.abs(change)}% em 30 dias
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color} bg-opacity-20`}>
          <Icon className={`text-xl ${color}`} />
        </div>
      </div>
    </div>
  );
};

export default StatCard;
