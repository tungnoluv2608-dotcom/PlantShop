IF NOT EXISTS (
  SELECT 1
  FROM sys.tables
  WHERE name = 'UserPlantAdvisorHistory'
)
BEGIN
  CREATE TABLE UserPlantAdvisorHistory (
    id                   INT IDENTITY(1,1) PRIMARY KEY,
    user_id              INT NOT NULL REFERENCES Users(id),
    budget               DECIMAL(18, 2) NOT NULL,
    light_level          NVARCHAR(20) NOT NULL,
    has_pets             BIT NOT NULL DEFAULT 0,
    priority             NVARCHAR(50) NOT NULL,
    summary              NVARCHAR(MAX),
    recommendations_json NVARCHAR(MAX) NOT NULL,
    created_at           DATETIME NOT NULL DEFAULT GETDATE()
  );

  CREATE INDEX IX_UserPlantAdvisorHistory_UserId_CreatedAt
    ON UserPlantAdvisorHistory(user_id, created_at DESC);
END
