export const SCRIPTS = [
    {
        id: 'patch-status',
        title: 'Windows Patch Status',
        fullTitle: 'Get-WindowsUpdateStatus.ps1',
        language: 'powershell',
        description: 'Retrieves the current patch status from Windows Update client.',
        code: `# Get Windows Update Status
$Session = New-Object -ComObject "Microsoft.Update.Session"
$Searcher = $Session.CreateUpdateSearcher()

Write-Host "Searching for missing updates..." -ForegroundColor Cyan
$Result = $Searcher.Search("IsInstalled=0")

if ($Result.Updates.Count -eq 0) {
    Write-Host "System is up to date." -ForegroundColor Green
} else {
    Write-Host "Missing Updates Found:" -ForegroundColor Red
    foreach ($update in $Result.Updates) {
        Write-Host "Title: $($update.Title)"
        Write-Host "Severity: $($update.MsrcSeverity)"
        Write-Host "---"
    }
}`
    },
    {
        id: 'failed-login',
        title: 'Failed Login Detection',
        fullTitle: 'Audit-FailedLogins.ps1',
        language: 'powershell',
        description: 'Scans Security Event Log for Event ID 4625 (Failed Logon).',
        code: `# Audit Failed Logins (Last 24 Hours)
$StartTime = (Get-Date).AddHours(-24)
$Events = Get-WinEvent -FilterHashTable @{
    LogName='Security'
    ID=4625
    StartTime=$StartTime
} -ErrorAction SilentlyContinue

if ($Events) {
    $Events | Select-Object TimeCreated, 
              @{N='Account';E={$_.Properties[5].Value}}, 
              @{N='IPAddress';E={$_.Properties[19].Value}} |
    Format-Table -AutoSize
} else {
    Write-Host "No failed login attempts found in last 24h." -ForegroundColor Green
}`
    },
    {
        id: 'stale-users',
        title: 'Stale User Accounts',
        fullTitle: 'Find-StaleUsers.ps1',
        language: 'powershell',
        description: 'Identifies AD users inactive for 90+ days.',
        code: `# Find Stale Active Directory Users
$DaysInactive = 90
$TimeLimit = (Get-Date).AddDays(-$DaysInactive)

Get-ADUser -Filter {LastLogonDate -lt $TimeLimit -and Enabled -eq $true} -Properties LastLogonDate |
Select-Object Name, SamAccountName, LastLogonDate |
Sort-Object LastLogonDate |
Format-Table -AutoSize

Write-Host "Scan Complete." -ForegroundColor Green`
    },
    {
        id: 'backup-verify',
        title: 'Backup File Verification',
        fullTitle: 'Test-BackupIntegrity.ps1',
        language: 'powershell',
        description: 'Verifies the existence and modified time of backup files.',
        code: `# Check Backup Status
$BackupPath = "\\NAS\Backups\SQL"
$LatestBackup = Get-ChildItem $BackupPath -Filter "*.bak" | 
                Sort-Object LastWriteTime -Descending | 
                Select-Object -First 1

if ($LatestBackup.LastWriteTime -lt (Get-Date).AddDays(-1)) {
    Write-Error "CRITICAL: No recent backup found!"
} else {
    Write-Host "Backup verification successful." -ForegroundColor Green
    Write-Host "File: $($LatestBackup.Name)"
    Write-Host "Time: $($LatestBackup.LastWriteTime)"
}`
    }
];
