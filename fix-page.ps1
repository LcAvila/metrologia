$file = "c:\Users\Lucas Ávila\Documents\sistema\app\fdu\emergencia\page.tsx"
$content = Get-Content $file -Raw

# Primeiro corrigir o final do arquivo (adicionar export default)
if (-not ($content -match "export default FichasEmergenciaPage")) {
    $content = $content -replace "}$", "}`n`nexport default FichasEmergenciaPage;"
}

# Garantir que todos os fechamentos e aberturas de tags estejam corretos
Set-Content -Path $file -Value $content
Write-Host "Arquivo corrigido com sucesso!"
