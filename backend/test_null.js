const { getPool } = require('./src/libs/db');
getPool().then(async p => {
  const r = await p.request().query("SELECT COLUMN_NAME, IS_NULLABLE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='OrderItems'");
  console.log(JSON.stringify(r.recordset, null, 2));
  process.exit(0);
});
