#!/usr/bin/env node
const { Command } = require('commander');
const RawDatabase = require('./index');
const program = new Command();

const FILE_EXT = '.jsonl';

program.version('2.0.0').description('CLI for JSONL database');

program
  .command('add <file> <data>')
  .description('Add a new row (accepts string or JSON)')
  .action(async (file, data) => {
    const db = new RawDatabase(file, { baseDir: './data', fileExtension: FILE_EXT });
    const row = await db.createRow(data);
    console.log(row ? '✅ Row added!' : '❌ Failed to add row.');
  });

program
  .command('get <file> <page>')
  .description('List rows with pagination')
  .option('-q, --quantity <quantity>', 'Rows per page', 10)
  .option('-a, --asc', 'Ascending order', false)
  .option('-p, --pretty', 'Pretty JSON output', false)
  .action(async (file, page, opts) => {
    const db = new RawDatabase(file, { baseDir: './data', fileExtension: FILE_EXT });
    const { rows, total } = await db.getPaginatedRows({
      quantity: parseInt(opts.quantity),
      asc: !!opts.asc,
      page: parseInt(page),
    });
    console.log(`📄 Total rows: ${total}`);
    rows.forEach((r, i) => {
      console.log(opts.pretty ? JSON.stringify(r, null, 2) : `${i + 1}. ${JSON.stringify(r)}`);
    });
  });

program
  .command('getIndex <file> <index>')
  .description('Get a row by index')
  .option('-p, --pretty', 'Pretty JSON output', false)
  .action(async (file, index, opts) => {
    const db = new RawDatabase(file, { baseDir: './data', fileExtension: FILE_EXT });
    const row = await db.getIndexRow(parseInt(index));
    if (!row) return console.log('No row found.');
    console.log(opts.pretty ? JSON.stringify(row, null, 2) : JSON.stringify(row));
  });

program
  .command('getById <file> <id>')
  .description('Get a row by ID')
  .option('-p, --pretty', 'Pretty JSON output', false)
  .action(async (file, id, opts) => {
    const db = new RawDatabase(file, { baseDir: './data', fileExtension: FILE_EXT });
    const row = await db.getById(parseInt(id));
    if (!row) return console.log('No row found.');
    console.log(opts.pretty ? JSON.stringify(row, null, 2) : JSON.stringify(row));
  });

program
  .command('exists <file> <term>')
  .description('Check if a row contains a term')
  .action(async (file, term) => {
    const db = new RawDatabase(file, { baseDir: './data', fileExtension: FILE_EXT });
    const row = await db.getRowByTerm(term);
    console.log(row ? `✅ Found: ${JSON.stringify(row)}` : `❌ No row contains "${term}"`);
  });

program
  .command('deleteByTerm <file> <term>')
  .description('Delete rows containing a term')
  .action(async (file, term) => {
    const db = new RawDatabase(file, { baseDir: './data', fileExtension: FILE_EXT });
    const ok = await db.deleteByTerm(term);
    console.log(ok ? '🗑️ Rows deleted.' : 'No matching rows found.');
  });

program
  .command('deleteByIndex <file> <index>')
  .description('Delete a row by index')
  .action(async (file, index) => {
    const db = new RawDatabase(file, { baseDir: './data', fileExtension: FILE_EXT });
    const ok = await db.deleteByIndex(parseInt(index));
    console.log(ok ? '🗑️ Row deleted.' : 'Invalid index.');
  });

program
  .command('deleteById <file> <id>')
  .description('Delete a row by ID')
  .action(async (file, id) => {
    const db = new RawDatabase(file, { baseDir: './data', fileExtension: FILE_EXT });
    const ok = await db.deleteById(parseInt(id));
    console.log(ok ? '🗑️ Row deleted.' : 'No row with that ID.');
  });

program
  .command('upgradeByIndex <file> <index> <newData>')
  .description('Update a row by index (accepts JSON)')
  .action(async (file, index, newData) => {
    const db = new RawDatabase(file, { baseDir: './data', fileExtension: FILE_EXT });
    const ok = await db.upgradeByIndex(parseInt(index), newData);
    console.log(ok ? '✅ Row updated!' : '❌ Failed to update.');
  });

program
  .command('upgradeByTerm <file> <term> <newData>')
  .description('Update a row containing a term (accepts JSON)')
  .action(async (file, term, newData) => {
    const db = new RawDatabase(file, { baseDir: './data', fileExtension: FILE_EXT });
    const ok = await db.upgradeByTerm(term, newData);
    console.log(ok ? '✅ Row updated!' : '❌ No matching row found.');
  });

program
  .command('upgradeById <file> <id> <newData>')
  .description('Update a row by ID (accepts JSON)')
  .action(async (file, id, newData) => {
    const db = new RawDatabase(file, { baseDir: './data', fileExtension: FILE_EXT });
    const ok = await db.upgradeById(parseInt(id), newData);
    console.log(ok ? '✅ Row updated!' : '❌ No row with that ID.');
  });

program.parse(process.argv);
