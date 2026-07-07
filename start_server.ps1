# FIFA AI Command Center - Local HTTP Server
# Usage: powershell -ExecutionPolicy Bypass -File start_server.ps1
# Opens: http://localhost:8000

param([int]$Port = 8000)

$root = $PSScriptRoot
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$Port/")
$listener.Start()

Write-Host ''
Write-Host '  ╔══════════════════════════════════════════════╗' -ForegroundColor Cyan
Write-Host "  ║   FIFA AI Command Center - Local Server      ║" -ForegroundColor Cyan
Write-Host "  ║   Running at: http://localhost:$Port           ║" -ForegroundColor Green
Write-Host '  ║   Press Ctrl+C to stop                       ║' -ForegroundColor Yellow
Write-Host '  ╚══════════════════════════════════════════════╝' -ForegroundColor Cyan
Write-Host ''

Start-Process "http://localhost:$Port"

$mimeTypes = @{
    '.html'  = 'text/html; charset=utf-8'
    '.css'   = 'text/css; charset=utf-8'
    '.js'    = 'application/javascript; charset=utf-8'
    '.json'  = 'application/json'
    '.png'   = 'image/png'
    '.jpg'   = 'image/jpeg'
    '.svg'   = 'image/svg+xml'
    '.ico'   = 'image/x-icon'
    '.woff2' = 'font/woff2'
}

while ($listener.IsListening) {
    $context  = $listener.GetContext()
    $request  = $context.Request
    $response = $context.Response

    $urlPath = $request.Url.LocalPath
    if ($urlPath -eq '/') { $urlPath = '/index.html' }

    $relPath  = $urlPath.TrimStart('/').Replace('/', [System.IO.Path]::DirectorySeparatorChar)
    $filePath = Join-Path $root $relPath

    if (Test-Path $filePath -PathType Leaf) {
        $ext  = [System.IO.Path]::GetExtension($filePath).ToLower()
        $mime = if ($mimeTypes.ContainsKey($ext)) { $mimeTypes[$ext] } else { 'application/octet-stream' }
        $bytes = [System.IO.File]::ReadAllBytes($filePath)
        $response.ContentType     = $mime
        $response.ContentLength64 = $bytes.Length
        $response.OutputStream.Write($bytes, 0, $bytes.Length)
        Write-Host ('  [200] ' + $urlPath) -ForegroundColor Green
    } else {
        $response.StatusCode = 404
        $notFound = 'Not Found: ' + $urlPath
        $bytes = [System.Text.Encoding]::UTF8.GetBytes($notFound)
        $response.OutputStream.Write($bytes, 0, $bytes.Length)
        Write-Host ('  [404] ' + $urlPath) -ForegroundColor Red
    }

    $response.OutputStream.Close()
}
