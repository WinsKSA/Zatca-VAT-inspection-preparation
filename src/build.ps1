# Builds index.html and webapp/Index.html from the source parts in this folder.
$src = $PSScriptRoot; $root = Split-Path $src -Parent; $u = New-Object Text.UTF8Encoding $false
$parts = "core.js","i18n.js","glue.js","engine.js","storage.js","charts.js","ui.js","ui2.js","extras.js","present.js","ui3.js"
$js = ($parts | ForEach-Object { [IO.File]::ReadAllText((Join-Path $src $_), [Text.Encoding]::UTF8) }) -join "`n"
$html = [IO.File]::ReadAllText((Join-Path $src "head.html"), [Text.Encoding]::UTF8) + $js + "`n</script>`n</body>`n</html>`n"
[IO.File]::WriteAllText((Join-Path $root "demo.html"), $html, $u)   # browser-only copy
Copy-Item -Force (Join-Path $src "landing.html") (Join-Path $root "index.html")   # front door: opens the Google Sheets web app
[IO.File]::WriteAllText((Join-Path $root "webapp\Index.html"), $html, $u)
"Built " + $html.Length + " bytes"
