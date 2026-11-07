$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$cluster = Join-Path $root ('work/db-test-' + [guid]::NewGuid().ToString('N'))
$bin = Split-Path (Get-Command initdb.exe -ErrorAction Stop).Source
$port = Get-Random -Minimum 26000 -Maximum 45000
if (Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue) { throw 'Puerto local ocupado; vuelve a ejecutar.' }
New-Item -ItemType Directory -Path $cluster -Force | Out-Null
$passwordFile = Join-Path $cluster 'password.txt'
[IO.File]::WriteAllText($passwordFile, ([guid]::NewGuid().ToString('N') + [guid]::NewGuid().ToString('N')))
$dataDirectory = Join-Path $cluster 'data'
$old = @{}
foreach ($name in @('PGHOST','PGPORT','PGUSER','PGPASSWORD','PGDATABASE')) { $old[$name] = [Environment]::GetEnvironmentVariable($name) }
$started = $false
try {
  & (Join-Path $bin 'initdb.exe') -D $dataDirectory -U itsm_test --auth=scram-sha-256 --pwfile=$passwordFile --encoding=UTF8 --locale=C | Out-Null
  if ($LASTEXITCODE -ne 0) { throw 'No se pudo crear el clúster local.' }
  $arguments = '-D "' + $dataDirectory + '" -l "' + (Join-Path $cluster 'server.log') + '" -o "-h 127.0.0.1 -p ' + $port + '" -w start'
  $start = Start-Process -FilePath (Join-Path $bin 'pg_ctl.exe') -ArgumentList $arguments -WindowStyle Hidden -Wait -PassThru
  if ($start.ExitCode -ne 0) { throw 'No se pudo iniciar el clúster local.' }
  $started = $true
  $env:PGHOST = '127.0.0.1'; $env:PGPORT = [string]$port; $env:PGUSER = 'itsm_test'; $env:PGPASSWORD = [IO.File]::ReadAllText($passwordFile)
  & (Join-Path $bin 'createdb.exe') --maintenance-db=postgres itsm_test
  if ($LASTEXITCODE -ne 0) { throw 'No se pudo crear la base local de pruebas.' }
  $env:PGDATABASE = 'itsm_test'
  & (Join-Path $bin 'psql.exe') -X -q -v ON_ERROR_STOP=1 -f (Join-Path $root 'supabase/tests/bootstrap.sql')
  if ($LASTEXITCODE -ne 0) { throw 'Fallo en el entorno local de pruebas.' }
  foreach ($migration in (Get-ChildItem -LiteralPath (Join-Path $root 'supabase/migrations') -Filter '*.sql' | Sort-Object Name)) {
    Write-Output ('Migración local: ' + $migration.Name)
    & (Join-Path $bin 'psql.exe') -X -q -v ON_ERROR_STOP=1 -f $migration.FullName
    if ($LASTEXITCODE -ne 0) { throw ('Fallo en ' + $migration.Name) }
  }
  & (Join-Path $bin 'psql.exe') -X -q -v ON_ERROR_STOP=1 -f (Join-Path $root 'supabase/tests/security.sql')
  if ($LASTEXITCODE -ne 0) { throw 'Falló una comprobación de reglas o permisos.' }
} finally {
  if ($started) { $stopArgs = '-D "' + $dataDirectory + '" -m fast -w stop'; Start-Process -FilePath (Join-Path $bin 'pg_ctl.exe') -ArgumentList $stopArgs -WindowStyle Hidden -Wait | Out-Null }
  foreach ($name in $old.Keys) { [Environment]::SetEnvironmentVariable($name, $old[$name]) }
}
