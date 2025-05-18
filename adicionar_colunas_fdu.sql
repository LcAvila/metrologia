-- Script SQL para adicionar as colunas que faltam na tabela de FDUs
-- Execute isso no Editor SQL do painel de administração do Supabase

-- Verificar se a coluna classeRisco já existe e adicionar se não existir
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'fdus' AND column_name = 'classeRisco') THEN
        ALTER TABLE fdus ADD COLUMN "classeRisco" TEXT;
    END IF;
END
$$;

-- Verificar se a coluna localArmazenamento já existe e adicionar se não existir
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'fdus' AND column_name = 'localArmazenamento') THEN
        ALTER TABLE fdus ADD COLUMN "localArmazenamento" TEXT;
    END IF;
END
$$;

-- Verificar se a coluna epiNecessario já existe e adicionar se não existir
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'fdus' AND column_name = 'epiNecessario') THEN
        ALTER TABLE fdus ADD COLUMN "epiNecessario" TEXT;
    END IF;
END
$$;

-- Verificar se a coluna medidasPreventivas já existe e adicionar se não existir
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'fdus' AND column_name = 'medidasPreventivas') THEN
        ALTER TABLE fdus ADD COLUMN "medidasPreventivas" TEXT;
    END IF;
END
$$;

-- Verificar se a coluna destinacaoProduto já existe e adicionar se não existir
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'fdus' AND column_name = 'destinacaoProduto') THEN
        ALTER TABLE fdus ADD COLUMN "destinacaoProduto" TEXT;
    END IF;
END
$$;

-- Verificar se a coluna nomeTecnico já existe e adicionar se não existir
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'fdus' AND column_name = 'nomeTecnico') THEN
        ALTER TABLE fdus ADD COLUMN "nomeTecnico" TEXT;
    END IF;
END
$$;

-- Verificar se a coluna numeroCas já existe e adicionar se não existir
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'fdus' AND column_name = 'numeroCas') THEN
        ALTER TABLE fdus ADD COLUMN "numeroCas" TEXT;
    END IF;
END
$$;

-- Verificar se a coluna classificacaoGHS já existe e adicionar se não existir
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'fdus' AND column_name = 'classificacaoGHS') THEN
        ALTER TABLE fdus ADD COLUMN "classificacaoGHS" TEXT;
    END IF;
END
$$;

-- Confirmar a alteração
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'fdus'
ORDER BY ordinal_position;
