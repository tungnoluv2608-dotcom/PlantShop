import { type FocusEvent, type KeyboardEvent, useEffect, useState } from "react";
import { ArrowRight, CaretLeft, CaretRight } from "@phosphor-icons/react";
import { useNavigate } from "react-router";

import { Button } from "@/components/ui/button";

const SLIDE_INTERVAL_MS = 6000;

const slides = [
  {
    id: 1,
    eyebrow: "Bộ sưu tập xanh",
    title: "Trồng một mầm xanh",
    subtitle: "Gieo mầm hy vọng",
    description: "Mỗi cái cây bạn trồng không chỉ làm đẹp không gian, mà còn là một lời hứa với tương lai về một hành tinh xanh hơn.",
    image: "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?q=80&w=2069&auto=format&fit=crop",
    color: "from-[#2f4f35]/72 via-[#4e7b4d]/45",
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
    color: "from-[#3a512d]/70 via-[#6a8a55]/40",
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
    color: "from-[#364528]/72 via-[#736141]/36",
    metric: "Đóng gói theo dịp",
    note: "Tạo set quà xanh cho sinh nhật, tân gia hoặc lời cảm ơn nhẹ nhàng.",
  },
];

const controlButtonClass =
  "flex items-center justify-center rounded-full border border-white/30 bg-white/15 text-white backdrop-blur-md transition-all duration-300 hover:bg-white/30 focus-visible:border-white/80 focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-0";

export function HeroBanner() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const updateMotionPreference = () => {
      setIsReducedMotion(mediaQuery.matches);
    };

    updateMotionPreference();
    mediaQuery.addEventListener("change", updateMotionPreference);

    return () => {
      mediaQuery.removeEventListener("change", updateMotionPreference);
    };
  }, []);

  useEffect(() => {
    if (isPaused || isReducedMotion) {
      return;
    }

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, SLIDE_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [isPaused, isReducedMotion]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      prevSlide();
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      nextSlide();
    }
  };

  const handleBlurCapture = (event: FocusEvent<HTMLDivElement>) => {
    const root = event.currentTarget;

    requestAnimationFrame(() => {
      const activeElement = document.activeElement;

      if (activeElement instanceof Node && root.contains(activeElement)) {
        return;
      }

      setIsPaused(false);
    });
  };

  const getRevealClass = () => (isReducedMotion ? "opacity-100" : "opacity-0 hero-reveal");
  const getRevealStyle = (delay: string) => (isReducedMotion ? undefined : { animationDelay: delay });

  return (
    <section className="container mx-auto mt-2 px-4 py-5 md:px-12 md:py-7">
      <div
        role="region"
        aria-roledescription="carousel"
        aria-label="PlantWeb hero slider"
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onFocusCapture={() => setIsPaused(true)}
        onBlurCapture={handleBlurCapture}
        className="group relative min-h-[540px] w-full overflow-hidden rounded-[28px] border border-white/45 bg-[#e6eddc] shadow-[0_34px_72px_-44px_rgba(36,53,42,0.72)] md:min-h-[620px]"
      >
        <div
          className={`flex h-full ${isReducedMotion ? "duration-300" : "duration-700"} transition-transform ease-out`}
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {slides.map((slide) => (
            <div
              key={slide.id}
              className="relative h-[540px] w-full flex-shrink-0 md:h-[620px]"
            >
              <div className="absolute inset-0 h-full w-full">
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="h-full w-full object-cover object-center"
                />
                <div className={`absolute inset-0 z-10 bg-gradient-to-r ${slide.color} via-45% to-[#1d2d1d]/22`} />
                <div className="absolute inset-0 z-10 bg-[linear-gradient(180deg,rgba(14,24,16,0.05),rgba(14,24,16,0.34))]" />
              </div>

              <div className="relative z-20 grid h-full grid-cols-1 items-end gap-5 p-5 text-white md:grid-cols-[minmax(0,1.15fr)_minmax(250px,330px)] md:items-center md:p-8 lg:p-10">
                <div className="flex h-full items-center py-2 md:py-5">
                  <div className="w-full max-w-3xl rounded-[26px] border border-white/14 bg-[linear-gradient(180deg,rgba(17,30,20,0.3),rgba(17,30,20,0.14))] p-6 shadow-[0_18px_55px_-34px_rgba(8,14,10,0.95)] backdrop-blur-sm md:p-8 lg:p-9">
                    <div className={`mb-4 flex flex-wrap items-center gap-3 ${getRevealClass()}`} style={getRevealStyle("80ms")}>
                      <span className="inline-flex rounded-full border border-white/18 bg-white/12 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.28em] text-white/90">
                        {slide.eyebrow}
                      </span>
                      <span className="inline-flex rounded-full border border-[#f3e1b1]/35 bg-[#f4deb0]/12 px-3 py-1 text-xs font-semibold text-[#fff4d8]">
                        {slide.subtitle}
                      </span>
                    </div>
                    <h1 className={`mb-4 max-w-2xl text-4xl font-black leading-[0.95] tracking-[-0.04em] text-white drop-shadow-md md:text-6xl lg:text-[4.4rem] ${getRevealClass()}`} style={getRevealStyle("170ms")}>
                      {slide.title}
                    </h1>
                    <p className={`mb-7 max-w-xl text-[15px] leading-7 text-white/88 md:text-lg ${getRevealClass()}`} style={getRevealStyle("250ms")}>
                      {slide.description}
                    </p>
                    <div className={`mb-7 grid max-w-xl gap-3 md:grid-cols-[auto_1fr] ${getRevealClass()}`} style={getRevealStyle("330ms")}>
                      <div className="rounded-2xl border border-white/14 bg-black/14 px-4 py-3.5">
                        <p className="text-[11px] uppercase tracking-[0.26em] text-white/60">Điểm nhấn</p>
                        <p className="mt-1.5 text-lg font-bold text-[#fff4d6]">{slide.metric}</p>
                      </div>
                      <div className="rounded-2xl border border-white/12 bg-white/9 px-4 py-3.5 text-sm leading-6 text-white/82 md:text-[15px]">
                        {slide.note}
                      </div>
                    </div>
                    <div className={`flex flex-col gap-3 sm:flex-row ${getRevealClass()}`} style={getRevealStyle("420ms")}>
                      <Button
                        onClick={() => navigate("/shop")}
                        className="h-12 w-max cursor-pointer rounded-full bg-[#fff8eb] px-7 text-base font-bold text-[#24402b] shadow-lg transition-all hover:-translate-y-0.5 hover:bg-white"
                      >
                        Khám phá ngay
                        <ArrowRight size={18} weight="bold" className="transition-transform group-hover/button:translate-x-0.5" />
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => navigate("/about")}
                        className="h-12 w-max cursor-pointer rounded-full border-white/22 bg-white/10 px-7 text-base font-semibold text-white hover:bg-white/18"
                      >
                        Xem câu chuyện PlantWeb
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="hidden h-full items-end justify-end md:flex">
                  <div className="mb-20 w-full max-w-[300px] rounded-[24px] border border-white/16 bg-[linear-gradient(180deg,rgba(255,251,243,0.18),rgba(255,251,243,0.08))] p-5 text-white shadow-[0_20px_60px_-40px_rgba(11,19,13,0.92)] backdrop-blur-lg">
                    <div className="mb-3.5 flex items-center justify-between">
                      <p className="text-[11px] uppercase tracking-[0.28em] text-white/60">PlantWeb Picks</p>
                      <p className="text-sm font-medium text-white/78">
                        {String(slide.id).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
                      </p>
                    </div>
                    <div className="overflow-hidden rounded-[18px]">
                      <img
                        src={slide.image}
                        alt={slide.title}
                        className="h-40 w-full object-cover"
                      />
                    </div>
                    <div className="mt-3.5">
                      <p className="text-lg font-bold">{slide.subtitle}</p>
                      <p className="mt-1.5 text-sm leading-6 text-white/74">
                        Gợi ý không gian xanh với tông màu và cảm xúc đồng nhất cho toàn bộ ngôi nhà.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="absolute inset-x-0 top-1/2 z-30 hidden -translate-y-1/2 justify-between px-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-within:opacity-100 md:flex lg:px-8">
          <button
            onClick={prevSlide}
            aria-label="Slide trước"
            className={`${controlButtonClass} h-11 w-11`}
          >
            <CaretLeft size={22} weight="bold" />
          </button>
          <button
            onClick={nextSlide}
            aria-label="Slide tiếp theo"
            className={`${controlButtonClass} h-11 w-11`}
          >
            <CaretRight size={22} weight="bold" />
          </button>
        </div>

        <div className="absolute inset-x-0 bottom-0 z-30 p-4 md:p-6">
          <div className="mx-auto flex w-full max-w-[calc(100%-8px)] flex-col gap-3.5 rounded-[22px] border border-white/16 bg-[linear-gradient(180deg,rgba(22,34,26,0.34),rgba(22,34,26,0.22))] px-4 py-4 text-white backdrop-blur-lg md:flex-row md:items-center md:justify-between md:px-5">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                {slides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    aria-label={`Chuyển đến slide ${index + 1}`}
                    aria-current={index === currentSlide ? "true" : undefined}
                    className={`cursor-pointer rounded-full transition-all duration-300 focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-0 ${
                      index === currentSlide ? "h-2.5 w-9 bg-[#fff8e7]" : "h-2.5 w-2.5 bg-white/38 hover:bg-white/58"
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
                  aria-label="Slide trước"
                  className={`${controlButtonClass} h-10 w-10`}
                >
                  <CaretLeft size={20} weight="bold" />
                </button>
                <button
                  onClick={nextSlide}
                  aria-label="Slide tiếp theo"
                  className={`${controlButtonClass} h-10 w-10`}
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
