# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

kxcode-j2ee-cli 是一个 J2EE 项目 AI 编程环境快速初始化工具，用于为 J2EE/Spring Boot 项目快速搭建 Claude Code 开发环境。

## 技术栈

- Node.js CLI 工具
- 核心依赖：commander、inquirer、chalk、ora、fs-extra、ejs

## 常用命令

```bash
# 开发测试
npm start                    # 运行 CLI
kxcode-j2ee --help          # 查看帮助
kxcode-j2ee init            # 初始化目标项目

# 全局安装测试
npm install -g .            # 全局安装
npm link                    # 本地链接开发
```

## 项目结构

```
kxcode-j2ee-cli/
├── src/
│   ├── index.js              # CLI 入口
│   ├── commands/
│   │   ├── init.js           # init 命令（核心初始化逻辑）
│   │   ├── skill/index.js    # SKILL 管理（create、list）
│   │   └── mcp/index.js      # MCP 服务管理（add、list、remove）
│   └── utils/
│       ├── file.js           # 文件操作工具
│       ├── git.js            # Git 操作
│       └── ui.js             # UI 交互工具
├── templates/
│   ├── project/
│   │   └── CLAUDE_TEMPLATE.ejs   # EJS 模板（渲染后输出到目标项目）
│   ├── skills/               # 预置 SKILL 模板
│   ├── rules/                # 预置 Rules 模板
│   ├── commands/             # 预置 Commands 模板
│   └── docs/                 # 预置 Docs 模板
│       ├── design/           # 设计文档目录（空目录也要复制）
│       └── framework/        # 框架文档
└── package.json
```

## 核心功能

### 1. init 命令流程

1. 检查 `.kxcode/config.json` 是否存在，已初始化则退出
2. 检查 Claude Code 安装状态
3. 交互式收集配置：
   - AI 工具选择（当前仅支持 claude）
   - SDD 框架选择（openspec/speckit/none）
   - 项目类型（j2ee/ptah）
   - 是否使用数据库
4. 创建 `.claude/` 目录结构和 `settings.local.json`
5. 复制 templates 到目标目录（skills、rules、commands、docs）
6. 执行 SDD 框架 init（如果选择了）
7. 生成 `.kxcode/config.json` 配置
8. 渲染 `CLAUDE_TEMPLATE.ejs` 到 `.kxcode/CLAUDE_TEMPLATE.md`

### 2. EJS 模板变量

`templates/project/CLAUDE_TEMPLATE.ejs` 使用以下变量渲染：
- `aiTool`: AI 工具（'claude'）
- `projectType`: 项目类型（'j2ee' | 'ptah'）
- `useDatabase`: 是否使用数据库（boolean）
- `sddFramework`: SDD 框架（'openspec' | 'speckit' | 'none'）

### 3. 目录复制逻辑

- `copyDir` 函数支持空目录复制
- 源目录不存在时不报错直接返回
- 读取失败时输出警告并继续

### 4. MCP 服务配置

预定义服务位于 `src/commands/mcp/index.js`：
- serena: uvx serena start-mcp-server
- figma: npx @figma/mcp-server
- github: npx @modelcontextprotocol/server-github
- filesystem: npx @modelcontextprotocol/server-filesystem
- playwright: npx @playwright/mcp-server

## 相关文件

- `.kxcode/config.json`: 项目差异化配置（aiTool、projectType、useDatabase、sddFramework）
- `.claude/settings.local.json`: Claude 本地权限配置
- `templates/project/CLAUDE_TEMPLATE.ejs`: 项目模板（EJS 渲染）