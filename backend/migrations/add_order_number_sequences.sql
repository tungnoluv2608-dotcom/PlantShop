IF NOT EXISTS (
  SELECT 1
  FROM sys.tables
  WHERE name = 'OrderNumberSequences'
)
BEGIN
  CREATE TABLE OrderNumberSequences (
    sequence_year INT NOT NULL PRIMARY KEY,
    last_value    INT NOT NULL DEFAULT 0,
    updated_at    DATETIME NOT NULL DEFAULT GETDATE()
  );
END;
GO
