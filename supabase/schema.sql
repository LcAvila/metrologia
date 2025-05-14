-- Schema para o projeto Metrologia
-- Execute este script no Editor SQL do Supabase para criar todas as tabelas necessárias

-- Tabela de usuários (estendendo os usuários do Auth)
CREATE TABLE IF NOT EXISTS "public"."usuarios" (
  "id" UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  "email" TEXT NOT NULL,
  "nome" TEXT NOT NULL,
  "tipo_usuario" TEXT NOT NULL CHECK (tipo_usuario IN ('admin', 'metrologista', 'quimico')),
  "matricula" TEXT,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de equipamentos
CREATE TABLE IF NOT EXISTS "public"."equipamentos" (
  "id" TEXT PRIMARY KEY,
  "type" TEXT NOT NULL,
  "sector" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "model" TEXT,
  "serialNumber" TEXT,
  "nextCalibration" DATE,
  "acquisition_date" DATE,
  "manufacturer" TEXT,
  "user_id" UUID REFERENCES auth.users(id),
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de certificados
CREATE TABLE IF NOT EXISTS "public"."certificados" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "equipmentId" TEXT NOT NULL REFERENCES "public"."equipamentos"("id") ON DELETE CASCADE,
  "equipmentName" TEXT NOT NULL,
  "certificateNumber" TEXT NOT NULL,
  "issueDate" DATE NOT NULL,
  "expirationDate" DATE NOT NULL,
  "calibrationDate" DATE NOT NULL,
  "fileName" TEXT NOT NULL,
  "fileUrl" TEXT NOT NULL,
  "sector" TEXT,
  "status" TEXT NOT NULL,
  "user_id" UUID REFERENCES auth.users(id),
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de FISPQs
CREATE TABLE IF NOT EXISTS "public"."fispqs" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "produto" TEXT NOT NULL,
  "fabricante" TEXT NOT NULL,
  "numeroCas" TEXT,
  "setor" TEXT NOT NULL,
  "tipoRisco" TEXT,
  "validade" DATE NOT NULL,
  "arquivoUrl" TEXT NOT NULL,
  "user_id" UUID REFERENCES auth.users(id),
  "criadoEm" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de fichas de emergência
CREATE TABLE IF NOT EXISTS "public"."fichas_emergencia" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "produto" TEXT NOT NULL,
  "setor" TEXT NOT NULL,
  "tipoRisco" TEXT,
  "dataEmissao" DATE NOT NULL,
  "arquivoUrl" TEXT NOT NULL,
  "user_id" UUID REFERENCES auth.users(id),
  "criadoEm" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- View para Documentos Públicos (Certificados, FISPQs e Fichas de Emergência)
CREATE OR REPLACE VIEW "public"."documentos_publicos" AS
  SELECT 
    id::text, 
    'certificado' AS tipo, 
    equipmentName AS nome, 
    certificateNumber AS numero, 
    sector AS setor, 
    expirationDate::text AS validade, 
    fileUrl AS arquivoUrl 
  FROM certificados
  UNION ALL
  SELECT 
    id::text, 
    'fispq' AS tipo, 
    produto AS nome, 
    numeroCas AS numero, 
    setor, 
    validade::text, 
    arquivoUrl 
  FROM fispqs
  UNION ALL
  SELECT 
    id::text, 
    'emergencia' AS tipo, 
    produto AS nome, 
    NULL AS numero, 
    setor, 
    dataEmissao::text AS validade, 
    arquivoUrl 
  FROM fichas_emergencia;

-- Configura RLS (Row Level Security) para todas as tabelas
-- Ativa RLS para todas as tabelas
ALTER TABLE "public"."usuarios" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."equipamentos" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."certificados" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."fispqs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."fichas_emergencia" ENABLE ROW LEVEL SECURITY;

-- Políticas para usuários
-- Administradores podem ver/gerenciar todos os usuários
CREATE POLICY "Admins podem gerenciar usuários"
ON "public"."usuarios"
USING (
  (SELECT tipo_usuario FROM usuarios WHERE id = auth.uid()) = 'admin'
);

-- Todos os usuários autenticados podem ver seu próprio registro
CREATE POLICY "Usuários podem ver seu próprio registro"
ON "public"."usuarios"
FOR SELECT
USING (auth.uid() = id);

-- Políticas para equipamentos
-- Admins e metrologistas podem gerenciar equipamentos
CREATE POLICY "Admins e metrologistas podem gerenciar equipamentos"
ON "public"."equipamentos"
USING (
  (SELECT tipo_usuario FROM usuarios WHERE id = auth.uid()) IN ('admin', 'metrologista')
);

-- Qualquer usuário autenticado pode visualizar equipamentos
CREATE POLICY "Qualquer usuário autenticado pode visualizar equipamentos"
ON "public"."equipamentos"
FOR SELECT
USING (auth.role() = 'authenticated');

-- Políticas para certificados
-- Admins e metrologistas podem gerenciar certificados
CREATE POLICY "Admins e metrologistas podem gerenciar certificados"
ON "public"."certificados"
USING (
  (SELECT tipo_usuario FROM usuarios WHERE id = auth.uid()) IN ('admin', 'metrologista')
);

-- Qualquer usuário autenticado pode visualizar certificados
CREATE POLICY "Qualquer usuário autenticado pode visualizar certificados"
ON "public"."certificados"
FOR SELECT
USING (auth.role() = 'authenticated');

-- Políticas para FISPQs
-- Admins e químicos podem gerenciar FISPQs
CREATE POLICY "Admins e químicos podem gerenciar FISPQs"
ON "public"."fispqs"
USING (
  (SELECT tipo_usuario FROM usuarios WHERE id = auth.uid()) IN ('admin', 'quimico')
);

-- Qualquer usuário autenticado pode visualizar FISPQs
CREATE POLICY "Qualquer usuário autenticado pode visualizar FISPQs"
ON "public"."fispqs"
FOR SELECT
USING (auth.role() = 'authenticated');

-- Políticas para fichas de emergência
-- Admins e químicos podem gerenciar fichas de emergência
CREATE POLICY "Admins e químicos podem gerenciar fichas de emergência"
ON "public"."fichas_emergencia"
USING (
  (SELECT tipo_usuario FROM usuarios WHERE id = auth.uid()) IN ('admin', 'quimico')
);

-- Qualquer usuário autenticado pode visualizar fichas de emergência
CREATE POLICY "Qualquer usuário autenticado pode visualizar fichas de emergência"
ON "public"."fichas_emergencia"
FOR SELECT
USING (auth.role() = 'authenticated');

-- Inserir usuário admin inicial (se não existir)
-- Substitua 'admin-user-id' pelo ID do usuário administrador criado no Auth
INSERT INTO "public"."usuarios" (id, email, nome, tipo_usuario)
SELECT 
  '48ac02fe-7b3c-4a94-a148-0b2a03fac6f0', -- Substitua pelo ID real do usuário admin
  'admin@exemplo.com', -- Substitua pelo email real do usuário admin
  'Administrador',
  'admin'
WHERE NOT EXISTS (
  SELECT 1 FROM "public"."usuarios" LIMIT 1
);
