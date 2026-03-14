const inquirer = require('inquirer');
const { execSync } = require('child_process');
const path = require('path');
const ejs = require('ejs');
const fs = require('fs-extra');

const {
  ensureDir,
  writeFile,
  fileExists,
  readFile,
  getCwd,
  resolvePath,
  getTemplateDir
} = require('../utils/file');
const {
  success,
  error,
  warn,
  info,
  createSpinner,
  printDivider,
  printTitle
} = require('../utils/ui');

/**
 * 检查命令是否可用
 * @param {string} command - 命令
 * @returns {boolean}
 */
function checkCommand(command) {
  try {
    execSync(command, { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

/**
 * 获取版本信息
 * @param {string} command - 版本命令
 * @returns {string|null}
 */
function getVersion(command) {
  try {
    const output = execSync(command, { encoding: 'utf-8', stdio: 'pipe' });
    return output.trim();
  } catch {
    return null;
  }
}

/**
 * 复制目录下的所有文件
 * @param {string} srcDir - 源目录
 * @param {string} destDir - 目标目录
 * @param {Array<string>} excludeFiles - 需要排除的文件名数组
 */
async function copyDir(srcDir, destDir, excludeFiles = []) {
  // 确保目标目录存在
  await ensureDir(destDir);

  // 如果源目录不存在，直接返回（允许空目录复制）
  if (!await fileExists(srcDir)) {
    return;
  }

  let entries;
  try {
    entries = await fs.readdir(srcDir, { withFileTypes: true });
  } catch (err) {
    // 如果读取失败（如权限问题），直接返回
    warn(`无法读取目录 ${srcDir}: ${err.message}`);
    return;
  }

  for (const entry of entries) {
    const srcPath = path.join(srcDir, entry.name);
    const destPath = path.join(destDir, entry.name);
    if (excludeFiles.includes(entry.name)) {
      continue;
    }
    if (entry.isDirectory()) {
      await copyDir(srcPath, destPath, excludeFiles);
    } else {
      await fs.copy(srcPath, destPath);
    }
  }
}

/**
 * 初始化项目命令
 */
async function doInit(options) {
  printTitle('🚀 kxcode-j2ee 项目初始化');

  const cwd = getCwd();

  // 0. 检查是否已经初始化过
  const configPath = resolvePath(cwd, '.kxcode', 'config.json');
  if (await fileExists(configPath)) {
    error('检测到当前目录已完成初始化 (.kxcode/config.json 已存在)');
    info('如需重新初始化，请先删除 .kxcode 目录');
    return;
  }

  // 1. 检查 Claude Code 是否安装
  printDivider();
  info('检查 Claude Code 安装状态...');
  if (!checkCommand('claude -v')) {
    error('未检测到 Claude Code，请先安装 Claude Code');
    return;
  }
  const claudeVersion = getVersion('claude -v');
  success(`Claude Code 已安装：${claudeVersion}`);

  // 2. 收集项目配置信息
  let projectTypeAnswer, useDatabaseAnswer, sddFrameworkAnswer, aiToolAnswer;

  // 1. 选择 AI Code 工具
  printDivider();
  aiToolAnswer = await inquirer.prompt([
    {
      type: 'list',
      name: 'aiTool',
      message: '选择 AI Code 工具',
      choices: [
        { name: 'Claude Code', value: 'claude' }
      ]
    }
  ]);

  // 2. 选择 SDD 框架
  printDivider();
  sddFrameworkAnswer = await inquirer.prompt([
    {
      type: 'list',
      name: 'sddFramework',
      message: '选择 SDD 框架',
      choices: [
        { name: 'OpenSpec', value: 'openspec' },
        { name: 'SpecKit', value: 'speckit' },
        { name: '不使用', value: 'none' }
      ]
    }
  ]);

  // 3. 选择项目类型
  printDivider();
  projectTypeAnswer = await inquirer.prompt([
    {
      type: 'list',
      name: 'projectType',
      message: '选择项目类型',
      choices: [
        { name: '普通 J2EE 项目', value: 'j2ee' },
        { name: 'Ptah 平台业务包', value: 'ptah' }
      ]
    }
  ]);

  // 4. 选择是否使用数据库
  printDivider();
  useDatabaseAnswer = await inquirer.prompt([
    {
      type: 'list',
      name: 'useDatabase',
      message: '是否使用数据库',
      choices: [
        { name: '是', value: true },
        { name: '否', value: false }
      ]
    }
  ]);

  // 3. 检查 SDD 框架是否安装（如果选择了不使用则跳过）
  let sddFramework = sddFrameworkAnswer.sddFramework;
  let sddCheckCommand, sddInitCommand;

  if (sddFramework !== 'none') {
    printDivider();
    if (sddFramework === 'openspec') {
      sddCheckCommand = 'openspec -V';
      sddInitCommand = 'openspec init --tools claude';
    } else {
      sddCheckCommand = 'speckit version';
      sddInitCommand = 'speckit init --here --ai claude';
    }

    info(`检查 ${sddFramework === 'openspec' ? 'OpenSpec' : 'SpecKit'} 安装状态...`);
    if (!checkCommand(sddCheckCommand)) {
      error(`未检测到 ${sddFramework === 'openspec' ? 'OpenSpec' : 'SpecKit'}，请先安装`);
      return;
    }
    const sddVersion = getVersion(sddCheckCommand);
    success(`${sddFramework === 'openspec' ? 'OpenSpec' : 'SpecKit'} 已安装：${sddVersion}`);
  }

  // 4. 创建 .claude 目录结构
  printDivider();
  info('创建 .claude 目录结构...');
  const claudeDir = resolvePath(cwd, '.claude');
  const skillsDir = resolvePath(claudeDir, 'skills');
  const rulesDir = resolvePath(claudeDir, 'rules');
  const commandsDir = resolvePath(claudeDir, 'commands');

  await ensureDir(skillsDir);
  await ensureDir(rulesDir);
  await ensureDir(commandsDir);
  success('目录结构创建完成');

  // 5. 创建 settings.local.json
  printDivider();
  info('创建 settings.local.json...');
  const settingsPath = resolvePath(claudeDir, 'settings.local.json');
  const settingsContent = {
    permissions: {
      defaultMode: 'bypassPermissions'
    }
  };
  await writeFile(settingsPath, JSON.stringify(settingsContent, null, 2));
  success('settings.local.json 创建完成');

  // 6. 复制 templates/skills 到 .claude/skills
  printDivider();
  info('复制 SKILL 模板...');
  const templateSkillsDir = resolvePath(getTemplateDir(), 'skills');
  await copyDir(templateSkillsDir, skillsDir);
  success('SKILL 模板复制完成');

  // 7. 复制 templates/rules 到 .claude/rules
  printDivider();
  info('复制 Rules 模板...');
  const templateRulesDir = resolvePath(getTemplateDir(), 'rules');
  await copyDir(templateRulesDir, rulesDir);
  success('Rules 模板复制完成');

  // 8. 复制 templates/commands 到 .claude/commands
  printDivider();
  info('复制 Commands 模板...');
  const templateCommandsDir = resolvePath(getTemplateDir(), 'commands');
  await copyDir(templateCommandsDir, commandsDir, ['.gitkeep']);
  success('Commands 模板复制完成');

  // 9. 复制 templates/docs 到 根目录
  printDivider();
  info('复制 Docs 模板...');
  const templateDocsDir = resolvePath(getTemplateDir(), 'docs');
  const targetDocsDir = resolvePath(cwd, 'docs');

  if (await fileExists(templateDocsDir)) {
    // 使用 copyDir 复制整个 docs 目录（包括空目录）
    await copyDir(templateDocsDir, targetDocsDir);
    success('Docs 模板复制完成');
  } else {
    warn('Docs 模板目录不存在');
  }

  // 10. 执行 SDD 框架 init 命令（如果选择了不使用则跳过）
  if (sddFramework !== 'none') {
    printDivider();
    info(`执行 ${sddFramework === 'openspec' ? 'OpenSpec' : 'SpecKit'} init...`);
    try {
      const spinner = createSpinner(`正在初始化 ${sddFramework === 'openspec' ? 'OpenSpec' : 'SpecKit'}...`);
      execSync(sddInitCommand, { stdio: 'pipe' });
      spinner.succeed(`${sddFramework === 'openspec' ? 'OpenSpec' : 'SpecKit'} 初始化完成`);
    } catch (err) {
      error(`${sddFramework === 'openspec' ? 'OpenSpec' : 'SpecKit'} init 失败`);
      warn('请手动执行初始化命令');
    }
  }

  // 11. 生成/更新差异化配置到 .kxcode 目录
  printDivider();
  info('生成差异化配置...');

  const kxcodeDir = resolvePath(cwd, '.kxcode');
  await ensureDir(kxcodeDir);

  const configContent = {
    aiTool: aiToolAnswer.aiTool,
    projectType: projectTypeAnswer.projectType,
    useDatabase: useDatabaseAnswer.useDatabase,
    sddFramework: sddFramework,
    generatedAt: new Date().toISOString()
  };

  const configFilePath = resolvePath(kxcodeDir, 'config.json');
  await writeFile(configFilePath, JSON.stringify(configContent, null, 2));
  success('config.json 已生成到 .kxcode 目录');

  // 12. 渲染 CLAUDE_TEMPLATE.ejs 并输出到 .kxcode 目录
  printDivider();
  info('渲染 CLAUDE 模板...');

  const templatePath = resolvePath(getTemplateDir(), 'project', 'CLAUDE_TEMPLATE.ejs');
  const templateContent = await readFile(templatePath);
  const renderedContent = ejs.render(templateContent, {
    aiTool: aiToolAnswer.aiTool,
    projectType: projectTypeAnswer.projectType,
    useDatabase: useDatabaseAnswer.useDatabase,
    sddFramework: sddFramework
  });

  const claudeTemplatePath = resolvePath(kxcodeDir, 'CLAUDE_TEMPLATE.md');
  await writeFile(claudeTemplatePath, renderedContent);
  success('CLAUDE_TEMPLATE.md 已生成到 .kxcode 目录');

  printDivider();
  info('差异化配置说明：');
  console.log(`  AI 工具：${aiToolAnswer.aiTool}`);
  console.log(`  SDD 框架：${sddFramework === 'none' ? '不使用' : sddFramework}`);
  console.log(`  项目类型：${projectTypeAnswer.projectType === 'j2ee' ? '普通 J2EE 项目' : 'Ptah 平台业务包'}`);
  console.log(`  是否使用数据库：${useDatabaseAnswer.useDatabase ? '是' : '否'}`);
  console.log('');

  // 13. 完成
  printDivider();
  printTitle('✅ 初始化完成！');
  info('接下来你可以：');
  console.log('  1. 查看 .kxcode/CLAUDE_TEMPLATE.md 获取项目模板内容');
  console.log('  2. 查看 .claude/skills/ 和 .claude/rules/ 获取预置模板');
  console.log('  3. 使用 Claude Code 开始开发');
  console.log('');
}

/**
 * 注册 init 命令
 */
function registerInitCommand(program) {
  program
    .command('init')
    .description('初始化 J2EE 项目的 AI 编程环境')
    .action(doInit);
}

module.exports = registerInitCommand;
