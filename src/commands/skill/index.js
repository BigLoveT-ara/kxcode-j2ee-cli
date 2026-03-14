const inquirer = require('inquirer');
const path = require('path');
const fs = require('fs-extra');

const {
  ensureDir,
  writeFile,
  readFile,
  fileExists,
  getTemplateDir,
  getCwd,
  resolvePath,
  readDir
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

/**
 * 创建 SKILL 命令
 */
async function doCreate(name, options) {
  const cwd = getCwd();
  const skillsDir = resolvePath(cwd, '.claude', 'skills');

  // 检查 .claude/skills 目录是否存在
  if (!(await fileExists(skillsDir))) {
    error('未找到 .claude/skills 目录，请先运行 kxcode-j2ee init 初始化项目');
    return;
  }

  let skillName = name;
  let description = '';

  // 如果没有提供名称，交互式询问
  if (!skillName) {
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'name',
        message: 'SKILL 名称',
        validate: (input) => {
          if (!input || input.trim() === '') {
            return '请输入 SKILL 名称';
          }
          return true;
        }
      },
      {
        type: 'input',
        name: 'description',
        message: 'SKILL 描述',
        validate: (input) => {
          if (!input || input.trim() === '') {
            return '请输入 SKILL 描述';
          }
          return true;
        }
      }
    ]);
    skillName = answers.name;
    description = answers.description;
  } else {
    // 提供了名称，询问描述
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'description',
        message: 'SKILL 描述',
        default: `${skillName} 技能`
      }
    ]);
    description = answers.description;
  }

  // 获取作者信息
  const authorAnswer = await inquirer.prompt([
    {
      type: 'input',
      name: 'author',
      message: '作者',
      default: process.env.USER || process.env.USERNAME || 'developer'
    }
  ]);

  // 检查是否已存在
  const skillDir = resolvePath(skillsDir, skillName);
  const skillFile = resolvePath(skillDir, 'SKILL.md');

  if (await fileExists(skillFile)) {
    if (!options.force) {
      error(`SKILL "${skillName}" 已存在`);
      warn('使用 --force 选项覆盖现有 SKILL');
      return;
    }
  }

  // 创建 SKILL 目录
  await ensureDir(skillDir);

  // 读取模板
  const templatePath = resolvePath(getTemplateDir(), 'skills', 'SKILL_TEMPLATE.md');
  let content = await readFile(templatePath);

  // 替换模板变量
  content = content
    .replace(/{{name}}/g, skillName)
    .replace(/{{description}}/g, description)
    .replace(/{{author}}/g, authorAnswer.author)
    .replace(/{{inputDescription}}/g, '请输入相关需求或文件路径')
    .replace(/{{step1}}/g, '请描述第一步操作')
    .replace(/{{step2}}/g, '请描述第二步操作')
    .replace(/{{step3}}/g, '请描述第三步操作')
    .replace(/{{constraint1}}/g, '约束条件 1')
    .replace(/{{constraint2}}/g, '约束条件 2');

  // 写入文件
  await writeFile(skillFile, content);

  success(`SKILL "${skillName}" 创建成功`);
  info(`文件位置：${skillFile}`);
  console.log('');
  console.log('请编辑 SKILL.md 文件，完善技能的具体步骤和约束条件。');
}

/**
 * 列出 SKILL 命令
 */
async function doList(options) {
  const cwd = getCwd();
  const skillsDir = resolvePath(cwd, '.claude', 'skills');

  // 检查 .claude/skills 目录是否存在
  if (!(await fileExists(skillsDir))) {
    error('未找到 .claude/skills 目录，请先运行 kxcode-j2ee init 初始化项目');
    return;
  }

  printTitle('📋 可用的 SKILLS');

  // 读取所有 SKILL 目录
  const items = await readDir(skillsDir);
  const skills = [];

  for (const item of items) {
    const itemPath = resolvePath(skillsDir, item);
    const stat = await fs.stat(itemPath);
    if (stat.isDirectory()) {
      const skillFile = resolvePath(itemPath, 'SKILL.md');
      if (await fileExists(skillFile)) {
        const content = await readFile(skillFile);
        // 解析 Frontmatter
        const nameMatch = content.match(/name:\s*(.+)/);
        const descMatch = content.match(/description:\s*(.+)/);
        const versionMatch = content.match(/version:\s*"?([^"\n]+)"?/);
        const authorMatch = content.match(/author:\s*(.+)/);

        skills.push({
          name: nameMatch ? nameMatch[1].trim() : item,
          description: descMatch ? descMatch[1].trim() : '无描述',
          version: versionMatch ? versionMatch[1].trim() : '1.0',
          author: authorMatch ? authorMatch[1].trim() : 'unknown'
        });
      }
    }
  }

  if (skills.length === 0) {
    info('暂无可用的 SKILL');
    console.log('');
    console.log('使用 kxcode-j2ee skill create <name> 创建新 SKILL');
    return;
  }

  // 创建表格
  const table = createTable({
    head: ['名称', '描述', '版本', '作者'],
    colWidths: [25, 50, 10, 15]
  });

  for (const skill of skills) {
    table.push([skill.name, skill.description, skill.version, skill.author]);
  }

  console.log(table.toString());
  console.log('');
  info(`共 ${skills.length} 个 SKILL`);
}

/**
 * 注册 skill 命令
 */
function registerSkillCommand(program) {
  const skill = program
    .command('skill')
    .description('SKILL 管理命令');

  skill
    .command('create [name]')
    .description('创建新的 SKILL')
    .option('-f, --force', '强制覆盖现有 SKILL')
    .action(doCreate);

  skill
    .command('list')
    .description('列出所有可用的 SKILL')
    .action(doList);
}

module.exports = registerSkillCommand;
