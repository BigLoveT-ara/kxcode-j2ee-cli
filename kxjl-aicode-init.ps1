# 1. 执行 openspec init
Write-Host "正在执行 openspec init..."
openspec init --tools claude
if ($LASTEXITCODE -ne 0) {
    Write-Error "openspec init 失败。"
    exit $LASTEXITCODE
}

# 2. 下载 GitHub 仓库内容到 .claude 文件夹（覆盖已有文件）
Write-Host "正在下载 kxjl-claude-code 仓库..."
$repoUrl = "https://github.com/BigLoveT-ara/kxjl-claude-code"
$tempDir = Join-Path $env:TEMP "kxjl-claude-code-$(Get-Random)"
$targetDir = ".claude"

# 确保目标文件夹存在
New-Item -ItemType Directory -Path $targetDir -Force | Out-Null

# 尝试使用 git clone（如果 git 可用）
if (Get-Command git -ErrorAction SilentlyContinue) {
    Write-Host "使用 git 克隆仓库..."
    git clone --depth 1 $repoUrl $tempDir
    if ($LASTEXITCODE -eq 0) {
        $sourcePath = $tempDir
    } else {
        Write-Host "git 克隆失败，尝试下载 ZIP 包..."
        $useGit = $false
    }
} else {
    Write-Host "未找到 git，将使用下载 ZIP 的方式..."
    $useGit = $false
}

if (-not $useGit) {
    # 下载 ZIP（先尝试 main 分支，失败则尝试 master）
    $zipUrl = "https://github.com/BigLoveT-ara/kxjl-claude-code/archive/refs/heads/main.zip"
    $zipPath = Join-Path $env:TEMP "kxjl-claude-code.zip"
    
    try {
        Write-Host "正在下载 $zipUrl ..."
        Invoke-WebRequest -Uri $zipUrl -OutFile $zipPath
    } catch {
        Write-Host "下载 main 分支失败，尝试 master 分支..."
        $zipUrl = "https://github.com/BigLoveT-ara/kxjl-claude-code/archive/refs/heads/master.zip"
        Invoke-WebRequest -Uri $zipUrl -OutFile $zipPath
    }

    # 解压 ZIP
    Write-Host "正在解压 ZIP 到临时目录..."
    Expand-Archive -Path $zipPath -DestinationPath $tempDir -Force

    # 找到解压后的实际文件夹（可能是 kxjl-claude-code-main 或 kxjl-claude-code-master）
    $extractedFolder = Get-ChildItem $tempDir -Directory | Select-Object -First 1
    if ($extractedFolder) {
        $sourcePath = $extractedFolder.FullName
    } else {
        Write-Error "未找到解压后的文件夹。"
        exit 1
    }
}

# 复制所有文件到 .claude 文件夹（覆盖已有文件）
Write-Host "正在复制文件到 $targetDir ..."
Copy-Item -Path "$sourcePath\*" -Destination $targetDir -Recurse -Force

# 清理临时文件
Remove-Item -Path $tempDir -Recurse -Force -ErrorAction SilentlyContinue
if (-not $useGit) {
    Remove-Item -Path $zipPath -Force -ErrorAction SilentlyContinue
}

# 3. 执行 claude mcp add 命令，替换 <pwd> 为当前目录
Write-Host "正在添加 serena MCP 服务器..."
$projectPath = (Get-Location).Path
Write-Host "项目路径: $projectPath"
& claude mcp add serena uvx --from git+https://github.com/oraios/serena serena start-mcp-server --context ide-assistant --project $projectPath

if ($LASTEXITCODE -ne 0) {
    Write-Error "claude mcp add 命令失败。"
    exit $LASTEXITCODE
}

Write-Host "所有命令执行完毕。"