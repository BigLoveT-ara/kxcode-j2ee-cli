const chalk = require('chalk');
const ora = require('ora');
const Table = require('cli-table3');

/**
 * 成功消息
 * @param {string} message
 */
function success(message) {
  console.log(chalk.green(`✓ ${message}`));
}

/**
 * 错误消息
 * @param {string} message
 */
function error(message) {
  console.log(chalk.red(`✗ ${message}`));
}

/**
 * 警告消息
 * @param {string} message
 */
function warn(message) {
  console.log(chalk.yellow(`⚠ ${message}`));
}

/**
 * 信息消息
 * @param {string} message
 */
function info(message) {
  console.log(chalk.blue(`ℹ ${message}`));
}

/**
 * 创建加载动画
 * @param {string} message
 * @returns {object} ora spinner
 */
function createSpinner(message) {
  return ora(chalk.cyan(message)).start();
}

/**
 * 创建表格
 * @param {object} options - 表格选项
 * @returns {Table}
 */
function createTable(options = {}) {
  const defaultOptions = {
    head: [],
    colWidths: [],
    wordWrap: true,
    wrapOnWordCount: false,
    style: {
      head: ['cyan'],
      border: ['gray']
    }
  };

  return new Table({ ...defaultOptions, ...options });
}

/**
 * 打印分隔线
 */
function printDivider() {
  console.log(chalk.gray('─'.repeat(50)));
}

/**
 * 打印标题
 * @param {string} title
 */
function printTitle(title) {
  console.log(chalk.bold.cyan(`\n${title}\n`));
}

module.exports = {
  success,
  error,
  warn,
  info,
  createSpinner,
  createTable,
  printDivider,
  printTitle
};
