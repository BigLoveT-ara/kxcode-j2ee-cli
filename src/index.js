#!/usr/bin/env node

const { program } = require('commander');
const { version, description } = require('../package.json');

// 导入命令
const initCommand = require('./commands/init');
const updateCommand = require('./commands/update');

// 设置 CLI 信息
program
  .name('kxcode-j2ee')
  .version(version, '-v, --version', '输出版本号')
  .description(description);

// 注册命令
initCommand(program);
updateCommand(program);

// 解析命令行
program.parse();

// 如果没有提供任何命令，显示帮助
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
