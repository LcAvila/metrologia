-- Script rápido para adicionar a coluna 'validade' à tabela fichas_emergencia
-- Execute este script diretamente no SQL Editor do Supabase

-- Verificar se a coluna já existe, se não, criá-la
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'fichas_emergencia' AND column_name = 'validade'
    ) THEN
        -- Adicionar a coluna 'validade' à tabela
        ALTER TABLE public.fichas_emergencia ADD COLUMN validade TIMESTAMP WITH TIME ZONE;
        
        -- Atualizar os registros existentes com uma data padrão (opcional)
        -- Isso é útil para evitar problemas com consultas existentes
        UPDATE public.fichas_emergencia SET validade = NOW() + INTERVAL '6 months';
        
        RAISE NOTICE 'Coluna validade adicionada com sucesso à tabela fichas_emergencia.';
    ELSE
        RAISE NOTICE 'A coluna validade já existe na tabela fichas_emergencia. Nenhuma alteração foi feita.';
    END IF;
END
$$;
