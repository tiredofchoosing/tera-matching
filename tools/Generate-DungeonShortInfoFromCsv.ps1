Set-Location $PSScriptRoot

. ".\Common.ps1"

$dungeons = Import-Csv -Path ".\dungeons.csv" -Encoding UTF8

$ruShortData = [ordered]@{}
$enShortData = [ordered]@{}

$dungeons | foreach {
    $id = $_.id

    if ($_.short_ru) {
        $ruShortData[$id] = @{
            shortName = $_.short_ru
        }
    }
    if ($_.short_en) {
        $enShortData[$id] = @{
            shortName = $_.short_en
        }
    }
}

$ruShortData | ConvertTo-Json -Depth 10 | Format-Json | Out-File "..\app\data\DungeonsInfoShort_ru.json" -Encoding UTF8
$enShortData | ConvertTo-Json -Depth 10 | Format-Json | Out-File "..\app\data\DungeonsInfoShort_en.json" -Encoding UTF8