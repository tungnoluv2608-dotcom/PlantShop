import { useState, useEffect } from "react";
import { ArrowRight, CaretLeft, CaretRight } from "@phosphor-icons/react";
import { useNavigate } from "react-router";

const slides = [
  {
    id: 1,
    eyebrow: "Bộ sưu tập xanh",
    title: "Trồng một mầm xanh",
    subtitle: "Gieo mầm hy vọng",
    description: "Mỗi cái cây bạn trồng không chỉ làm đẹp không gian, mà còn là một lời hứa với tương lai về một hành tinh xanh hơn.",
    image: "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?q=80&w=2069&auto=format&fit=crop",
    color: "from-[#31553a]/78 via-[#4f7f4f]/55",
    metric: "150+ giống cây",
    note: "Chọn từ cây nội thất, cây để bàn đến bộ quà tặng xanh.",
  },
  {
    id: 2,
    eyebrow: "Không gian sống",
    title: "Chạm vào thiên nhiên",
    subtitle: "Sống chậm lại",
    description: "Mang hơi thở của rừng xanh vào ngôi nhà của bạn. Hãy để sắc xanh xoa dịu tâm hồn sau những giờ làm việc căng thẳng.",
    image: "https://images.unsplash.com/photo-1463936575829-25148e1db1b8?w=2000&auto=format&fit=crop",
    color: "from-[#40592f]/76 via-[#6d8f57]/52",
    metric: "Thiết kế theo góc nhà",
    note: "Gợi ý phối cây và chậu để từng góc nhỏ đều có chiều sâu tự nhiên.",
  },
  {
    id: 3,
    eyebrow: "Quà tặng tinh tế",
    title: "Món quà từ đất mẹ",
    subtitle: "Gắn kết yêu thương",
    description: "Cây xanh là món quà ý nghĩa nhất dành tặng bản thân và những người thân yêu. Hãy cùng PlantWeb lan tỏa tình yêu thiên nhiên.",
    image: "https://images.unsplash.com/photo-1599839619722-39751411ea63?w=2000&auto=format&fit=crop",
    color: "from-[#3f4d2d]/76 via-[#7a6641]/44",
    metric: "Đóng gói theo dịp",
    note: "Tạo set quà xanh cho sinh nhật, tân gia hoặc lời cảm ơn nhẹ nhàng.",
  },
];

export function HeroBanner() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <section className="container mx-auto mt-2 px-4 py-6 md:px-12 md:py-8">
      <div className="group relative min-h-[580px] w-full overflow-hidden rounded-[32px] border border-white/50 bg-[#e5eddc] shadow-[0_42px_80px_-44px_rgba(36,53,42,0.82)] md:min-h-[640px]">
        <div 
          className="flex h-full transition-transform duration-1000 ease-in-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {slides.map((slide) => (
            <div
              key={slide.id}
              className="relative h-[580px] w-full flex-shrink-0 md:h-[640px]"
            >
              <div className="absolute inset-0 w-full h-full">
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="w-full h-full object-cover object-center"
                />
                <div className={`absolute inset-0 z-10 bg-gradient-to-r ${slide.color} via-42% to-[#20311f]/18`} />
                <div className="absolute inset-0 z-10 bg-[radial-gradient(circle_at_top_right,rgba(255,250,241,0.3),transparent_24%)]" />
                <div className="absolute inset-0 z-10 bg-[linear-gradient(180deg,rgba(18,30,20,0.04),rgba(18,30,20,0.38))]" />
              </div>

              <div className="relative z-20 grid h-full grid-cols-1 items-end gap-6 p-5 text-white md:grid-cols-[minmax(0,1.2fr)_minmax(260px,360px)] md:items-center md:p-8 lg:p-10">
                <div className="flex h-full items-center py-4 md:py-6">
                  <div className="w-full max-w-3xl rounded-[30px] border border-white/16 bg-[linear-gradient(180deg,rgba(19,34,23,0.32),rgba(19,34,23,0.16))] p-6 shadow-[0_24px_70px_-30px_rgba(11,19,13,0.9)] backdrop-blur-md md:p-8 lg:p-10">
                    <div className="mb-5 flex flex-wrap items-center gap-3 opacity-0 animate-[fadeInUp_0.8s_ease-out_forwards]">
                      <span className="inline-flex rounded-full border border-white/18 bg-white/14 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.3em] text-white/92">
                        {slide.eyebrow}
                      </span>
                      <span className="inline-flex rounded-full border border-[#f3e1b1]/35 bg-[#f4deb0]/14 px-3 py-1 text-xs font-semibold text-[#fff4d8]">
                        {slide.subtitle}
                      </span>
                    </div>
                    <h1 className="mb-5 max-w-2xl text-4xl font-black leading-[0.96] tracking-[-0.04em] text-white opacity-0 drop-shadow-lg animate-[fadeInUp_0.8s_ease-out_0.15s_forwards] md:text-6xl lg:text-7xl">
                      {slide.title}
                    </h1>
                    <p className="mb-8 max-w-xl text-base leading-7 text-white/88 opacity-0 animate-[fadeInUp_0.8s_ease-out_0.3s_forwards] md:text-lg">
                      {slide.description}
                    </p>
                    <div className="mb-8 grid max-w-xl gap-3 opacity-0 animate-[fadeInUp_0.8s_ease-out_0.45s_forwards] md:grid-cols-[auto_1fr]">
                      <div className="rounded-2xl border border-white/14 bg-black/14 px-4 py-4">
                        <p className="text-[11px] uppercase tracking-[0.28em] text-white/62">Điểm nhấn</p>
                        <p className="mt-2 text-lg font-bold text-[#fff4d6]">{slide.metric}</p>
                      </div>
                      <div className="rounded-2xl border border-white/12 bg-white/10 px-4 py-4 text-sm leading-6 text-white/82 md:text-[15px]">
                        {slide.note}
                      </div>
                    </div>
                    <div className="flex flex-col gap-3 opacity-0 animate-[fadeInUp_0.8s_ease-out_0.6s_forwards] sm:flex-row">
                      <button 
                        onClick={() => navigate("/shop")}
                        className="group/btn flex w-max cursor-pointer items-center gap-2 rounded-full bg-[#fff8eb] px-7 py-3.5 text-base font-bold text-[#24402b] shadow-xl transition-all hover:-translate-y-1 hover:bg-white hover:shadow-2xl"
                      >
                        Khám phá ngay
                        <ArrowRight size={18} weight="bold" className="transition-transform group-hover/btn:translate-x-1" />
                      </button>
                      <button
                        onClick={() => navigate("/about")}
                        className="flex w-max cursor-pointer items-center rounded-full border border-white/18 bg-white/10 px-7 py-3.5 text-base font-semibold text-white/92 backdrop-blur-sm transition-all hover:bg-white/18"
                      >
                        Xem câu chuyện PlantWeb
                      </button>
                    </div>
                  </div>
                </div>

                <div className="hidden h-full items-end justify-end md:flex">
                  <div className="mb-22 w-full max-w-[320px] rounded-[28px] border border-white/18 bg-[linear-gradient(180deg,rgba(255,251,243,0.18),rgba(255,251,243,0.08))] p-5 text-white shadow-[0_28px_80px_-40px_rgba(11,19,13,0.95)] backdrop-blur-lg">
                    <div className="mb-4 flex items-center justify-between">
                      <p className="text-[11px] uppercase tracking-[0.3em] text-white/60">PlantWeb Picks</p>
                      <p className="text-sm font-medium text-white/78">
                        {String(slide.id).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
                      </p>
                    </div>
                    <div className="overflow-hidden rounded-[22px]">
                      <img
                        src={slide.image}
                        alt={slide.title}
                        className="h-44 w-full object-cover"
                      />
                    </div>
                    <div className="mt-4">
                      <p className="text-xl font-bold">{slide.subtitle}</p>
                      <p className="mt-2 text-sm leading-6 text-white/74">
                        Gợi ý không gian xanh với tông màu và cảm xúc đồng nhất cho toàn bộ ngôi nhà.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="absolute inset-x-0 top-1/2 z-30 hidden -translate-y-1/2 justify-between px-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100 md:flex lg:px-8">
          <button
            onClick={prevSlide}
            className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border border-white/30 bg-white/16 text-white backdrop-blur-md transition-all hover:bg-white/30"
          >
            <CaretLeft size={24} weight="bold" />
          </button>
          <button
            onClick={nextSlide}
            className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border border-white/30 bg-white/16 text-white backdrop-blur-md transition-all hover:bg-white/30"
          >
            <CaretRight size={24} weight="bold" />
          </button>
        </div>

        <div className="absolute inset-x-0 bottom-0 z-30 p-4 md:p-6">
          <div className="mx-auto flex w-full max-w-[calc(100%-8px)] flex-col gap-4 rounded-[26px] border border-white/16 bg-[linear-gradient(180deg,rgba(25,38,29,0.34),rgba(25,38,29,0.2))] px-4 py-4 text-white backdrop-blur-lg md:flex-row md:items-center md:justify-between md:px-5">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                {slides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    aria-label={`Chuyển đến slide ${index + 1}`}
                    className={`cursor-pointer rounded-full transition-all duration-300 ${
                      index === currentSlide ? "h-2.5 w-10 bg-[#fff8e7]" : "h-2.5 w-2.5 bg-white/35 hover:bg-white/55"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm font-medium text-white/74">
                {String(currentSlide + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
              </span>
            </div>

            <div className="grid gap-3 md:min-w-[420px] md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <p className="text-[11px] uppercase tracking-[0.28em] text-white/56">Đang hiển thị</p>
                <p className="mt-1 text-sm font-semibold text-white/92 md:text-base">{slides[currentSlide].title}</p>
              </div>
              <div className="flex gap-2 md:hidden">
                <button
                  onClick={prevSlide}
                  className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-white/25 bg-white/12 text-white backdrop-blur-md transition-all hover:bg-white/24"
                >
                  <CaretLeft size={20} weight="bold" />
                </button>
                <button
                  onClick={nextSlide}
                  className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-white/25 bg-white/12 text-white backdrop-blur-md transition-all hover:bg-white/24"
                >
                  <CaretRight size={20} weight="bold" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
