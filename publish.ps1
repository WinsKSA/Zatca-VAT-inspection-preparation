# Publishes Fahs everywhere: builds the app, pushes to GitHub (updates GitHub Pages),
# uploads to Google Apps Script and updates the live web app deployment (same URL).
# Usage: .\publish.ps1 "Commit message"
param([string]$Message = "Update Fahs")
$ErrorActionPreference = "Continue"   # git and clasp write progress to stderr; check exit codes instead
function Check($what) { if ($LASTEXITCODE -ne 0) { throw "$what failed (exit $LASTEXITCODE)" } }
$root = $PSScriptRoot
$deployment = "AKfycbygC_bY9QKQBoLKMhXA2Yvo_vQ9Vsgdvjo30PThWUxY7YsPv-mo8Z4yNRzEAjkAbyG9Lg"
$env:Path = "C:\Program Files\nodejs;" + $env:Path + ";$env:APPDATA\npm"

& (Join-Path $root "src\build.ps1")

Push-Location $root
git add -A
git diff --cached --quiet
if ($LASTEXITCODE -ne 0) {
  git commit -q -m "$Message`n`nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
}
git push -q origin main 2>&1 | Out-Null; Check "git push"
Pop-Location

# clasp refuses linked folders, so upload from a plain staging folder
$stage = Join-Path $env:LOCALAPPDATA "fahs-clasp"
New-Item -ItemType Directory -Force $stage | Out-Null
foreach ($f in "Code.gs", "Index.html", "appsscript.json", ".clasp.json", ".claspignore") { Copy-Item -Force (Join-Path $root "webapp\$f") (Join-Path $stage $f) }
Push-Location $stage
clasp push -f; Check "clasp push"
clasp update-deployment $deployment --description $Message; Check "clasp update-deployment"
Pop-Location

"Published:"
"  GitHub:   https://github.com/WinsKSA/Zatca-VAT-inspection-preparation"
"  Website:  https://winsksa.github.io/Zatca-VAT-inspection-preparation/"
"  Web app:  https://script.google.com/macros/s/$deployment/exec"
