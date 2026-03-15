import type { Product, Category, BlogPost, Order, Review, TeamMember } from "../types";

export interface Planter {
  id: string;
  name: string;
  material: string;
  price: number;
  imageUrl: string;
  sizes: string[];
  inStock: boolean;
}

export const categories: Category[] = [
  { id: "1", name: "Bonsai", image: "https://images.unsplash.com/photo-1613143525642-45e079c65692?w=500&auto=format&fit=crop", subcategories: ["Bonsai Indoor", "Bonsai Mini"] },
  { id: "2", name: "Xương rồng", image: "https://images.unsplash.com/photo-1459411552884-841db9b3ce2a?w=500&auto=format&fit=crop", subcategories: ["Sen đá", "Xương rồng mini"] },
  { id: "3", name: "Cây leo", image: "https://images.unsplash.com/photo-1599839619722-39751411ea63?w=500&auto=format&fit=crop", subcategories: ["Cẩm cù", "Trầu bà"] },
  { id: "4", name: "Sen đá", image: "https://images.unsplash.com/photo-1446071103084-22578be4bd07?w=500&auto=format&fit=crop", subcategories: ["Echeveria", "Haworthia"] },
  { id: "5", name: "Hạt giống", image: "https://images.unsplash.com/photo-1594968411036-3a7cbab22fdb?w=500&auto=format&fit=crop", subcategories: ["Hạt hoa", "Hạt rau"] },
  { id: "6", name: "Quà tặng", image: "https://plus.unsplash.com/premium_photo-1675865396004-c7b8640bf4ad?w=500&auto=format&fit=crop", subcategories: ["Set quà", "Chậu quà tặng"] },
];

export const products: Product[] = [
  {
    id: "1",
    title: "Cẩm Cù Linearis",
    price: 350000,
    originalPrice: 450000,
    discount: "22%",
    description: "Với những chiếc lá thuôn dài mềm mại như rèm cửa tự nhiên, Cẩm Cù Linearis là một loài cây trồng trong nhà độc đáo và mang giá trị trang trí cao, phù hợp cho không gian sống hiện đại.",
    images: [
      "https://images.unsplash.com/photo-1598531405108-9df5156aeeff?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1614594975525-e45190c55d40?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1604762512698-b80c10b7194f?q=80&w=800&auto=format&fit=crop",
    ],
    imageUrl: "https://images.unsplash.com/photo-1598531405108-9df5156aeeff?q=80&w=500&auto=format&fit=crop",
    category: "Cây leo",
    careGuide: [
      { title: "Tưới nước hàng tuần", content: "Cẩm Cù ưa thích độ ẩm trung bình. Tưới nước 1-2 lần mỗi tuần, để bề mặt đất khô khoảng 5cm trước khi tưới lại. Vào mùa đông, giảm lượng nước tưới. Cây không chịu được khô hạn kéo dài, dễ làm cháy mép lá." },
      { title: "Yêu cầu ánh sáng", content: "Cây phát triển tốt nhất dưới ánh sáng gián tiếp cường độ trung bình đến sáng. Cây có thể chịu được bóng râm một phần nhưng ánh nắng mặt trời trực tiếp có thể làm phai màu lá và cháy sém." },
      { title: "Độ ẩm", content: "Loài cây này ưa môi trường ẩm ướt. Bạn có thể tăng độ ẩm bằng cách phun sương thường xuyên hoặc đặt cây gần khay sỏi có nước. Cây rất thích hợp đặt trong các khu vực có độ ẩm cao như phòng tắm có đủ sáng." },
    ],
    bio: "Cẩm Cù Linearis (Hoya linearis) là loài cây thuộc họ Apocynaceae, có nguồn gốc từ vùng Himalaya. Cây có dạng thân rủ, lá mảnh dài, hoa trắng hương thơm nhẹ. Nhiệt độ lý tưởng: 15-25°C.",
  },
  {
    id: "2",
    title: "Sứ Thái (Adenium)",
    price: 280000,
    originalPrice: 350000,
    discount: "20%",
    description: "Sứ Thái hay còn gọi là Hoa sứ sa mạc, nổi bật với thân cây phình to độc đáo và những bông hoa sặc sỡ rực rỡ.",
    images: [
      "https://images.unsplash.com/photo-1644754593457-fe5af3f4eeb1?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1604762512697-b9628286f78f?q=80&w=800&auto=format&fit=crop",
    ],
    imageUrl: "https://images.unsplash.com/photo-1644754593457-fe5af3f4eeb1?q=80&w=500&auto=format&fit=crop",
    category: "Bonsai",
    careGuide: [
      { title: "Tưới nước", content: "Tưới khi đất khô hoàn toàn. Trong mùa sinh trưởng tưới 1 lần/tuần, mùa đông giảm còn 2 tuần/lần." },
      { title: "Ánh sáng", content: "Cần nhiều ánh sáng trực tiếp, ít nhất 6 giờ/ngày." },
    ],
    bio: "Adenium obesum, thường gọi là Sứ Thái hay Hoa Hồng Sa Mạc, có nguồn gốc từ vùng Sahel châu Phi. Cây nổi bật với phần gốc phình to (caudex) dự trữ nước.",
  },
  {
    id: "3",
    title: "Đa Búp Đỏ (Ficus Twilight)",
    price: 320000,
    originalPrice: 400000,
    discount: "20%",
    description: "Đa Búp Đỏ là cây cảnh nội thất được yêu thích nhờ lá non màu đỏ đồng nổi bật, tạo điểm nhấn tuyệt vời cho mọi không gian.",
    images: [
      "https://images.unsplash.com/photo-1612363148951-87a419fc77bd?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1597055181300-3faec167cb44?q=80&w=800&auto=format&fit=crop",
    ],
    imageUrl: "https://images.unsplash.com/photo-1612363148951-87a419fc77bd?q=80&w=500&auto=format&fit=crop",
    category: "Cây trong nhà",
    careGuide: [
      { title: "Tưới nước", content: "Tưới khi lớp đất mặt khô 2-3cm, khoảng 2-3 lần/tuần vào mùa hè." },
      { title: "Ánh sáng", content: "Thích ánh sáng gián tiếp sáng, tránh nắng trực tiếp gắt." },
    ],
  },
  {
    id: "4",
    title: "Lẻ Bạn (Rhoeo)",
    price: 150000,
    description: "Cây Lẻ Bạn có lá hai màu đặc trưng: mặt trên xanh, mặt dưới tím, dễ trồng và phù hợp cho người mới bắt đầu.",
    images: [
      "https://images.unsplash.com/photo-1599824641392-58137351df70?q=80&w=800&auto=format&fit=crop",
    ],
    imageUrl: "https://images.unsplash.com/photo-1599824641392-58137351df70?q=80&w=500&auto=format&fit=crop",
    category: "Cây trong nhà",
    careGuide: [
      { title: "Tưới nước", content: "Giữ đất ẩm vừa, tưới 2-3 lần/tuần." },
    ],
  },
  {
    id: "5",
    title: "Đuôi Công (Ctenanthe)",
    price: 250000,
    originalPrice: 320000,
    discount: "22%",
    description: "Ctenanthe hay Đuôi Công có lá hình bầu dục với hoa văn sọc xanh-trắng đẹp mắt, mặt dưới lá tím đậm.",
    images: [
      "https://images.unsplash.com/photo-1565545648873-1f19d0dd41ae?q=80&w=800&auto=format&fit=crop",
    ],
    imageUrl: "https://images.unsplash.com/photo-1565545648873-1f19d0dd41ae?q=80&w=500&auto=format&fit=crop",
    category: "Cây trong nhà",
    careGuide: [
      { title: "Tưới nước", content: "Giữ đất ẩm đều, không để khô quá." },
      { title: "Độ ẩm", content: "Cần độ ẩm cao, nên phun sương thường xuyên." },
    ],
  },
  {
    id: "6",
    title: "Tiểu Cảnh Ngọc Bích",
    price: 420000,
    originalPrice: 550000,
    discount: "24%",
    description: "Tiểu cảnh terrarium với cây ngọc bích (Jade Plant) được thiết kế tinh tế trong bình thủy tinh, phù hợp làm quà tặng hoặc trang trí bàn làm việc.",
    images: [
      "https://images.unsplash.com/photo-1595126744865-c9cb6b09335e?w=800&auto=format&fit=crop",
    ],
    imageUrl: "https://images.unsplash.com/photo-1595126744865-c9cb6b09335e?w=500&auto=format&fit=crop",
    category: "Quà tặng",
  },
  {
    id: "7",
    title: "Si Bông (Ficus Benjamina)",
    price: 380000,
    originalPrice: 480000,
    discount: "21%",
    description: "Ficus Benjamina hay Si Bông là cây cảnh nội thất cổ điển, có tán lá xanh mướt rám nắng, khả năng lọc không khí tuyệt vời.",
    images: [
      "https://plus.unsplash.com/premium_photo-1664188301569-825dfa2fb376?w=800&auto=format&fit=crop",
    ],
    imageUrl: "https://plus.unsplash.com/premium_photo-1664188301569-825dfa2fb376?w=500&auto=format&fit=crop",
    category: "Cây trong nhà",
  },
  {
    id: "8",
    title: "Cây Chân Ngỗng (Syngonium)",
    price: 180000,
    originalPrice: 230000,
    discount: "22%",
    description: "Syngonium có lá hình mũi tên đặc trưng, nhiều biến thể màu sắc, dễ trồng dạng leo hoặc rủ.",
    images: [
      "https://images.unsplash.com/photo-1600329437158-b0a01a3bd6ea?w=800&auto=format&fit=crop",
    ],
    imageUrl: "https://images.unsplash.com/photo-1600329437158-b0a01a3bd6ea?w=500&auto=format&fit=crop",
    category: "Cây leo",
  },
  {
    id: "9",
    title: "Cúc Xanh (Chlorophytum)",
    price: 120000,
    description: "Chlorophytum Lemon hay Cúc Xanh là cây lọc không khí hàng đầu, cực kỳ dễ trồng và phù hợp cho người mới.",
    images: [
      "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=500&auto=format&fit=crop",
    ],
    imageUrl: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=500&auto=format&fit=crop",
    category: "Cây trong nhà",
  },
  {
    id: "10",
    title: "Nha Đam (Aloe Vera)",
    price: 90000,
    description: "Nha Đam có nhiều công dụng từ làm đẹp đến chữa bỏng nhẹ, dễ trồng và chịu hạn tốt.",
    images: [
      "https://images.unsplash.com/photo-1596547609652-9fc5b8cb4000?w=500&auto=format&fit=crop",
    ],
    imageUrl: "https://images.unsplash.com/photo-1596547609652-9fc5b8cb4000?w=500&auto=format&fit=crop",
    category: "Xương rồng",
  },
  {
    id: "11",
    title: "Cau Vàng (Areca Palm)",
    price: 450000,
    originalPrice: 580000,
    discount: "22%",
    description: "Cau Vàng mang vẻ đẹp nhiệt đới sang trọng, tán lá xoè rộng giúp không gian thoáng đãng và tươi mát.",
    images: [
      "https://images.unsplash.com/photo-1600411330366-9ab505c21df3?w=500&auto=format&fit=crop",
    ],
    imageUrl: "https://images.unsplash.com/photo-1600411330366-9ab505c21df3?w=500&auto=format&fit=crop",
    category: "Cây trong nhà",
  },
  {
    id: "12",
    title: "Lưỡi Hổ Đen (Sansevieria Black)",
    price: 200000,
    originalPrice: 260000,
    discount: "23%",
    description: "Lưỡi Hổ Đen là biến thể quý hiếm với lá màu xanh đen đặc biệt, cực kỳ bền bỉ và lọc không khí tốt.",
    images: [
      "https://images.unsplash.com/photo-1601058269756-11bfafe0e5bc?w=500&auto=format&fit=crop",
    ],
    imageUrl: "https://images.unsplash.com/photo-1601058269756-11bfafe0e5bc?w=500&auto=format&fit=crop",
    category: "Cây trong nhà",
  },
  {
    id: "13",
    title: "Xương Rồng Peru (Cereus)",
    price: 170000,
    originalPrice: 220000,
    discount: "23%",
    description: "Xương rồng Peru có thân trụ xanh lam ấn tượng, ít cần chăm sóc, phù hợp cho không gian tối giản.",
    images: [
      "https://images.unsplash.com/photo-1459411552884-841db9b3ce2a?w=500&auto=format&fit=crop",
    ],
    imageUrl: "https://images.unsplash.com/photo-1459411552884-841db9b3ce2a?w=500&auto=format&fit=crop",
    category: "Xương rồng",
  },
];

export const blogPosts: BlogPost[] = [
  {
    id: "1",
    title: "8 Loại Cây Ít Tốn Công Chăm Sóc Tốt Nhất Cho Người Bận Rộn",
    image: "https://images.unsplash.com/photo-1416879598555-081e6ae76d05?w=500&auto=format&fit=crop",
    excerpt: "Bạn muốn có cây xanh trong nhà nhưng không có nhiều thời gian? Đây là 8 lựa chọn hoàn hảo.",
    date: "2026-03-01",
  },
  {
    id: "2",
    title: "Những Cây Lọc Không Khí Bạn Nên Mang Về Nhà Ngay Hôm Nay",
    image: "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=500&auto=format&fit=crop",
    excerpt: "NASA đã nghiên cứu và chỉ ra nhiều loài cây có khả năng lọc không khí tuyệt vời. Cùng tìm hiểu!",
    date: "2026-02-20",
  },
];

// For navbar search
export const searchDatabase = products.map((p) => ({
  id: p.id,
  title: p.title,
  category: p.category,
}));

// Extended blog posts for /blog and /blog/:id
export const blogPostsFull: BlogPost[] = [
  {
    id: "1",
    title: "8 Loại Cây Ít Tốn Công Chăm Sóc Tốt Nhất Cho Người Bận Rộn",
    image: "https://images.unsplash.com/photo-1416879598555-081e6ae76d05?w=800&auto=format&fit=crop",
    excerpt: "Bạn muốn có cây xanh trong nhà nhưng không có nhiều thời gian? Đây là 8 lựa chọn hoàn hảo.",
    date: "2026-03-01",
    category: "Chăm sóc cây",
    readTime: "5 phút",
    content: `Trong cuộc sống bận rộn hiện đại, việc trồng cây xanh trong nhà không chỉ giúp làm đẹp không gian mà còn cải thiện sức khỏe tinh thần. Dưới đây là 8 loại cây lý tưởng cho người bận rộn:\n\n**1. Lưỡi Hổ (Sansevieria)**\nCây lưỡi hổ có thể sống sót ngay cả khi bạn quên tưới nước hàng tuần. Chúng chịu được bóng râm và chỉ cần tưới nước khi đất khô hoàn toàn.\n\n**2. Nha Đam (Aloe Vera)**\nKhông chỉ dễ trồng mà còn có nhiều công dụng làm đẹp và chữa bỏng nhẹ. Tưới 2-3 tuần/lần là đủ.\n\n**3. Cây Kim Tiền (ZZ Plant)**\nMột trong những cây kiên cường nhất — có thể sống trong điều kiện ánh sáng yếu và ít nước.\n\n**4. Cúc Xanh (Chlorophytum)**\nHàng đầu về lọc không khí, cực kỳ dễ trồng và sinh sản nhanh.\n\n**5. Lẻ Bạn (Tradescantia)**\nMàu sắc đẹp, phát triển nhanh, chỉ cần tưới khi đất hơi khô.\n\n**6. Hồng Môn (Anthurium)**\nHoa đẹp quanh năm, chịu được phòng điều hòa tốt.\n\n**7. Trầu Bà (Pothos)**\nLeo rủ đẹp, chịu được thiếu sáng và ít nước — lý tưởng cho văn phòng.\n\n**8. Xương Rồng Mini**\nGần như không cần chăm sóc, đặt cạnh cửa sổ và tưới 1 lần/tháng.`,
    tags: ["cây dễ trồng", "người bận rộn", "cây văn phòng"],
    featured: true,
  },
  {
    id: "2",
    title: "Những Cây Lọc Không Khí Bạn Nên Mang Về Nhà Ngay Hôm Nay",
    image: "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=800&auto=format&fit=crop",
    excerpt: "NASA đã nghiên cứu và chỉ ra nhiều loài cây có khả năng lọc không khí tuyệt vời. Cùng tìm hiểu!",
    date: "2026-02-20",
    category: "Sức khỏe",
    readTime: "4 phút",
    content: `Nghiên cứu nổi tiếng của NASA năm 1989 đã chứng minh rằng cây xanh có thể loại bỏ các chất độc hại trong không khí như benzene, formaldehyde và trichloroethylene.\n\n**Top 5 cây lọc không khí tốt nhất:**\n\n**1. Cau Vàng (Areca Palm)**\nHiệu quả nhất trong việc loại bỏ formaldehyde. Cần ánh sáng gián tiếp và tưới đều đặn.\n\n**2. Lưỡi Hổ (Snake Plant)**\nĐặc biệt ở chỗ nó hấp thụ CO2 và thải O2 vào ban đêm — lý tưởng đặt trong phòng ngủ.\n\n**3. Dương Xỉ Boston**\nLoại bỏ formaldehyde và xylene rất hiệu quả. Cần độ ẩm cao.\n\n**4. Thường Xuân (English Ivy)**\nGiúp giảm nấm mốc trong không khí tới 60%.\n\n**5. Cúc Xanh (Spider Plant)**\nLoại bỏ carbon monoxide cực kỳ tốt.`,
    tags: ["lọc không khí", "sức khỏe", "NASA"],
    featured: false,
  },
  {
    id: "3",
    title: "Cách Phối Cây Cảnh Để Trang Trí Phòng Khách Như Designer",
    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&auto=format&fit=crop",
    excerpt: "Bí quyết bố trí cây cảnh theo nguyên tắc tam giác và luật số lẻ để tạo không gian sống đẹp như tạp chí.",
    date: "2026-02-10",
    category: "Trang trí",
    readTime: "6 phút",
    content: `Trang trí với cây xanh không chỉ là đặt cây vào góc nhà. Có một nghệ thuật trong việc phối hợp cây cảnh để tạo ra không gian sống thực sự ấn tượng.\n\n**Nguyên tắc tam giác**\nCách sắp xếp cây theo 3 độ cao khác nhau tạo chiều sâu cho không gian.\n\n**Luật số lẻ**\nLuôn nhóm cây theo số lẻ (3, 5, 7) để tạo bố cục tự nhiên và hài hòa hơn số chẵn.\n\n**Phối màu sắc lá**\nKết hợp cây lá xanh đậm với lá xanh nhạt hoặc lá có vân để tạo tương phản đẹp mắt.`,
    tags: ["trang trí", "interior", "phong cách sống"],
    featured: false,
  },
  {
    id: "4",
    title: "Hướng Dẫn Đất Trồng Cho Từng Loại Cây: Bí Quyết Từ Chuyên Gia",
    image: "https://images.unsplash.com/photo-1416879598555-081e6ae76d05?w=800&auto=format&fit=crop",
    excerpt: "Đất trồng phù hợp là yếu tố quyết định 70% sự phát triển của cây. Tìm hiểu loại đất nào phù hợp với cây của bạn.",
    date: "2026-01-25",
    category: "Chăm sóc cây",
    readTime: "7 phút",
    content: `Nhiều người thất bại khi trồng cây không phải vì thiếu nước hay ánh sáng, mà vì dùng sai loại đất.\n\n**Đất cho xương rồng và sen đá:**\nCần đất tơi xốp, thoát nước tốt. Mix 50% đất thường + 50% cát thô/perlite.\n\n**Đất cho cây lá rộng (Monstera, Philodendron):**\nCần đất giữ ẩm tốt nhưng không bị úng. Thêm peat moss hoặc xơ dừa.\n\n**Đất cho Bonsai:**\nMix riêng với akadama, pumice, kanuma theo tỷ lệ 6:3:1.`,
    tags: ["đất trồng", "chăm sóc", "kỹ thuật"],
    featured: false,
  },
  {
    id: "5",
    title: "Cây Phong Thủy Mang Tài Lộc Vào Nhà: Những Điều Cần Biết",
    image: "https://images.unsplash.com/photo-1600411330366-9ab505c21df3?w=800&auto=format&fit=crop",
    excerpt: "Theo phong thủy, một số loài cây không chỉ đẹp mà còn thu hút năng lượng tích cực và tài lộc.",
    date: "2026-01-15",
    category: "Phong thủy",
    readTime: "5 phút",
    content: `Cây xanh trong phong thủy không chỉ là yếu tố trang trí mà còn mang ý nghĩa tâm linh sâu sắc.\n\n**Kim Tiền (Pachira aquatica):** Tượng trưng cho tài lộc, đặt góc Đông Nam nhà.\n\n**Cây Ngọc Bích (Jade Plant):** Theo phong thủy Tây, đây là cây thu hút tiền bạc.\n\n**Trúc May Mắn (Lucky Bamboo):** 3 nhánh: hạnh phúc, 5 nhánh: sức khỏe, 7 nhánh: thịnh vượng.\n\n**Cây Lưỡi Hổ (Snake Plant):** Hấp thụ năng lượng tiêu cực, bảo vệ ngôi nhà.`,
    tags: ["phong thủy", "tài lộc", "ý nghĩa cây"],
    featured: false,
  },
  {
    id: "6",
    title: "DIY: Tự Làm Terrarium Mini Từ Chai Thủy Tinh Cũ",
    image: "https://images.unsplash.com/photo-1595126744865-c9cb6b09335e?w=800&auto=format&fit=crop",
    excerpt: "Tận dụng chai thủy tinh cũ để tạo ra khu vườn thu nhỏ xinh xắn ngay tại nhà — không cần đầu bếp chuyên nghiệp!",
    date: "2026-01-05",
    category: "DIY",
    readTime: "8 phút",
    content: `Terrarium là một khu vườn thu nhỏ trong hộp thủy tinh kín hoặc hở, tạo ra hệ sinh thái tự duy trì.\n\n**Nguyên liệu cần chuẩn bị:**\n- Chai/bình thủy tinh cũ\n- Đá sỏi nhỏ (lớp thoát nước)\n- Than hoạt tính (ngăn vi khuẩn)\n- Đất rêu\n- Cây mini: moss, địa y, cây dương xỉ nhỏ\n\n**Các bước thực hiện:**\n1. Đặt lớp đá sỏi 3-4cm\n2. Rắc lớp than hoạt tính mỏng\n3. Cho đất rêu ẩm 5-7cm\n4. Trồng cây, trang trí đá/vỏ cây\n5. Xịt nước nhẹ và đậy nắp`,
    tags: ["DIY", "terrarium", "thủ công"],
    featured: false,
  },
];

// Mock orders for /profile/orders
export const mockOrders: Order[] = [
  {
    id: "PSTT-2026-00123",
    date: "2026-03-10",
    status: "delivered",
    items: [
      { id: "1", title: "Cẩm Cù Linearis", price: 350000, quantity: 1, image: "https://images.unsplash.com/photo-1598531405108-9df5156aeeff?q=80&w=500&auto=format&fit=crop", planter: "Chậu gốm trắng" },
      { id: "9", title: "Cúc Xanh (Chlorophytum)", price: 120000, quantity: 2, image: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=500&auto=format&fit=crop", planter: "Chậu nhựa đen" },
    ],
    shippingAddress: "123 Nguyễn Huệ, Quận 1, TP.HCM",
    paymentMethod: "MoMo",
    subtotal: 590000,
    shippingFee: 30000,
    total: 620000,
    trackingNumber: "GHN123456789",
    timeline: [
      { status: "Đặt hàng thành công", date: "2026-03-10 09:15", done: true },
      { status: "PlanS Thanh Tùng đã xác nhận", date: "2026-03-10 10:30", done: true },
      { status: "Đang đóng gói", date: "2026-03-10 14:00", done: true },
      { status: "Đang vận chuyển", date: "2026-03-11 08:00", done: true },
      { status: "Đã giao hàng", date: "2026-03-11 15:30", done: true },
    ],
  },
  {
    id: "PSTT-2026-00118",
    date: "2026-03-05",
    status: "shipping",
    items: [
      { id: "11", title: "Cau Vàng (Areca Palm)", price: 450000, quantity: 1, image: "https://images.unsplash.com/photo-1600411330366-9ab505c21df3?w=500&auto=format&fit=crop", planter: "Chậu xi măng xám" },
    ],
    shippingAddress: "456 Lê Lợi, Quận 3, TP.HCM",
    paymentMethod: "COD",
    subtotal: 450000,
    shippingFee: 30000,
    total: 480000,
    trackingNumber: "GHN987654321",
    timeline: [
      { status: "Đặt hàng thành công", date: "2026-03-05 11:00", done: true },
      { status: "PlanS Thanh Tùng đã xác nhận", date: "2026-03-05 12:45", done: true },
      { status: "Đang đóng gói", date: "2026-03-06 09:00", done: true },
      { status: "Đang vận chuyển", date: "2026-03-07 07:30", done: true },
      { status: "Đã giao hàng", date: "", done: false },
    ],
  },
  {
    id: "PSTT-2026-00099",
    date: "2026-02-20",
    status: "cancelled",
    items: [
      { id: "6", title: "Tiểu Cảnh Ngọc Bích", price: 420000, quantity: 1, image: "https://images.unsplash.com/photo-1595126744865-c9cb6b09335e?w=500&auto=format&fit=crop", planter: "Hộp thủy tinh" },
    ],
    shippingAddress: "789 Trần Hưng Đạo, Quận 5, TP.HCM",
    paymentMethod: "VNPay",
    subtotal: 420000,
    shippingFee: 30000,
    total: 450000,
    timeline: [
      { status: "Đặt hàng thành công", date: "2026-02-20 16:00", done: true },
      { status: "Đã hủy", date: "2026-02-20 17:00", done: true },
    ],
  },
];

// Mock reviews for products
export const mockReviews: Review[] = [
  {
    id: "r1",
    productId: "1",
    userName: "Nguy**n T. H.",
    avatar: "https://i.pravatar.cc/48?img=1",
    rating: 5,
    title: "Cây đẹp hơn mong đợi!",
    content: "Nhận cây trong tình trạng rất tốt, được đóng gói cẩn thận. Lá mềm mại và màu sắc đúng như ảnh. Giao hàng nhanh, shop còn gửi kèm hướng dẫn chăm sóc chi tiết.",
    images: [
      "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=400&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1614594975525-e45190c55d40?q=80&w=400&auto=format&fit=crop",
    ],
    tags: ["Đúng mô tả", "Đóng gói tốt", "Cây khỏe"],
    date: "2026-03-08",
    helpful: 24,
    verified: true,
  },
  {
    id: "r2",
    productId: "1",
    userName: "Minh T. L.",
    avatar: "https://i.pravatar.cc/48?img=5",
    rating: 5,
    title: "Mua lần 2 vẫn không thất vọng",
    content: "Đã mua lần đầu tháng trước, cây phát triển rất tốt nên quyết định mua thêm một chậu nữa. Shop tư vấn nhiệt tình, cây giao đến còn bám rễ tốt.",
    images: [],
    tags: ["Giao nhanh", "Cây khỏe", "Tư vấn tốt"],
    date: "2026-03-01",
    helpful: 15,
    verified: true,
  },
  {
    id: "r3",
    productId: "1",
    userName: "Lan P. T.",
    avatar: "https://i.pravatar.cc/48?img=9",
    rating: 4,
    title: "Cây đẹp, giao hơi chậm một xíu",
    content: "Cây nhận được rất đẹp và khỏe mạnh. Chỉ tiếc là giao hơi trễ hơn dự kiến 1 ngày. Nhưng nhìn chung vẫn hài lòng và sẽ ủng hộ shop tiếp.",
    images: [],
    tags: ["Đúng mô tả", "Cây khỏe"],
    date: "2026-02-25",
    helpful: 8,
    verified: true,
  },
];

// Team members for /about
export const teamMembers: TeamMember[] = [
  {
    name: "Phạm Anh Tuấn",
    role: "Founder & Chuyên gia cây cảnh",
    image: "https://images.unsplash.com/photo-1556157382-97eda2d62296?w=400&auto=format&fit=crop&face",
    bio: "15 năm kinh nghiệm với cây cảnh nhiệt đới. Tốt nghiệp Đại học Nông Lâm TP.HCM.",
  },
  {
    name: "Lê Thị Bảo Châu",
    role: "Giám đốc Vườn Ươm",
    image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&auto=format&fit=crop&face",
    bio: "Chuyên gia về kỹ thuật nhân giống và chăm sóc cây xanh bền vững.",
  },
  {
    name: "Nguyễn Minh Khoa",
    role: "Thiết kế Cảnh quan",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&face",
    bio: "Kiến trúc sư cảnh quan với nhiều dự án greenspace cho văn phòng và resort.",
  },
  {
    name: "Trần Hồng Nhung",
    role: "Customer Experience",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&face",
    bio: "Đảm bảo mỗi khách hàng của PlanS Thanh Tùng đều có trải nghiệm mua sắm tốt nhất.",
  },
];

// Planters / Pots catalog
export const mockPlanters: Planter[] = [
  {
    id: "p1",
    name: "Chậu Gốm Trắng Trơn",
    material: "Gốm sứ",
    price: 85000,
    imageUrl: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=400&auto=format&fit=crop",
    sizes: ["S (10cm)", "M (15cm)", "L (20cm)"],
    inStock: true,
  },
  {
    id: "p2",
    name: "Chậu Xi Măng Xám Tối Giản",
    material: "Xi măng",
    price: 120000,
    imageUrl: "https://images.unsplash.com/photo-1416879598555-081e6ae76d05?w=400&auto=format&fit=crop",
    sizes: ["S (12cm)", "M (18cm)", "L (25cm)"],
    inStock: true,
  },
  {
    id: "p3",
    name: "Chậu Nhựa Đen Thoát Nước",
    material: "Nhựa PP",
    price: 35000,
    imageUrl: "https://images.unsplash.com/photo-1459411552884-841db9b3ce2a?w=400&auto=format&fit=crop",
    sizes: ["S (8cm)", "M (12cm)", "L (16cm)", "XL (20cm)"],
    inStock: true,
  },
  {
    id: "p4",
    name: "Bình Thủy Tinh Terrarium",
    material: "Thủy tinh borosilicate",
    price: 180000,
    imageUrl: "https://images.unsplash.com/photo-1595126744865-c9cb6b09335e?w=400&auto=format&fit=crop",
    sizes: ["Mini (8cm)", "Medium (15cm)", "Large (25cm)"],
    inStock: true,
  },
  {
    id: "p5",
    name: "Chậu Gỗ Teak Handmade",
    material: "Gỗ teak",
    price: 250000,
    imageUrl: "https://images.unsplash.com/photo-1476362555312-ab9e108a0b7e?w=400&auto=format&fit=crop",
    sizes: ["S (15cm)", "M (22cm)"],
    inStock: false,
  },
  {
    id: "p6",
    name: "Chậu Đất Nung Mộc Nâu",
    material: "Đất nung",
    price: 65000,
    imageUrl: "https://images.unsplash.com/photo-1598531405108-9df5156aeeff?w=400&auto=format&fit=crop",
    sizes: ["S (10cm)", "M (14cm)", "L (18cm)"],
    inStock: true,
  },
];

// Additional reviews for products 2, 3, 5
export const mockReviewsExtra: Review[] = [
  {
    id: "r4",
    productId: "2",
    userName: "Hùng V. T.",
    avatar: "https://i.pravatar.cc/48?img=12",
    rating: 5,
    title: "Sứ Thái cực đẹp, cần nhiều nắng!",
    content: "Cây giao đến vẫn còn hoa đang nở, màu đỏ cực rực. Shop đóng gói rất cẩn thận, cây không bị dập một cái lá nào. Đặt cạnh cửa sổ hướng nam là hoàn hảo.",
    images: [],
    tags: ["Cây khỏe", "Đúng mô tả", "Giao nhanh"],
    date: "2026-03-05",
    helpful: 11,
    verified: true,
  },
  {
    id: "r5",
    productId: "3",
    userName: "Tú A. N.",
    avatar: "https://i.pravatar.cc/48?img=20",
    rating: 4,
    title: "Lá đỏ đồng rất nổi bật",
    content: "Đặt cây giữa phòng khách, ai vào cũng hỏi cây gì vậy. Lá non đỏ đồng rất đặc biệt. Điểm trừ nhỏ là cây hơi nhỏ hơn mình nghĩ, nhưng nhìn chung vẫn rất hài lòng.",
    images: [],
    tags: ["Trang trí đẹp", "Cây khỏe"],
    date: "2026-02-28",
    helpful: 7,
    verified: true,
  },
  {
    id: "r6",
    productId: "5",
    userName: "Thu H. P.",
    avatar: "https://i.pravatar.cc/48?img=25",
    rating: 5,
    title: "Hoa văn lá siêu đẹp!",
    content: "Đuôi Công có lá hoa văn rất đẹp, giống như tranh nghệ thuật tự nhiên. Ban đêm lá còn gập lại, sáng ra lại xòe ra—rất thú vị khi quan sát. Mua thêm cho nhà rồi sẽ mua nữa.",
    images: [
      "https://images.unsplash.com/photo-1565545648873-1f19d0dd41ae?q=80&w=400&auto=format&fit=crop",
    ],
    tags: ["Đặc biệt", "Cây khỏe", "Đúng mô tả"],
    date: "2026-03-01",
    helpful: 19,
    verified: true,
  },
];

// Combined all reviews
export const allMockReviews: Review[] = [...mockReviews, ...mockReviewsExtra];
