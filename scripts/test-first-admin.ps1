$ErrorActionPreference = 'Stop'
$repo = Split-Path -Parent $PSScriptRoot
$templatePath = Join-Path $repo 'supabase/bootstrap-admin-dashboard.sql'
$bin = Split-Path (Get-Command initdb.exe -ErrorAction Stop).Source
$scratch = Join-Path $repo ('work/admin-check-' + [guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Path $scratch | Out-Null
$dataPath = Join-Path $scratch 'data'
$passwordPath = Join-Path $scratch 'password.txt'
[IO.File]::WriteAllText($passwordPath, [guid]::NewGuid().ToString('N') + [guid]::NewGuid().ToString('N'))
$port = Get-Random -Minimum 31000 -Maximum 45000
$old = @{}
foreach ($envName in @('PGHOST','PGPORT','PGUSER','PGPASSWORD','PGDATABASE')) { $old[$envName] = [Environment]::GetEnvironmentVariable($envName) }
$started = $false
function Control([string]$pgArgs) {
  $p = Start-Process -FilePath (Join-Path $bin 'pg_ctl.exe') -ArgumentList $pgArgs -WindowStyle Hidden -PassThru
  if (-not $p.WaitForExit(45000) -or $p.ExitCode -ne 0) { throw 'No se pudo controlar el servidor local aislado.' }
}
function Sql([string]$query) {
  $out = & (Join-Path $bin 'psql.exe') -X -q -A -t -v ON_ERROR_STOP=1 -c $query 2>&1
  if ($LASTEXITCODE -ne 0) { throw ('Fallo SQL local: ' + ($out -join "`n")) }
  return ($out -join "`n").Trim()
}
function CheckFile([string]$filePath, [string]$expectedError = '') {
  $out = & (Join-Path $bin 'psql.exe') -X -q -v ON_ERROR_STOP=1 -f $filePath 2>&1
  $code = $LASTEXITCODE
  $message = $out -join "`n"
  if ($expectedError) {
    if ($code -eq 0 -or -not $message.Contains($expectedError)) { throw ('Rechazo local inesperado: ' + $message) }
  } elseif ($code -ne 0) { throw ('Alta local fallida: ' + $message) }
}
try {
  & (Join-Path $bin 'initdb.exe') -D $dataPath -U itsm_test --auth=scram-sha-256 --pwfile=$passwordPath --encoding=UTF8 --locale=C | Out-Null
  if ($LASTEXITCODE -ne 0) { throw 'Fallo initdb local.' }
  $started = $true
  Control ('-D "' + $dataPath + '" -l "' + (Join-Path $scratch 'server.log') + '" -o "-h 127.0.0.1 -p ' + $port + '" -w start')
  $env:PGHOST = '127.0.0.1'; $env:PGPORT = [string]$port; $env:PGUSER = 'itsm_test'
  $env:PGPASSWORD = [IO.File]::ReadAllText($passwordPath); $env:PGDATABASE = 'itsm_test'
  & (Join-Path $bin 'createdb.exe') --maintenance-db=postgres itsm_test
  if ($LASTEXITCODE -ne 0) { throw 'Fallo createdb local.' }
  CheckFile (Join-Path $repo 'supabase/tests/bootstrap.sql')
  foreach ($m in (Get-ChildItem -LiteralPath (Join-Path $repo 'supabase/migrations') -Filter '*.sql' | Sort-Object Name)) { CheckFile $m.FullName }
  Write-Output 'Base aislada: 20 migraciones aplicadas.'
  CheckFile $templatePath 'Primero reemplaza el UID'
  Write-Output 'Correcto: plantilla sin completar rechazada.'
  $uid = '11111111-1111-4111-a111-111111111111'
  # Sustituir solo las asignaciones: conservar las comprobaciones de marcadores.
  $sql = [IO.File]::ReadAllText($templatePath).Replace("target_uid_text text := 'PEGA_AQUI_TU_UID'", "target_uid_text text := '$uid'").Replace("target_name text := 'ESCRIBE_AQUI_TU_NOMBRE'", "target_name text := 'Prueba Local'")
  $caseFile = Join-Path $scratch 'candidate.sql'
  [IO.File]::WriteAllText($caseFile, $sql)
  CheckFile $caseFile 'No existe una cuenta Auth'
  Write-Output 'Correcto: cuenta inexistente rechazada.'
  $null = Sql "insert into auth.users(id,email) values('$uid','admin@example.invalid'); insert into public.profiles(id,full_name) values('$uid','Perfil previo');"
  CheckFile $caseFile 'Esta cuenta ya tiene un perfil'
  Write-Output 'Correcto: perfil previo rechazado sin elevar permisos.'
  $null = Sql "delete from public.profiles where id='$uid';"
  CheckFile $caseFile
  if ((Sql "select count(*) from public.profiles p join public.user_roles r on r.user_id=p.id where p.id='$uid' and p.auth_user_id=p.id and p.state='active' and r.role='system_admin';") -ne '1') { throw 'No se comprobó perfil, enlace y rol.' }
  if ((Sql "select count(*) from public.audit_events where action='account.bootstrap.owner' and actor_id is null and resource_id='$uid';") -ne '1') { throw 'No se comprobó la auditoría.' }
  Write-Output 'Correcto: primer administrador y auditoría creados atómicamente.'
  CheckFile $caseFile 'Ya existe un administrador'
  Write-Output 'Correcto: repetición rechazada.'
  if ((Sql 'select count(*) from pg_catalog.pg_tables where schemaname=''public'' and rowsecurity;') -ne '26') { throw 'RLS no coincide con la instalación.' }
  $aal1 = Sql "set role authenticated; set request.jwt.claims='{`"sub`":`"$uid`",`"aal`":`"aal1`"}'; select private.system_admin();"
  $aal2 = Sql "set role authenticated; set request.jwt.claims='{`"sub`":`"$uid`",`"aal`":`"aal2`"}'; select private.system_admin();"
  if ($aal1 -ne 'f' -or $aal2 -ne 't') { throw 'La exigencia MFA no se conservó.' }
  Write-Output 'Correcto: 26 tablas con RLS; acciones de administrador requieren aal2.'
} finally {
  if ($started) { Control ('-D "' + $dataPath + '" -m fast -w stop') }
  foreach ($envName in $old.Keys) { [Environment]::SetEnvironmentVariable($envName, $old[$envName]) }
}
