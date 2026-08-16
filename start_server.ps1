$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:8080/")
$listener.Start()

Write-Host "===================================================="
Write-Host "BYHARIANS Decoupled Backend and Modular Frontend Engine"
Write-Host "Frontend Served at http://localhost:8080/"
Write-Host "API Backend Endpoint: http://localhost:8080/api/health"
Write-Host "===================================================="

$frontendDir = Join-Path (Get-Location) "frontend"

while ($listener.IsListening) {
    $context = $listener.GetContext()
    $request = $context.Request
    $response = $context.Response
    
    $localPath = $request.Url.LocalPath

    # Handle API Endpoints
    if ($localPath.StartsWith("/api/health")) {
        $json = '{"status":"ONLINE","service":"BYHARIANS API Engine","backend":"PowerShell .NET and Node.js Express"}'
        $bytes = [System.Text.Encoding]::UTF8.GetBytes($json)
        $response.ContentType = "application/json"
        $response.ContentLength64 = $bytes.Length
        $response.OutputStream.Write($bytes, 0, $bytes.Length)
        $response.Close()
        continue
    }

    # Handle Frontend Static Files
    if ($localPath -eq "/") { $localPath = "/index.html" }
    $filePath = Join-Path $frontendDir $localPath.TrimStart('/')
    
    if (-not (Test-Path $filePath -PathType Leaf)) {
        $filePath = Join-Path $frontendDir "index.html"
    }

    if (Test-Path $filePath -PathType Leaf) {
        $bytes = [System.IO.File]::ReadAllBytes($filePath)
        $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
        switch ($ext) {
            ".html" { $response.ContentType = "text/html; charset=utf-8" }
            ".css"  { $response.ContentType = "text/css" }
            ".js"   { $response.ContentType = "application/javascript" }
            ".jpg"  { $response.ContentType = "image/jpeg" }
            ".png"  { $response.ContentType = "image/png" }
            ".svg"  { $response.ContentType = "image/svg+xml" }
            ".json" { $response.ContentType = "application/json" }
            default { $response.ContentType = "application/octet-stream" }
        }
        $response.ContentLength64 = $bytes.Length
        $response.OutputStream.Write($bytes, 0, $bytes.Length)
    } else {
        $response.StatusCode = 404
    }
    $response.Close()
}
