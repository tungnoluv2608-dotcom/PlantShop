require("dotenv").config();
const { getPool, sql } = require("./src/libs/db");
const bcrypt = require("bcryptjs");
const { spawnSync } = require("child_process");
const path = require("path");

function ensureMigrations() {
  const migratePath = path.resolve(__dirname, "scripts/migrate.js");
  const result = spawnSync(process.execPath, [migratePath], {
    stdio: "inherit",
    env: process.env,
  });
  if (result.status !== 0) {
    console.error("[seed] Migrations failed. Cannot seed without tables.");
    process.exit(result.status || 1);
  }
}

async function seed() {
  ensureMigrations();

  console.log("[seed] Starting...");
  const pool = await getPool();

  // ── 1. Clear existing data in correct order ─────────────────
  console.log("[seed] Clearing old data...");
  await pool.request().query(`
    DELETE FROM UserWishlistItems;
    IF EXISTS (SELECT 1 FROM sys.tables WHERE name = 'WholesaleInquiries') DELETE FROM WholesaleInquiries;
    DELETE FROM ReviewImages;
    DELETE FROM ReviewTags;
    DELETE FROM Reviews;
    DELETE FROM OrderTimeline;
    DELETE FROM OrderItems;
    DELETE FROM Orders;
    DELETE FROM PlanterSizes;
    DELETE FROM Planters;
    DELETE FROM CareGuides;
    DELETE FROM ProductImages;
    DELETE FROM Products;
    DELETE FROM CategorySubcategories;
    DELETE FROM Categories;
    DELETE FROM UserAddresses;
    DELETE FROM Users;
    DELETE FROM BlogPosts;

    -- Reset Identity counters
    IF EXISTS (SELECT 1 FROM sys.tables WHERE name = 'UserWishlistItems') DBCC CHECKIDENT ('UserWishlistItems', RESEED, 0);
    IF EXISTS (SELECT 1 FROM sys.tables WHERE name = 'WholesaleInquiries') DBCC CHECKIDENT ('WholesaleInquiries', RESEED, 0);
    IF EXISTS (SELECT 1 FROM sys.tables WHERE name = 'ReviewImages') DBCC CHECKIDENT ('ReviewImages', RESEED, 0);
    IF EXISTS (SELECT 1 FROM sys.tables WHERE name = 'ReviewTags') DBCC CHECKIDENT ('ReviewTags', RESEED, 0);
    IF EXISTS (SELECT 1 FROM sys.tables WHERE name = 'Reviews') DBCC CHECKIDENT ('Reviews', RESEED, 0);
    IF EXISTS (SELECT 1 FROM sys.tables WHERE name = 'OrderTimeline') DBCC CHECKIDENT ('OrderTimeline', RESEED, 0);
    IF EXISTS (SELECT 1 FROM sys.tables WHERE name = 'OrderItems') DBCC CHECKIDENT ('OrderItems', RESEED, 0);
    IF EXISTS (SELECT 1 FROM sys.tables WHERE name = 'PlanterSizes') DBCC CHECKIDENT ('PlanterSizes', RESEED, 0);
    IF EXISTS (SELECT 1 FROM sys.tables WHERE name = 'Planters') DBCC CHECKIDENT ('Planters', RESEED, 0);
    IF EXISTS (SELECT 1 FROM sys.tables WHERE name = 'CareGuides') DBCC CHECKIDENT ('CareGuides', RESEED, 0);
    IF EXISTS (SELECT 1 FROM sys.tables WHERE name = 'ProductImages') DBCC CHECKIDENT ('ProductImages', RESEED, 0);
    IF EXISTS (SELECT 1 FROM sys.tables WHERE name = 'Products') DBCC CHECKIDENT ('Products', RESEED, 0);
    IF EXISTS (SELECT 1 FROM sys.tables WHERE name = 'CategorySubcategories') DBCC CHECKIDENT ('CategorySubcategories', RESEED, 0);
    IF EXISTS (SELECT 1 FROM sys.tables WHERE name = 'Categories') DBCC CHECKIDENT ('Categories', RESEED, 0);
    IF EXISTS (SELECT 1 FROM sys.tables WHERE name = 'UserAddresses') DBCC CHECKIDENT ('UserAddresses', RESEED, 0);
    IF EXISTS (SELECT 1 FROM sys.tables WHERE name = 'Users') DBCC CHECKIDENT ('Users', RESEED, 0);
    IF EXISTS (SELECT 1 FROM sys.tables WHERE name = 'BlogPosts') DBCC CHECKIDENT ('BlogPosts', RESEED, 0);
  `);
  console.log("[seed] Database cleared");

  // ── 2. Create users ──────────────────────────────────────────
  const passwordHash = await bcrypt.hash("123456", 10);

  const adminResult = await pool.request()
    .input("name", sql.NVarChar, "Thanh Tùng Admin")
    .input("email", sql.NVarChar, "thanhtung@admin.com")
    .input("hash", sql.NVarChar, passwordHash)
    .query("INSERT INTO Users (name, email, password_hash, role) OUTPUT INSERTED.id VALUES (@name, @email, @hash, 'admin')");
  const adminId = adminResult.recordset[0].id;

  const userResult = await pool.request()
    .input("name", sql.NVarChar, "Thanh Tùng Customer")
    .input("email", sql.NVarChar, "thanhtung@user.com")
    .input("hash", sql.NVarChar, passwordHash)
    .query("INSERT INTO Users (name, email, password_hash, role) OUTPUT INSERTED.id VALUES (@name, @email, @hash, 'customer')");
  const userId = userResult.recordset[0].id;

  console.log("[seed] Users created (thanhtung@admin.com & thanhtung@user.com)");

  // ── 3. Categories ───────────────────────────────────────────
  const categories = [
    {
      name: "Cây trong nhà",
      image: "https://images.unsplash.com/photo-1545167622-3a6ac756afa4?q=80&w=600&auto=format&fit=crop",
      subs: ["Cây lọc không khí", "Cây phong thủy", "Cây để bàn"]
    },
    {
      name: "Sen đá",
      image: "https://images.unsplash.com/photo-1519068261745-b3f8ecd6b8d9?q=80&w=600&auto=format&fit=crop",
      subs: ["Sen đá mini", "Sen đá nhập khẩu", "Sen đá cổ thụ"]
    },
    {
      name: "Xương rồng",
      image: "https://images.unsplash.com/photo-1498408040764-ab6eb772a145?q=80&w=600&auto=format&fit=crop",
      subs: ["Xương rồng mini", "Xương rồng hoa", "Xương rồng kiểng"]
    },
    {
      name: "Cây leo",
      image: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=600&auto=format&fit=crop",
      subs: ["Trầu bà leo", "Cẩm cù dây", "Cây leo ban công"]
    },
    {
      name: "Bonsai",
      image: "https://images.unsplash.com/photo-1512428559087-560fa5ceab42?q=80&w=600&auto=format&fit=crop",
      subs: ["Bonsai mini", "Bonsai nghệ thuật", "Tùng cảnh"]
    },
    {
      name: "Hạt giống",
      image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?q=80&w=600&auto=format&fit=crop",
      subs: ["Hạt giống hoa", "Hạt giống rau", "Hạt giống quả"]
    },
    {
      name: "Quà tặng",
      image: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=600&auto=format&fit=crop",
      subs: ["Bình Terrarium", "Set quà sinh nhật", "Tiểu cảnh mini"]
    }
  ];

  const catIds = {};
  for (const cat of categories) {
    const r = await pool.request()
      .input("name", sql.NVarChar, cat.name)
      .input("image", sql.NVarChar, cat.image)
      .query("INSERT INTO Categories (name, image) OUTPUT INSERTED.id VALUES (@name, @image)");
    const catId = r.recordset[0].id;
    catIds[cat.name] = catId;

    for (const sub of cat.subs) {
      await pool.request()
        .input("catId", sql.Int, catId)
        .input("sub", sql.NVarChar, sub)
        .query("INSERT INTO CategorySubcategories (category_id, name) VALUES (@catId, @sub)");
    }
  }
  console.log("[seed] Categories seeded");

  // ── 4. Products (> 50 items) ───────────────────────────────
  const products = [
    // ── Cây trong nhà (15 products) ──
    {
      title: "Cây Bàng Singapore dáng cột", price: 350000, originalPrice: 450000, discount: "22%",
      description: "Cây Bàng Singapore sở hữu những chiếc lá to tròn, xanh bóng sang trọng. Cây thích hợp để góc phòng khách, văn phòng, mang lại năng lượng tích cực và sự bình an.",
      imageUrl: "https://images.unsplash.com/photo-1584444262846-e2716db1294b?q=80&w=600&auto=format&fit=crop",
      category: "Cây trong nhà", inStock: true,
      bio: "Ficus Lyrata - Có nguồn gốc từ Tây Phi, ưa ánh sáng gián tiếp.",
      images: [
        "https://images.unsplash.com/photo-1584444262846-e2716db1294b?q=80&w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1525498128493-380d1990a112?q=80&w=800&auto=format&fit=crop"
      ],
      careGuide: [
        { title: "Ánh sáng", content: "Đặt gần cửa sổ, tránh ánh nắng gay gắt trực tiếp giữa trưa." },
        { title: "Tưới nước", content: "Tưới 1-2 lần/tuần, chỉ tưới khi lớp đất mặt đã khô hoàn toàn." }
      ]
    },
    {
      title: "Cây Kim Tiền lộc phát", price: 180000, originalPrice: 220000, discount: "18%",
      description: "Cây Kim Tiền (Kim Phát Tài) nổi bật với những nhánh lá xanh thẫm, cứng cáp mọc vươn thẳng. Biểu tượng của tài lộc và sự thịnh vượng.",
      imageUrl: "https://images.unsplash.com/photo-1632203171982-cc0df6e9ceb4?q=80&w=600&auto=format&fit=crop",
      category: "Cây trong nhà", inStock: true,
      bio: "Zamioculcas Zamiifolia - Cây bản địa của Đông Phi, cực kỳ chịu hạn tốt.",
      images: [
        "https://images.unsplash.com/photo-1632203171982-cc0df6e9ceb4?q=80&w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?q=80&w=800&auto=format&fit=crop"
      ],
      careGuide: [
        { title: "Ánh sáng", content: "Sống tốt trong phòng thiếu ánh sáng hoặc môi trường đèn văn phòng." },
        { title: "Tưới nước", content: "Tưới rất ít, 7-10 ngày mới cần tưới một lần." }
      ]
    },
    {
      title: "Cây Lưỡi Hổ Thái viền vàng", price: 120000, originalPrice: 150000, discount: "20%",
      description: "Lưỡi Hổ Thái nhỏ gọn thích hợp để bàn hoặc góc phòng. Khả năng thanh lọc không khí cực mạnh, đặc biệt là hấp thụ các chất độc hại vào ban đêm.",
      imageUrl: "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?q=80&w=600&auto=format&fit=crop",
      category: "Cây trong nhà", inStock: true,
      bio: "Sansevieria Laurentii - Cây phong thủy mang tính trừ tà, đem lại bình an.",
      images: ["https://images.unsplash.com/photo-1599599810769-bcde5a160d32?q=80&w=800&auto=format&fit=crop"],
      careGuide: [
        { title: "Ánh sáng", content: "Thích nghi tốt từ bóng râm đến nắng nhẹ." },
        { title: "Tưới nước", content: "Chỉ tưới khi đất khô hẳn, khoảng 10-15 ngày/lần." }
      ]
    },
    {
      title: "Cây Lan Ý Mỹ lọc khí tốt", price: 150000, originalPrice: 190000, discount: "21%",
      description: "Cây Lan Ý mang vẻ đẹp tao nhã với những bông hoa màu trắng muốt như cánh buồm. Cây có khả năng hấp thụ các khí độc hại như formaldehyde, trichloroethylene.",
      imageUrl: "https://images.unsplash.com/photo-1593696140826-c58b021acf8b?q=80&w=600&auto=format&fit=crop",
      category: "Cây trong nhà", inStock: true,
      bio: "Spathiphyllum Wallisii - Xuất xứ từ vùng nhiệt đới châu Mỹ và Đông Nam Á.",
      images: ["https://images.unsplash.com/photo-1593696140826-c58b021acf8b?q=80&w=800&auto=format&fit=crop"],
      careGuide: [
        { title: "Ánh sáng", content: "Ưa bóng râm hoặc ánh sáng nhẹ gián tiếp." },
        { title: "Tưới nước", content: "Tưới 2-3 lần/tuần, giữ đất ẩm nhẹ nhưng không ngập úng." }
      ]
    },
    {
      title: "Cây Trầu Bà Đế Vương Đỏ", price: 260000, originalPrice: 320000, discount: "18%",
      description: "Trầu Bà Đế Vương Đỏ nổi bật với lá to bản màu đỏ sẫm quý phái. Cây thể hiện quyền lực, tinh thần vươn lên và mang lại may mắn cho người mệnh Hỏa, Thổ.",
      imageUrl: "https://images.unsplash.com/photo-1525498128493-380d1990a112?q=80&w=600&auto=format&fit=crop",
      category: "Cây trong nhà", inStock: true,
      bio: "Philodendron Erubescens - Dòng trầu bà cao cấp thích hợp trang trí nội thất.",
      images: ["https://images.unsplash.com/photo-1525498128493-380d1990a112?q=80&w=800&auto=format&fit=crop"],
      careGuide: [
        { title: "Ánh sáng", content: "Ưa mát mẻ, tránh ánh nắng trực tiếp chiếu vào lá gây cháy lá." },
        { title: "Tưới nước", content: "Tưới nước 1-2 lần/tuần." }
      ]
    },
    {
      title: "Cây Vạn Lộc Đỏ may mắn", price: 135000, originalPrice: 170000, discount: "20%",
      description: "Lá cây có sắc đỏ rực rỡ xen kẽ đốm xanh vô cùng độc đáo. Vạn Lộc mang ý nghĩa đem lại tiền tài, sự thịnh vượng và may mắn ngập tràn.",
      imageUrl: "https://images.unsplash.com/photo-1545167622-3a6ac756afa4?q=80&w=600&auto=format&fit=crop",
      category: "Cây trong nhà", inStock: true,
      bio: "Aglaonema Rotundum - Cây phong thủy để bàn làm việc rất được ưa chuộng.",
      images: ["https://images.unsplash.com/photo-1545167622-3a6ac756afa4?q=80&w=800&auto=format&fit=crop"],
      careGuide: [
        { title: "Ánh sáng", content: "Cần ánh sáng gián tiếp nhẹ để duy trì sắc đỏ tươi tắn của lá." },
        { title: "Tưới nước", content: "Tưới khoảng 2 lần mỗi tuần." }
      ]
    },
    {
      title: "Cây Đa Búp Đỏ Cẩm Thạch", price: 240000, originalPrice: 300000, discount: "20%",
      description: "Những chiếc lá dày tròn với họa tiết cẩm thạch độc nhất vô nhị. Cây lọc không khí cực tốt và giúp không gian làm việc thêm hiện đại.",
      imageUrl: "https://images.unsplash.com/photo-1592150621744-aca64f48394a?q=80&w=600&auto=format&fit=crop",
      category: "Cây trong nhà", inStock: true,
      bio: "Ficus Elastica Variegata - Dòng đa búp đỏ đột biến vân cẩm thạch tuyệt đẹp.",
      images: ["https://images.unsplash.com/photo-1592150621744-aca64f48394a?q=80&w=800&auto=format&fit=crop"],
      careGuide: [
        { title: "Ánh sáng", content: "Ánh sáng tán xạ mạnh để vân lá rõ và sáng màu." },
        { title: "Tưới nước", content: "Tưới nước 1 lần/tuần." }
      ]
    },
    {
      title: "Cây Hạnh Phúc dáng cao", price: 450000, originalPrice: 550000, discount: "18%",
      description: "Cây Hạnh Phúc mang tán lá xanh mướt xếp thành chùm sum suê. Đúng như tên gọi, cây biểu tượng cho hạnh phúc gia đình, sự gắn kết yêu thương.",
      imageUrl: "https://images.unsplash.com/photo-1509937528035-ad76254b0356?q=80&w=600&auto=format&fit=crop",
      category: "Cây trong nhà", inStock: true,
      bio: "Radermachera Sinica - Xuất xứ từ vùng cận nhiệt đới Trung Quốc và Đài Loan.",
      images: ["https://images.unsplash.com/photo-1509937528035-ad76254b0356?q=80&w=800&auto=format&fit=crop"],
      careGuide: [
        { title: "Ánh sáng", content: "Đặt ở phòng khách hoặc hiên nhà thoáng đãng, nhiều sáng nhẹ." },
        { title: "Tưới nước", content: "Tưới 2 lần/tuần, tránh để cây úng rễ." }
      ]
    },
    {
      title: "Cây Ngũ Gia Bì Xanh lọc sóng điện từ", price: 190000, originalPrice: 240000, discount: "20%",
      description: "Lá cây mọc thành chùm 5-7 lá như bàn tay xòe rộng. Cây có tác dụng đuổi muỗi tự nhiên và giúp không gian thông thoáng hơn.",
      imageUrl: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?q=80&w=600&auto=format&fit=crop",
      category: "Cây trong nhà", inStock: true,
      bio: "Schefflera Heptaphylla - Cây thảo dược thiên nhiên có lợi cho sức khỏe.",
      images: ["https://images.unsplash.com/photo-1485955900006-10f4d324d411?q=80&w=800&auto=format&fit=crop"],
      careGuide: [
        { title: "Ánh sáng", content: "Ánh sáng nhẹ bán phần, thích hợp trồng trong bóng râm." },
        { title: "Tưới nước", content: "Tưới 1-2 lần/tuần." }
      ]
    },
    {
      title: "Cây Trầu Bà Thanh Xuân độc đáo", price: 320000, originalPrice: 400000, discount: "20%",
      description: "Sở hữu những chiếc lá xẻ sâu hình răng cưa vô cùng hoang dã. Phù hợp cho những căn hộ phong cách tối giản, Scandinavian hay quán cà phê mộc mạc.",
      imageUrl: "https://images.unsplash.com/photo-1584444262846-e2716db1294b?q=80&w=600&auto=format&fit=crop",
      category: "Cây trong nhà", inStock: true,
      bio: "Philodendron Selloum - Dòng kiểng lá nhiệt đới sang trọng, lá xẻ sâu.",
      images: ["https://images.unsplash.com/photo-1584444262846-e2716db1294b?q=80&w=800&auto=format&fit=crop"],
      careGuide: [
        { title: "Ánh sáng", content: "Chịu bóng tốt, tránh ánh nắng trực tiếp chiếu vào." },
        { title: "Tưới nước", content: "Tưới nước 2 lần/tuần, thích hợp phun sương giữ ẩm cho lá." }
      ]
    },
    {
      title: "Cây Trường Sinh Xanh bền bỉ", price: 95000, originalPrice: 120000, discount: "20%",
      description: "Cây Trường Sinh có lá tròn dày mọng nước màu xanh lục bảo cực kỳ khỏe mạnh. Cây tượng trưng cho sự trường tồn, sức khỏe dồi dào.",
      imageUrl: "https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?q=80&w=600&auto=format&fit=crop",
      category: "Cây trong nhà", inStock: true,
      bio: "Peperomia Obtusifolia - Cây nhỏ gọn để bàn làm việc rất bền bỉ.",
      images: ["https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?q=80&w=800&auto=format&fit=crop"],
      careGuide: [
        { title: "Ánh sáng", content: "Ánh sáng gián tiếp nhẹ." },
        { title: "Tưới nước", content: "Chỉ tưới khi đất khô hoàn toàn (khoảng 1 lần/tuần)." }
      ]
    },
    {
      title: "Cây Cau Tiểu Trâm để bàn", price: 85000, originalPrice: 110000, discount: "22%",
      description: "Vẻ đẹp nhỏ nhắn như một rừng cau mini trên bàn làm việc của bạn. Cau Tiểu Trâm giúp tăng độ ẩm phòng lạnh và hút các tia bức xạ có hại.",
      imageUrl: "https://images.unsplash.com/photo-1512428813834-c702c7702b78?q=80&w=600&auto=format&fit=crop",
      category: "Cây trong nhà", inStock: true,
      bio: "Chamaedorea Elegans - Họ cau dừa, có khả năng lọc không khí vượt trội.",
      images: ["https://images.unsplash.com/photo-1512428813834-c702c7702b78?q=80&w=800&auto=format&fit=crop"],
      careGuide: [
        { title: "Ánh sáng", content: "Chịu bóng tốt, ưa môi trường văn phòng máy lạnh." },
        { title: "Tưới nước", content: "Tưới nhẹ nhàng giữ ẩm cho đất 2 lần/tuần." }
      ]
    },
    {
      title: "Cây Thiết Mộc Lan gốc to", price: 550000, originalPrice: 700000, discount: "21%",
      description: "Cây Phát Tài (Thiết Mộc Lan) ghép từ các thân gỗ khỏe mạnh mọc chồi non mơn mởn. Cây thường được chọn đặt ở đại sảnh công ty hoặc khai trương.",
      imageUrl: "https://images.unsplash.com/photo-1525498128493-380d1990a112?q=80&w=600&auto=format&fit=crop",
      category: "Cây trong nhà", inStock: true,
      bio: "Dracaena Fragrans - Mang lại vượng khí dồi dào và thịnh vượng.",
      images: ["https://images.unsplash.com/photo-1525498128493-380d1990a112?q=80&w=800&auto=format&fit=crop"],
      careGuide: [
        { title: "Ánh sáng", content: "Đặt nơi có ánh sáng tự nhiên đầy đủ." },
        { title: "Tưới nước", content: "Tưới 1 lần/tuần quanh gốc cây." }
      ]
    },
    {
      title: "Cây Trầu Bà Thanh Xuân Mini", price: 160000, originalPrice: 200000, discount: "20%",
      description: "Phiên bản trầu bà thanh xuân để bàn cực đáng yêu. Lá xanh quanh năm, dễ chăm sóc phù hợp bàn học hoặc bàn làm việc.",
      imageUrl: "https://images.unsplash.com/photo-1584444262846-e2716db1294b?q=80&w=600&auto=format&fit=crop",
      category: "Cây trong nhà", inStock: true,
      bio: "Philodendron Selloum Dwarf - Dòng lùn dễ thương của trầu bà thanh xuân.",
      images: ["https://images.unsplash.com/photo-1584444262846-e2716db1294b?q=80&w=800&auto=format&fit=crop"],
      careGuide: [
        { title: "Ánh sáng", content: "Ánh sáng văn phòng, tránh ánh nắng chiếu trực tiếp." },
        { title: "Tưới nước", content: "Tưới nước 1-2 lần/tuần." }
      ]
    },
    {
      title: "Cây Bàng Singapore Mini để bàn", price: 175000, originalPrice: 220000, discount: "20%",
      description: "Cây bàng Singapore cỡ nhỏ được ươm dưỡng tỉ mỉ trong chậu sứ trắng nhỏ gọn, mang lại không gian xanh nhỏ xinh cho căn phòng của bạn.",
      imageUrl: "https://images.unsplash.com/photo-1584444262846-e2716db1294b?q=80&w=600&auto=format&fit=crop",
      category: "Cây trong nhà", inStock: true,
      bio: "Ficus Lyrata Bambino - Dòng bàng Singapore mini độc đáo.",
      images: ["https://images.unsplash.com/photo-1584444262846-e2716db1294b?q=80&w=800&auto=format&fit=crop"],
      careGuide: [
        { title: "Ánh sáng", content: "Nơi có ánh sáng khuếch tán từ cửa sổ." },
        { title: "Tưới nước", content: "Tưới nước vừa phải, khoảng 1 lần mỗi tuần." }
      ]
    },

    // ── Sen đá (10 products) ──
    {
      title: "Sen Đá Bắp Cải Tím Echeveria", price: 85000, originalPrice: 110000, discount: "22%",
      description: "Sở hữu những chiếc lá to bản xoăn nhẹ ở viền tựa như bắp cải xanh mộc mạc. Màu sắc chuyển dần sang tím hồng vô cùng cuốn hút dưới nắng.",
      imageUrl: "https://images.unsplash.com/photo-1512428559087-560fa5ceab42?q=80&w=600&auto=format&fit=crop",
      category: "Sen đá", inStock: true,
      bio: "Echeveria Runyonii - Dòng sen đá cánh lớn xinh xắn thích nắng.",
      images: ["https://images.unsplash.com/photo-1512428559087-560fa5ceab42?q=80&w=800&auto=format&fit=crop"],
      careGuide: [
        { title: "Ánh sáng", content: "Cần tối thiểu 4-5 tiếng nắng trực tiếp mỗi ngày." },
        { title: "Tưới nước", content: "Tưới đẫm quanh gốc khi đất khô hoàn toàn (3-5 ngày/lần)." }
      ]
    },
    {
      title: "Sen Đá Kim Cương xanh ngọc", price: 150000, originalPrice: 190000, discount: "21%",
      description: "Được mệnh danh là nữ hoàng sen đá nhờ phần đầu lá trong suốt lấp lánh như viên ngọc dưới ánh sáng. Mang giá trị sưu tầm cao.",
      imageUrl: "https://images.unsplash.com/photo-1512428813834-c702c7702b78?q=80&w=600&auto=format&fit=crop",
      category: "Sen đá", inStock: true,
      bio: "Haworthia Cooperi - Có nguồn gốc Nam Phi, ưa mát mẻ bóng râm nhẹ.",
      images: ["https://images.unsplash.com/photo-1512428813834-c702c7702b78?q=80&w=800&auto=format&fit=crop"],
      careGuide: [
        { title: "Ánh sáng", content: "Ánh sáng gián tiếp nhẹ, không để nắng gắt buổi trưa chiếu thẳng." },
        { title: "Tưới nước", content: "Tưới khi đất khô, 1 lần/tuần." }
      ]
    },
    {
      title: "Sen Đá Phật Bà viền đỏ", price: 65000, originalPrice: 85000, discount: "23%",
      description: "Các lớp lá xếp tầng khít nhau như đóa sen của Phật Bà Quan Âm. Mang ý nghĩa bình an, may mắn và che chở.",
      imageUrl: "https://images.unsplash.com/photo-1517059224940-d4af9eec41b7?q=80&w=600&auto=format&fit=crop",
      category: "Sen đá", inStock: true,
      bio: "Sempervivum Calcareum - Khả năng sinh sản cây con mạnh mẽ xung quanh gốc.",
      images: ["https://images.unsplash.com/photo-1517059224940-d4af9eec41b7?q=80&w=800&auto=format&fit=crop"],
      careGuide: [
        { title: "Ánh sáng", content: "Nắng nhẹ mát mẻ buổi sáng." },
        { title: "Tưới nước", content: "Tưới quanh mép chậu khi đất khô ráo." }
      ]
    },
    {
      title: "Sen Đá Nâu Black Prince", price: 50000, originalPrice: 65000, discount: "23%",
      description: "Có màu sắc tối sẫm đặc biệt như socola. Sen đá nâu thích nắng nhiều, nắng càng mạnh thì màu lá càng thẫm đẹp.",
      imageUrl: "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=600&auto=format&fit=crop",
      category: "Sen đá", inStock: true,
      bio: "Echeveria Black Prince - Cây sen đá cổ điển, sức sống mãnh liệt.",
      images: ["https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=800&auto=format&fit=crop"],
      careGuide: [
        { title: "Ánh sáng", content: "Ưa nắng nhiều, thoáng gió." },
        { title: "Tưới nước", content: "Tưới nước 1 lần/tuần." }
      ]
    },
    {
      title: "Sen Đá Dù viền hồng xinh xắn", price: 75000, originalPrice: 95000, discount: "21%",
      description: "Lá mọc thành cụm nhỏ xinh như chiếc dù nhỏ li ti xếp chồng lên nhau. Thích hợp làm quà tặng nhỏ xinh để bàn học.",
      imageUrl: "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?q=80&w=600&auto=format&fit=crop",
      category: "Sen đá", inStock: true,
      bio: "Echeveria Prolifica - Dòng sen đá mini đẻ nhánh cực nhanh.",
      images: ["https://images.unsplash.com/photo-1464965911861-746a04b4bca6?q=80&w=800&auto=format&fit=crop"],
      careGuide: [
        { title: "Ánh sáng", content: "Cần nắng sáng 4-5 tiếng để viền lá có màu hồng đào." },
        { title: "Tưới nước", content: "Tưới nước khi bầu đất khô hoàn toàn." }
      ]
    },
    {
      title: "Sen Đá Thạch Ngọc hạt đỏ", price: 80000, originalPrice: 100000, discount: "20%",
      description: "Những chiếc lá mập mạp tròn như những hạt thạch ngọc, đầu lá sẽ chuyển sang đỏ mọng lấp lánh khi hấp thụ đủ ánh sáng mặt trời.",
      imageUrl: "https://images.unsplash.com/photo-1502082553048-f009c37129b9?q=80&w=600&auto=format&fit=crop",
      category: "Sen đá", inStock: true,
      bio: "Sedum Rubrotinctum - Được gọi là Jelly Bean Plant cực dễ thương.",
      images: ["https://images.unsplash.com/photo-1502082553048-f009c37129b9?q=80&w=800&auto=format&fit=crop"],
      careGuide: [
        { title: "Ánh sáng", content: "Rất ưa nắng, chịu hạn tốt." },
        { title: "Tưới nước", content: "Hạn chế tưới, chỉ tưới 1 lần/tuần." }
      ]
    },
    {
      title: "Sen Đá Chuỗi Ngọc treo rủ", price: 110000, originalPrice: 140000, discount: "21%",
      description: "Thích hợp làm chậu treo trang trí ban công. Các nhánh lá mọng nước xanh mát xếp tầng rủ xuống trông tựa những chuỗi ngọc xanh mướt.",
      imageUrl: "https://images.unsplash.com/photo-1509937528035-ad76254b0356?q=80&w=600&auto=format&fit=crop",
      category: "Sen đá", inStock: true,
      bio: "Sedum Morganianum - Dòng chậu treo rủ độc đáo từ Mexico.",
      images: ["https://images.unsplash.com/photo-1509937528035-ad76254b0356?q=80&w=800&auto=format&fit=crop"],
      careGuide: [
        { title: "Ánh sáng", content: "Nơi có ánh sáng mạnh nhưng không quá gắt." },
        { title: "Tưới nước", content: "Tránh tưới trực tiếp lên lá, tưới gốc nhẹ nhàng." }
      ]
    },
    {
      title: "Sen Đá Đô La Hồng cẩm thạch", price: 90000, originalPrice: 115000, discount: "21%",
      description: "Lá nhỏ màu xanh xám có viền trắng hồng, mọc trên thân màu đỏ tía rực rỡ tựa như những đồng tiền đô la mang lại may mắn tài lộc.",
      imageUrl: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?q=80&w=600&auto=format&fit=crop",
      category: "Sen đá", inStock: true,
      bio: "Portulacaria Afra Variegata - Dòng sen đá bụi thân gỗ bonsai.",
      images: ["https://images.unsplash.com/photo-1485955900006-10f4d324d411?q=80&w=800&auto=format&fit=crop"],
      careGuide: [
        { title: "Ánh sáng", content: "Ánh sáng ban mai nhẹ nhàng." },
        { title: "Tưới nước", content: "Tưới khoảng 1-2 lần/tuần." }
      ]
    },
    {
      title: "Sen Đá Móng Rồng sọc trắng", price: 55000, originalPrice: 70000, discount: "21%",
      description: "Lá thon dài cứng cáp nổi bật với các sọc vân ngang màu trắng tựa như những chiếc móng rồng uy nghiêm bảo vệ gia chủ khỏi điềm xấu.",
      imageUrl: "https://images.unsplash.com/photo-1536882240095-0379873feb4e?q=80&w=600&auto=format&fit=crop",
      category: "Sen đá", inStock: true,
      bio: "Haworthia Attenuata - Loài cực kỳ bền bỉ và dễ chăm sóc nhất.",
      images: ["https://images.unsplash.com/photo-1536882240095-0379873feb4e?q=80&w=800&auto=format&fit=crop"],
      careGuide: [
        { title: "Ánh sáng", content: "Chịu bóng tốt, có thể để trên bàn làm việc trong phòng máy lạnh." },
        { title: "Tưới nước", content: "7-10 ngày tưới nước 1 lần." }
      ]
    },
    {
      title: "Sen Đá Viền Lửa đỏ cam", price: 95000, originalPrice: 120000, discount: "20%",
      description: "Lá dày thon nhọn có sắc xanh nõn và viền đỏ cam cháy rực rỡ như những ngọn lửa ấm áp, tạo nét cá tính mạnh mẽ cho khu vườn nhỏ.",
      imageUrl: "https://images.unsplash.com/photo-1463936575829-25148e1db1b8?q=80&w=600&auto=format&fit=crop",
      category: "Sen đá", inStock: true,
      bio: "Echeveria Agavoides - Dòng sen đá chịu nhiệt khá tốt thích nắng ấm.",
      images: ["https://images.unsplash.com/photo-1463936575829-25148e1db1b8?q=80&w=800&auto=format&fit=crop"],
      careGuide: [
        { title: "Ánh sáng", content: "Thích ánh nắng đầy đủ để giữ viền lửa đỏ." },
        { title: "Tưới nước", content: "Tưới nhẹ nước quanh mép đất." }
      ]
    },

    // ── Xương rồng (8 products) ──
    {
      title: "Xương Rồng Bánh Sinh Nhật hoa hồng", price: 110000, originalPrice: 140000, discount: "21%",
      description: "Hình dáng tròn trịa bao phủ bởi lớp lông trắng mịn màng như bông tuyết. Khi nở hoa sẽ có màu hồng ngọc xinh xắn tựa chiếc bánh sinh nhật ngọt ngào.",
      imageUrl: "https://images.unsplash.com/photo-1498408040764-ab6eb772a145?q=80&w=600&auto=format&fit=crop",
      category: "Xương rồng", inStock: true,
      bio: "Mammillaria Bocasana - Xương rồng có lông mịn phủ quanh thân.",
      images: ["https://images.unsplash.com/photo-1498408040764-ab6eb772a145?q=80&w=800&auto=format&fit=crop"],
      careGuide: [
        { title: "Ánh sáng", content: "Cần nắng sáng 4-5 tiếng, thoáng khí để tránh thối thân." },
        { title: "Tưới nước", content: "Hạn chế tưới nước trực tiếp lên lông trắng, chỉ tưới gốc 7 ngày/lần." }
      ]
    },
    {
      title: "Xương Rồng Tai Thỏ gai vàng", price: 60000, originalPrice: 75000, discount: "20%",
      description: "Thân dẹt phẳng mọc nhánh kép giống đôi tai chú thỏ ngộ nghĩnh. Dòng xương rồng dễ trồng, dễ trang trí tiểu cảnh bàn học.",
      imageUrl: "https://images.unsplash.com/photo-1497250681960-ef046c08a56e?q=80&w=600&auto=format&fit=crop",
      category: "Xương rồng", inStock: true,
      bio: "Opuntia Microdasys - Nguồn gốc từ vùng hoang mạc Mexico.",
      images: ["https://images.unsplash.com/photo-1497250681960-ef046c08a56e?q=80&w=800&auto=format&fit=crop"],
      careGuide: [
        { title: "Ánh sáng", content: "Thích ánh nắng mặt trời trực tiếp và thông thoáng tốt." },
        { title: "Tưới nước", content: "Tưới 1 lần/tuần khi thấy đất đã khô cằn hoàn toàn." }
      ]
    },
    {
      title: "Xương Rồng Kim Hổ gai vàng óng", price: 450000, originalPrice: 550000, discount: "18%",
      description: "Dòng xương rồng kích thước lớn có gai màu vàng rực như bờm sư tử. Thể hiện sự kiên cường vượt qua thử thách, thích hợp để ban công hướng nắng.",
      imageUrl: "https://images.unsplash.com/photo-1519331379826-f10be5486c6f?q=80&w=600&auto=format&fit=crop",
      category: "Xương rồng", inStock: true,
      bio: "Echinocactus Grusonii - Loại xương rồng hình cầu uy phong nổi tiếng.",
      images: ["https://images.unsplash.com/photo-1519331379826-f10be5486c6f?q=80&w=800&auto=format&fit=crop"],
      careGuide: [
        { title: "Ánh sáng", content: "Thích nắng gắt toàn phần để nuôi gai vàng sắc nhọn." },
        { title: "Tưới nước", content: "Tưới đẫm rồi để khô ráo hẳn trước khi tưới tiếp (7-10 ngày/lần)." }
      ]
    },
    {
      title: "Xương Rồng Thanh Sơn dáng núi", price: 70000, originalPrice: 90000, discount: "22%",
      description: "Thân cây phân nhiều nhánh dọc vươn cao như dãy núi trùng điệp xanh mướt đầy sức sống nghệ thuật.",
      imageUrl: "https://images.unsplash.com/photo-1517059224940-d4af9eec41b7?q=80&w=600&auto=format&fit=crop",
      category: "Xương rồng", inStock: true,
      bio: "Cereus Tetragonus - Dòng xương rồng kiểng núi ấn tượng.",
      images: ["https://images.unsplash.com/photo-1517059224940-d4af9eec41b7?q=80&w=800&auto=format&fit=crop"],
      careGuide: [
        { title: "Ánh sáng", content: "Nơi nhiều sáng tự nhiên, thích hợp để bên bậu cửa." },
        { title: "Tưới nước", content: "Tưới nước 1 lần/tuần." }
      ]
    },
    {
      title: "Xương Rồng Trứng Chim trắng xóa", price: 50000, originalPrice: 65000, discount: "23%",
      description: "Các cụm nhỏ tròn trịa phủ đầy gai nhỏ trắng mọc xen kẽ đẻ nhánh tựa như những quả trứng chim tí hon xếp sát vào nhau.",
      imageUrl: "https://images.unsplash.com/photo-1536882240095-0379873feb4e?q=80&w=600&auto=format&fit=crop",
      category: "Xương rồng", inStock: true,
      bio: "Mammillaria Gracilis - Dòng xương rồng nhỏ tạo bụi mini.",
      images: ["https://images.unsplash.com/photo-1536882240095-0379873feb4e?q=80&w=800&auto=format&fit=crop"],
      careGuide: [
        { title: "Ánh sáng", content: "Nắng trực tiếp 3-4 giờ hàng ngày." },
        { title: "Tưới nước", content: "Chỉ tưới khi thấy đất chậu khô cằn hoàn toàn." }
      ]
    },
    {
      title: "Xương Rồng Peru Thân Trụ đứng", price: 280000, originalPrice: 350000, discount: "20%",
      description: "Thân cột đơn thẳng tắp với các khía sâu sắc sảo màu xanh lam bạc cổ điển. Mang lại vẻ đẹp hoang dã Địa Trung Hải cho không gian hiện đại.",
      imageUrl: "https://images.unsplash.com/photo-1497250681960-ef046c08a56e?q=80&w=600&auto=format&fit=crop",
      category: "Xương rồng", inStock: true,
      bio: "Cereus Repandus - Thích hợp phối tiểu cảnh sa mạc trong chậu gốm lớn.",
      images: ["https://images.unsplash.com/photo-1497250681960-ef046c08a56e?q=80&w=800&auto=format&fit=crop"],
      careGuide: [
        { title: "Ánh sáng", content: "Thích nắng nóng đầy đủ." },
        { title: "Tưới nước", content: "1-2 tuần tưới 1 lần." }
      ]
    },
    {
      title: "Xương Rồng Bát Tiên hoa đỏ đón lộc", price: 130000, originalPrice: 160000, discount: "18%",
      description: "Thân cây gai góc nhưng nở ra những chùm hoa đỏ hồng rực rỡ lâu tàn mang ý nghĩa phú quý cát tường, điềm lành cho gia chủ.",
      imageUrl: "https://images.unsplash.com/photo-1632203171982-cc0df6e9ceb4?q=80&w=600&auto=format&fit=crop",
      category: "Xương rồng", inStock: true,
      bio: "Euphorbia Milii - Dòng cây ưa nắng ấm hoa nở quanh năm.",
      images: ["https://images.unsplash.com/photo-1632203171982-cc0df6e9ceb4?q=80&w=800&auto=format&fit=crop"],
      careGuide: [
        { title: "Ánh sáng", content: "Thích ánh nắng cả ngày ngoài trời." },
        { title: "Tưới nước", content: "Tưới khi đất khô ráo, tránh tưới đọng ngập úng." }
      ]
    },
    {
      title: "Xương Rồng Astro không gai độc đáo", price: 180000, originalPrice: 220000, discount: "18%",
      description: "Có hình ngôi sao hoặc bánh ú dẹt xinh xắn đặc biệt hoàn toàn không có gai nhọn nguy hiểm, thay vào đó là các chấm trắng tinh tế phủ dọc múi cây.",
      imageUrl: "https://images.unsplash.com/photo-1519331379826-f10be5486c6f?q=80&w=600&auto=format&fit=crop",
      category: "Xương rồng", inStock: true,
      bio: "Astrophytum Asterias - Thích hợp làm quà tặng nhỏ xinh để bàn làm việc.",
      images: ["https://images.unsplash.com/photo-1519331379826-f10be5486c6f?q=80&w=800&auto=format&fit=crop"],
      careGuide: [
        { title: "Ánh sáng", content: "Ánh sáng mạnh nhưng mát mẻ." },
        { title: "Tưới nước", content: "Tưới 1 lần/tuần, đất trồng cần thoát nước siêu nhanh." }
      ]
    },

    // ── Cây leo (7 products) ──
    {
      title: "Cây Thường Xuân Mỹ ban công", price: 160000, originalPrice: 200000, discount: "20%",
      description: "Có tán lá hình sao xanh mướt mọc bám tường hoặc rủ mềm mại từ chậu treo. Loài cây nổi tiếng với khả năng hút bụi mịn và lọc không khí tuyệt hảo.",
      imageUrl: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=600&auto=format&fit=crop",
      category: "Cây leo", inStock: true,
      bio: "Hedera Helix - Cây biểu tượng cho sự kiên trì bền bỉ và may mắn.",
      images: ["https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=800&auto=format&fit=crop"],
      careGuide: [
        { title: "Ánh sáng", content: "Ưa bóng râm nhẹ, nơi thoáng mát." },
        { title: "Tưới nước", content: "Tưới phun sương nhẹ lên lá và tưới ẩm gốc 2-3 lần/tuần." }
      ]
    },
    {
      title: "Cây Trầu Bà Vàng leo cột nhựa", price: 110000, originalPrice: 140000, discount: "21%",
      description: "Thích hợp làm cây leo bám tường trang trí văn phòng làm việc. Cây cực dễ sống, lọc sạch nhiều chất độc trong khí lạnh phòng.",
      imageUrl: "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?q=80&w=600&auto=format&fit=crop",
      category: "Cây leo", inStock: true,
      bio: "Epipremnum Aureum - Cây trầu bà vàng dễ chăm nhất thế giới.",
      images: ["https://images.unsplash.com/photo-1599599810769-bcde5a160d32?q=80&w=800&auto=format&fit=crop"],
      careGuide: [
        { title: "Ánh sáng", content: "Chịu bóng tốt, tránh ánh nắng trực tiếp của mặt trời." },
        { title: "Tưới nước", content: "Tưới đều đặn 2 lần/tuần giữ độ ẩm tốt cho đất chậu." }
      ]
    },
    {
      title: "Cẩm Cù Trái Tim Hoya Kerrii", price: 150000, originalPrice: 190000, discount: "21%",
      description: "Những chiếc lá mập mọng nước hình trái tim hoàn mỹ đáng yêu. Cẩm cù là món quà tỏ tình lãng mạn ý nghĩa.",
      imageUrl: "https://images.unsplash.com/photo-1593696140826-c58b021acf8b?q=80&w=600&auto=format&fit=crop",
      category: "Cây leo", inStock: true,
      bio: "Hoya Kerrii - Cây leo bản địa Đông Nam Á, lá bền bỉ quanh năm.",
      images: ["https://images.unsplash.com/photo-1593696140826-c58b021acf8b?q=80&w=800&auto=format&fit=crop"],
      careGuide: [
        { title: "Ánh sáng", content: "Ánh sáng gián tiếp nhẹ." },
        { title: "Tưới nước", content: "Chỉ tưới khi thấy đất khô hoàn toàn (1 lần/tuần)." }
      ]
    },
    {
      title: "Cây Sử Quân Tử leo giàn hoa thơm", price: 220000, originalPrice: 280000, discount: "21%",
      description: "Loài hoa leo giàn cực kỳ rực rỡ với hương thơm ngọt ngào dễ chịu. Hoa đổi màu từ trắng, hồng đến đỏ sẫm rất thú vị.",
      imageUrl: "https://images.unsplash.com/photo-1497250681960-ef046c08a56e?q=80&w=600&auto=format&fit=crop",
      category: "Cây leo", inStock: true,
      bio: "Combretum Indicum - Dòng hoa dây leo giàn thơm ban công đón nắng.",
      images: ["https://images.unsplash.com/photo-1497250681960-ef046c08a56e?q=80&w=800&auto=format&fit=crop"],
      careGuide: [
        { title: "Ánh sáng", content: "Rất ưa nắng, cần đặt vị trí hứng nắng nhiều ngoài trời." },
        { title: "Tưới nước", content: "Tưới nước hàng ngày để cây sinh trưởng mạnh." }
      ]
    },
    {
      title: "Cây Hoa Giấy Thái Lan hoa đỏ hồng", price: 350000, originalPrice: 450000, discount: "22%",
      description: "Xum xuê rực rỡ sắc màu đỏ hồng, chịu nắng nóng và hạn cực khỏe. Thích hợp trang trí hiên nhà, cổng ngõ mang lại may mắn ấm cúng.",
      imageUrl: "https://images.unsplash.com/photo-1567306301408-9b74779a11af?q=80&w=600&auto=format&fit=crop",
      category: "Cây leo", inStock: true,
      bio: "Bougainvillea Spectabilis - Giống hoa giấy nhập khẩu hoa nhiều lâu tàn.",
      images: ["https://images.unsplash.com/photo-1567306301408-9b74779a11af?q=80&w=800&auto=format&fit=crop"],
      careGuide: [
        { title: "Ánh sáng", content: "Trồng nơi đón nắng nhiều nhất có thể." },
        { title: "Tưới nước", content: "Tưới 2-3 ngày/lần, không cần tưới quá sũng đất." }
      ]
    },
    {
      title: "Cây Mai Xanh Thái hoa tím leo ban công", price: 380000, originalPrice: 480000, discount: "21%",
      description: "Dòng hoa leo giàn cổ điển mang sắc hoa màu tím xanh lãng mạn sang trọng rủ bóng râm mát cho mái hiên nhà bạn.",
      imageUrl: "https://images.unsplash.com/photo-1599839619722-39751411ea63?q=80&w=600&auto=format&fit=crop",
      category: "Cây leo", inStock: true,
      bio: "Petrea Volubilis - Dòng hoa mai xanh Thái Lan leo giàn rủ tuyệt đẹp.",
      images: ["https://images.unsplash.com/photo-1599839619722-39751411ea63?q=80&w=800&auto=format&fit=crop"],
      careGuide: [
        { title: "Ánh sáng", content: "Ưa nắng nhiều để hoa nở rực rỡ." },
        { title: "Tưới nước", content: "Tưới nước giữ độ ẩm ổn định hàng ngày." }
      ]
    },
    {
      title: "Cây Trầu Bà Sữa cẩm thạch rủ", price: 140000, originalPrice: 180000, discount: "22%",
      description: "Sở hữu những chiếc lá cẩm thạch trắng sữa pha xanh nõn nhẹ nhàng như những chiếc đĩa cẩm thạch mini rủ xuống thơ mộng.",
      imageUrl: "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?q=80&w=600&auto=format&fit=crop",
      category: "Cây leo", inStock: true,
      bio: "Epipremnum Aureum Manjula - Biến thể trầu bà lá đốm trắng sữa xinh xắn.",
      images: ["https://images.unsplash.com/photo-1599599810769-bcde5a160d32?q=80&w=800&auto=format&fit=crop"],
      careGuide: [
        { title: "Ánh sáng", content: "Cần ánh sáng nhẹ gián tiếp để giữ vân cẩm thạch tươi màu." },
        { title: "Tưới nước", content: "Tưới nhẹ nhàng giữ ẩm cho đất chậu 2 lần/tuần." }
      ]
    },

    // ── Bonsai (6 products) ──
    {
      title: "Bonsai Tùng La Hán thế trực", price: 1500000, originalPrice: 1800000, discount: "17%",
      description: "Tùng La Hán mang dáng trực thẳng tắp uy nghi vững chãi, lá kim xanh mướt quanh năm thể hiện khí phách người quân tử và đem lại đại phú quý.",
      imageUrl: "https://images.unsplash.com/photo-1512428559087-560fa5ceab42?q=80&w=600&auto=format&fit=crop",
      category: "Bonsai", inStock: true,
      bio: "Podocarpus Macrophyllus - Cây bonsai thế lâu năm nghệ thuật thanh lịch.",
      images: ["https://images.unsplash.com/photo-1512428559087-560fa5ceab42?q=80&w=800&auto=format&fit=crop"],
      careGuide: [
        { title: "Ánh sáng", content: "Ánh sáng tán xạ mạnh hoặc để hiên nhà mát mẻ." },
        { title: "Tưới nước", content: "Tưới khi thấy đất mặt bắt đầu khô nhẹ (2 lần/tuần)." }
      ]
    },
    {
      title: "Bonsai Mai Chiếu Thủy hoa trắng thơm", price: 850000, originalPrice: 1100000, discount: "23%",
      description: "Cây được uốn dáng bay mềm mại nghệ thuật, ra rất nhiều chùm hoa nhỏ màu trắng buốt thơm mát rủ xuống hướng về đất mẹ.",
      imageUrl: "https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=600&auto=format&fit=crop",
      category: "Bonsai", inStock: true,
      bio: "Wrightia Religiosa - Dòng cây bonsai hoa thơm mang ý nghĩa tâm linh cát tường.",
      images: ["https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=800&auto=format&fit=crop"],
      careGuide: [
        { title: "Ánh sáng", content: "Thích nắng trực tiếp đầy đủ ngoài trời." },
        { title: "Tưới nước", content: "Ưa ẩm, tưới đều đặn mỗi ngày." }
      ]
    },
    {
      title: "Bonsai Linh Sam dáng bay hoa tím", price: 650000, originalPrice: 800000, discount: "19%",
      description: "Thân cây xù xì cổ kính uốn lượn tỉ mỉ kết hợp với những chùm hoa màu tím biếc thơ mộng quyến rũ mang đậm phong thái tĩnh lặng thiền môn.",
      imageUrl: "https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=600&auto=format&fit=crop",
      category: "Bonsai", inStock: true,
      bio: "Desmodium Unifoliatum - Dòng bonsai linh sam hoa tím được yêu thích nhất.",
      images: ["https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=800&auto=format&fit=crop"],
      careGuide: [
        { title: "Ánh sáng", content: "Rất ưa ánh sáng tự nhiên đầy đủ." },
        { title: "Tưới nước", content: "Tưới nước khi đất chậu ráo nước hoàn toàn." }
      ]
    },
    {
      title: "Bonsai Sung Mỹ kiểng quả ngọt", price: 580000, originalPrice: 700000, discount: "17%",
      description: "Dòng bonsai mini độc đáo vừa mang dáng dấp nghệ thuật cổ điển vừa cho các chùm quả ngọt đỏ mọng nước đầy sum suê thịnh vượng.",
      imageUrl: "https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=600&auto=format&fit=crop",
      category: "Bonsai", inStock: true,
      bio: "Ficus Carica - Sung Mỹ dáng bonsai nhỏ gọn trưng nhà xinh.",
      images: ["https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=800&auto=format&fit=crop"],
      careGuide: [
        { title: "Ánh sáng", content: "Ánh sáng chiếu trực tiếp tối thiểu 4-6 giờ." },
        { title: "Tưới nước", content: "Tưới giữ ẩm đều đặn cho bầu đất chậu." }
      ]
    },
    {
      title: "Bonsai Sam Hương Dáng Huyền nghệ thuật", price: 420000, originalPrice: 520000, discount: "19%",
      description: "Cây Sam Hương dáng huyền đổ rủ xuống mép chậu vô cùng nghệ thuật, mùi thơm nhẹ dịu tỏa ra từ lá mang lại cảm giác an yên trong phòng trà.",
      imageUrl: "https://images.unsplash.com/photo-1512428559087-560fa5ceab42?q=80&w=600&auto=format&fit=crop",
      category: "Bonsai", inStock: true,
      bio: "Premna Microphylla - Lá nhỏ bóng bảy có mùi hương dịu thơm xua đuổi côn trùng.",
      images: ["https://images.unsplash.com/photo-1512428559087-560fa5ceab42?q=80&w=800&auto=format&fit=crop"],
      careGuide: [
        { title: "Ánh sáng", content: "Nơi nhiều sáng tự nhiên thông thoáng gió." },
        { title: "Tưới nước", content: "Phun sương giữ ẩm lá hàng ngày và tưới ẩm gốc." }
      ]
    },
    {
      title: "Bonsai Duyên Tùng mini thế trực", price: 1200000, originalPrice: 1500000, discount: "20%",
      description: "Tán tùng xanh rì như thảm rêu mọc giữa vách đá cheo leo, gốc tùng lâu năm thô ráp uốn lượn kỳ công nghệ thuật Nhật Bản sang quý.",
      imageUrl: "https://images.unsplash.com/photo-1512428559087-560fa5ceab42?q=80&w=600&auto=format&fit=crop",
      category: "Bonsai", inStock: true,
      bio: "Juniperus Chinensis Bonsai - Duyên Tùng dáng trực quân tử.",
      images: ["https://images.unsplash.com/photo-1512428559087-560fa5ceab42?q=80&w=800&auto=format&fit=crop"],
      careGuide: [
        { title: "Ánh sáng", content: "Nắng ngoài trời toàn phần." },
        { title: "Tưới nước", content: "Chỉ tưới ẩm khi đất bầu ráo mặt." }
      ]
    },

    // ── Hạt giống (6 products) ──
    {
      title: "Hạt Giống Cà Chua Bi Lùn ngọt mát", price: 25000, originalPrice: 35000, discount: "28%",
      description: "Gói hạt giống cà chua bi lùn chất lượng nhập khẩu tỷ lệ nảy mầm cao thích hợp trồng chậu nhỏ ngoài ban công cho ra nhiều trùm quả ngọt.",
      imageUrl: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?q=80&w=600&auto=format&fit=crop",
      category: "Hạt giống", inStock: true,
      bio: "Solanum Lycopersicum - Tỉ lệ nảy mầm > 90%, thời gian thu hoạch 60-70 ngày.",
      images: ["https://images.unsplash.com/photo-1592924357228-91a4daadcfea?q=80&w=800&auto=format&fit=crop"],
      careGuide: [
        { title: "Gieo hạt", content: "Ngâm hạt trong nước ấm 2-3 tiếng trước khi gieo vào khay ươm." },
        { title: "Đất trồng", content: "Đất tơi xốp nhiều mùn dinh dưỡng tự nhiên." }
      ]
    },
    {
      title: "Hạt Giống Dâu Tây Đỏ New Zealand", price: 30000, originalPrice: 40000, discount: "25%",
      description: "Hạt giống dâu tây đỏ giống chịu nhiệt nhẹ cực thích hợp gieo trồng xứ nóng cho quả thơm ngọt căng mọng nước đẹp mắt.",
      imageUrl: "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?q=80&w=600&auto=format&fit=crop",
      category: "Hạt giống", inStock: true,
      bio: "Fragaria Ananassa - Tỷ lệ nảy mầm ổn định, thích đất thoát nước tốt.",
      images: ["https://images.unsplash.com/photo-1464965911861-746a04b4bca6?q=80&w=800&auto=format&fit=crop"],
      careGuide: [
        { title: "Gieo hạt", content: "Gieo hạt cạn nông phủ lớp sơ dừa mỏng ẩm nhẹ." },
        { title: "Ánh sáng", content: "Đặt nơi mát mẻ có ánh sáng hắt nhẹ." }
      ]
    },
    {
      title: "Hạt Giống Hoa Hướng Dương Lùn đón nắng", price: 20000, originalPrice: 25000, discount: "20%",
      description: "Thích hợp trồng chậu nhỏ ban công tạo điểm nhấn vàng rực rỡ vui tươi tràn đầy năng lượng tích cực cho không gian sống của bạn.",
      imageUrl: "https://images.unsplash.com/photo-1597848212624-a19eb35e2651?q=80&w=600&auto=format&fit=crop",
      category: "Hạt giống", inStock: true,
      bio: "Helianthus Annuus - Chiều cao cây trưởng thành chỉ từ 30-40cm.",
      images: ["https://images.unsplash.com/photo-1597848212624-a19eb35e2651?q=80&w=800&auto=format&fit=crop"],
      careGuide: [
        { title: "Gieo hạt", content: "Gieo trực tiếp xuống đất ẩm sâu khoảng 1cm." },
        { title: "Chăm sóc", content: "Tưới nước giữ đất ẩm đều đặn mỗi sáng." }
      ]
    },
    {
      title: "Hạt Giống Hoa Hồng Mini đa sắc", price: 35000, originalPrice: 45000, discount: "22%",
      description: "Gói hạt giống hoa hồng bụi lùn nhiều màu sắc nhẹ nhàng kiêu sa làm đẹp tiểu cảnh ban công chung cư của bạn.",
      imageUrl: "https://images.unsplash.com/photo-1519331379826-f10be5486c6f?q=80&w=600&auto=format&fit=crop",
      category: "Hạt giống", inStock: true,
      bio: "Rosa Chinensis - Gói hỗn hợp nhiều màu hoa nhẹ nhàng.",
      images: ["https://images.unsplash.com/photo-1519331379826-f10be5486c6f?q=80&w=800&auto=format&fit=crop"],
      careGuide: [
        { title: "Nảy mầm", content: "Cần ủ ẩm hạt trong ngăn mát tủ lạnh 15-20 ngày trước khi gieo." }
      ]
    },
    {
      title: "Hạt Giống Ớt Chỉ Thiên siêu cay", price: 15000, originalPrice: 20000, discount: "25%",
      description: "Ớt chỉ thiên mọc chùm sai quả, vị cay nồng đặc trưng, dễ trồng từ chậu nhỏ, cây chịu hạn và chịu nhiệt cực khỏe.",
      imageUrl: "https://images.unsplash.com/photo-1463936575829-25148e1db1b8?q=80&w=600&auto=format&fit=crop",
      category: "Hạt giống", inStock: true,
      bio: "Capsicum Annuum - Thích hợp gieo quanh năm đất ẩm thoát nước tốt.",
      images: ["https://images.unsplash.com/photo-1463936575829-25148e1db1b8?q=80&w=800&auto=format&fit=crop"],
      careGuide: [
        { title: "Chăm sóc", content: "Tưới nước ẩm đều hàng ngày, đặt chậu hướng nắng trực tiếp." }
      ]
    },
    {
      title: "Hạt Giống Rau Muống Cao Sản ăn lá", price: 12000, originalPrice: 15000, discount: "20%",
      description: "Hạt giống rau sạch chất lượng cao nhanh thu hoạch chỉ sau 20-25 ngày gieo. Thích hợp trồng thùng xốp cung cấp rau sạch gia đình.",
      imageUrl: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?q=80&w=600&auto=format&fit=crop",
      category: "Hạt giống", inStock: true,
      bio: "Ipomoea Aquatica - Rau muống lá tre mềm ăn giòn ngọt.",
      images: ["https://images.unsplash.com/photo-1592924357228-91a4daadcfea?q=80&w=800&auto=format&fit=crop"],
      careGuide: [
        { title: "Chăm sóc", content: "Tưới đẫm nước hàng ngày sáng tối vì rau muống rất ưa ẩm." }
      ]
    },

    // ── Quà tặng (6 products) ──
    {
      title: "Bình Terrarium Rừng Nhiệt Đới kín", price: 480000, originalPrice: 600000, discount: "20%",
      description: "Bình thủy tinh Borosilicate kín chứa hệ sinh thái thu nhỏ tuần hoàn hơi nước độc đáo gồm rêu, dương xỉ, cẩm nhung và đá cuội thiên nhiên.",
      imageUrl: "https://images.unsplash.com/photo-1567306301408-9b74779a11af?q=80&w=600&auto=format&fit=crop",
      category: "Quà tặng", inStock: true,
      bio: "Hệ sinh thái tuần hoàn kín tự nuôi dưỡng độc lạ trang trí phòng khách.",
      images: ["https://images.unsplash.com/photo-1567306301408-9b74779a11af?q=80&w=800&auto=format&fit=crop"],
      careGuide: [
        { title: "Chăm sóc", content: "Chỉ cần xịt phun sương ẩm nhẹ mỗi 3-4 tuần một lần, đậy kín nắp bình." }
      ]
    },
    {
      title: "Set Quà Tặng Sen Đá Phú Quý gỗ mộc", price: 320000, originalPrice: 400000, discount: "20%",
      description: "Hộp quà gỗ thông sang trọng cắm mix 5 loại sen đá mập mạp may mắn, trang trí rêu khô xinh xắn kèm thiệp chúc mừng sinh nhật ý nghĩa.",
      imageUrl: "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?q=80&w=600&auto=format&fit=crop",
      category: "Quà tặng", inStock: true,
      bio: "Set quà tặng sinh nhật bạn bè, người thân độc đáo tinh tế.",
      images: ["https://images.unsplash.com/photo-1464965911861-746a04b4bca6?q=80&w=800&auto=format&fit=crop"],
      careGuide: [
        { title: "Tưới nước", content: "Tưới nước ẩm gốc nhẹ nhàng quanh chậu gỗ 7 ngày một lần." }
      ]
    },
    {
      title: "Chậu Cây Kim Ngân Bính Lộc để bàn", price: 250000, originalPrice: 300000, discount: "17%",
      description: "Thân cây thắt bím đuôi sam nghệ thuật mọc lá tán xòe như 5 ngón tay thu lộc. Món quà tân gia ý nghĩa cầu chúc tiền tài dồi dào gõ cửa.",
      imageUrl: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=600&auto=format&fit=crop",
      category: "Quà tặng", inStock: true,
      bio: "Pachira Aquatica - Cây Tiền Tài biểu tượng giàu sang thịnh vượng.",
      images: ["https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=800&auto=format&fit=crop"],
      careGuide: [
        { title: "Ánh sáng", content: "Đặt bàn làm việc sáng dịu, phòng điều hòa tốt." },
        { title: "Chăm sóc", content: "Tưới nước quanh gốc 1 lần/tuần." }
      ]
    },
    {
      title: "Set Cây Để Bàn Ý Nghĩa ngày lễ", price: 180000, originalPrice: 220000, discount: "18%",
      description: "Sự kết hợp hoàn hảo giữa chậu sứ in chữ chúc mừng, sen đá hồng, xương rồng tai thỏ bọc hộp quà xinh xắn.",
      imageUrl: "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?q=80&w=600&auto=format&fit=crop",
      category: "Quà tặng", inStock: true,
      bio: "Set quà tặng dễ thương cho đồng nghiệp nhân dịp lễ kỷ niệm.",
      images: ["https://images.unsplash.com/photo-1464965911861-746a04b4bca6?q=80&w=800&auto=format&fit=crop"],
      careGuide: [
        { title: "Tưới nước", content: "Tưới ẩm đất nhẹ nhàng 1 lần/tuần." }
      ]
    },
    {
      title: "Chậu Cây Tài Lộc Hộp Quà Đỏ", price: 290000, originalPrice: 350000, discount: "17%",
      description: "Cây may mắn với gốc mập mọc lá xanh mướt trang trí nơ đỏ rực rỡ thích hợp làm quà tặng khai trương đại diện cho lời chúc hồng phát.",
      imageUrl: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=600&auto=format&fit=crop",
      category: "Quà tặng", inStock: true,
      bio: "Gói quà sang trọng gửi kèm lời chúc cát tường thịnh vượng.",
      images: ["https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=800&auto=format&fit=crop"],
      careGuide: [
        { title: "Tưới nước", content: "Tưới nước vừa đủ làm ẩm giá thể 1 lần mỗi tuần." }
      ]
    },
    {
      title: "Bình Terrarium Sen Đá Cát Trắng mở", price: 390000, originalPrice: 480000, discount: "19%",
      description: "Bình thủy tinh dáng bán cầu hở được decor tinh xảo bằng cát trắng thạch anh cùng 3 dòng sen đá sặc sỡ chống chịu nhiệt tốt.",
      imageUrl: "https://images.unsplash.com/photo-1567306301408-9b74779a11af?q=80&w=600&auto=format&fit=crop",
      category: "Quà tặng", inStock: true,
      bio: "Hồ kính tiểu cảnh sen đá mộc mạc cá tính trang trí bàn trà.",
      images: ["https://images.unsplash.com/photo-1567306301408-9b74779a11af?q=80&w=800&auto=format&fit=crop"],
      careGuide: [
        { title: "Ánh sáng", content: "Cần đặt nơi sáng gió, gần cửa sổ hưởng sáng tự nhiên." },
        { title: "Tưới nước", content: "Dùng vòi phun sương xịt ẩm cát quanh rễ cây mỗi 10 ngày." }
      ]
    }
  ];

  // Insert products
  for (const p of products) {
    const catId = catIds[p.category] || null;
    const result = await pool.request()
      .input("title", sql.NVarChar, p.title)
      .input("price", sql.Decimal(18, 2), p.price)
      .input("originalPrice", sql.Decimal(18, 2), p.originalPrice || null)
      .input("discount", sql.NVarChar, p.discount || null)
      .input("description", sql.NVarChar, p.description)
      .input("imageUrl", sql.NVarChar, p.imageUrl)
      .input("categoryId", sql.Int, catId)
      .input("bio", sql.NVarChar, p.bio || null)
      .input("inStock", sql.Bit, p.inStock)
      .input("stockQuantity", sql.Int, p.inStock ? 50 : 0)
      .query(`INSERT INTO Products (title,price,original_price,discount,description,image_url,category_id,bio,in_stock,stock_quantity)
              OUTPUT INSERTED.id VALUES (@title,@price,@originalPrice,@discount,@description,@imageUrl,@categoryId,@bio,@inStock,@stockQuantity)`);

    const productId = result.recordset[0].id;

    for (let i = 0; i < p.images.length; i++) {
      await pool.request()
        .input("pid", sql.Int, productId)
        .input("url", sql.NVarChar, p.images[i])
        .input("sort", sql.Int, i)
        .query("INSERT INTO ProductImages (product_id,url,sort_order) VALUES (@pid,@url,@sort)");
    }
    for (let i = 0; i < p.careGuide.length; i++) {
      await pool.request()
        .input("pid", sql.Int, productId)
        .input("title2", sql.NVarChar, p.careGuide[i].title)
        .input("content", sql.NVarChar, p.careGuide[i].content)
        .input("sort", sql.Int, i)
        .query("INSERT INTO CareGuides (product_id,title,content,sort_order) VALUES (@pid,@title2,@content,@sort)");
    }
  }
  console.log(`[seed] ${products.length} products seeded`);

  // ── 5. Planters & Accessories ───────────────────────────────
  const plantersAndAccessories = [
    // Planters
    { name: "Chậu Gốm Bát Tràng Trắng Trơn", material: "Gốm sứ Bát Tràng", price: 85000, imageUrl: "https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?q=80&w=400&auto=format&fit=crop", inStock: true, type: "planter", sizes: ["S (10cm)", "M (15cm)", "L (20cm)"], accessoryBrand: null, usageTags: null },
    { name: "Chậu Xi Măng Xám Tối Giản", material: "Xi măng đúc", price: 120000, imageUrl: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?q=80&w=400&auto=format&fit=crop", inStock: true, type: "planter", sizes: ["S (12cm)", "M (18cm)", "L (25cm)"], accessoryBrand: null, usageTags: null },
    { name: "Chậu Nhựa Terracotta Nhẹ", material: "Nhựa PP bền", price: 35000, imageUrl: "https://images.unsplash.com/photo-1593696140826-c58b021acf8b?q=80&w=400&auto=format&fit=crop", inStock: true, type: "planter", sizes: ["S (8cm)", "M (12cm)", "L (16cm)"], accessoryBrand: null, usageTags: null },
    { name: "Chậu Đất Nung Mộc Đỏ", material: "Đất nung Bình Dương", price: 65000, imageUrl: "https://images.unsplash.com/photo-1593696140826-c58b021acf8b?q=80&w=400&auto=format&fit=crop", inStock: true, type: "planter", sizes: ["S (10cm)", "M (14cm)", "L (18cm)"], accessoryBrand: null, usageTags: null },
    { name: "Chậu Treo Xơ Dừa Handmade", material: "Xơ dừa tự nhiên", price: 95000, imageUrl: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=400&auto=format&fit=crop", inStock: true, type: "planter", sizes: ["M (15cm)", "L (20cm)"], accessoryBrand: null, usageTags: null },
    { name: "Chậu Sứ Vẽ Hoa Văn Cổ", material: "Gốm sứ cao cấp", price: 210000, imageUrl: "https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?q=80&w=400&auto=format&fit=crop", inStock: true, type: "planter", sizes: ["M (18cm)", "L (22cm)"], accessoryBrand: null, usageTags: null },
    
    // Accessories
    { name: "Bình tưới cây inox cao cấp", material: "Inox 304", price: 150000, imageUrl: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?q=80&w=400&auto=format&fit=crop", inStock: true, type: "accessory", sizes: [], accessoryBrand: "Gardena", usageTags: ["Tưới nước", "Trang trí"] },
    { name: "Phân bón hữu cơ sinh học", material: "Phân trùn quế", price: 45000, imageUrl: "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?q=80&w=400&auto=format&fit=crop", inStock: true, type: "accessory", sizes: [], accessoryBrand: "EcoClean", usageTags: ["Dinh dưỡng", "Kích rễ"] },
    { name: "Bộ xẻng làm vườn mini 3 món", material: "Thép + Gỗ", price: 65000, imageUrl: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?q=80&w=400&auto=format&fit=crop", inStock: true, type: "accessory", sizes: [], accessoryBrand: "OEM", usageTags: ["Xới đất", "Thay chậu"] },
    { name: "Đất hữu cơ vi sinh cao cấp 5kg", material: "Đất mùn dừa", price: 55000, imageUrl: "https://images.unsplash.com/photo-1463936575829-25148e1db1b8?q=80&w=400&auto=format&fit=crop", inStock: true, type: "accessory", sizes: [], accessoryBrand: "Tribe", usageTags: ["Trồng cây", "Dinh dưỡng"] },
    { name: "Đèn LED quang phổ grow light", material: "Hợp kim nhôm", price: 320000, imageUrl: "https://images.unsplash.com/photo-1512428559087-560fa5ceab42?q=80&w=400&auto=format&fit=crop", inStock: true, type: "accessory", sizes: [], accessoryBrand: "Phillips", usageTags: ["Ánh sáng", "Indoor"] }
  ];

  for (const item of plantersAndAccessories) {
    const r = await pool.request()
      .input("name", sql.NVarChar, item.name)
      .input("material", sql.NVarChar, item.material)
      .input("price", sql.Decimal(18, 2), item.price)
      .input("imageUrl", sql.NVarChar, item.imageUrl)
      .input("inStock", sql.Bit, item.inStock)
      .input("stockQuantity", sql.Int, item.inStock ? 50 : 0)
      .input("type", sql.NVarChar, item.type)
      .input("accessoryBrand", sql.NVarChar, item.accessoryBrand || null)
      .input("accessoryUses", sql.NVarChar, item.usageTags ? JSON.stringify(item.usageTags) : null)
      .query(`INSERT INTO Planters (name, material, price, image_url, in_stock, stock_quantity, type, accessory_brand, accessory_uses)
              OUTPUT INSERTED.id
              VALUES (@name, @material, @price, @imageUrl, @inStock, @stockQuantity, @type, @accessoryBrand, @accessoryUses)`);
    const itemId = r.recordset[0].id;
    if (item.sizes && item.sizes.length > 0) {
      for (const s of item.sizes) {
        await pool.request()
          .input("pid", sql.Int, itemId)
          .input("size", sql.NVarChar, s)
          .query("INSERT INTO PlanterSizes (planter_id, size_label) VALUES (@pid, @size)");
      }
    }
  }
  console.log("[seed] Planters & accessories seeded");

  // ── 6. Blog Posts ───────────────────────────────────────────
  const blogs = [
    {
      title: "Kỹ thuật chăm sóc sen đá cho người mới bắt đầu",
      image: "https://images.unsplash.com/photo-1512428813834-c702c7702b78?q=80&w=800&auto=format&fit=crop",
      excerpt: "Sen đá tuy dễ sống nhưng lại cực kỳ nhạy cảm với nước và ánh sáng. Đọc ngay bí quyết chăm sóc từ chuyên gia.",
      category: "Chăm sóc", readTime: "5 phút", tags: "sen đá,chăm sóc cây,vườn nhà", featured: true, date: "2026-05-15",
      content: "Sen đá là dòng cây mọng nước nhỏ xinh thích nắng ấm và cực kỳ kỵ tưới quá nhiều nước gây thối rễ rụng lá. Công thức trộn đất phù hợp là 70% đá Pumice/Perlite thoáng rễ và 30% phân trùn quế/đất tơi xốp dinh dưỡng. Hãy chỉ tưới nước khi đất chậu khô cằn hoàn toàn và phơi nắng tối thiểu 4 tiếng mỗi ngày để giữ được màu sắc rực rỡ và phom dáng khít chặt tròn trịa..."
    },
    {
      title: "Top 10 loại cây lọc không khí tốt nhất năm 2026",
      image: "https://images.unsplash.com/photo-1584444262846-e2716db1294b?q=80&w=800&auto=format&fit=crop",
      excerpt: "Để không gian sống luôn trong lành và ngập tràn năng lượng tích cực, hãy bổ sung ngay những cây này vào phòng.",
      category: "Xu hướng", readTime: "7 phút", tags: "lọc không khí,cây trong nhà,sức khỏe", featured: false, date: "2026-05-10",
      content: "Cây xanh không chỉ đem lại sắc xanh tươi tắn bình yên cho không gian sống hiện đại mà còn hoạt động như những chiếc máy lọc không khí sinh học bền bỉ. NASA đã công bố các dòng cây hàng đầu như Lưỡi Hổ (hấp thụ khí CO2 ban đêm tốt), Lan Ý (lọc benzen, formaldehyde mạnh mẽ) và Trầu Bà (hấp thụ tia sóng có hại từ máy tính, thiết bị điện tử văn phòng). Việc trang bị chậu cây xanh nhỏ bàn làm việc giúp bảo vệ sức khỏe hệ hô hấp..."
    },
    {
      title: "Cách tự làm bình Terrarium mini độc đáo tại nhà",
      image: "https://images.unsplash.com/photo-1567306301408-9b74779a11af?q=80&w=800&auto=format&fit=crop",
      excerpt: "Một bình thủy tinh nhỏ, một ít đất, sỏi và rêu là bạn đã có ngay một hệ sinh thái thu nhỏ vô cùng sống động.",
      category: "DIY", readTime: "10 phút", tags: "DIY,terrarium,tiểu cảnh", featured: false, date: "2026-05-01",
      content: "Terrarium là nghệ thuật sắp đặt cây xanh trong các bể kính trong suốt để tạo ra một hệ sinh thái tuần hoàn hoặc bán tuần hoàn thu nhỏ xinh xắn. Bạn cần chuẩn bị một bình thủy tinh Borosilicate sạch sẽ, rải lớp sỏi dưới đáy để lọc nước, sau đó phủ than hoạt tính khử mùi mốc, lớp đất mùn mỏng tơi xốp rồi trồng các dòng cây nhỏ như cẩm nhung, dương xỉ mini, rêu tươi xanh. Sau cùng, decor thêm một vài lát sỏi màu, đá cuội để tạo cảnh đồi núi..."
    },
    {
      title: "Ý nghĩa phong thủy của cây Kim Tiền và cách đặt đúng",
      image: "https://images.unsplash.com/photo-1632203171982-cc0df6e9ceb4?q=80&w=800&auto=format&fit=crop",
      excerpt: "Cây Kim Tiền mang ý nghĩa chiêu tài hút lộc. Đặt đúng vị trí phong thủy sẽ giúp gia chủ làm ăn phát đạt.",
      category: "Phong thủy", readTime: "4 phút", tags: "phong thủy,cây tài lộc,kim tiền", featured: true, date: "2026-04-20",
      content: "Cây Kim Tiền (Kim Phát Tài) sở hữu những lá xanh mọc đối xứng cứng cáp, vươn cao tràn đầy sinh khí như đón tiền tài. Theo phong thủy Đông Á, đặt chậu Kim Tiền ở hướng Đông Nam hoặc góc tài lộc trong phòng khách, quầy thu ngân cửa hàng sẽ giúp thu hút tài khí, mang lại vận may tài lộc hanh thông cho công việc kinh doanh của chủ nhân..."
    },
    {
      title: "Hướng dẫn trộn đất trồng xương rồng thoát nước tốt",
      image: "https://images.unsplash.com/photo-1498408040764-ab6eb772a145?q=80&w=800&auto=format&fit=crop",
      excerpt: "Xương rồng ghét nhất là đất bị úng nước. Dưới đây là công thức trộn giá thể đá bọt Perlite siêu thoát nước.",
      category: "Chăm sóc", readTime: "6 phút", tags: "xương rồng,giá thể,đất trồng", featured: false, date: "2026-04-15",
      content: "Xương rồng là dòng thực vật hoang mạc khô cằn, rễ của chúng rất dễ bị nghẹt và úng thối nếu gặp đất trồng giữ nước quá lâu. Công thức vàng để trộn giá thể lý tưởng cho xương rồng gồm: 40% đá Pumice tạo độ xốp rỗng rễ, 30% đá Perlite giữ ẩm nhẹ nhưng thoát nước nhanh, 20% xơ dừa đã xử lý chát tơi xốp, 10% phân bò hoai mục hoặc phân trùn quế cung cấp dinh dưỡng nuôi gai bền bỉ..."
    },
    {
      title: "Thiết kế ban công xanh mát với các loài cây leo dễ trồng",
      image: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=800&auto=format&fit=crop",
      excerpt: "Ban công nhỏ hẹp vẫn có thể trở thành thiên đường thư giãn nhờ các loại cây leo rủ rực rỡ sắc màu.",
      category: "Thiết kế", readTime: "8 phút", tags: "ban công,cây leo,trang trí ngoại thất", featured: false, date: "2026-04-01",
      content: "Dây leo xanh mát hay chùm hoa sặc sỡ rủ mềm mại như Hoa Giấy, Sử Quân Tử, hay Thường Xuân là giải pháp trang trí ban công nhỏ lý tưởng, không tốn nhiều diện tích mặt sàn chậu mà vẫn che nắng hiệu quả cho ngôi nhà. Hãy lắp đặt thêm giàn gỗ treo tường và thiết lập hệ thống tưới nước nhỏ giọt đơn giản để ban công của bạn luôn xanh mướt..."
    }
  ];

  for (const b of blogs) {
    await pool.request()
      .input("title", sql.NVarChar, b.title)
      .input("image", sql.NVarChar, b.image)
      .input("excerpt", sql.NVarChar, b.excerpt)
      .input("content", sql.NVarChar, b.content)
      .input("category", sql.NVarChar, b.category)
      .input("readTime", sql.NVarChar, b.readTime)
      .input("tags", sql.NVarChar, b.tags)
      .input("featured", sql.Bit, b.featured)
      .input("date", sql.Date, b.date)
      .query(`INSERT INTO BlogPosts (title,image,excerpt,content,category,read_time,tags,featured,date)
              VALUES (@title,@image,@excerpt,@content,@category,@readTime,@tags,@featured,@date)`);
  }
  console.log("[seed] Blog posts seeded");

  console.log("[seed] Done");
  await sql.close();
  process.exit(0);
}

seed().catch(async (err) => {
  console.error("[seed] Failed:", err.message);
  await sql.close();
  process.exit(1);
});
