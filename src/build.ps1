# Builds index.html and webapp/Index.html from the source parts in this folder.
$src = $PSScriptRoot; $root = Split-Path $src -Parent; $u = New-Object Text.UTF8Encoding $false
$parts = "core.js","i18n.js","glue.js","engine.js","storage.js","charts.js","ui.js","ui2.js","ui3.js"
$js = ($parts | ForEach-Object { [IO.File]::ReadAllText((Join-Path $src $_), [Text.Encoding]::UTF8) }) -join "`n"
$html = [IO.File]::ReadAllText((Join-Path $src "head.html"), [Text.Encoding]::UTF8) + $js + "`n</script>`n</body>`n</html>`n"
[IO.File]::WriteAllText((Join-Path $root "index.html"), $html, $u)
[IO.File]::WriteAllText((Join-Path $root "webapp\Index.html"), $html, $u)
"Built " + $html.Length + " bytes"
