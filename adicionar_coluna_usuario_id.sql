-- Script SQL para adicionar a coluna usuario_id na tabela fdus
-- Execute isso no Editor SQL do painel de administração do Supabase

-- Verificar se a coluna usuario_id já existe e adicionar se não existir
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'fdus' AND column_name = 'usuario_id') THEN
        ALTER TABLE fdus ADD COLUMN "usuario_id" UUID REFERENCES usuarios(id);
    END IF;
END
$$;

-- Confirmar a alteração
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'fdus' AND column_name = 'usuario_id';
