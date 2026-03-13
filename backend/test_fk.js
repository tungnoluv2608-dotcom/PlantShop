const { getPool } = require('./src/libs/db');
getPool().then(async p => {
  const r = await p.request().query("SELECT CONSTRAINT_NAME, COLUMN_NAME FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE WHERE TABLE_NAME='OrderItems'");
  console.log(JSON.stringify(r.recordset, null, 2));
  process.exit(0);
});
