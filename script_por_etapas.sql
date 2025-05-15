-- ETAPA 1: Extensões
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ETAPA 2: Criar tabela de usuários
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

-- ETAPA 3: Configurar RLS para usuários
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver seu próprio perfil" ON usuarios
  FOR SELECT USING (auth.uid() = id);
  
CREATE POLICY "Admins podem gerenciar todos os usuários" ON usuarios
  USING (
    EXISTS (
      SELECT 1 FROM usuarios WHERE id = auth.uid() AND tipo_usuario = 'admin'
    )
  );

-- ETAPA 4: Tabela de equipamentos
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

-- ETAPA 5: Configurar RLS para equipamentos
ALTER TABLE equipamentos ENABLE ROW LEVEL SECURITY;

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

-- ETAPA 6: Tabela de certificados
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

-- ETAPA 7: Configurar RLS para certificados
ALTER TABLE certificados ENABLE ROW LEVEL SECURITY;

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

-- ETAPA 8: Tabela de FISPQ
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

-- ETAPA 9: Configurar RLS para FISPQs
ALTER TABLE fispqs ENABLE ROW LEVEL SECURITY;

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

-- ETAPA 10: Tabela de Fichas de Emergência
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

-- ETAPA 11: Configurar RLS para Fichas de Emergência
ALTER TABLE fichas_emergencia ENABLE ROW LEVEL SECURITY;

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

-- ETAPA 12: Índices para melhorar performance
CREATE INDEX IF NOT EXISTS equipamentos_setor_idx ON equipamentos(setor);
CREATE INDEX IF NOT EXISTS fispqs_setor_idx ON fispqs(setor);
CREATE INDEX IF NOT EXISTS certificados_status_idx ON certificados(status);
CREATE INDEX IF NOT EXISTS fispqs_status_idx ON fispqs(status);
CREATE INDEX IF NOT EXISTS fichas_emergencia_status_idx ON fichas_emergencia(status);
