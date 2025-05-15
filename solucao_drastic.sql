-- Solução drástica para resolver o problema de recursão infinita
-- Esta solução desabilita completamente o RLS para a tabela usuarios

-- 1. Remover todas as políticas existentes
DROP POLICY IF EXISTS "Usuarios visualizam proprio perfil" ON usuarios;
DROP POLICY IF EXISTS "Admins gerenciam todos usuarios" ON usuarios;
DROP POLICY IF EXISTS "Permitir acesso a todos usuarios autenticados" ON usuarios;

-- 2. Desabilitar RLS para a tabela usuarios
ALTER TABLE usuarios DISABLE ROW LEVEL SECURITY;

-- 3. Certificar-se de que os usuários existem
INSERT INTO usuarios (id, nome, email, tipo_usuario)
VALUES ('1ce76ad3-9577-4a85-b919-043e75024f4f', 'Lucas Ávila', 'lucas.avila@email.com', 'admin')
ON CONFLICT (id) DO UPDATE SET tipo_usuario = 'admin';

INSERT INTO usuarios (id, nome, email, tipo_usuario)
VALUES ('b0c6ed99-7079-4ad2-b6fc-2db3c288e4cd', 'Vinicius Teixeira', 'vinicius@email.com', 'quimico')
ON CONFLICT (id) DO UPDATE SET tipo_usuario = 'quimico';

INSERT INTO usuarios (id, nome, email, tipo_usuario)
VALUES ('f25eefb1-5f52-4f5f-9923-7ba114fc0f02', 'Sérgio Zago', 'sergio@email.com', 'metrologista')
ON CONFLICT (id) DO UPDATE SET tipo_usuario = 'metrologista';

-- 4. Verificar se a tabela está acessível
SELECT * FROM usuarios LIMIT 10;
