Set-Location $PSScriptRoot

. ".\Common.ps1"

$dungeons = Import-Csv -Path ".\dungeons.csv" -Encoding UTF8
$shortData = [ordered]@{}
$dungeons | foreach {
    $id = $_.id
    if ($_.short_ru -ne "" -or $_.short_en -ne "") {
        $shortData[$id] = @{
            shortName = [ordered]@{
                ru = if ($_.short_ru -ne "") { $_.short_ru } else { $null }
                en = if ($_.short_en -ne "") { $_.short_en } else { $null }
            }
        }
    }
}

$shortData | ConvertTo-Json -Depth 10 | Format-Json | Out-File "..\app\data\DungeonsInfoShort.json" -Encoding UTF8