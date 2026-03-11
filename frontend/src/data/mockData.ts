import type { Product, Category, BlogPost } from "../types";

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
