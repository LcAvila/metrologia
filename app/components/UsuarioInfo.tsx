import { useEffect, useState } from 'react';
import { getUsuarioLogado, Usuario } from '../lib/usuarioService';

export default function UsuarioInfo() {
  const [usuario, setUsuario] = useState<Usuario | null>(null);

  useEffect(() => {
    getUsuarioLogado().then(setUsuario);
  }, []);

  if (!usuario) return <div className="text-gray-400">Carregando informações do usuário...</div>;

  return (
    <div className="flex items-center gap-4 p-4 bg-gray-800 rounded-lg">
      {usuario.foto && (
        <img src={usuario.foto} alt="Foto de perfil" className="w-16 h-16 rounded-full border border-gray-700 object-cover" />
      )}
      <div>
        <div className="font-bold text-lg">{usuario.nome} {usuario.sobrenome}</div>
        <div className="text-sm text-gray-300">{usuario.email}</div>
        <div className="text-sm">Idade: {usuario.idade ?? 'Não informada'}</div>
        <div className="text-sm capitalize">Tipo: {usuario.tipo_usuario}</div>
      </div>
    </div>
  );
}
