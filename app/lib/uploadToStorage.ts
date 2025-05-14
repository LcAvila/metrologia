import { supabase } from './supabaseClient';

export async function uploadToStorage(file: File, tipo: 'certificados' | 'registros') {
  // Obter UID do usuário autenticado
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();
  if (userError || !user) throw new Error('Usuário não autenticado');

  if (!file || file.size === 0) {
    throw new Error('Arquivo inválido ou vazio.');
  }

  const uid = user.id;
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}_${file.name}`;
  const filePath = `${uid}/${tipo}/${fileName}`; // Ex: uid/certificados/arquivo.pdf

  const { data, error } = await supabase.storage
    .from('documentos')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true // Permite sobrescrever se já existir
    });

  if (error) {
    console.error('Erro ao fazer upload:', error.message || error);
    throw new Error(error.message || 'Erro desconhecido ao fazer upload');
  }
  return filePath;
}
