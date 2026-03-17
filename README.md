# kxcode-j2ee-cli

J2EE 项目 AI 编程环境快速初始化工具 - 支持 Claude Code、OpenSpec 等框架

## 安装方式

### 从 GitHub 安装（推荐）

按照指定版本安装

```bash
npm install -g git+http://github.com/BigLoveT-ara/kxcode-j2ee-cli.git#v1.0.4
```

安装最新版本（可能是Beta）

```bash
npm install -g git+http://github.com/BigLoveT-ara/kxcode-j2ee-cli.git
```


### 开发模式安装

```bash
# 克隆项目
git clone http://github.com/BigLoveT-ara/kxcode-j2ee-cli.git

# 进入项目目录
cd kxcode-j2ee-cli

# 安装依赖
npm install

# 全局链接
npm link
```

## 相关指令

安装完成后，可以在命令行中使用 `kxcode-j2ee` 命令：

### --help 查看帮助

```bash
kxcode-j2ee --help
```

**作用**：显示所有可用命令及其描述。

### -v/--version 查看版本

```bash
kxcode-j2ee -v
# 或
kxcode-j2ee --version
```

**作用**：输出当前安装的版本号。

### init 初始化项目

```bash
kxcode-j2ee init
```

**作用**：初始化 J2EE 项目的 AI 编程环境。

执行流程：
1. 检查 Claude Code 是否已安装
2. 交互式收集配置：
   - AI 工具选择（当前仅支持 Claude Code）
   - SDD 框架选择（OpenSpec/SpecKit/不使用）
   - 项目类型（普通 J2EE 项目/Ptah 平台业务包）
   - 是否使用数据库
3. 创建 `.claude/` 目录结构（skills、rules、commands）
4. 创建 `settings.local.json` 权限配置
5. 复制模板文件（skills、rules、commands、docs）
6. 执行 SDD 框架初始化（如果选择了）
7. 生成 `.kxcode/config.json` 项目配置
8. 渲染 `CLAUDE_TEMPLATE.md` 项目模板

### update 更新项目配置

```bash
kxcode-j2ee update
```

**作用**：更新 J2EE 项目的相关配置文件（需先执行 `init` 命令）。

执行内容：
- 更新 `.claude/skills/`（SKILL 模板，按文件夹覆盖）
- 更新 `.claude/commands/kxcode/`（命令文件，按文件覆盖）
- 更新 `.claude/rules/`（Rules 模板，按文件覆盖）
- 更新 `docs/`（文档模板，保留用户新增文件）
- 重新执行 SDD 框架 init（如果选择了）


## 安装后在 Claude Code 中可用的 Skills

执行 `init` 命令后，以下 Skills 可在 Claude Code 中使用：


### Ptah 业务包项目专用 Skills

| Skill | 作用 |
|--------------|------|
| `kxcode-init-claude-md` | 初始化 J2EE 项目的 CLAUDE.md 文件。分析项目技术栈、包结构、数据库实体、工具类、消息队列和定时任务，生成完整的项目开发指引文档 |
| `kxcode-create-business-api` | Ptah 电话机器人平台业务包接口编码工作流，定义需求澄清流程、返回值确认、数据库设计三件套、编码规范等 |
| `kxcode-create-brainsession-listen` | Brain 交互详情的 Kafka 消费者开发工作流，包括消息监听、数据入库、外部接口调用、RestTemplate 规范等 |

---

## 快速开始

```bash
# 1. 安装 CLI
npm install -g git+http://github.com/BigLoveT-ara/kxcode-j2ee-cli.git#v1.0.1

# 2. 进入目标 J2EE 项目目录
cd /path/to/your/j2ee-project

# 3. 初始化 AI 编程环境，选择合适的项目类型和SDD驱动框架
kxcode-j2ee init

# 4. 启动 Claude Code
claude
```

## Claude Code 中指令使用
```bash
# 1. 初始化CLAUDE.md（claude 命令行中，非必须）
/kxcode-init-claude-md

# 2. 创建业务包接口 （claude 命令行中，非必须）
/kxcode-create-business-api 根据进线手机号码查询24小时内进线次数

# 3. 创建Brain交互监听 （claude 命令行中，非必须）
/kxcode-create-brainsession-listen 监听Brain交互数据并推送至客户接口
```

## 项目结构

```
kxcode-j2ee-cli/
├── src/
│   ├── index.js              # CLI 入口
│   ├── commands/
│   │   ├── init.js           # init 命令（项目初始化）
│   │   ├── update.js         # update 命令（配置更新）
│   │   ├── skill/index.js    # SKILL 管理（create、list）
│   │   └── mcp/index.js      # MCP 服务管理（add、list、remove）
│   └── utils/
│       ├── file.js           # 文件操作工具
│       ├── ui.js             # UI 交互工具
│       └── git.js            # Git 操作工具
├── templates/
│   ├── project/
│   │   └── CLAUDE_TEMPLATE.ejs   # EJS 项目模板
│   ├── skills/               # 预置 SKILL 模板
│   ├── rules/                # 预置 Rules 模板
│   ├── commands/             # 预置 Commands 模板
│   └── docs/                 # 预置 Docs 模板
│       ├── design/           # 设计文档目录
│       └── framework/        # 框架文档
└── package.json
```

## 技术栈

- **Node.js** - 运行环境
- **commander** - 命令行框架
- **inquirer** - 交互式问答
- **chalk** - 终端颜色输出
- **ora** - 加载动画
- **fs-extra** - 增强文件系统操作
- **ejs** - 模板引擎

## 版本历史

- **v1.0.1** - 发布版本，支持 init、update、skill、mcp 命令

## 许可证

MIT
