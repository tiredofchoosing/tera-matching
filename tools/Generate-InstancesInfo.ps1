param(
    [Parameter(Mandatory=$true)]
    [String]$DataCenterRuDir,

    [Parameter(Mandatory=$true)]
    [String]$DataCenterEnDir
)

Set-Location $PSScriptRoot

. ".\Common.ps1"

$dungeonMatchingFile = Get-ChildItem -Path $DataCenterRuDir -Filter "DungeonMatching*.xml" -Recurse | select -ExpandProperty FullName -First 1
$dungeonRecommendFile = Get-ChildItem -Path $DataCenterRuDir -Filter "DungeonRecommend*.xml" -Recurse | select -ExpandProperty FullName -First 1
$battlefieldDataFile = Get-ChildItem -Path $DataCenterRuDir -Filter  "BattleFieldData*.xml" -Recurse | select -ExpandProperty FullName -First 1
$dungeonStringRuFile = Get-ChildItem -Path $DataCenterRuDir -Filter "StrSheet_Dungeon-*.xml" -Recurse | select -ExpandProperty FullName -First 1
$battlefieldStringRuFile = Get-ChildItem -Path $DataCenterRuDir -Filter "StrSheet_BattleField*.xml" -Recurse | select -ExpandProperty FullName -First 1
$dungeonStringEnFile = Get-ChildItem -Path $DataCenterEnDir -Filter "StrSheet_Dungeon-*.xml" -Recurse | select -ExpandProperty FullName -First 1
$battlefieldStringEnFile = Get-ChildItem -Path $DataCenterEnDir -Filter "StrSheet_BattleField*.xml" -Recurse | select -ExpandProperty FullName -First 1

$dungeonOutputFile = "..\app\data\DungeonsInfo.json"
$battlefieldOutputFile = "..\app\data\BattlegroundsInfo.json"

[xml]$dungeonMatchingXml = Get-Content $dungeonMatchingFile -Encoding UTF8
[xml]$dungeonRecommendXml = Get-Content $dungeonRecommendFile -Encoding UTF8
[xml]$dungeonStringRuXml = Get-Content $dungeonStringRuFile -Encoding UTF8
[xml]$dungeonStringEnXml = Get-Content $dungeonStringEnFile -Encoding UTF8
$dungeonMatchings = [ordered]@{}
$dungeonMatchingXml.DungeonMatching.Dungeon | foreach {
    $dungeon = $_
    $dungeonMatchings["$($dungeon.id)"] = [ordered]@{
        minLevel = [int]$dungeon.dungeonMinLevel
        maxLevel = [int]$dungeon.dungeonMaxLevel
        minItemLevel = [int]$dungeon.minItemLevel
        rank = [int]($dungeonRecommendXml.DungeonRecommend.Dungeon | where { $_.id -eq $dungeon.id } | select -ExpandProperty Recommend | select -ExpandProperty rank)
        name = [ordered]@{
            ru = $dungeonStringRuXml.StrSheet_Dungeon.String | where { $_.id -eq $dungeon.id } | select -ExpandProperty string
            en = $dungeonStringEnXml.StrSheet_Dungeon.String | where { $_.id -eq $dungeon.id } | select -ExpandProperty string
        }
    }
}
$dungeonMatchings | ConvertTo-Json -Depth 10 | Format-Json | Out-File $dungeonOutputFile -Encoding UTF8

[xml]$battlefieldDataXml = Get-Content $battlefieldDataFile -Encoding UTF8
[xml]$battlefieldStringRuXml = Get-Content $battlefieldStringRuFile -Encoding UTF8
[xml]$battlefieldStringEnXml = Get-Content $battlefieldStringEnFile -Encoding UTF8
$battlefieldMatchings = [ordered]@{}
$battleFieldDataXml.BattleFieldData.BattleField | foreach {
    $battlefield = $_
    $battlefieldMatchings["$($battlefield.id)"] = [ordered]@{
        minLevel = [int]$battlefield.CommonData.minLevel
        maxLevel = [int]$battlefield.CommonData.maxLevel
        name = [ordered]@{
            ru = $battlefieldStringRuXml.StrSheet_BattleField.String | where { $_.id -eq $battlefield.name } | select -ExpandProperty string
            en = $battlefieldStringEnXml.StrSheet_BattleField.String | where { $_.id -eq $battlefield.name } | select -ExpandProperty string
        }
    }
}
$battlefieldMatchings | ConvertTo-Json -Depth 10 | Format-Json | Out-File $battlefieldOutputFile -Encoding UTF8