-- Schema para o projeto de Metrologia e FISPQ
-- Este script cria todas as tabelas necessárias no Supabase

-- Habilitar extensão uuid-ossp se ainda não estiver habilitada
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela de usuários
CREATE TABLE IF NOT EXISTS usuarios (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  tipo_usuario TEXT NOT NULL CHECK (tipo_usuario IN ('admin', 'metrologista', 'quimico')),
  matricula TEXT UNIQUE,
  setor TEXT,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança para usuários
CREATE POLICY "Usuários podem ver seu próprio perfil" ON usuarios
  FOR SELECT USING (auth.uid() = id);
  
CREATE POLICY "Admins podem gerenciar todos os usuários" ON usuarios
  USING (
    EXISTS (
      SELECT 1 FROM usuarios WHERE id = auth.uid() AND tipo_usuario = 'admin'
    )
  );

-- Tabela de equipamentos
CREATE TABLE IF NOT EXISTS equipamentos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome TEXT NOT NULL,
  codigo TEXT UNIQUE NOT NULL,
  tipo TEXT NOT NULL,
  fabricante TEXT,
  modelo TEXT,
  numero_serie TEXT,
  setor TEXT,
  localizacao TEXT,
  status TEXT DEFAULT 'ativo',
  data_calibracao DATE,
  proxima_calibracao DATE,
  certificado_url TEXT,
  registro_url TEXT,
  observacoes TEXT,
  criado_por UUID REFERENCES usuarios(id),
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE equipamentos ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança para equipamentos
CREATE POLICY "Todos usuários autenticados podem ver equipamentos" ON equipamentos
  FOR SELECT USING (auth.role() = 'authenticated');
  
CREATE POLICY "Apenas admins e metrologistas podem modificar equipamentos" ON equipamentos
  USING (
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE id = auth.uid() 
      AND (tipo_usuario = 'admin' OR tipo_usuario = 'metrologista')
    )
  );

-- Tabela de certificados
CREATE TABLE IF NOT EXISTS certificados (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  equipamento_id UUID REFERENCES equipamentos(id),
  numero TEXT NOT NULL,
  data_emissao DATE NOT NULL,
  data_validade DATE NOT NULL,
  emissor TEXT NOT NULL,
  arquivo_url TEXT NOT NULL,
  status TEXT GENERATED ALWAYS AS (
    CASE 
      WHEN data_validade < CURRENT_DATE THEN 'vencido'
      WHEN data_validade < CURRENT_DATE + INTERVAL '30 days' THEN 'expirando'
      ELSE 'valido'
    END
  ) STORED,
  criado_por UUID REFERENCES usuarios(id),
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE certificados ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança para certificados
CREATE POLICY "Todos usuários autenticados podem ver certificados" ON certificados
  FOR SELECT USING (auth.role() = 'authenticated');
  
CREATE POLICY "Apenas admins e metrologistas podem modificar certificados" ON certificados
  USING (
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE id = auth.uid() 
      AND (tipo_usuario = 'admin' OR tipo_usuario = 'metrologista')
    )
  );

-- Tabela de FISPQ
CREATE TABLE IF NOT EXISTS fispqs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  produto TEXT NOT NULL,
  fabricante TEXT NOT NULL,
  numero_cas TEXT,
  setor TEXT NOT NULL,
  tipo_risco TEXT,
  validade DATE NOT NULL,
  arquivo_url TEXT NOT NULL,
  status TEXT GENERATED ALWAYS AS (
    CASE 
      WHEN validade < CURRENT_DATE THEN 'vencido'
      WHEN validade < CURRENT_DATE + INTERVAL '30 days' THEN 'expirando'
      ELSE 'valido'
    END
  ) STORED,
  criado_por UUID REFERENCES usuarios(id),
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE fispqs ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança para FISPQs
CREATE POLICY "Todos usuários autenticados podem ver FISPQs" ON fispqs
  FOR SELECT USING (auth.role() = 'authenticated');
  
CREATE POLICY "Apenas admins e químicos podem modificar FISPQs" ON fispqs
  USING (
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE id = auth.uid() 
      AND (tipo_usuario = 'admin' OR tipo_usuario = 'quimico')
    )
  );

-- Tabela de Fichas de Emergência (complementar ao módulo FISPQ)
CREATE TABLE IF NOT EXISTS fichas_emergencia (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  fispq_id UUID REFERENCES fispqs(id),
  produto TEXT NOT NULL,
  numero TEXT NOT NULL,
  validade DATE NOT NULL,
  arquivo_url TEXT NOT NULL,
  status TEXT GENERATED ALWAYS AS (
    CASE 
      WHEN validade < CURRENT_DATE THEN 'vencido'
      WHEN validade < CURRENT_DATE + INTERVAL '30 days' THEN 'expirando'
      ELSE 'valido'
    END
  ) STORED,
  criado_por UUID REFERENCES usuarios(id),
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE fichas_emergencia ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança para Fichas de Emergência
CREATE POLICY "Todos usuários autenticados podem ver Fichas de Emergência" ON fichas_emergencia
  FOR SELECT USING (auth.role() = 'authenticated');
  
CREATE POLICY "Apenas admins e químicos podem modificar Fichas de Emergência" ON fichas_emergencia
  USING (
    EXISTS (
      SELECT 1 FROM usuarios 
      WHERE id = auth.uid() 
      AND (tipo_usuario = 'admin' OR tipo_usuario = 'quimico')
    )
  );

-- Criar cada tabela individualmente primeiro, depois criar a view
DO $$
BEGIN
  -- Só criar a view se todas as tabelas necessárias estiverem disponíveis
  IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'certificados') AND
     EXISTS (SELECT FROM pg_tables WHERE tablename = 'fispqs') AND
     EXISTS (SELECT FROM pg_tables WHERE tablename = 'fichas_emergencia') THEN
    
    EXECUTE 'CREATE OR REPLACE VIEW documentos AS
    SELECT 
      id::text,
      ''certificado'' as tipo_documento,
      numero as identificador,
      data_emissao as data,
      data_validade as validade,
      arquivo_url,
      status,
      criado_em,
      atualizado_em
    FROM certificados
    UNION ALL
    SELECT 
      id::text,
      ''fispq'' as tipo_documento,
      produto as identificador,
      criado_em as data,
      validade,
      arquivo_url,
      status,
      criado_em,
      atualizado_em
    FROM fispqs
    UNION ALL
    SELECT 
      id::text,
      ''ficha_emergencia'' as tipo_documento,
      numero as identificador,
      criado_em as data,
      validade,
      arquivo_url,
      status,
      criado_em,
      atualizado_em
    FROM fichas_emergencia;';
  END IF;
END $$;

-- Índices para melhorar performance
CREATE INDEX IF NOT EXISTS equipamentos_setor_idx ON equipamentos(setor);
CREATE INDEX IF NOT EXISTS fispqs_setor_idx ON fispqs(setor);
CREATE INDEX IF NOT EXISTS certificados_status_idx ON certificados(status);
CREATE INDEX IF NOT EXISTS fispqs_status_idx ON fispqs(status);
CREATE INDEX IF NOT EXISTS fichas_emergencia_status_idx ON fichas_emergencia(status);
