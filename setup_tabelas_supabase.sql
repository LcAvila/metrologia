-- Script para criar ou atualizar as tabelas necessárias no Supabase
-- Execute este script no SQL Editor do Supabase para configurar o banco de dados

-- Tabela de FISPQs
CREATE TABLE IF NOT EXISTS public.fispqs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    produto TEXT NOT NULL,
    fabricante TEXT NOT NULL,
    numeroCas TEXT,
    setor TEXT NOT NULL,
    tipoRisco TEXT,
    validade TIMESTAMP WITH TIME ZONE NOT NULL,
    arquivoUrl TEXT NOT NULL,
    criadoEm TIMESTAMP WITH TIME ZONE DEFAULT now(),
    user_id UUID REFERENCES auth.users(id)
);

-- Tabela de Fichas de Emergência
CREATE TABLE IF NOT EXISTS public.fichas_emergencia (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    produto TEXT NOT NULL,
    numeroOnu TEXT NOT NULL,
    classeRisco TEXT NOT NULL,
    setor TEXT,
    validade TIMESTAMP WITH TIME ZONE NOT NULL,
    arquivoUrl TEXT NOT NULL,
    criadoEm TIMESTAMP WITH TIME ZONE DEFAULT now(),
    user_id UUID REFERENCES auth.users(id)
);

-- Tabela de Certificados
CREATE TABLE IF NOT EXISTS public.certificados (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    produto TEXT NOT NULL,
    tipo TEXT NOT NULL,
    setor TEXT,
    validade TIMESTAMP WITH TIME ZONE NOT NULL,
    arquivoUrl TEXT NOT NULL,
    criadoEm TIMESTAMP WITH TIME ZONE DEFAULT now(),
    user_id UUID REFERENCES auth.users(id)
);

-- Tabela de Equipamentos (Metrologia)
CREATE TABLE IF NOT EXISTS public.equipamentos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo TEXT NOT NULL,
    nome TEXT NOT NULL,
    tipo TEXT NOT NULL,
    setor TEXT NOT NULL,
    ultimaCalibracao TIMESTAMP WITH TIME ZONE,
    proximaCalibracao TIMESTAMP WITH TIME ZONE,
    status TEXT,
    responsavel TEXT,
    fabricante TEXT,
    modelo TEXT,
    numeroSerie TEXT,
    criadoEm TIMESTAMP WITH TIME ZONE DEFAULT now(),
    user_id UUID REFERENCES auth.users(id)
);

-- Adicionar Políticas de Segurança Row Level Security (RLS)
ALTER TABLE public.fispqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fichas_emergencia ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificados ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipamentos ENABLE ROW LEVEL SECURITY;

-- Políticas para usuários admin (acesso total)
CREATE POLICY "Acesso total para admin" ON public.fispqs
    FOR ALL USING (
        auth.uid() IN (
            SELECT auth.uid() FROM auth.users
            WHERE auth.jwt() ->> 'user_role' = 'admin'
        )
    );

CREATE POLICY "Acesso total para admin" ON public.fichas_emergencia
    FOR ALL USING (
        auth.uid() IN (
            SELECT auth.uid() FROM auth.users
            WHERE auth.jwt() ->> 'user_role' = 'admin'
        )
    );

CREATE POLICY "Acesso total para admin" ON public.certificados
    FOR ALL USING (
        auth.uid() IN (
            SELECT auth.uid() FROM auth.users
            WHERE auth.jwt() ->> 'user_role' = 'admin'
        )
    );

CREATE POLICY "Acesso total para admin" ON public.equipamentos
    FOR ALL USING (
        auth.uid() IN (
            SELECT auth.uid() FROM auth.users
            WHERE auth.jwt() ->> 'user_role' = 'admin'
        )
    );

-- Políticas para químicos (acesso aos módulos FISPQ)
CREATE POLICY "Acesso para químicos" ON public.fispqs
    FOR ALL USING (
        auth.uid() IN (
            SELECT auth.uid() FROM auth.users
            WHERE auth.jwt() ->> 'user_role' IN ('admin', 'quimico')
        )
    );

CREATE POLICY "Acesso para químicos" ON public.fichas_emergencia
    FOR ALL USING (
        auth.uid() IN (
            SELECT auth.uid() FROM auth.users
            WHERE auth.jwt() ->> 'user_role' IN ('admin', 'quimico')
        )
    );

CREATE POLICY "Acesso para químicos" ON public.certificados
    FOR ALL USING (
        auth.uid() IN (
            SELECT auth.uid() FROM auth.users
            WHERE auth.jwt() ->> 'user_role' IN ('admin', 'quimico')
        )
    );

-- Políticas para metrologistas (acesso aos módulos de Metrologia)
CREATE POLICY "Acesso para metrologistas" ON public.equipamentos
    FOR ALL USING (
        auth.uid() IN (
            SELECT auth.uid() FROM auth.users
            WHERE auth.jwt() ->> 'user_role' IN ('admin', 'metrologista')
        )
    );

-- Verificar se as colunas necessárias existem, e adicioná-las se não existirem
DO $$
BEGIN
    -- Verificar e adicionar coluna 'validade' na tabela fichas_emergencia se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'fichas_emergencia' AND column_name = 'validade'
    ) THEN
        ALTER TABLE public.fichas_emergencia ADD COLUMN validade TIMESTAMP WITH TIME ZONE;
    END IF;

    -- Verificar e adicionar coluna 'setor' na tabela fichas_emergencia se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'fichas_emergencia' AND column_name = 'setor'
    ) THEN
        ALTER TABLE public.fichas_emergencia ADD COLUMN setor TEXT;
    END IF;

    -- Adicionar outras verificações de colunas se necessário
END
$$;

-- Criar índices para melhorar a performance das consultas
CREATE INDEX IF NOT EXISTS idx_fispqs_produto ON public.fispqs(produto);
CREATE INDEX IF NOT EXISTS idx_fispqs_setor ON public.fispqs(setor);
CREATE INDEX IF NOT EXISTS idx_fispqs_validade ON public.fispqs(validade);

CREATE INDEX IF NOT EXISTS idx_fichas_emergencia_produto ON public.fichas_emergencia(produto);
CREATE INDEX IF NOT EXISTS idx_fichas_emergencia_setor ON public.fichas_emergencia(setor);
CREATE INDEX IF NOT EXISTS idx_fichas_emergencia_validade ON public.fichas_emergencia(validade);

CREATE INDEX IF NOT EXISTS idx_equipamentos_codigo ON public.equipamentos(codigo);
CREATE INDEX IF NOT EXISTS idx_equipamentos_setor ON public.equipamentos(setor);
CREATE INDEX IF NOT EXISTS idx_equipamentos_proximaCalibracao ON public.equipamentos(proximaCalibracao);

-- Conceder permissões ao papel anon (necessário para operações públicas)
GRANT USAGE ON SCHEMA public TO anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon;

-- Conceder permissões ao papel authenticated (usuários autenticados)
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Conceder permissões ao papel service_role (usado pelo back-end)
GRANT USAGE ON SCHEMA public TO service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role;
