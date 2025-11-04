// index.js — versão JSONL avançada
const fs = require('fs');
const readline = require('readline');
const path = require('path');

class RawDatabase {
  constructor(file, options = {}) {
    this.file = file;
    this.baseDir = options.baseDir || './data';
    this.fileExtension = options.fileExtension || '.jsonl';
  }

  async splitPath() {
    const fileParts = this.file.split('-');
    const fileName = `${fileParts[fileParts.length - 1]}${this.fileExtension}`;
    const dirPath = path.join(this.baseDir, ...fileParts.slice(0, -1));
    const filePath = path.join(dirPath, fileName);
    return { dirPath, filePath };
  }

  async ensureFile(filePath, dirPath) {
    await fs.promises.mkdir(dirPath, { recursive: true });
    if (!fs.existsSync(filePath)) {
      await fs.promises.writeFile(filePath, '');
    }
  }

  async getAllRows(filePath) {
    if (!fs.existsSync(filePath)) return [];
    const content = await fs.promises.readFile(filePath, 'utf-8');
    return content
      .trim()
      .split('\n')
      .filter(Boolean)
      .map(line => JSON.parse(line));
  }

  // ✅ adiciona uma nova linha (gera id automaticamente)
  async createRow(newRow) {
    const { dirPath, filePath } = await this.splitPath();
    await this.ensureFile(filePath, dirPath);

    const rows = await this.getAllRows(filePath);
    const nextId = rows.length > 0 ? rows[rows.length - 1].id + 1 : 1;

    let obj;
    try {
      // tenta interpretar JSON se a entrada for string JSON
      obj = typeof newRow === 'string' && newRow.trim().startsWith('{')
        ? JSON.parse(newRow)
        : { data: newRow };
    } catch {
      obj = { data: newRow };
    }

    obj.id = nextId;
    const jsonLine = JSON.stringify(obj);
    await fs.promises.appendFile(filePath, jsonLine + '\n');
    return true;
  }

  // ✅ lê registros com paginação
  async getPaginatedRows({ quantity = 10, asc = true, page = 1 }) {
    const { filePath } = await this.splitPath();
    const rows = await this.getAllRows(filePath);
    const sorted = asc ? rows : rows.reverse();
    const start = (page - 1) * quantity;
    return { rows: sorted.slice(start, start + quantity), total: rows.length };
  }

  async getIndexRow(index) {
    const { filePath } = await this.splitPath();
    const rows = await this.getAllRows(filePath);
    return rows[index - 1] || null;
  }

  async getRowByTerm(term) {
    const { filePath } = await this.splitPath();
    const rows = await this.getAllRows(filePath);
    return rows.find(r => JSON.stringify(r).toLowerCase().includes(term.toLowerCase())) || null;
  }

  async deleteByTerm(term) {
    const { filePath } = await this.splitPath();
    const rows = await this.getAllRows(filePath);
    const filtered = rows.filter(r => !JSON.stringify(r).toLowerCase().includes(term.toLowerCase()));
    const changed = filtered.length !== rows.length;
    if (changed) await fs.promises.writeFile(filePath, filtered.map(r => JSON.stringify(r)).join('\n') + '\n');
    return changed;
  }

  async deleteByIndex(index) {
    const { filePath } = await this.splitPath();
    const rows = await this.getAllRows(filePath);
    if (index < 1 || index > rows.length) return false;
    rows.splice(index - 1, 1);
    await fs.promises.writeFile(filePath, rows.map(r => JSON.stringify(r)).join('\n') + '\n');
    return true;
  }

  async upgradeByIndex(index, newData) {
    const { filePath } = await this.splitPath();
    const rows = await this.getAllRows(filePath);
    if (index < 1 || index > rows.length) return false;

    const obj = typeof newData === 'string' && newData.trim().startsWith('{')
      ? JSON.parse(newData)
      : { data: newData };

    obj.id = rows[index - 1].id; // mantém id
    rows[index - 1] = obj;
    await fs.promises.writeFile(filePath, rows.map(r => JSON.stringify(r)).join('\n') + '\n');
    return true;
  }

  async upgradeByTerm(term, newData) {
    const { filePath } = await this.splitPath();
    const rows = await this.getAllRows(filePath);
    const idx = rows.findIndex(r => JSON.stringify(r).toLowerCase().includes(term.toLowerCase()));
    if (idx === -1) return false;

    const obj = typeof newData === 'string' && newData.trim().startsWith('{')
      ? JSON.parse(newData)
      : { data: newData };

    obj.id = rows[idx].id;
    rows[idx] = obj;
    await fs.promises.writeFile(filePath, rows.map(r => JSON.stringify(r)).join('\n') + '\n');
    return true;
  }
}

module.exports = RawDatabase;
