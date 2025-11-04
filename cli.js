#!/usr/bin/env node
const { Command } = require('commander');
const RawDatabase = require('./index');
const program = new Command();

const FILE_EXT = '.jsonl';

program.version('2.0.0').description('CLI para banco de dados JSONL');

program
  .command('add <file> <data>')
  .description('Adiciona uma nova linha (aceita string ou JSON)')
  .action(async (file, data) => {
    const db = new RawDatabase(file, { baseDir: './data', fileExtension: FILE_EXT });
    const ok = await db.createRow(data);
    console.log(ok ? '✅ Linha adicionada!' : '❌ Falha ao adicionar linha.');
  });

program
  .command('get <file> <page>')
  .description('Lista registros com paginação')
  .option('-q, --quantity <quantity>', 'Quantidade por página', 10)
  .option('-a, --asc', 'Ordem ascendente', false)
  .option('-p, --pretty', 'Exibir JSON formatado', false)
  .action(async (file, page, opts) => {
    const db = new RawDatabase(file, { baseDir: './data', fileExtension: FILE_EXT });
    const { rows, total } = await db.getPaginatedRows({
      quantity: parseInt(opts.quantity),
      asc: !!opts.asc,
      page: parseInt(page),
    });
    console.log(`📄 Total de linhas: ${total}`);
    rows.forEach((r, i) => {
      console.log(opts.pretty ? JSON.stringify(r, null, 2) : `${i + 1}. ${JSON.stringify(r)}`);
    });
  });

program
  .command('getIndex <file> <index>')
  .description('Obtém um registro pelo índice')
  .option('-p, --pretty', 'Exibir JSON formatado', false)
  .action(async (file, index, opts) => {
    const db = new RawDatabase(file, { baseDir: './data', fileExtension: FILE_EXT });
    const row = await db.getIndexRow(parseInt(index));
    if (!row) return console.log('Nenhum registro encontrado.');
    console.log(opts.pretty ? JSON.stringify(row, null, 2) : JSON.stringify(row));
  });

program
  .command('exists <file> <term>')
  .description('Verifica se existe linha contendo o termo')
  .action(async (file, term) => {
    const db = new RawDatabase(file, { baseDir: './data', fileExtension: FILE_EXT });
    const row = await db.getRowByTerm(term);
    console.log(row ? `✅ Encontrado: ${JSON.stringify(row)}` : `❌ Nenhum registro com "${term}"`);
  });

program
  .command('deleteByTerm <file> <term>')
  .description('Remove linhas que contenham o termo')
  .action(async (file, term) => {
    const db = new RawDatabase(file, { baseDir: './data', fileExtension: FILE_EXT });
    const ok = await db.deleteByTerm(term);
    console.log(ok ? '🗑️ Linhas removidas.' : 'Nenhuma linha correspondente encontrada.');
  });

program
  .command('deleteByIndex <file> <index>')
  .description('Remove linha pelo índice')
  .action(async (file, index) => {
    const db = new RawDatabase(file, { baseDir: './data', fileExtension: FILE_EXT });
    const ok = await db.deleteByIndex(parseInt(index));
    console.log(ok ? '🗑️ Linha removida.' : 'Índice inválido.');
  });

program
  .command('upgradeByIndex <file> <index> <newData>')
  .description('Atualiza linha pelo índice (aceita JSON)')
  .action(async (file, index, newData) => {
    const db = new RawDatabase(file, { baseDir: './data', fileExtension: FILE_EXT });
    const ok = await db.upgradeByIndex(parseInt(index), newData);
    console.log(ok ? '✅ Linha atualizada!' : '❌ Falha ao atualizar.');
  });

program
  .command('upgradeByTerm <file> <term> <newData>')
  .description('Atualiza linha que contenha termo (aceita JSON)')
  .action(async (file, term, newData) => {
    const db = new RawDatabase(file, { baseDir: './data', fileExtension: FILE_EXT });
    const ok = await db.upgradeByTerm(term, newData);
    console.log(ok ? '✅ Linha atualizada!' : '❌ Nenhuma linha encontrada.');
  });

program.parse(process.argv);
