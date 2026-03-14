const inquirer = require('inquirer');
const { execSync } = require('child_process');

const {
  getCwd,
  resolvePath
} = require('../../utils/file');
const {
  success,
  error,
  warn,
  info,
  createSpinner,
  printDivider,
  printTitle,
  createTable
} = require('../../utils/ui');

// 预定义的 MCP 服务列表
const PREDEFINED_MCP_SERVICES = [
  {
    name: 'serena',
    description: 'Serena - IDE 助手，代码分析和上下文理解',
    command: 'uvx --from git+https://github.com/oraios/serena serena start-mcp-server --context ide-assistant --project {{projectPath}}'
  },
  {
    name: 'figma',
    description: 'Figma - 设计稿导入和代码生成',
    command: 'npx -y @figma/mcp-server'
  },
  {
    name: 'github',
    description: 'GitHub - PR、Issue、文件操作',
    command: 'npx -y @modelcontextprotocol/server-github'
  },
  {
    name: 'filesystem',
    description: '文件系统 - 安全的文件操作',
    command: 'npx -y @modelcontextprotocol/server-filesystem {{cwd}}'
  },
  {
    name: 'playwright',
    description: 'Playwright - 浏览器自动化和测试',
    command: 'npx -y @playwright/mcp-server'
  }
];

/**
 * 添加 MCP 服务命令
 */
async function doAdd(name, options) {
  const cwd = getCwd();
  let mcpName = name;
  let mcpCommand = '';

  // 如果没有提供名称，交互式选择
  if (!mcpName) {
    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'service',
        message: '选择要添加的 MCP 服务',
        choices: PREDEFINED_MCP_SERVICES.map(s => ({
          name: `${s.name} - ${s.description}`,
          value: s.name
        }))
      },
      {
        type: 'confirm',
        name: 'useDefault',
        message: '使用默认配置？',
        default: true,
        when: (answers) => {
          const service = PREDEFINED_MCP_SERVICES.find(s => s.name === answers.service);
          mcpCommand = service.command
            .replace('{{projectPath}}', cwd)
            .replace('{{cwd}}', cwd);
          return true;
        }
      }
    ]);
    mcpName = answers.service;
  } else {
    // 提供了名称，检查是否是预定义的服务
    const service = PREDEFINED_MCP_SERVICES.find(s => s.name === mcpName);
    if (service) {
      mcpCommand = service.command
        .replace('{{projectPath}}', cwd)
        .replace('{{cwd}}', cwd);

      const confirm = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'confirmed',
          message: `使用默认配置：${mcpCommand}`,
          default: true
        }
      ]);
      if (!confirm.confirmed) {
        const customAnswer = await inquirer.prompt([
          {
            type: 'input',
            name: 'command',
            message: '输入 MCP 服务启动命令'
          }
        ]);
        mcpCommand = customAnswer.command;
      }
    } else {
      // 自定义 MCP 服务
      const customAnswer = await inquirer.prompt([
        {
          type: 'input',
          name: 'command',
          message: '输入 MCP 服务启动命令'
        }
      ]);
      mcpCommand = customAnswer.command;
    }
  }

  // 添加 MCP 服务
  try {
    const spinner = createSpinner(`正在添加 ${mcpName} MCP 服务...`);
    const cmd = `claude mcp add ${mcpName} -- "${mcpCommand}"`;
    execSync(cmd, { stdio: 'pipe' });
    spinner.succeed(`${mcpName} MCP 服务添加成功`);
  } catch (err) {
    error(`${mcpName} MCP 服务添加失败`);
    warn(`请手动执行：${cmd}`);
  }
}

/**
 * 列出 MCP 服务命令
 */
async function doList(options) {
  printTitle('🔌 已配置的 MCP 服务');

  try {
    // 尝试读取 claude 配置
    const configCmd = process.platform === 'win32'
      ? '%APPDATA%\\Claude\\claude_config.json'
      : '~/.config/Claude/claude_config.json';

    info('MCP 服务配置通常位于：');
    console.log(`  Windows: ${process.env.APPDATA}\\Claude\\claude_config.json`);
    console.log(`  macOS/Linux: ~/.config/Claude/claude_config.json`);
    console.log('');

    // 尝试使用 claude 命令列出配置
    try {
      const output = execSync('claude mcp list', { encoding: 'utf-8' });
      console.log(output);
    } catch (err) {
      warn('无法通过 claude mcp list 获取配置，请查看配置文件');
      info('或者直接运行 claude 查看已加载的 MCP 服务');
    }

  } catch (err) {
    error('读取 MCP 配置失败');
  }
}

/**
 * 移除 MCP 服务命令
 */
async function doRemove(name, options) {
  if (!name) {
    error('请指定要移除的 MCP 服务名称');
    console.log('');
    console.log('用法：kxcode-j2ee mcp remove <name>');
    return;
  }

  const confirm = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirmed',
      message: `确定要移除 MCP 服务 "${name}" 吗？`,
      default: false
    }
  ]);

  if (!confirm.confirmed) {
    return;
  }

  try {
    const spinner = createSpinner(`正在移除 ${name} MCP 服务...`);
    execSync(`claude mcp remove ${name}`, { stdio: 'pipe' });
    spinner.succeed(`${name} MCP 服务已移除`);
  } catch (err) {
    error(`${name} MCP 服务移除失败`);
    warn('请手动编辑配置文件移除');
  }
}

/**
 * 注册 mcp 命令
 */
function registerMcpCommand(program) {
  const mcp = program
    .command('mcp')
    .description('MCP 服务管理命令');

  mcp
    .command('add [name]')
    .description('添加 MCP 服务')
    .action(doAdd);

  mcp
    .command('list')
    .description('列出所有已配置的 MCP 服务')
    .action(doList);

  mcp
    .command('remove <name>')
    .description('移除指定的 MCP 服务')
    .action(doRemove);
}

module.exports = registerMcpCommand;
