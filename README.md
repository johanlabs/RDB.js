# RDB.js

`RDB.js` is a simple JavaScript library for managing file-based databases using JSON Lines (`.jsonl`). It allows you to add, retrieve, update, and delete rows, with support for **pagination**, **automatic unique IDs**, and **term-based search**. A CLI is included for quick terminal interactions.

---

## Table of Contents

1. [RawDatabase Class](#rawdatabase-class)
2. [Dataset Examples](#dataset-examples)
3. [CLI Commands](#cli-commands)
4. [Installation](#installation)
5. [Usage Examples](#usage-examples)

---

## RawDatabase Class

The `RawDatabase` class is the main interface for interacting with `.jsonl` files as a simple database.

### Constructor

```javascript
new RawDatabase(file, options = {})
```

* `file`: Name of the database file (without extension).
* `options`:

  * `baseDir` (string, default `./data`): Base directory for database files.
  * `fileExtension` (string, default `.jsonl`): File extension for database files.

### Methods

#### `createRow(newRow)`

Adds a new row. The `id` is **auto-generated**. Returns the new row with ID.

```javascript
const newRow = { name: "Alice", age: 25, city: "São Paulo" };
const addedRow = db.createRow(newRow);
// addedRow -> { id: 1, name: "Alice", age: 25, city: "São Paulo" }
```

#### `getPaginatedRows({ quantity, asc, page })`

Returns rows with pagination.

* `quantity` (default 10): Rows per page.
* `asc` (default `true`): Sort ascending (`false` for descending).
* `page` (default 1): Page number.

```javascript
const page1 = await db.getPaginatedRows({ quantity: 5, page: 1, asc: true });
```

#### `getIndexRow(index)`

Retrieves a row by its **1-based index**.

#### `getById(id)`

Retrieves a row by its **auto-generated ID**.

```javascript
const row = db.getById(1);
```

#### `getRowByTerm(term)`

Retrieves the first row containing a term (case-insensitive).

```javascript
const row = db.getRowByTerm("Alice");
```

#### `deleteByTerm(term)`

Deletes rows containing the term. Returns `true` if any row was deleted.

#### `deleteByIndex(index)` / `deleteById(id)`

Deletes a row by index or ID. Returns `true` if successful.

#### `upgradeByIndex(index, newData)` / `upgradeByTerm(term, newData)` / `upgradeById(id, newData)`

Updates a row by index, term, or ID. Returns `true` if successful.

---

## Dataset Examples

Here is a **sample JSONL dataset** suitable for AI training or prototyping:

**File: `users.jsonl`**

```json
{"id":1,"name":"Alice","age":25,"city":"São Paulo"}
{"id":2,"name":"Bob","age":30,"city":"Rio de Janeiro"}
{"id":3,"name":"Carol","age":28,"city":"Belo Horizonte"}
{"id":4,"name":"David","age":35,"city":"Curitiba"}
{"id":5,"name":"Eve","age":22,"city":"Salvador"}
```

**Usage in `RawDatabase`:**

```javascript
const db = new RawDatabase('users');

// Add a new user (ID is auto-generated)
const newUser = db.createRow({name: "Frank", age: 40, city: "Fortaleza"});

// Paginate rows (3 per page)
const page1 = await db.getPaginatedRows({quantity:3, page:1});
console.log(page1);

// Update a user by ID
db.upgradeById(2, {name: "Bobby", age: 31, city: "Rio de Janeiro"});

// Delete a user by term
db.deleteByTerm("Eve");
```

> This dataset is suitable for **AI tasks**, such as classification, text generation, or data analysis.

---

## CLI Commands

The CLI allows interaction without writing code.

### `add <file> <data>`

Add a row (ID auto-generated):

```bash
node cli.js add users '{"name":"Frank","age":40,"city":"Fortaleza"}'
```

### `get <file> <page> [options]`

List rows with pagination:

```bash
node cli.js get users 1 --quantity 3 --asc --pretty
```

### `getIndex <file> <index>` / `getById <file> <id>`

Retrieve a row by index or ID.

### `exists <file> <term>`

Check if any row contains a term.

### `deleteByTerm <file> <term>` / `deleteByIndex <file> <index>` / `deleteById <file> <id>`

Delete rows by term, index, or ID.

### `upgradeByIndex <file> <index> <newData>` / `upgradeByTerm <file> <term> <newData>` / `upgradeById <file> <id> <newData>`

Update rows with new data.

---

## Installation

```bash
git clone https://github.com/your-repo/raw-database-cli.git
cd raw-database-cli
npm install
```

---

## Full Usage Examples

```bash
# Add a user
node cli.js add users '{"name":"Grace","age":29,"city":"Recife"}'

# List first page (5 rows per page)
node cli.js get users 1 --quantity 5 --asc

# Update a user by term
node cli.js upgradeByTerm users "Grace" '{"name":"Grace Hopper","age":30,"city":"Recife"}'

# Delete a user by ID
node cli.js deleteById users 7
```