$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://127.0.0.1:8080/")
$listener.Start()
Write-Host "Listening on http://127.0.0.1:8080/..."

try {
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $req = $context.Request
        $res = $context.Response
        $path = $req.Url.LocalPath
        if ($path -eq "/") { $path = "/index.html" }
        
        $filePath = Join-Path "d:\00. Me\Code Project\KUK" $path.TrimStart('/').Replace('/', '\')
        if (Test-Path $filePath -PathType Leaf) {
            $bytes = [System.IO.File]::ReadAllBytes($filePath)
            $res.ContentLength64 = $bytes.Length
            if ($filePath.EndsWith(".html")) { $res.ContentType = "text/html" }
            elseif ($filePath.EndsWith(".js")) { $res.ContentType = "application/javascript" }
            elseif ($filePath.EndsWith(".css")) { $res.ContentType = "text/css" }
            elseif ($filePath.EndsWith(".json")) { $res.ContentType = "application/json" }
            $res.OutputStream.Write($bytes, 0, $bytes.Length)
        } else {
            $res.StatusCode = 404
        }
        $res.Close()
    }
} catch {
    Write-Host "Server stopped: $_"
} finally {
    $listener.Stop()
}
