'use client';
import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { createClient } from '@supabase/supabase-js';
import { FaUserPlus, FaEdit, FaTrash, FaKey } from 'react-icons/fa';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Usuario {
  id: string;
  email: string;
  nome: string;
  tipo: 'admin' | 'metrologista' | 'quimico';
  criadoEm: string;
}

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    nome: '',
    tipo: 'metrologista',
    senha: ''
  });
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    loadUsuarios();
  }, []);

  async function loadUsuarios() {
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .order('nome');

      if (error) throw error;
      setUsuarios(data || []);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      alert('Erro ao carregar usuários. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (editingId) {
        // Atualizar usuário
        const { error } = await supabase
          .from('usuarios')
          .update({
            nome: formData.nome,
            tipo: formData.tipo
          })
          .eq('id', editingId);

        if (error) throw error;
      } else {
        // Criar usuário
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.senha
        });

        if (authError) throw authError;

        const { error: dbError } = await supabase
          .from('usuarios')
          .insert({
            id: authData.user!.id,
            email: formData.email,
            nome: formData.nome,
            tipo: formData.tipo
          });

        if (dbError) throw dbError;
      }

      setShowForm(false);
      setEditingId(null);
      setFormData({ email: '', nome: '', tipo: 'metrologista', senha: '' });
      loadUsuarios();
    } catch (error) {
      console.error('Erro ao salvar usuário:', error);
      alert('Erro ao salvar usuário. Por favor, tente novamente.');
    }
  }

  async function handleDelete(id: string) {
    if (confirm('Tem certeza que deseja excluir este usuário?')) {
      try {
        const { error } = await supabase
          .from('usuarios')
          .delete()
          .eq('id', id);

        if (error) throw error;
        loadUsuarios();
      } catch (error) {
        console.error('Erro ao excluir usuário:', error);
        alert('Erro ao excluir usuário. Por favor, tente novamente.');
      }
    }
  }

  function handleEdit(usuario: Usuario) {
    setFormData({
      email: usuario.email,
      nome: usuario.nome,
      tipo: usuario.tipo,
      senha: ''
    });
    setEditingId(usuario.id);
    setShowForm(true);
  }

  return (
    <Layout title="Gerenciar Usuários">
      <div className="p-4 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Gerenciar Usuários</h1>
          <button
            onClick={() => {
              setShowForm(true);
              setEditingId(null);
              setFormData({ email: '', nome: '', tipo: 'metrologista', senha: '' });
            }}
            className="px-4 py-2 bg-[var(--success)] text-white rounded-md hover:bg-[var(--success-dark)] transition-colors inline-flex items-center gap-2"
          >
            <FaUserPlus /> Novo Usuário
          </button>
        </div>

        {showForm && (
          <div className="bg-[var(--card-bg)] p-4 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">
              {editingId ? 'Editar Usuário' : 'Novo Usuário'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">E-mail</label>
                  <input
                    type="email"
                    required
                    disabled={!!editingId}
                    className="w-full px-3 py-2 border rounded-md bg-[var(--input-bg)] text-[var(--input-text)]"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Nome</label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border rounded-md bg-[var(--input-bg)] text-[var(--input-text)]"
                    value={formData.nome}
                    onChange={e => setFormData({ ...formData, nome: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Tipo</label>
                  <select
                    required
                    className="w-full px-3 py-2 border rounded-md bg-[var(--input-bg)] text-[var(--input-text)]"
                    value={formData.tipo}
                    onChange={e => setFormData({ ...formData, tipo: e.target.value as Usuario['tipo'] })}
                  >
                    <option value="metrologista">Metrologista</option>
                    <option value="quimico">Químico</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>

                {!editingId && (
                  <div>
                    <label className="block text-sm font-medium mb-1">Senha</label>
                    <input
                      type="password"
                      required
                      className="w-full px-3 py-2 border rounded-md bg-[var(--input-bg)] text-[var(--input-text)]"
                      value={formData.senha}
                      onChange={e => setFormData({ ...formData, senha: e.target.value })}
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                  }}
                  className="px-4 py-2 text-[var(--foreground)] hover:bg-[var(--hover)] rounded-md transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[var(--primary)] text-white rounded-md hover:bg-[var(--primary-dark)] transition-colors inline-flex items-center gap-2"
                >
                  {editingId ? <FaEdit /> : <FaUserPlus />} {editingId ? 'Atualizar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-[var(--card-bg)] p-4 rounded-lg shadow overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="py-2 text-left">Nome</th>
                <th className="py-2 text-left">E-mail</th>
                <th className="py-2 text-left">Tipo</th>
                <th className="py-2 text-center">Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="text-center py-4">
                    Carregando...
                  </td>
                </tr>
              ) : usuarios.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-4 text-[var(--muted)]">
                    Nenhum usuário encontrado
                  </td>
                </tr>
              ) : (
                usuarios.map(usuario => (
                  <tr key={usuario.id} className="border-b border-[var(--border)] hover:bg-[var(--hover)]">
                    <td className="py-2">{usuario.nome}</td>
                    <td className="py-2">{usuario.email}</td>
                    <td className="py-2">
                      {usuario.tipo === 'admin' ? 'Administrador' :
                       usuario.tipo === 'metrologista' ? 'Metrologista' : 'Químico'}
                    </td>
                    <td className="py-2">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleEdit(usuario)}
                          className="text-[var(--warning)] hover:text-[var(--warning-dark)] transition-colors"
                          title="Editar"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(usuario.id)}
                          className="text-[var(--danger)] hover:text-[var(--danger-dark)] transition-colors"
                          title="Excluir"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
}
