param(
    [Parameter(Mandatory=$true)]
    [String]$DataCenterDir
)

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

$dungeonMatchingFile = "$DataCenterDir\DungeonMatching\DungeonMatching-00000.xml"
$dungeonRecommendFile = "$DataCenterDir\DungeonRecommend\DungeonRecommend-00000.xml"
$battlefieldDataFile = "$DataCenterDir\BattleFieldData\BattleFieldData-00000.xml"
$dungeonStringFile = "$DataCenterDir\StrSheet_Dungeon\StrSheet_Dungeon-00000.xml"
$battlefieldStringFile = "$DataCenterDir\StrSheet_BattleField\StrSheet_BattleField-00000.xml"

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