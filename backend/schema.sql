-- PlantWeb Database Schema
-- SQL Server

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

CREATE INDEX IX_UserAddresses_UserId ON UserAddresses(user_id);
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
    in_stock       BIT               NOT NULL DEFAULT 1,
    stock_quantity INT               NOT NULL DEFAULT 0,
    planter_options NVARCHAR(MAX)
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
    accessory_brand NVARCHAR(255),
    accessory_uses  NVARCHAR(MAX),
    price     DECIMAL(18, 2) NOT NULL,
    image_url NVARCHAR(1000),
    in_stock  BIT            NOT NULL DEFAULT 1,
    stock_quantity INT       NOT NULL DEFAULT 0,
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
    title     NVARCHAR(500)  NOT NULL,
    image     NVARCHAR(1000) NOT NULL,
    excerpt   NVARCHAR(MAX)  NOT NULL,
    content   NVARCHAR(MAX)  NOT NULL,
    category  NVARCHAR(255)  NOT NULL,
    read_time NVARCHAR(50),
    tags      NVARCHAR(500),  -- comma-separated
    featured  BIT NOT NULL DEFAULT 0,
    date      DATE           NOT NULL DEFAULT GETDATE()
);
GO

-- ── Vouchers ───────────────────────────────────────────────────
CREATE TABLE Vouchers (
    id              INT IDENTITY(1,1) PRIMARY KEY,
    code            NVARCHAR(50)  NOT NULL UNIQUE,
    name            NVARCHAR(255) NOT NULL,
    description     NVARCHAR(500) NULL,
    discount_type   NVARCHAR(20)  NOT NULL,
    discount_value  DECIMAL(18,2) NOT NULL,
    max_discount    DECIMAL(18,2) NULL,
    min_order_value DECIMAL(18,2) NOT NULL DEFAULT 0,
    usage_limit     INT NULL,
    usage_per_user  INT NOT NULL DEFAULT 1,
    starts_at       DATETIME      NOT NULL,
    expires_at      DATETIME      NOT NULL,
    is_active       BIT           NOT NULL DEFAULT 1,
    applies_to      NVARCHAR(20)  NOT NULL DEFAULT 'all',
    created_at      DATETIME      NOT NULL DEFAULT GETDATE(),
    updated_at      DATETIME      NOT NULL DEFAULT GETDATE()
);
GO

CREATE TABLE VoucherScopes (
    id          INT IDENTITY(1,1) PRIMARY KEY,
    voucher_id  INT NOT NULL REFERENCES Vouchers(id) ON DELETE CASCADE,
    scope_type  NVARCHAR(20) NOT NULL,
    scope_id    INT NOT NULL
);
GO

-- ── Orders ─────────────────────────────────────────────────────
CREATE TABLE Orders (
    id               NVARCHAR(50)  NOT NULL PRIMARY KEY,  -- e.g. PSTT-2026-00001
    user_id          INT           NOT NULL REFERENCES Users(id),
    status           NVARCHAR(50)  NOT NULL DEFAULT 'pending',
    shipping_address NVARCHAR(MAX),
    payment_method   NVARCHAR(100),
    subtotal         DECIMAL(18, 2) NOT NULL,
    shipping_fee     DECIMAL(18, 2) NOT NULL DEFAULT 0,
    discount_amount  DECIMAL(18, 2) NOT NULL DEFAULT 0,
    voucher_id       INT           REFERENCES Vouchers(id),
    voucher_code     NVARCHAR(50),
    total            DECIMAL(18, 2) NOT NULL,
    tracking_number  NVARCHAR(100),
    tracking_provider NVARCHAR(50),
    tracking_url     NVARCHAR(1000),
    shipping_method  NVARCHAR(50),
    recipient_name   NVARCHAR(255),
    recipient_phone  NVARCHAR(50),
    province         NVARCHAR(255),
    district         NVARCHAR(255),
    ward             NVARCHAR(255),
    address_line     NVARCHAR(500),
    internal_note    NVARCHAR(1000),
    weight_grams     INT,
    stock_reserved   BIT      NOT NULL DEFAULT 0,
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
    planter_name NVARCHAR(255),
    item_type    NVARCHAR(20),
    planter_id   INT
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

CREATE TABLE VoucherRedemptions (
    id              INT IDENTITY(1,1) PRIMARY KEY,
    voucher_id      INT NOT NULL REFERENCES Vouchers(id),
    user_id         INT NOT NULL REFERENCES Users(id),
    order_id        NVARCHAR(50) NULL REFERENCES Orders(id),
    discount_amount DECIMAL(18,2) NOT NULL,
    redeemed_at     DATETIME NOT NULL DEFAULT GETDATE()
);
GO

CREATE TABLE UserVoucherClaims (
    id         INT IDENTITY(1,1) PRIMARY KEY,
    user_id    INT NOT NULL REFERENCES Users(id) ON DELETE CASCADE,
    voucher_id INT NOT NULL REFERENCES Vouchers(id) ON DELETE CASCADE,
    claimed_at DATETIME NOT NULL DEFAULT GETDATE(),
    CONSTRAINT UQ_UserVoucherClaims_User_Voucher UNIQUE (user_id, voucher_id)
);
GO

CREATE INDEX IX_UserVoucherClaims_UserId ON UserVoucherClaims(user_id);
GO

CREATE TABLE OrderNumberSequences (
    sequence_year INT      NOT NULL PRIMARY KEY,
    last_value    INT      NOT NULL DEFAULT 0,
    updated_at    DATETIME NOT NULL DEFAULT GETDATE()
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

-- ── Wishlist / Favorites ─────────────────────────────────────
CREATE TABLE UserWishlistItems (
    id         INT IDENTITY(1,1) PRIMARY KEY,
    user_id    INT NOT NULL REFERENCES Users(id),
    product_id INT NOT NULL REFERENCES Products(id),
    created_at DATETIME NOT NULL DEFAULT GETDATE(),
    CONSTRAINT UQ_UserWishlistItems_User_Product UNIQUE (user_id, product_id)
);
GO

CREATE INDEX IX_UserWishlistItems_UserId ON UserWishlistItems(user_id);
GO

-- ── Wholesale Inquiries ─────────────────────────────────────
CREATE TABLE WholesaleInquiries (
    id                 INT IDENTITY(1,1) PRIMARY KEY,
    company_name       NVARCHAR(255)  NOT NULL,
    contact_name       NVARCHAR(255)  NOT NULL,
    phone              NVARCHAR(50)   NOT NULL,
    email              NVARCHAR(255)  NOT NULL,
    estimated_quantity NVARCHAR(100),
    space_type         NVARCHAR(255),
    project_location   NVARCHAR(255),
    budget_range       NVARCHAR(255),
    timeline           NVARCHAR(255),
    note               NVARCHAR(MAX),
    status             NVARCHAR(50)   NOT NULL DEFAULT 'new',
    source             NVARCHAR(100)  NOT NULL DEFAULT 'website_wholesale',
    assigned_to        NVARCHAR(255),
    admin_note         NVARCHAR(MAX),
    created_at         DATETIME       NOT NULL DEFAULT GETDATE(),
    updated_at         DATETIME       NOT NULL DEFAULT GETDATE(),
    contacted_at       DATETIME       NULL,
    closed_at          DATETIME       NULL
);
GO

CREATE INDEX IX_WholesaleInquiries_Status ON WholesaleInquiries(status);
GO

CREATE INDEX IX_WholesaleInquiries_CreatedAt ON WholesaleInquiries(created_at DESC);
GO

-- ── Plant Advisor History ────────────────────────────────────
CREATE TABLE UserPlantAdvisorHistory (
    id                   INT IDENTITY(1,1) PRIMARY KEY,
    user_id              INT            NOT NULL REFERENCES Users(id),
    budget               DECIMAL(18, 2) NOT NULL,
    light_level          NVARCHAR(20)   NOT NULL,
    has_pets             BIT            NOT NULL DEFAULT 0,
    priority             NVARCHAR(50)   NOT NULL,
    custom_prompt        NVARCHAR(280)  NULL,
    summary              NVARCHAR(MAX),
    recommendations_json NVARCHAR(MAX)  NOT NULL,
    created_at           DATETIME       NOT NULL DEFAULT GETDATE()
);
GO

CREATE INDEX IX_UserPlantAdvisorHistory_UserId_CreatedAt
    ON UserPlantAdvisorHistory(user_id, created_at DESC);
GO

-- ── Shop Print Settings (singleton) ───────────────────────────
CREATE TABLE ShopPrintSettings (
    id           INT            NOT NULL PRIMARY KEY DEFAULT 1,
    shop_name    NVARCHAR(255)  NOT NULL,
    shop_phone   NVARCHAR(50)   NOT NULL,
    shop_address NVARCHAR(500)  NOT NULL,
    default_note NVARCHAR(500)  NULL,
    logo_url     NVARCHAR(1000) NULL,
    updated_at   DATETIME       NOT NULL DEFAULT GETDATE(),
    CONSTRAINT CK_ShopPrintSettings_singleton CHECK (id = 1)
);
GO
