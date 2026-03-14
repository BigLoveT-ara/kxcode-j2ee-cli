# kxcode-j2ee-cli

J2EE 项目 AI 编程环境快速初始化工具 - 支持 Claude Code、OpenSpec 等框架

## 安装

```bash
# 全局安装
npm install -g kxcode-j2ee-cli

# 或者本地链接开发
npm link
```

## 使用

### 初始化项目

```bash
# 进入项目目录
cd your-j2ee-project

# 初始化 AI 编程环境
kxcode-j2ee init
```

初始化过程包括：
- 执行 `openspec init --tools claude`
- 创建 `.claude` 目录结构
- 复制预置 SKILLS（table-design, dao-create, mybatisplus-class-creater）
- 复制 Rules 模板（package-rules, tb_design, java-coding-rules）
- 生成 CLAUDE.md 配置文件
- 配置 serena MCP 服务

### SKILL 管理

```bash
# 列出所有可用的 SKILL
kxcode-j2ee skill list

# 创建新的 SKILL
kxcode-j2ee skill create my-skill

# 强制覆盖现有 SKILL
kxcode-j2ee skill create my-skill --force
```

### MCP 服务管理

```bash
# 添加 MCP 服务（交互式）
kxcode-j2ee mcp add

# 添加预定义的 MCP 服务
kxcode-j2ee mcp add serena
kxcode-j2ee mcp add figma
kxcode-j2ee mcp add github

# 列出已配置的 MCP 服务
kxcode-j2ee mcp list

# 移除 MCP 服务
kxcode-j2ee mcp remove <name>
```

## 预置 SKILLS

| SKILL | 描述 |
|-------|------|
| table-design | 表结构设计，生成 MD 格式的表定义 |
| dao-create | 基于表结构生成 DAO 层代码 |
| mybatisplus-class-creater | 使用 mp-class-creater 工具生成全栈代码 |

## 预置 Rules

| Rule | 描述 |
|------|------|
| package-rules.md | 包结构和命名规范 |
| tb_design.md | 表结构设计规范 |
| java-coding-rules.md | Java 编码规范和工具类使用指南 |

## 预定义 MCP 服务

| 服务 | 描述 |
|------|------|
| serena | IDE 助手，代码分析和上下文理解 |
| figma | Figma 设计稿导入和代码生成 |
| github | GitHub PR、Issue、文件操作 |
| filesystem | 安全的文件操作 |
| playwright | 浏览器自动化和测试 |

## 开发

```bash
# 克隆项目
git clone <repo-url>

# 安装依赖
npm install

# 本地链接
npm link

# 测试命令
kxcode-j2ee --help
kxcode-j2ee init
kxcode-j2ee skill list
```

## License

MIT
