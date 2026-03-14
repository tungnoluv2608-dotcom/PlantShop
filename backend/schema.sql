-- PlantWeb Database Schema
-- SQL Server

USE PlantShopDB;
GO

-- ── Users ──────────────────────────────────────────────────────
CREATE TABLE Users (
    id            INT IDENTITY(1,1) PRIMARY KEY,
    name          NVARCHAR(255)  NOT NULL,
    email         NVARCHAR(255)  NOT NULL UNIQUE,
    password_hash NVARCHAR(500)  NOT NULL,
    role          NVARCHAR(50)   NOT NULL DEFAULT 'customer', -- 'customer' | 'admin'
    created_at    DATETIME       NOT NULL DEFAULT GETDATE()
);
GO

-- ── User Addresses ────────────────────────────────────────────
CREATE TABLE UserAddresses (
    id           INT IDENTITY(1,1) PRIMARY KEY,
    user_id      INT            NOT NULL REFERENCES Users(id),
    label        NVARCHAR(100)  NOT NULL,
    full_name    NVARCHAR(255)  NOT NULL,
    phone        NVARCHAR(50)   NOT NULL,
    province     NVARCHAR(255)  NOT NULL,
    district     NVARCHAR(255)  NOT NULL,
    ward         NVARCHAR(255),
    address_line NVARCHAR(MAX)  NOT NULL,
    is_default   BIT            NOT NULL DEFAULT 0,
    created_at   DATETIME       NOT NULL DEFAULT GETDATE(),
    updated_at   DATETIME       NOT NULL DEFAULT GETDATE()
);
GO

-- ── Categories ─────────────────────────────────────────────────
CREATE TABLE Categories (
    id    INT IDENTITY(1,1) PRIMARY KEY,
    name  NVARCHAR(255) NOT NULL,
    image NVARCHAR(1000)
);
GO

CREATE TABLE CategorySubcategories (
    id          INT IDENTITY(1,1) PRIMARY KEY,
    category_id INT           NOT NULL REFERENCES Categories(id),
    name        NVARCHAR(255) NOT NULL
);
GO

-- ── Products ───────────────────────────────────────────────────
CREATE TABLE Products (
    id             INT IDENTITY(1,1) PRIMARY KEY,
    title          NVARCHAR(500)     NOT NULL,
    price          DECIMAL(18, 2)    NOT NULL,
    original_price DECIMAL(18, 2),
    discount       NVARCHAR(50),
    description    NVARCHAR(MAX),
    image_url      NVARCHAR(1000),
    category_id    INT               REFERENCES Categories(id),
    bio            NVARCHAR(MAX),
    in_stock       BIT               NOT NULL DEFAULT 1
);
GO

CREATE TABLE ProductImages (
    id         INT IDENTITY(1,1) PRIMARY KEY,
    product_id INT            NOT NULL REFERENCES Products(id),
    url        NVARCHAR(1000) NOT NULL,
    sort_order INT            NOT NULL DEFAULT 0
);
GO

CREATE TABLE CareGuides (
    id         INT IDENTITY(1,1) PRIMARY KEY,
    product_id INT           NOT NULL REFERENCES Products(id),
    title      NVARCHAR(500) NOT NULL,
    content    NVARCHAR(MAX) NOT NULL,
    sort_order INT           NOT NULL DEFAULT 0
);
GO

-- ── Planters ───────────────────────────────────────────────────
CREATE TABLE Planters (
    id        INT IDENTITY(1,1) PRIMARY KEY,
    name      NVARCHAR(500)  NOT NULL,
    material  NVARCHAR(255)  NOT NULL,
    price     DECIMAL(18, 2) NOT NULL,
    image_url NVARCHAR(1000),
    in_stock  BIT            NOT NULL DEFAULT 1,
    type      NVARCHAR(50)   NOT NULL DEFAULT 'planter'
);
GO

CREATE TABLE PlanterSizes (
    id         INT IDENTITY(1,1) PRIMARY KEY,
    planter_id INT           NOT NULL REFERENCES Planters(id),
    size_label NVARCHAR(100) NOT NULL
);
GO

-- ── Blog Posts ─────────────────────────────────────────────────
CREATE TABLE BlogPosts (
    id        INT IDENTITY(1,1) PRIMARY KEY,
    title     NVARCHAR(500) NOT NULL,
    image     NVARCHAR(1000),
    excerpt   NVARCHAR(MAX),
    content   NVARCHAR(MAX),
    category  NVARCHAR(255),
    read_time NVARCHAR(50),
    tags      NVARCHAR(500),  -- comma-separated
    featured  BIT NOT NULL DEFAULT 0,
    date      DATE NOT NULL DEFAULT CAST(GETDATE() AS DATE)
);
GO

-- ── Orders ─────────────────────────────────────────────────────
CREATE TABLE Orders (
    id               NVARCHAR(50)  NOT NULL PRIMARY KEY,  -- e.g. PAP-2026-00001
    user_id          INT           NOT NULL REFERENCES Users(id),
    status           NVARCHAR(50)  NOT NULL DEFAULT 'pending',
    shipping_address NVARCHAR(MAX),
    payment_method   NVARCHAR(100),
    subtotal         DECIMAL(18, 2) NOT NULL,
    shipping_fee     DECIMAL(18, 2) NOT NULL DEFAULT 0,
    total            DECIMAL(18, 2) NOT NULL,
    tracking_number  NVARCHAR(100),
    created_at       DATETIME NOT NULL DEFAULT GETDATE()
);
GO

CREATE TABLE OrderItems (
    id           INT IDENTITY(1,1) PRIMARY KEY,
    order_id     NVARCHAR(50)   NOT NULL REFERENCES Orders(id),
    product_id   INT,
    title        NVARCHAR(500)  NOT NULL,
    price        DECIMAL(18, 2) NOT NULL,
    quantity     INT            NOT NULL DEFAULT 1,
    image_url    NVARCHAR(1000),
    planter_name NVARCHAR(255)
);
GO

CREATE TABLE OrderTimeline (
    id         INT IDENTITY(1,1) PRIMARY KEY,
    order_id   NVARCHAR(50)  NOT NULL REFERENCES Orders(id),
    status     NVARCHAR(255) NOT NULL,
    event_date DATETIME      NOT NULL DEFAULT GETDATE(),
    done       BIT           NOT NULL DEFAULT 0
);
GO

-- ── Reviews ────────────────────────────────────────────────────
CREATE TABLE Reviews (
    id         INT IDENTITY(1,1) PRIMARY KEY,
    product_id INT           NOT NULL REFERENCES Products(id),
    user_id    INT           REFERENCES Users(id),
    user_name  NVARCHAR(255) NOT NULL,
    avatar     NVARCHAR(1000),
    rating     INT           NOT NULL CHECK (rating BETWEEN 1 AND 5),
    title      NVARCHAR(500),
    content    NVARCHAR(MAX),
    helpful    INT           NOT NULL DEFAULT 0,
    verified   BIT           NOT NULL DEFAULT 0,
    visible    BIT           NOT NULL DEFAULT 1,
    created_at DATETIME      NOT NULL DEFAULT GETDATE()
);
GO

CREATE TABLE ReviewImages (
    id        INT IDENTITY(1,1) PRIMARY KEY,
    review_id INT            NOT NULL REFERENCES Reviews(id),
    url       NVARCHAR(1000) NOT NULL
);
GO

CREATE TABLE ReviewTags (
    id        INT IDENTITY(1,1) PRIMARY KEY,
    review_id INT           NOT NULL REFERENCES Reviews(id),
    tag       NVARCHAR(255) NOT NULL
);
GO

-- ── Blog ───────────────────────────────────────────────────────
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
