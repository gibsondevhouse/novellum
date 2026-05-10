# SQLite (`better-sqlite3`) Production Best Practices

This instruction file defines the standard for all database interactions within Novellum. Agents must adhere to these rules for high-performance, safe backend execution.

## 1. Connection & Pragmas
- **WAL Mode:** Write-Ahead Logging must be enabled. It allows multiple readers to operate concurrently with a single writer.
  ```javascript
  db.pragma('journal_mode = WAL');
  ```
- **Synchronous NORMAL:** When WAL is enabled, synchronous can be safely lowered to `NORMAL` for massive speed improvements.
  ```javascript
  db.pragma('synchronous = NORMAL');
  ```
- **Busy Timeout:** Always set a `busy_timeout` to prevent `SQLITE_BUSY` (database is locked) errors during write contention.
  ```javascript
  db.pragma('busy_timeout = 5000');
  ```

## 2. Transactions (Synchronous)
- `better-sqlite3` transactions are synchronous and avoid event loop overhead.
- **Rule:** Wrap any operation that modifies multiple rows or tables inside a transaction.
- **Immediate Transactions:** For high-concurrency endpoints, use `db.transaction(...).default('IMMEDIATE')` to acquire write locks early and prevent deadlocks.
  ```javascript
  const insertMany = db.transaction((items) => {
    for (const item of items) {
      stmt.run(item);
    }
  });
  insertMany(data);
  ```

## 3. Prepared Statements
- **Rule:** Never interpolate variables directly into SQL strings. Always use `db.prepare('...').run(value)`.
- **Caching:** Cache prepared statements at the module level if they are called frequently in a loop, though `better-sqlite3` has internal caching.

## 4. Concurrency Management
- SQLite allows infinite concurrent readers but only **one** writer at a time.
- Ensure write transactions are kept as short as possible. Do not perform heavy CPU tasks or I/O while a database write transaction is open.
