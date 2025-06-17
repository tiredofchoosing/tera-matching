Set-Location $PSScriptRoot

$infoData = Get-Content -Path "..\app\data\DungeonsInfo.json" -Raw -Encoding UTF8 | ConvertFrom-Json
$shortData = Get-Content -Path "..\app\data\DungeonsInfoShort.json" -Raw -Encoding UTF8 | ConvertFrom-Json

$results = @()
$infoData.PSObject.Properties | foreach {
    $id = $_.Name
    $result = [PSCustomObject]@{
        id = $id
        name_ru = $_.Value.name.ru
        name_en = $_.Value.name.en
        short_ru = $shortData.$id.shortName.ru
        short_en = $shortData.$id.shortName.en
    }
    $results += $result
}

$results | Export-Csv -Path ".\dungeons.csv" -NoTypeInformation -Encoding UTF8