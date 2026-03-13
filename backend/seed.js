require("dotenv").config();
const { getPool, sql } = require("./src/libs/db");
const bcrypt = require("bcryptjs");

async function seed() {
  console.log("🌱 Starting seed...");
  const pool = await getPool();

  // ── Admin user ─────────────────────────────────────────────
  const adminHash = await bcrypt.hash("admin123", 10);
  const demoHash = await bcrypt.hash("123456", 10);

  await pool.request()
    .input("name", sql.NVarChar, "Admin").input("email", sql.NVarChar, "admin@plantweb.vn")
    .input("hash", sql.NVarChar, adminHash)
    .query(`IF NOT EXISTS (SELECT 1 FROM Users WHERE email='admin@plantweb.vn')
            INSERT INTO Users (name,email,password_hash,role) VALUES (@name,@email,@hash,'admin')`);

  await pool.request()
    .input("name", sql.NVarChar, "Nguyễn Văn A").input("email", sql.NVarChar, "demo@plantweb.vn")
    .input("hash", sql.NVarChar, demoHash)
    .query(`IF NOT EXISTS (SELECT 1 FROM Users WHERE email='demo@plantweb.vn')
            INSERT INTO Users (name,email,password_hash,role) VALUES (@name,@email,@hash,'customer')`);

  console.log("✅ Users seeded");

  // ── Categories ─────────────────────────────────────────────
  const categories = [
    { name: "Bonsai", image: "https://images.unsplash.com/photo-1613143525642-45e079c65692?w=500&auto=format&fit=crop", subs: ["Bonsai Indoor", "Bonsai Mini"] },
    { name: "Xương rồng", image: "https://images.unsplash.com/photo-1459411552884-841db9b3ce2a?w=500&auto=format&fit=crop", subs: ["Sen đá", "Xương rồng mini"] },
    { name: "Cây leo", image: "https://images.unsplash.com/photo-1599839619722-39751411ea63?w=500&auto=format&fit=crop", subs: ["Cẩm cù", "Trầu bà"] },
    { name: "Sen đá", image: "https://images.unsplash.com/photo-1446071103084-22578be4bd07?w=500&auto=format&fit=crop", subs: ["Echeveria", "Haworthia"] },
    { name: "Hạt giống", image: "https://images.unsplash.com/photo-1594968411036-3a7cbab22fdb?w=500&auto=format&fit=crop", subs: ["Hạt hoa", "Hạt rau"] },
    { name: "Quà tặng", image: "https://plus.unsplash.com/premium_photo-1675865396004-c7b8640bf4ad?w=500&auto=format&fit=crop", subs: ["Set quà", "Chậu quà tặng"] },
    { name: "Cây trong nhà", image: "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=500&auto=format&fit=crop", subs: [] },
  ];

  const catIds = {};
  for (const cat of categories) {
    const existing = await pool.request().input("name", sql.NVarChar, cat.name).query("SELECT id FROM Categories WHERE name=@name");
    let catId;
    if (existing.recordset.length > 0) {
      catId = existing.recordset[0].id;
    } else {
      const r = await pool.request().input("name", sql.NVarChar, cat.name).input("image", sql.NVarChar, cat.image)
        .query("INSERT INTO Categories (name, image) OUTPUT INSERTED.id VALUES (@name, @image)");
      catId = r.recordset[0].id;
      for (const sub of cat.subs) {
        await pool.request().input("catId", sql.Int, catId).input("sub", sql.NVarChar, sub)
          .query("INSERT INTO CategorySubcategories (category_id, name) VALUES (@catId, @sub)");
      }
    }
    catIds[cat.name] = catId;
  }
  console.log("✅ Categories seeded");

  // ── Products ───────────────────────────────────────────────
  const products = [
    {
      title: "Cẩm Cù Linearis", price: 350000, originalPrice: 450000, discount: "22%",
      description: "Với những chiếc lá thuôn dài mềm mại như rèm cửa tự nhiên, Cẩm Cù Linearis là loài cây độc đáo và mang giá trị trang trí cao.",
      imageUrl: "https://images.unsplash.com/photo-1598531405108-9df5156aeeff?q=80&w=500&auto=format&fit=crop",
      category: "Cây leo", inStock: true,
      bio: "Cẩm Cù Linearis (Hoya linearis) có nguồn gốc từ vùng Himalaya. Nhiệt độ lý tưởng: 15-25°C.",
      images: [
        "https://images.unsplash.com/photo-1598531405108-9df5156aeeff?q=80&w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1614594975525-e45190c55d40?q=80&w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1604762512698-b80c10b7194f?q=80&w=800&auto=format&fit=crop",
      ],
      careGuide: [
        { title: "Tưới nước hàng tuần", content: "Cẩm Cù ưa thích độ ẩm trung bình. Tưới nước 1-2 lần mỗi tuần." },
        { title: "Yêu cầu ánh sáng", content: "Phát triển tốt nhất dưới ánh sáng gián tiếp cường độ trung bình đến sáng." },
        { title: "Độ ẩm", content: "Loài cây này ưa môi trường ẩm ướt. Phun sương thường xuyên." },
      ],
    },
    {
      title: "Sứ Thái (Adenium)", price: 280000, originalPrice: 350000, discount: "20%",
      description: "Sứ Thái hay còn gọi là Hoa sứ sa mạc, nổi bật với thân cây phình to độc đáo và những bông hoa sặc sỡ rực rỡ.",
      imageUrl: "https://images.unsplash.com/photo-1644754593457-fe5af3f4eeb1?q=80&w=500&auto=format&fit=crop",
      category: "Bonsai", inStock: true,
      bio: "Adenium obesum có nguồn gốc từ vùng Sahel châu Phi. Cây nổi bật với phần gốc phình to dự trữ nước.",
      images: ["https://images.unsplash.com/photo-1644754593457-fe5af3f4eeb1?q=80&w=800&auto=format&fit=crop"],
      careGuide: [
        { title: "Tưới nước", content: "Tưới khi đất khô hoàn toàn. Mùa đông giảm còn 2 tuần/lần." },
        { title: "Ánh sáng", content: "Cần nhiều ánh sáng trực tiếp, ít nhất 6 giờ/ngày." },
      ],
    },
    {
      title: "Đa Búp Đỏ (Ficus Twilight)", price: 320000, originalPrice: 400000, discount: "20%",
      description: "Đa Búp Đỏ được yêu thích nhờ lá non màu đỏ đồng nổi bật, tạo điểm nhấn tuyệt vời cho mọi không gian.",
      imageUrl: "https://images.unsplash.com/photo-1612363148951-87a419fc77bd?q=80&w=500&auto=format&fit=crop",
      category: "Cây trong nhà", inStock: true,
      images: ["https://images.unsplash.com/photo-1612363148951-87a419fc77bd?q=80&w=800&auto=format&fit=crop"],
      careGuide: [{ title: "Tưới nước", content: "Tưới khi lớp đất mặt khô 2-3cm." }],
    },
    {
      title: "Lẻ Bạn (Rhoeo)", price: 150000,
      description: "Cây Lẻ Bạn có lá hai màu đặc trưng: mặt trên xanh, mặt dưới tím, dễ trồng.",
      imageUrl: "https://images.unsplash.com/photo-1599824641392-58137351df70?q=80&w=500&auto=format&fit=crop",
      category: "Cây trong nhà", inStock: true,
      images: ["https://images.unsplash.com/photo-1599824641392-58137351df70?q=80&w=800&auto=format&fit=crop"],
      careGuide: [{ title: "Tưới nước", content: "Giữ đất ẩm vừa, tưới 2-3 lần/tuần." }],
    },
    {
      title: "Đuôi Công (Ctenanthe)", price: 250000, originalPrice: 320000, discount: "22%",
      description: "Ctenanthe hay Đuôi Công có lá hình bầu dục với hoa văn sọc xanh-trắng đẹp mắt, mặt dưới lá tím đậm.",
      imageUrl: "https://images.unsplash.com/photo-1565545648873-1f19d0dd41ae?q=80&w=500&auto=format&fit=crop",
      category: "Cây trong nhà", inStock: true,
      images: ["https://images.unsplash.com/photo-1565545648873-1f19d0dd41ae?q=80&w=800&auto=format&fit=crop"],
      careGuide: [{ title: "Tưới nước", content: "Giữ đất ẩm đều." }],
    },
    {
      title: "Tiểu Cảnh Ngọc Bích", price: 420000, originalPrice: 550000, discount: "24%",
      description: "Tiểu cảnh terrarium với cây ngọc bích được thiết kế tinh tế trong bình thủy tinh.",
      imageUrl: "https://images.unsplash.com/photo-1595126744865-c9cb6b09335e?w=500&auto=format&fit=crop",
      category: "Quà tặng", inStock: true,
      images: ["https://images.unsplash.com/photo-1595126744865-c9cb6b09335e?w=800&auto=format&fit=crop"],
      careGuide: [],
    },
    {
      title: "Si Bông (Ficus Benjamina)", price: 380000, originalPrice: 480000, discount: "21%",
      description: "Si Bông là cây cảnh nội thất cổ điển, tán lá xanh mướt, khả năng lọc không khí tuyệt vời.",
      imageUrl: "https://plus.unsplash.com/premium_photo-1664188301569-825dfa2fb376?w=500&auto=format&fit=crop",
      category: "Cây trong nhà", inStock: true,
      images: ["https://plus.unsplash.com/premium_photo-1664188301569-825dfa2fb376?w=800&auto=format&fit=crop"],
      careGuide: [],
    },
    {
      title: "Cây Chân Ngỗng (Syngonium)", price: 180000, originalPrice: 230000, discount: "22%",
      description: "Syngonium có lá hình mũi tên đặc trưng, nhiều biến thể màu sắc, dễ trồng.",
      imageUrl: "https://images.unsplash.com/photo-1600329437158-b0a01a3bd6ea?w=500&auto=format&fit=crop",
      category: "Cây leo", inStock: true,
      images: ["https://images.unsplash.com/photo-1600329437158-b0a01a3bd6ea?w=800&auto=format&fit=crop"],
      careGuide: [],
    },
    {
      title: "Cúc Xanh (Chlorophytum)", price: 120000,
      description: "Chlorophytum Lemon hay Cúc Xanh là cây lọc không khí hàng đầu, cực kỳ dễ trồng.",
      imageUrl: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=500&auto=format&fit=crop",
      category: "Cây trong nhà", inStock: true,
      images: ["https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=500&auto=format&fit=crop"],
      careGuide: [],
    },
    {
      title: "Nha Đam (Aloe Vera)", price: 90000,
      description: "Nha Đam có nhiều công dụng từ làm đẹp đến chữa bỏng nhẹ, dễ trồng và chịu hạn tốt.",
      imageUrl: "https://images.unsplash.com/photo-1596547609652-9fc5b8cb4000?w=500&auto=format&fit=crop",
      category: "Xương rồng", inStock: true,
      images: ["https://images.unsplash.com/photo-1596547609652-9fc5b8cb4000?w=500&auto=format&fit=crop"],
      careGuide: [],
    },
    {
      title: "Cau Vàng (Areca Palm)", price: 450000, originalPrice: 580000, discount: "22%",
      description: "Cau Vàng mang vẻ đẹp nhiệt đới sang trọng, tán lá xoè rộng giúp không gian thoáng đãng.",
      imageUrl: "https://images.unsplash.com/photo-1600411330366-9ab505c21df3?w=500&auto=format&fit=crop",
      category: "Cây trong nhà", inStock: true,
      images: ["https://images.unsplash.com/photo-1600411330366-9ab505c21df3?w=500&auto=format&fit=crop"],
      careGuide: [],
    },
    {
      title: "Lưỡi Hổ Đen (Sansevieria Black)", price: 200000, originalPrice: 260000, discount: "23%",
      description: "Lưỡi Hổ Đen là biến thể quý hiếm với lá màu xanh đen đặc biệt, cực kỳ bền bỉ và lọc không khí tốt.",
      imageUrl: "https://images.unsplash.com/photo-1601058269756-11bfafe0e5bc?w=500&auto=format&fit=crop",
      category: "Cây trong nhà", inStock: true,
      images: ["https://images.unsplash.com/photo-1601058269756-11bfafe0e5bc?w=500&auto=format&fit=crop"],
      careGuide: [],
    },
    {
      title: "Xương Rồng Peru (Cereus)", price: 170000, originalPrice: 220000, discount: "23%",
      description: "Xương rồng Peru có thân trụ xanh lam ấn tượng, ít cần chăm sóc.",
      imageUrl: "https://images.unsplash.com/photo-1459411552884-841db9b3ce2a?w=500&auto=format&fit=crop",
      category: "Xương rồng", inStock: true,
      images: ["https://images.unsplash.com/photo-1459411552884-841db9b3ce2a?w=500&auto=format&fit=crop"],
      careGuide: [],
    },
  ];

  for (const p of products) {
    const existing = await pool.request().input("title", sql.NVarChar, p.title).query("SELECT id FROM Products WHERE title=@title");
    if (existing.recordset.length > 0) continue;

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
      .query(`INSERT INTO Products (title,price,original_price,discount,description,image_url,category_id,bio,in_stock)
              OUTPUT INSERTED.id VALUES (@title,@price,@originalPrice,@discount,@description,@imageUrl,@categoryId,@bio,@inStock)`);

    const productId = result.recordset[0].id;

    for (let i = 0; i < p.images.length; i++) {
      await pool.request().input("pid", sql.Int, productId).input("url", sql.NVarChar, p.images[i]).input("sort", sql.Int, i)
        .query("INSERT INTO ProductImages (product_id,url,sort_order) VALUES (@pid,@url,@sort)");
    }
    for (let i = 0; i < p.careGuide.length; i++) {
      await pool.request().input("pid", sql.Int, productId).input("title2", sql.NVarChar, p.careGuide[i].title)
        .input("content", sql.NVarChar, p.careGuide[i].content).input("sort", sql.Int, i)
        .query("INSERT INTO CareGuides (product_id,title,content,sort_order) VALUES (@pid,@title2,@content,@sort)");
    }
  }
  console.log("✅ Products seeded");

  // ── Planters ───────────────────────────────────────────────
  const planters = [
    { name: "Chậu Gốm Trắng Trơn", material: "Gốm sứ", price: 85000, imageUrl: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=400&auto=format&fit=crop", inStock: true, sizes: ["S (10cm)", "M (15cm)", "L (20cm)"] },
    { name: "Chậu Xi Măng Xám Tối Giản", material: "Xi măng", price: 120000, imageUrl: "https://images.unsplash.com/photo-1416879598555-081e6ae76d05?w=400&auto=format&fit=crop", inStock: true, sizes: ["S (12cm)", "M (18cm)", "L (25cm)"] },
    { name: "Chậu Nhựa Đen Thoát Nước", material: "Nhựa PP", price: 35000, imageUrl: "https://images.unsplash.com/photo-1459411552884-841db9b3ce2a?w=400&auto=format&fit=crop", inStock: true, sizes: ["S (8cm)", "M (12cm)", "L (16cm)", "XL (20cm)"] },
    { name: "Bình Thủy Tinh Terrarium", material: "Thủy tinh borosilicate", price: 180000, imageUrl: "https://images.unsplash.com/photo-1595126744865-c9cb6b09335e?w=400&auto=format&fit=crop", inStock: true, sizes: ["Mini (8cm)", "Medium (15cm)", "Large (25cm)"] },
    { name: "Chậu Gỗ Teak Handmade", material: "Gỗ teak", price: 250000, imageUrl: "https://images.unsplash.com/photo-1476362555312-ab9e108a0b7e?w=400&auto=format&fit=crop", inStock: false, sizes: ["S (15cm)", "M (22cm)"] },
    { name: "Chậu Đất Nung Mộc Nâu", material: "Đất nung", price: 65000, imageUrl: "https://images.unsplash.com/photo-1598531405108-9df5156aeeff?w=400&auto=format&fit=crop", inStock: true, sizes: ["S (10cm)", "M (14cm)", "L (18cm)"] },
  ];

  for (const pl of planters) {
    const existing = await pool.request().input("name", sql.NVarChar, pl.name).query("SELECT id FROM Planters WHERE name=@name");
    if (existing.recordset.length > 0) continue;
    const r = await pool.request()
      .input("name", sql.NVarChar, pl.name).input("material", sql.NVarChar, pl.material)
      .input("price", sql.Decimal(18, 2), pl.price).input("imageUrl", sql.NVarChar, pl.imageUrl)
      .input("inStock", sql.Bit, pl.inStock)
      .query("INSERT INTO Planters (name,material,price,image_url,in_stock) OUTPUT INSERTED.id VALUES (@name,@material,@price,@imageUrl,@inStock)");
    const plId = r.recordset[0].id;
    for (const s of pl.sizes) {
      await pool.request().input("pid", sql.Int, plId).input("size", sql.NVarChar, s)
        .query("INSERT INTO PlanterSizes (planter_id,size_label) VALUES (@pid,@size)");
    }
  }
  console.log("✅ Planters seeded");

  // ── Blog Posts ─────────────────────────────────────────────
  const blogs = [
    { title: "8 Loại Cây Ít Tốn Công Chăm Sóc Tốt Nhất Cho Người Bận Rộn", image: "https://images.unsplash.com/photo-1416879598555-081e6ae76d05?w=800&auto=format&fit=crop", excerpt: "Bạn muốn có cây xanh trong nhà nhưng không có nhiều thời gian?", category: "Chăm sóc cây", readTime: "5 phút", tags: "cây dễ trồng,người bận rộn,cây văn phòng", featured: true, date: "2026-03-01", content: "Top 8 loại cây ít cần chăm sóc..." },
    { title: "Những Cây Lọc Không Khí Bạn Nên Mang Về Nhà Ngay Hôm Nay", image: "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=800&auto=format&fit=crop", excerpt: "NASA đã nghiên cứu và chỉ ra nhiều loài cây có khả năng lọc không khí tuyệt vời.", category: "Sức khỏe", readTime: "4 phút", tags: "lọc không khí,sức khỏe,NASA", featured: false, date: "2026-02-20", content: "Top 5 cây lọc không khí..." },
    { title: "Cách Phối Cây Cảnh Để Trang Trí Phòng Khách Như Designer", image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&auto=format&fit=crop", excerpt: "Bí quyết bố trí cây cảnh theo nguyên tắc tam giác và luật số lẻ.", category: "Trang trí", readTime: "6 phút", tags: "trang trí,interior,phong cách sống", featured: false, date: "2026-02-10", content: "Trang trí với cây xanh..." },
    { title: "Hướng Dẫn Đất Trồng Cho Từng Loại Cây: Bí Quyết Từ Chuyên Gia", image: "https://images.unsplash.com/photo-1416879598555-081e6ae76d05?w=800&auto=format&fit=crop", excerpt: "Đất trồng phù hợp là yếu tố quyết định 70% sự phát triển của cây.", category: "Chăm sóc cây", readTime: "7 phút", tags: "đất trồng,chăm sóc,kỹ thuật", featured: false, date: "2026-01-25", content: "Hướng dẫn chọn đất trồng..." },
    { title: "Cây Phong Thủy Mang Tài Lộc Vào Nhà: Những Điều Cần Biết", image: "https://images.unsplash.com/photo-1600411330366-9ab505c21df3?w=800&auto=format&fit=crop", excerpt: "Theo phong thủy, một số loài cây không chỉ đẹp mà còn thu hút năng lượng tích cực.", category: "Phong thủy", readTime: "5 phút", tags: "phong thủy,tài lộc,ý nghĩa cây", featured: false, date: "2026-01-15", content: "Cây xanh trong phong thủy..." },
    { title: "DIY: Tự Làm Terrarium Mini Từ Chai Thủy Tinh Cũ", image: "https://images.unsplash.com/photo-1595126744865-c9cb6b09335e?w=800&auto=format&fit=crop", excerpt: "Tận dụng chai thủy tinh cũ để tạo ra khu vườn thu nhỏ xinh xắn ngay tại nhà.", category: "DIY", readTime: "8 phút", tags: "DIY,terrarium,thủ công", featured: false, date: "2026-01-05", content: "Hướng dẫn làm terrarium..." },
  ];

  for (const b of blogs) {
    const existing = await pool.request().input("title", sql.NVarChar, b.title).query("SELECT id FROM BlogPosts WHERE title=@title");
    if (existing.recordset.length > 0) continue;
    await pool.request()
      .input("title", sql.NVarChar, b.title).input("image", sql.NVarChar, b.image)
      .input("excerpt", sql.NVarChar, b.excerpt).input("content", sql.NVarChar, b.content)
      .input("category", sql.NVarChar, b.category).input("readTime", sql.NVarChar, b.readTime)
      .input("tags", sql.NVarChar, b.tags).input("featured", sql.Bit, b.featured)
      .input("date", sql.Date, b.date)
      .query(`INSERT INTO BlogPosts (title,image,excerpt,content,category,read_time,tags,featured,date)
              VALUES (@title,@image,@excerpt,@content,@category,@readTime,@tags,@featured,@date)`);
  }
  console.log("✅ Blog posts seeded");

  console.log("🎉 Seed completed!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed error:", err);
  process.exit(1);
});
