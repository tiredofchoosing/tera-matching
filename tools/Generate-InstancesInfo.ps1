param(
    [Parameter(Mandatory=$true)]
    [String]$DataCenterDir
)

. ".\Common.ps1"

$dungeonMatchingFile = Get-ChildItem -Path $DataCenterDir -Filter "DungeonMatching*.xml" -Recurse | select -ExpandProperty FullName -First 1
$dungeonRecommendFile = Get-ChildItem -Path $DataCenterDir -Filter "DungeonRecommend*.xml" -Recurse | select -ExpandProperty FullName -First 1
$battlefieldDataFile = Get-ChildItem -Path $DataCenterDir -Filter  "BattleFieldData*.xml" -Recurse | select -ExpandProperty FullName -First 1
$dungeonStringFile = Get-ChildItem -Path $DataCenterDir -Filter "StrSheet_Dungeon-*.xml" -Recurse | select -ExpandProperty FullName -First 1
$battlefieldStringFile = Get-ChildItem -Path $DataCenterDir -Filter "StrSheet_BattleField*.xml" -Recurse | select -ExpandProperty FullName -First 1

$dungeonOutputFile = "$PSScriptRoot\DungeonsInfo.json"
$battlefieldOutputFile = "$PSScriptRoot\BattlegroundsInfo.json"

[xml]$dungeonMatchingXml = Get-Content $dungeonMatchingFile -Encoding UTF8
[xml]$dungeonRecommendXml = Get-Content $dungeonRecommendFile -Encoding UTF8
[xml]$dungeonStringXml = Get-Content $dungeonStringFile -Encoding UTF8
$dungeonMatchings = [ordered]@{}
$dungeonMatchingXml.DungeonMatching.Dungeon | foreach {
    $dungeon = $_
    $dungeonMatchings["$($dungeon.id)"] = [ordered]@{
        minLevel = [int]$dungeon.dungeonMinLevel
        maxLevel = [int]$dungeon.dungeonMaxLevel
        minItemLevel = [int]$dungeon.minItemLevel
        rank = [int]($dungeonRecommendXml.DungeonRecommend.Dungeon | where { $_.id -eq $dungeon.id } | select -ExpandProperty Recommend | select -ExpandProperty rank)
        name = $dungeonStringXml.StrSheet_Dungeon.String | where { $_.id -eq $dungeon.id } | select -ExpandProperty string
    }
}
$dungeonMatchings | ConvertTo-Json -Depth 10 | Format-Json | Out-File $dungeonOutputFile -Encoding UTF8

[xml]$battlefieldDataXml = Get-Content $battlefieldDataFile -Encoding UTF8
[xml]$battlefieldStringXml = Get-Content $battlefieldStringFile -Encoding UTF8
$battlefieldMatchings = [ordered]@{}
$battleFieldDataXml.BattleFieldData.BattleField | foreach {
    $battlefield = $_
    $battlefieldMatchings["$($battlefield.id)"] = [ordered]@{
        minLevel = [int]$battlefield.CommonData.minLevel
        maxLevel = [int]$battlefield.CommonData.maxLevel
        name = $battlefieldStringXml.StrSheet_BattleField.String | where { $_.id -eq $battlefield.name } | select -ExpandProperty string
    }
}
$battlefieldMatchings | ConvertTo-Json -Depth 10 | Format-Json | Out-File $battlefieldOutputFile -Encoding UTF8