function Format-Json {
    param
    (
        [Parameter(Mandatory = $true, ValueFromPipeline = $true)]
        [String]$Json,
 
        [ValidateRange(1, 1024)]
        [Int]$Indentation = 2
    )
    $lines = $Json -split '\n'
    $indentLevel = 0
    $result = $lines | ForEach-Object `
    {
        if ($_ -match "[\}\]]" -and $_ -notmatch '["][^\]\}"]*[\]\}]+[^"]*["]')
        {
            $indentLevel--
        }
        $line = (' ' * $indentLevel * $Indentation) + $_.TrimStart().Replace(":  ", ": ")
        if ($_ -match "[\{\[]" -and $_ -notmatch '["][^\[\{"]*[\[\{]+[^"]*["]')
        {
            $indentLevel++
        }
        return $line
    }
    return $result -join "`n"
}