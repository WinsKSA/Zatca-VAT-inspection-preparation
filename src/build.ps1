# Builds the app from the source parts in this folder.
#   index.html - the live app (sign-in, data saved in the Google Sheet through the Apps Script API)
#   demo.html  - the same app in demo mode (no sign-in, saves only in the browser)
$src = $PSScriptRoot; $root = Split-Path $src -Parent; $u = New-Object Text.UTF8Encoding $false
$parts = "core.js","i18n.js","glue.js","engine.js","storage.js","years.js","charts.js","ui.js","ui2.js","extras.js","present.js","auth.js","ui3.js"
$js = ($parts | ForEach-Object { [IO.File]::ReadAllText((Join-Path $src $_), [Text.Encoding]::UTF8).TrimStart([char]0xFEFF) }) -join "`n"
$head = [IO.File]::ReadAllText((Join-Path $src "head.html"), [Text.Encoding]::UTF8)
$html = $head + $js + "`n</script>`n</body>`n</html>`n"
[IO.File]::WriteAllText((Join-Path $root "index.html"), $html, $u)
$demo = $html.Replace("<body>`n", "<body>`n<script>window.FAHS_MODE=""demo""</script>`n")
[IO.File]::WriteAllText((Join-Path $root "demo.html"), $demo, $u)
# service worker: a new cache name on every build so installed apps pick up updates
$ver = (Get-Date).ToString("yyyyMMddHHmmss")
$sw = [IO.File]::ReadAllText((Join-Path $src "sw.js"), [Text.Encoding]::UTF8).Replace("__VERSION__", $ver)
[IO.File]::WriteAllText((Join-Path $root "sw.js"), $sw, $u)
Copy-Item -Force (Join-Path $src "manifest.webmanifest") (Join-Path $root "manifest.webmanifest")
"Built " + $html.Length + " bytes (version $ver)"
