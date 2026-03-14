const fs = require('fs-extra');
const path = require('path');

/**
 * 检查目录是否存在
 * @param {string} dirPath - 目录路径
 * @returns {Promise<boolean>}
 */
async function ensureDir(dirPath) {
  return fs.ensureDir(dirPath);
}

/**
 * 读取文件内容
 * @param {string} filePath - 文件路径
 * @returns {Promise<string>}
 */
async function readFile(filePath) {
  return fs.readFile(filePath, 'utf-8');
}

/**
 * 写入文件内容
 * @param {string} filePath - 文件路径
 * @param {string} content - 文件内容
 */
async function writeFile(filePath, content) {
  await ensureDir(path.dirname(filePath));
  return fs.writeFile(filePath, content, 'utf-8');
}

/**
 * 复制文件或目录
 * @param {string} src - 源路径
 * @param {string} dest - 目标路径
 */
async function copy(src, dest) {
  return fs.copy(src, dest);
}

/**
 * 检查文件是否存在
 * @param {string} filePath - 文件路径
 * @returns {Promise<boolean>}
 */
async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * 读取目录内容
 * @param {string} dirPath - 目录路径
 * @returns {Promise<string[]>}
 */
async function readDir(dirPath) {
  return fs.readdir(dirPath);
}

/**
 * 获取当前工作目录
 * @returns {string}
 */
function getCwd() {
  return process.cwd();
}

/**
 * 解析路径
 * @param {...string} paths - 路径片段
 * @returns {string}
 */
function resolvePath(...paths) {
  return path.resolve(...paths);
}

/**
 * 获取模板目录路径
 * @returns {string}
 */
function getTemplateDir() {
  // 模板目录在项目根目录的 templates/，不是 src/templates/
  return path.join(__dirname, '..', '..', 'templates');
}

module.exports = {
  ensureDir,
  readFile,
  writeFile,
  copy,
  fileExists,
  readDir,
  getCwd,
  resolvePath,
  getTemplateDir
};
