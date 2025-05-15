-- Script para corrigir o problema de recursão infinita nas políticas RLS
-- Este erro acontece porque a política "Admins gerenciam todos usuarios" está referenciando a própria tabela,
-- causando uma recursão infinita

-- 1. Primeiro, vamos remover todas as políticas atuais da tabela usuarios
DROP POLICY IF EXISTS "Usuarios visualizam proprio perfil" ON usuarios;
DROP POLICY IF EXISTS "Admins gerenciam todos usuarios" ON usuarios;

-- 2. Desabilitar temporariamente RLS para permitir a inserção de dados
ALTER TABLE usuarios DISABLE ROW LEVEL SECURITY;

-- 3. Verificar se os usuários existem e se não, inserir
INSERT INTO usuarios (id, nome, email, tipo_usuario)
VALUES ('1ce76ad3-9577-4a85-b919-043e75024f4f', 'Lucas Ávila', 'lucas.avila@email.com', 'admin')
ON CONFLICT (id) DO UPDATE SET tipo_usuario = 'admin';

INSERT INTO usuarios (id, nome, email, tipo_usuario)
VALUES ('b0c6ed99-7079-4ad2-b6fc-2db3c288e4cd', 'Vinicius Teixeira', 'vinicius@email.com', 'quimico')
ON CONFLICT (id) DO UPDATE SET tipo_usuario = 'quimico';

INSERT INTO usuarios (id, nome, email, tipo_usuario)
VALUES ('f25eefb1-5f52-4f5f-9923-7ba114fc0f02', 'Sérgio Zago', 'sergio@email.com', 'metrologista')
ON CONFLICT (id) DO UPDATE SET tipo_usuario = 'metrologista';

-- 4. Criar uma política simples que permita acesso a todos os usuários autenticados
-- Isso elimina o problema de recursão infinita
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permitir acesso a todos usuarios autenticados" ON usuarios
  FOR ALL
  USING (auth.role() = 'authenticated');

-- 5. Verificar se a tabela está disponível agora
SELECT * FROM usuarios LIMIT 5;
