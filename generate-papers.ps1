$papersDir = Join-Path $PSScriptRoot "papers"
$outputFile = Join-Path $papersDir "papers.json"

$files = Get-ChildItem -Path $papersDir -Recurse -Filter "*.pdf"

$papers = @()
foreach ($f in $files) {
    $relPath = $f.Directory.FullName.Substring($papersDir.Length + 1)
    $sizeKB = [math]::Round($f.Length / 1KB, 1)
    $papers += @{
        name = $f.Name
        path = ($relPath + "/" + $f.Name) -replace '\\', '/'
        folder = $relPath -replace '\\', ' / '
        size = "$sizeKB KB"
        date = $f.LastWriteTime.ToString("dd-MMM-yyyy")
    }
}

$papers = @($papers)
$json = $papers | ConvertTo-Json
if ($json -notmatch '^\s*\[') { $json = "[$json]" }
Set-Content $outputFile -Value $json -Encoding UTF8
Write-Host "Generated papers.json with $($papers.Count) paper(s)"
