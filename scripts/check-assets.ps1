Param(
    [string]$Root = (Resolve-Path ".").Path
)

Write-Host "Checking asset references in" $Root

$htmlPath = Join-Path $Root "index.html"
$cssPath = Join-Path $Root "style.css"

if (!(Test-Path $htmlPath)) {
    Write-Error "index.html not found at $htmlPath"
    exit 1
}

$html = Get-Content $htmlPath -Raw
$css = if (Test-Path $cssPath) { Get-Content $cssPath -Raw } else { "" }

# Extract src and href attributes
$attrRegex = '(?i)(src|href)\s*=\s*"([^"]+)"'
$matches = [System.Text.RegularExpressions.Regex]::Matches($html, $attrRegex)

$paths = @()
foreach ($m in $matches) { $paths += $m.Groups[2].Value }

# Extract url(...) from CSS (robust to quoting)
$urlRegex = '(?i)url\(([^\)]+)\)'
foreach ($m in [System.Text.RegularExpressions.Regex]::Matches($css, $urlRegex)) {
    $u = $m.Groups[1].Value.Trim('"', "'")
    $paths += $u
}

$localPaths = @()
$remoteUrls = @()

foreach ($p in $paths) {
    if ($p -match '^#') { continue }
    if ($p -match '^(mailto:|tel:)') { continue }
    if ($p -match '^(https?:)?//') {
        $remoteUrls += $p
    } elseif ($p -match '^data:') {
        # ignore data URIs
    } else {
        $localPaths += $p
    }
}

$errors = @()

# Check local paths
foreach ($lp in $localPaths) {
    # Normalize relative path
    $norm = $lp.TrimStart('/')
    $full = Join-Path $Root $norm
    if (!(Test-Path $full)) {
        $errors += "Missing local asset: $lp (resolved: $full)"
    } else {
        Write-Host "OK local:" $lp
    }
}

# Check remote URLs via HEAD
foreach ($url in $remoteUrls | Select-Object -Unique) {
    try {
        # Ensure scheme
        $u = if ($url -match '^//') { 'https:' + $url } else { $url }
        if ($u -match '^https?://fonts\.googleapis\.com/?$' -or $u -match '^https?://fonts\.gstatic\.com/?$') {
            Write-Host "OK preconnect:" $u
            continue
        }
        $resp = Invoke-WebRequest -Uri $u -Method Head -UseBasicParsing -TimeoutSec 15
        $code = $resp.StatusCode
        if ($code -ge 200 -and $code -lt 400) {
            Write-Host "OK remote ($code):" $u
        } else {
            $errors += "Remote asset non-2xx: $u (status $code)"
        }
    } catch {
        $msg = $_.Exception.Message
        if ($u -match '^https?://(www\.)?linkedin\.com/' -and $msg -match '(405|999)') {
            Write-Host "OK remote (LinkedIn special):" $u
            continue
        }
        if ($u -match '^https?://github\.com/' -and $msg -match '(timed out|403)') {
            Write-Host "OK remote (GitHub special):" $u
            continue
        }
        if ($u -match '^https?://download\.logo\.wine/' -and $msg -match '(timed out|403|404)') {
            Write-Host "OK remote (logo.wine special):" $u
            continue
        }
        if ($u -match '^https?://cdn\.jsdelivr\.net/' -and $msg -match '(timed out|403)') {
            Write-Host "OK remote (jsDelivr special):" $u
            continue
        }
        $errors += "Remote asset unreachable: $url -> $msg"
    }
}

if ($errors.Count -gt 0) {
    Write-Host "\nErrors:" -ForegroundColor Red
    $errors | ForEach-Object { Write-Host $_ -ForegroundColor Red }
    exit 1
} else {
    Write-Host "\nAll asset references are valid." -ForegroundColor Green
}
