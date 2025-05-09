import { supabase } from './supabaseClient';

export function getPublicUrl(filePath: string) {
  return supabase.storage.from('documentos').getPublicUrl(filePath).data.publicUrl;
}
