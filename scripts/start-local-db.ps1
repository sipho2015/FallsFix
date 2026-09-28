param(
  [string]$PostgresBin = 'C:\Program Files\PostgreSQL\18\bin',
  [int]$Port = 55433
)

$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$localDirectory = Join-Path $projectRoot '.local'
$dataDirectory = Join-Path $localDirectory 'postgres'
$envFile = Join-Path $projectRoot '.env'
$pgCtl = Join-Path $PostgresBin 'pg_ctl.exe'
$initDb = Join-Path $PostgresBin 'initdb.exe'
$psql = Join-Path $PostgresBin 'psql.exe'
$logFile = Join-Path $localDirectory 'postgres.log'
$utf8 = [System.Text.UTF8Encoding]::new($false)

foreach ($executable in @($pgCtl, $initDb, $psql)) {
  if (-not (Test-Path -LiteralPath $executable)) { throw 'PostgreSQL binaries not found. Supply -PostgresBin with your installation directory.' }
}

if (Test-Path -LiteralPath (Join-Path $dataDirectory 'PG_VERSION')) {
  if (-not (Test-Path -LiteralPath $envFile)) { throw 'Existing cluster found without .env. Restore its configuration rather than generating new credentials.' }
  & $pgCtl -D $dataDirectory status *> $null
  if ($LASTEXITCODE -eq 0) { Write-Output 'FallsFix local PostgreSQL is already running.'; exit 0 }
  & $pgCtl -D $dataDirectory -l $logFile -w start
  if ($LASTEXITCODE -ne 0) { throw 'Could not start FallsFix PostgreSQL. Check .local/postgres.log.' }
  exit 0
}

if (Test-Path -LiteralPath $envFile) { throw 'An .env file already exists. Configure that database or move it deliberately before creating a local cluster; it will not be overwritten.' }
if (Test-Path -LiteralPath $dataDirectory) { throw 'An incomplete cluster directory exists. Inspect it before retrying; this script never deletes database files.' }
$listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Loopback, $Port)
try { $listener.Start() } finally { $listener.Stop() }

New-Item -ItemType Directory -Path $localDirectory -Force | Out-Null
$random = [System.Security.Cryptography.RandomNumberGenerator]::Create()
function New-LocalPassword {
  $bytes = New-Object byte[] 32
  $random.GetBytes($bytes)
  return ([System.BitConverter]::ToString($bytes)).Replace('-', '').ToLowerInvariant()
}
$bootstrapPassword = New-LocalPassword
$applicationPassword = New-LocalPassword
$passwordFile = Join-Path $localDirectory 'init-password.tmp'
$previousPassword = $env:PGPASSWORD
try {
  [System.IO.File]::WriteAllText($passwordFile, $bootstrapPassword, $utf8)
  & $initDb -D $dataDirectory -U fallsfix_bootstrap -A scram-sha-256 --pwfile=$passwordFile --encoding=UTF8 --locale=C
  if ($LASTEXITCODE -ne 0) { throw 'PostgreSQL initialization failed.' }
  # Retain recovery credentials even if subsequent database provisioning fails.
  [System.IO.File]::WriteAllText((Join-Path $localDirectory 'bootstrap-password.txt'), $bootstrapPassword, $utf8)
  [System.IO.File]::AppendAllText((Join-Path $dataDirectory 'postgresql.conf'), "`nlisten_addresses = '127.0.0.1'`nport = $Port`n", $utf8)
  & $pgCtl -D $dataDirectory -l $logFile -w start
  if ($LASTEXITCODE -ne 0) { throw 'PostgreSQL startup failed.' }
  $env:PGPASSWORD = $bootstrapPassword
  $setupSql = @"
CREATE ROLE fallsfix_dev LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE PASSWORD '$applicationPassword';
CREATE DATABASE fallsfix_dev OWNER fallsfix_dev;
CREATE DATABASE fallsfix_shadow OWNER fallsfix_dev;
CREATE DATABASE fallsfix_test OWNER fallsfix_dev;
"@
  $setupSql | & $psql -h 127.0.0.1 -p $Port -U fallsfix_bootstrap -d postgres -w -v ON_ERROR_STOP=1 -q
  if ($LASTEXITCODE -ne 0) { throw 'Local database provisioning failed.' }
  $settings = @"
DATABASE_URL="postgresql://fallsfix_dev:${applicationPassword}@127.0.0.1:${Port}/fallsfix_dev"
SHADOW_DATABASE_URL="postgresql://fallsfix_dev:${applicationPassword}@127.0.0.1:${Port}/fallsfix_shadow"
TEST_DATABASE_URL="postgresql://fallsfix_dev:${applicationPassword}@127.0.0.1:${Port}/fallsfix_test"
"@
  [System.IO.File]::WriteAllText($envFile, $settings + "`n", $utf8)
  Write-Output "Created isolated FallsFix databases on 127.0.0.1:$Port. Generated credentials were saved locally, not printed."
} finally {
  $env:PGPASSWORD = $previousPassword
  if (Test-Path -LiteralPath $passwordFile) { Remove-Item -LiteralPath $passwordFile }
  $random.Dispose()
}
