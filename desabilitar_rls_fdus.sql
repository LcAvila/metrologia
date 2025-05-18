-- Script para configurar as políticas de segurança da tabela fdus
-- Opção 1: Desabilitar o RLS temporariamente (mais simples para importação em massa)
ALTER TABLE fdus DISABLE ROW LEVEL SECURITY;

-- Opção 2 (alternativa): Manter o RLS, mas adicionar uma política permissiva para inserção
-- Descomente estas linhas se preferir manter o RLS ativo com uma política específica
/*
DROP POLICY IF EXISTS "Permitir inserção para todos" ON fdus;
CREATE POLICY "Permitir inserção para todos" 
ON fdus 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir seleção para todos" ON fdus;
CREATE POLICY "Permitir seleção para todos" 
ON fdus 
FOR SELECT 
TO authenticated 
USING (true);

DROP POLICY IF EXISTS "Permitir atualização para owner" ON fdus;
CREATE POLICY "Permitir atualização para owner" 
ON fdus 
FOR UPDATE 
TO authenticated 
USING (auth.uid() = usuario_id)
WITH CHECK (auth.uid() = usuario_id);

DROP POLICY IF EXISTS "Permitir exclusão para owner" ON fdus;
CREATE POLICY "Permitir exclusão para owner" 
ON fdus 
FOR DELETE 
TO authenticated 
USING (auth.uid() = usuario_id);
*/

-- Verificar configuração de RLS
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'fdus';
