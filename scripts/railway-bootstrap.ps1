param(
  [string]$WebService = "web",
  [string]$Environment = "production"
)

$ErrorActionPreference = "Stop"

function Require-Cli {
  if (-not (Get-Command railway -ErrorAction SilentlyContinue)) {
    throw "Railway CLI not found. Install: npm i -g @railway/cli"
  }
}

function Ensure-Login {
  try {
    railway whoami | Out-Null
  } catch {
    throw "Railway CLI is not authenticated. Run: railway login"
  }
}

function Ensure-LinkedProject {
  try {
    railway status | Out-Null
  } catch {
    throw "Current directory is not linked to a Railway project. Run: railway link"
  }
}

Write-Host "Checking Railway CLI..." -ForegroundColor Cyan
Require-Cli
Ensure-Login
Ensure-LinkedProject

Write-Host "Adding PostgreSQL service (if it already exists, Railway will return an error you can ignore)..." -ForegroundColor Cyan
try {
  railway add --database postgres
} catch {
  Write-Host "Postgres add step returned an error (likely already exists). Continuing..." -ForegroundColor Yellow
}

Write-Host "Configuring DB reference variables on service '$WebService'..." -ForegroundColor Cyan
railway variable set "DATABASE_URL=`${{Postgres.DATABASE_URL}}" --service $WebService --environment $Environment
railway variable set "DATABASE_SSL=false" --service $WebService --environment $Environment
railway variable set "DATABASE_SSL_STRICT=false" --service $WebService --environment $Environment

Write-Host "Setting required runtime defaults on service '$WebService'..." -ForegroundColor Cyan
railway variable set "NODE_ENV=production" --service $WebService --environment $Environment
railway variable set "PORT=3000" --service $WebService --environment $Environment
railway variable set "HOSTNAME=0.0.0.0" --service $WebService --environment $Environment

Write-Host ""
Write-Host "Bootstrap complete." -ForegroundColor Green
Write-Host "Next steps:"
Write-Host "1) Ensure secrets are set on '$WebService': SESSION_SECRET, OPENROUTER_API_KEY"
Write-Host "2) Trigger deploy: railway redeploy --service $WebService --environment $Environment"
