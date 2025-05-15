-- Script para inserir os usuários específicos na tabela usuarios
-- Este script deve ser executado depois que a tabela usuarios já foi criada

-- Inserir Lucas Ávila como admin
INSERT INTO usuarios (id, nome, email, tipo_usuario)
VALUES ('1ce76ad3-9577-4a85-b919-043e75024f4f', 'Lucas Ávila', 'lucas.avila@email.com', 'admin')
ON CONFLICT (id) 
DO UPDATE SET 
  tipo_usuario = 'admin',
  atualizado_em = NOW()
WHERE usuarios.id = '1ce76ad3-9577-4a85-b919-043e75024f4f';

-- Inserir Vinicius Teixeira como quimico
INSERT INTO usuarios (id, nome, email, tipo_usuario)
VALUES ('b0c6ed99-7079-4ad2-b6fc-2db3c288e4cd', 'Vinicius Teixeira', 'vinicius.teixeira@email.com', 'quimico')
ON CONFLICT (id) 
DO UPDATE SET 
  tipo_usuario = 'quimico',
  atualizado_em = NOW()
WHERE usuarios.id = 'b0c6ed99-7079-4ad2-b6fc-2db3c288e4cd';

-- Inserir Sérgio Zago como metrologista
INSERT INTO usuarios (id, nome, email, tipo_usuario)
VALUES ('f25eefb1-5f52-4f5f-9923-7ba114fc0f02', 'Sérgio Zago', 'sergio.zago@email.com', 'metrologista')
ON CONFLICT (id) 
DO UPDATE SET 
  tipo_usuario = 'metrologista',
  atualizado_em = NOW()
WHERE usuarios.id = 'f25eefb1-5f52-4f5f-9923-7ba114fc0f02';

-- Verificar se os usuários foram inseridos corretamente
SELECT id, nome, email, tipo_usuario FROM usuarios;
