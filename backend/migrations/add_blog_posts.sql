CREATE TABLE BlogPosts (
    id         INT IDENTITY(1,1) PRIMARY KEY,
    title      NVARCHAR(500)  NOT NULL,
    image      NVARCHAR(1000) NOT NULL,
    excerpt    NVARCHAR(MAX)  NOT NULL,
    content    NVARCHAR(MAX)  NOT NULL,
    category   NVARCHAR(255)  NOT NULL,
    read_time  NVARCHAR(50),
    tags       NVARCHAR(500),
    featured   BIT            NOT NULL DEFAULT 0,
    date       DATE           NOT NULL DEFAULT GETDATE()
);
GO
