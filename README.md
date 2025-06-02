## Tera Asura Companion Web App

Web application for Tera Asura server that provides:
- Dungeons and battlefields matching queue monitor
- Online players list
- LFG messages list

### Updating instance data
To update DungeonsInfo.json and BattlegroundsInfo.json:

```powershell
.\tools\Generate-InstancesInfo.ps1 -DataCenterDir "path\to\DC" 
```

where `path\to\DC` is path to Tera DataCenter folder containing xml files
