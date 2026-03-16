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
 * 加载 manifest 配置文件
 * @returns {Object} manifest 配置对象
 */
async function loadManifest() {
  const manifestPath = resolvePath(getTemplateDir(), 'config', 'manifest.json');
  if (!await fileExists(manifestPath)) {
    warn('manifest.json 配置文件不存在');
    return { commands: [], skills: [] };
  }
  const content = await readFile(manifestPath);
  return JSON.parse(content);
}

/**
 * 根据作用域过滤技能列表
 * @param {Array} skills - 技能列表
 * @param {string} projectType - 项目类型 (j2ee|ptah)
 * @returns {Array} 过滤后的技能目录列表
 */
function filterSkillsByScope(skills, projectType) {
  const scope = projectType === 'ptah' ? 'ptah' : 'normal';
  const filteredSkills = skills.filter(skill => {
    // scope 为 disable 的技能直接被禁用
    if (skill.scope === 'disable') {
      return false;
    }
    // scope 为 normal 的技能所有项目都可以使用
    // scope 为 ptah 的技能只有 ptah 项目才能使用
    if (skill.scope === 'normal') {
      return true;
    }
    return scope === 'ptah';
  });
  return filteredSkills.map(skill => skill.dir);
}

/**
 * 根据作用域过滤命令列表
 * @param {Array} commands - 命令列表
 * @param {string} projectType - 项目类型 (j2ee|ptah)
 * @returns {Array} 需要复制的命令文件路径列表
 */
function filterCommandsByScope(commands, projectType) {
  const scope = projectType === 'ptah' ? 'ptah' : 'normal';
  const filteredCommands = commands.filter(command => {
    // scope 为 disable 的命令直接被禁用
    if (command.scope === 'disable') {
      return false;
    }
    if (command.scope === 'normal') {
      return true;
    }
    return scope === 'ptah';
  });
  return filteredCommands.map(command => command.file);
}

/**
 * 复制目录下的所有文件（通用逻辑，保留目标目录原有内容）
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
 * 覆盖复制 skills 目录（按文件夹直接覆盖，不保留原文件夹内容）
 * @param {string} srcDir - 源目录
 * @param {string} destDir - 目标目录
 * @param {Array<string>} excludeSkills - 需要排除的 skill 文件夹名数组
 */
async function copySkillsWithOverride(srcDir, destDir, excludeSkills = []) {
  // 如果源目录不存在，直接返回
  if (!await fileExists(srcDir)) {
    return;
  }

  let entries;
  try {
    entries = await fs.readdir(srcDir, { withFileTypes: true });
  } catch (err) {
    warn(`无法读取目录 ${srcDir}: ${err.message}`);
    return;
  }

  for (const entry of entries) {
    if (excludeSkills.includes(entry.name)) {
      continue;
    }
    if (entry.isDirectory()) {
      const srcPath = path.join(srcDir, entry.name);
      const destPath = path.join(destDir, entry.name);
      // 如果目标文件夹已存在，先删除再复制（完全覆盖）
      if (await fileExists(destPath)) {
        await fs.remove(destPath);
      }
      await fs.copy(srcPath, destPath);
    }
  }
}

/**
 * 覆盖复制 commands/kxcode 目录下的文件（按文件覆盖）
 * @param {string} srcDir - 源目录（templates/commands/kxcode）
 * @param {string} destDir - 目标目录（.claude/commands/kxcode）
 */
async function copyCommandsWithOverride(srcDir, destDir) {
  // 如果源目录不存在，直接返回
  if (!await fileExists(srcDir)) {
    return;
  }

  // 确保目标目录存在
  await ensureDir(destDir);

  let entries;
  try {
    entries = await fs.readdir(srcDir, { withFileTypes: true });
  } catch (err) {
    warn(`无法读取目录 ${srcDir}: ${err.message}`);
    return;
  }

  // 只复制文件，按文件覆盖
  for (const entry of entries) {
    if (!entry.isFile()) {
      continue;
    }
    const srcPath = path.join(srcDir, entry.name);
    const destPath = path.join(destDir, entry.name);
    // 直接覆盖复制
    await fs.copy(srcPath, destPath);
  }
}

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
 * 更新项目相关文件的命令
 */
async function doUpdate() {
  printTitle('🔄 kxcode-j2ee 更新相关文件');

  const cwd = getCwd();

  // 1. 检查是否已初始化（.kxcode 目录和 config.json 是否存在）
  const kxcodeDir = resolvePath(cwd, '.kxcode');
  const configPath = resolvePath(kxcodeDir, 'config.json');

  if (!await fileExists(kxcodeDir)) {
    error('未检测到 .kxcode 目录，请先执行 init 命令进行初始化');
    return;
  }

  if (!await fileExists(configPath)) {
    error('未检测到 config.json，请先执行 init 命令进行初始化');
    return;
  }

  // 2. 读取 config.json 配置
  info('读取项目配置...');
  const configContent = await readFile(configPath);
  const config = JSON.parse(configContent);

  const { aiTool, projectType, useDatabase, sddFramework } = config;

  success('配置读取成功');
  info(`  项目类型：${projectType === 'j2ee' ? '普通 J2EE 项目' : 'Ptah 平台业务包'}`);
  info(`  SDD 框架：${sddFramework === 'none' ? '不使用' : sddFramework}`);
  info(`  是否使用数据库：${useDatabase ? '是' : '否'}`);

  // 3. 检查 .claude 目录结构
  printDivider();
  info('检查 .claude 目录结构...');
  const claudeDir = resolvePath(cwd, '.claude');
  const skillsDir = resolvePath(claudeDir, 'skills');
  const rulesDir = resolvePath(claudeDir, 'rules');
  const commandsDir = resolvePath(claudeDir, 'commands');

  await ensureDir(skillsDir);
  await ensureDir(rulesDir);
  await ensureDir(commandsDir);
  success('.claude 目录结构检查完成');

  // 4. 复制/更新 templates/skills 到 .claude/skills（按文件夹覆盖）
  printDivider();
  info('更新 SKILL 模板（按文件夹覆盖）...');
  const templateSkillsDir = resolvePath(getTemplateDir(), 'skills');
  // 加载 manifest 配置，根据作用域过滤 skills
  const manifest = await loadManifest();
  const excludeSkills = filterSkillsByScope(manifest.skills, projectType);
  // 复制时排除不在列表中的 skills
  const allSkillDirs = manifest.skills.map(s => s.dir);
  const skillsToExclude = allSkillDirs.filter(dir => !excludeSkills.includes(dir));
  await copySkillsWithOverride(templateSkillsDir, skillsDir, skillsToExclude);
  success(`SKILL 模板更新完成（已根据作用域过滤，排除 ${skillsToExclude.length} 个）`);

  // 5. 复制/更新 templates/rules 到 .claude/rules（按文件覆盖，保留用户新增文件）
  printDivider();
  info('更新 Rules 模板（按文件覆盖）...');
  const templateRulesDir = resolvePath(getTemplateDir(), 'rules');
  await copyDir(templateRulesDir, rulesDir);
  success('Rules 模板更新完成（保留用户新增文件）');

  // 6. 复制/更新 templates/commands 到 .claude/commands
  // commands/kxcode 下的文件按文件覆盖
  printDivider();
  info('更新 Commands 模板...');
  const templateCommandsDir = resolvePath(getTemplateDir(), 'commands');
  // 根据作用域过滤 commands，获取需要复制的文件列表
  const commandsToCopy = filterCommandsByScope(manifest.commands, projectType);

  // 复制过滤后的命令文件（按文件覆盖）
  for (const commandFile of commandsToCopy) {
    const srcPath = resolvePath(templateCommandsDir, commandFile);
    const destPath = resolvePath(commandsDir, commandFile);
    if (await fileExists(srcPath)) {
      // 确保目标目录存在
      await ensureDir(path.dirname(destPath));
      await fs.copy(srcPath, destPath);
    }
  }
  success(`Commands 模板更新完成（已根据作用域过滤，复制 ${commandsToCopy.length} 个）`);

  // 7. 复制/更新 templates/docs 到根目录（按文件覆盖，保留用户新增文件）
  printDivider();
  info('更新 Docs 模板（按文件覆盖）...');
  const templateDocsDir = resolvePath(getTemplateDir(), 'docs');
  const targetDocsDir = resolvePath(cwd, 'docs');

  if (await fileExists(templateDocsDir)) {
    await copyDir(templateDocsDir, targetDocsDir);
    success('Docs 模板更新完成（保留用户新增文件）');
  } else {
    warn('Docs 模板目录不存在');
  }

  // 8. 执行 SDD 框架 init 命令（如果选择了不使用则跳过）
  if (sddFramework !== 'none') {
    printDivider();
    info(`检查 ${sddFramework === 'openspec' ? 'OpenSpec' : 'SpecKit'} 安装状态...`);

    let sddCheckCommand, sddInitCommand;
    if (sddFramework === 'openspec') {
      sddCheckCommand = 'openspec -V';
      sddInitCommand = 'openspec init --tools claude';
    } else {
      sddCheckCommand = 'speckit version';
      sddInitCommand = 'speckit init --here --ai claude';
    }

    if (!checkCommand(sddCheckCommand)) {
      error(`未检测到 ${sddFramework === 'openspec' ? 'OpenSpec' : 'SpecKit'}，请先安装`);
      return;
    }
    const sddVersion = getVersion(sddCheckCommand);
    success(`${sddFramework === 'openspec' ? 'OpenSpec' : 'SpecKit'} 已安装：${sddVersion}`);

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

  // 9. 检查并更新 CLAUDE_TEMPLATE.md
  printDivider();
  info('检查 CLAUDE_TEMPLATE.md...');

  const templatePath = resolvePath(getTemplateDir(), 'project', 'CLAUDE_TEMPLATE.ejs');
  if (!await fileExists(templatePath)) {
    warn('CLAUDE_TEMPLATE.ejs 模板不存在');
  } else {
    const templateContent = await readFile(templatePath);
    const renderedContent = ejs.render(templateContent, {
      aiTool: aiTool,
      projectType: projectType,
      useDatabase: useDatabase,
      sddFramework: sddFramework
    });

    const claudeTemplatePath = resolvePath(kxcodeDir, 'CLAUDE_TEMPLATE.md');
    await writeFile(claudeTemplatePath, renderedContent);
    success('CLAUDE_TEMPLATE.md 已更新');
  }

  // 10. 完成
  printDivider();
  printTitle('✅ 更新完成！');
  info('已更新的内容：');
  console.log('  - .claude/skills/ (SKILL 模板，按文件夹覆盖)');
  console.log('  - .claude/commands/kxcode/ (命令文件，按文件覆盖)');
  console.log('  - .claude/rules/ (Rules 模板，按文件覆盖)');
  console.log('  - docs/ (文档模板，按文件覆盖，保留用户新增文件)');
  if (sddFramework !== 'none') {
    console.log(`  - ${sddFramework} init (SDD 框架初始化)`);
  }
  console.log('  - .kxcode/CLAUDE_TEMPLATE.md (项目模板，重新渲染)');
  info('未修改的内容：');
  console.log('  - .kxcode/config.json (保持不变)');
  console.log('');
}

/**
 * 注册 update 命令
 */
function registerUpdateCommand(program) {
  program
    .command('update')
    .description('更新 J2EE 项目的相关配置文件（需先执行 init）')
    .action(doUpdate);
}

module.exports = registerUpdateCommand;
