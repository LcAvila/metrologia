-- Script para inserir os usuários específicos na tabela usuarios
-- Este script inclui a coluna de foto que já existe na sua tabela

-- Inserir Lucas Ávila como admin
INSERT INTO usuarios (id, nome, email, tipo_usuario, foto)
VALUES (
  '1ce76ad3-9577-4a85-b919-043e75024f4f', 
  'Lucas Ávila', 
  'lucas.avila@email.com', 
  'admin',
  'https://fzuytdzwuwlywdbleysl.supabase.co/storage/v1/object/public/avatars/lucas.jpg'
)
ON CONFLICT (id) 
DO UPDATE SET 
  tipo_usuario = 'admin',
  nome = 'Lucas Ávila',
  atualizado_em = NOW();

-- Inserir Vinicius Teixeira como quimico
INSERT INTO usuarios (id, nome, email, tipo_usuario, foto)
VALUES (
  'b0c6ed99-7079-4ad2-b6fc-2db3c288e4cd', 
  'Vinicius Teixeira', 
  'vinicius.teixeira@email.com', 
  'quimico',
  'https://fzuytdzwuwlywdbleysl.supabase.co/storage/v1/object/public/avatars/vinicius.jpg'
)
ON CONFLICT (id) 
DO UPDATE SET 
  tipo_usuario = 'quimico',
  nome = 'Vinicius Teixeira',
  atualizado_em = NOW();

-- Inserir Sérgio Zago como metrologista
INSERT INTO usuarios (id, nome, email, tipo_usuario, foto)
VALUES (
  'f25eefb1-5f52-4f5f-9923-7ba114fc0f02', 
  'Sérgio Zago', 
  'sergio.zago@email.com', 
  'metrologista',
  'https://fzuytdzwuwlywdbleysl.supabase.co/storage/v1/object/public/avatars/sergio.jpg'
)
ON CONFLICT (id) 
DO UPDATE SET 
  tipo_usuario = 'metrologista',
  nome = 'Sérgio Zago',
  atualizado_em = NOW();

-- Verificar se os usuários foram inseridos corretamente
SELECT id, nome, email, tipo_usuario, foto FROM usuarios;
