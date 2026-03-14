const { execSync } = require('child_process');

/**
 * 检查 git 是否可用
 * @returns {boolean}
 */
function isGitAvailable() {
  try {
    execSync('git --version', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

/**
 * 克隆 git 仓库
 * @param {string} repoUrl - 仓库 URL
 * @param {string} destPath - 目标路径
 * @param {boolean} depth - 是否浅克隆
 */
function clone(repoUrl, destPath, depth = true) {
  const args = ['clone'];
  if (depth) {
    args.push('--depth', '1');
  }
  args.push(repoUrl, destPath);
  execSync(`git ${args.join(' ')}`, { stdio: 'inherit' });
}

/**
 * 执行 git 命令
 * @param {string[]} args - git 命令参数
 * @param {object} options - 执行选项
 */
function exec(args, options = {}) {
  const stdio = options.stdio || 'pipe';
  return execSync(`git ${args.join(' ')}`, { stdio, encoding: 'utf-8' });
}

/**
 * 检查当前目录是否已经是 git 仓库
 * @returns {boolean}
 */
function isGitRepo() {
  try {
    execSync('git rev-parse --is-inside-work-tree', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

module.exports = {
  isGitAvailable,
  clone,
  exec,
  isGitRepo
};
