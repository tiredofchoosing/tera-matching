Set-Location $PSScriptRoot

$ruData = Get-Content -Path "..\app\data\DungeonsInfo_ru.json" -Raw -Encoding UTF8 | ConvertFrom-Json
$enData = Get-Content -Path "..\app\data\DungeonsInfo_en.json" -Raw -Encoding UTF8 | ConvertFrom-Json
$ruShortData = Get-Content -Path "..\app\data\DungeonsInfoShort_ru.json" -Raw -Encoding UTF8 | ConvertFrom-Json
$enShortData = Get-Content -Path "..\app\data\DungeonsInfoShort_en.json" -Raw -Encoding UTF8 | ConvertFrom-Json

$results = @()
$ruData.PSObject.Properties | foreach {
    $id = $_.Name
    $result = [PSCustomObject]@{
        id = $id
        name_ru = $_.Value.name
        name_en = $enData.$id.name
        short_ru = $ruShortData.$id.shortName
        short_en = $enShortData.$id.shortName
    }
    $results += $result
}

$results | Export-Csv -Path ".\dungeons.csv" -NoTypeInformation -Encoding UTF8