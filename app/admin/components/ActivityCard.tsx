import { HiBeaker, HiDocumentText, HiUsers, HiCube, HiClock } from 'react-icons/hi';

interface Activity {
  id: string;
  tipo: 'fispq' | 'certificado' | 'usuario' | 'equipamento';
  acao: 'criacao' | 'atualizacao' | 'exclusao';
  descricao: string;
  data: string;
  usuario: string;
}

interface ActivityCardProps {
  activities: Activity[];
}

const ActivityCard: React.FC<ActivityCardProps> = ({ activities }) => {
  return (
    <div className="bg-gray-900/70 border border-gray-800 rounded-xl overflow-hidden">
      <div className="p-4 border-b border-gray-800/80 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <HiClock className="text-blue-400" /> Atividades Recentes
        </h3>
        <button className="text-sm text-gray-400 hover:text-white transition-colors">
          Ver todas
        </button>
      </div>
      
      <div className="divide-y divide-gray-800/50">
        {activities.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            Nenhuma atividade recente encontrada
          </div>
        ) : (
          activities.map((activity) => (
            <div key={activity.id} className="p-4 hover:bg-gray-800/20 transition-colors">
              <div className="flex items-start">
                <div className={`p-2 rounded-full mr-3 ${
                  activity.tipo === 'fispq' ? 'bg-green-500/10 text-green-400' :
                  activity.tipo === 'certificado' ? 'bg-blue-500/10 text-blue-400' :
                  activity.tipo === 'usuario' ? 'bg-purple-500/10 text-purple-400' :
                  'bg-yellow-500/10 text-yellow-400'
                }`}>
                  {activity.tipo === 'fispq' && <HiBeaker />}
                  {activity.tipo === 'certificado' && <HiDocumentText />}
                  {activity.tipo === 'usuario' && <HiUsers />}
                  {activity.tipo === 'equipamento' && <HiCube />}
                </div>
                
                <div className="flex-grow">
                  <p className="text-sm text-white font-medium">{activity.descricao}</p>
                  <div className="flex items-center text-xs text-gray-400 mt-1">
                    <span className="mr-2">{activity.usuario}</span>
                    <span>{new Date(activity.data).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}</span>
                  </div>
                </div>
                
                <div className={`text-xs px-2 py-1 rounded-full ${
                  activity.acao === 'criacao' ? 'bg-green-900/20 text-green-400' :
                  activity.acao === 'atualizacao' ? 'bg-blue-900/20 text-blue-400' :
                  'bg-red-900/20 text-red-400'
                }`}>
                  {activity.acao === 'criacao' ? 'Novo' : 
                   activity.acao === 'atualizacao' ? 'Atualizado' : 'Excluído'}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ActivityCard;
