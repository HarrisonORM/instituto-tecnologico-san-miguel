param([switch]$InstallBundle)
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
function Invoke-PgControl([string]$ControlArguments) {
  # Start-Process -Wait espera también a los descendientes: al arrancar pg_ctl,
  # eso incluye el servidor que debe seguir vivo durante las pruebas.
  $control = Start-Process -FilePath (Join-Path $bin 'pg_ctl.exe') -ArgumentList $ControlArguments -WindowStyle Hidden -PassThru
  if (-not $control.WaitForExit(45000)) { throw 'El control del clúster local excedió 45 segundos.' }
  if ($control.ExitCode -ne 0) { throw 'El control del clúster local no terminó correctamente.' }
}
try {
  & (Join-Path $bin 'initdb.exe') -D $dataDirectory -U itsm_test --auth=scram-sha-256 --pwfile=$passwordFile --encoding=UTF8 --locale=C | Out-Null
  if ($LASTEXITCODE -ne 0) { throw 'No se pudo crear el clúster local.' }
  $arguments = '-D "' + $dataDirectory + '" -l "' + (Join-Path $cluster 'server.log') + '" -o "-h 127.0.0.1 -p ' + $port + '" -w start'
  $started = $true
  Invoke-PgControl $arguments
  $env:PGHOST = '127.0.0.1'; $env:PGPORT = [string]$port; $env:PGUSER = 'itsm_test'; $env:PGPASSWORD = [IO.File]::ReadAllText($passwordFile)
  & (Join-Path $bin 'createdb.exe') --maintenance-db=postgres itsm_test
  if ($LASTEXITCODE -ne 0) { throw 'No se pudo crear la base local de pruebas.' }
  $env:PGDATABASE = 'itsm_test'
  & (Join-Path $bin 'psql.exe') -X -q -v ON_ERROR_STOP=1 -f (Join-Path $root 'supabase/tests/bootstrap.sql')
  if ($LASTEXITCODE -ne 0) { throw 'Fallo en el entorno local de pruebas.' }
  if ($InstallBundle) {
    & node (Join-Path $root 'scripts/prepare-database.mjs')
    if ($LASTEXITCODE -ne 0) { throw 'No se pudo preparar el instalador local.' }
    $bundlePath = Join-Path $root 'work/database-install/instalar-base.sql'
    Write-Output 'Instalador completo en base local aislada'
    & (Join-Path $bin 'psql.exe') -X -q -v ON_ERROR_STOP=1 -f $bundlePath
    if ($LASTEXITCODE -ne 0) { throw 'Fallo en el instalador completo.' }
    $reapplyLog = Join-Path $cluster 'reapply-denied.log'
    & (Join-Path $bin 'psql.exe') -X -q -v ON_ERROR_STOP=1 -f $bundlePath *> $reapplyLog
    if ($LASTEXITCODE -eq 0 -or -not ([IO.File]::ReadAllText($reapplyLog).Contains('public ya contiene tablas'))) {
      throw 'El instalador no rechazó la repetición como se esperaba.'
    }
    Write-Output 'Correcto: el instalador rechaza una segunda ejecución sin borrar tablas.'
  } else {
    foreach ($migration in (Get-ChildItem -LiteralPath (Join-Path $root 'supabase/migrations') -Filter '*.sql' | Sort-Object Name)) {
      Write-Output ('Migración local: ' + $migration.Name)
      & (Join-Path $bin 'psql.exe') -X -q -v ON_ERROR_STOP=1 -f $migration.FullName
      if ($LASTEXITCODE -ne 0) { throw ('Fallo en ' + $migration.Name) }
    }
  }
  foreach ($suite in @('security.sql','academic.sql','contextual_mfa.sql')) {
    Write-Output ('Escenarios locales: ' + $suite)
    & (Join-Path $bin 'psql.exe') -X -q -v ON_ERROR_STOP=1 -f (Join-Path $root ('supabase/tests/' + $suite))
    if ($LASTEXITCODE -ne 0) { throw ('Falló la comprobación ' + $suite) }
  }
} finally {
  if ($started) { $stopArgs = '-D "' + $dataDirectory + '" -m fast -w stop'; Invoke-PgControl $stopArgs }
  foreach ($name in $old.Keys) { [Environment]::SetEnvironmentVariable($name, $old[$name]) }
}
