import { useState, useEffect } from "react";
import { ArrowRight, CaretLeft, CaretRight } from "@phosphor-icons/react";
import { useNavigate } from "react-router";

const slides = [
  {
    id: 1,
    title: "Trồng một mầm xanh",
    subtitle: "Gieo mầm hy vọng",
    description: "Mỗi cái cây bạn trồng không chỉ làm đẹp không gian, mà còn là một lời hứa với tương lai về một hành tinh xanh hơn.",
    image: "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?q=80&w=2069&auto=format&fit=crop",
    color: "from-[#31553a]/78 via-[#4f7f4f]/55",
  },
  {
    id: 2,
    title: "Chạm vào thiên nhiên",
    subtitle: "Sống chậm lại",
    description: "Mang hơi thở của rừng xanh vào ngôi nhà của bạn. Hãy để sắc xanh xoa dịu tâm hồn sau những giờ làm việc căng thẳng.",
    image: "https://images.unsplash.com/photo-1463936575829-25148e1db1b8?w=2000&auto=format&fit=crop",
    color: "from-[#40592f]/76 via-[#6d8f57]/52",
  },
  {
    id: 3,
    title: "Món quà từ đất mẹ",
    subtitle: "Gắn kết yêu thương",
    description: "Cây xanh là món quà ý nghĩa nhất dành tặng bản thân và những người thân yêu. Hãy cùng PlantWeb lan tỏa tình yêu thiên nhiên.",
    image: "https://images.unsplash.com/photo-1599839619722-39751411ea63?w=2000&auto=format&fit=crop",
    color: "from-[#3f4d2d]/76 via-[#7a6641]/44",
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
    <div className="container mx-auto mt-2 px-6 py-8 md:px-12">
      <div className="group relative h-[500px] w-full overflow-hidden rounded-[36px] border border-white/45 bg-secondary shadow-[0_42px_80px_-44px_rgba(36,53,42,0.85)]">
        {/* Slides Container - Continuous Row */}
        <div 
          className="flex h-full transition-transform duration-1000 ease-in-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {slides.map((slide) => (
            <div
              key={slide.id}
              className="relative w-full h-full flex-shrink-0"
            >
              {/* Background Image */}
              <div className="absolute inset-0 w-full h-full">
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="w-full h-full object-cover object-center"
                />
                <div className={`absolute inset-0 z-10 bg-gradient-to-r ${slide.color} to-transparent`}></div>
                <div className="absolute inset-0 z-10 bg-[radial-gradient(circle_at_top_right,rgba(255,253,247,0.18),transparent_22%)]" />
              </div>

              {/* Content */}
              <div className="relative z-20 flex h-full max-w-2xl flex-col justify-center p-10 text-white md:p-16">
                <span className="mb-4 inline-flex w-max rounded-full border border-white/20 bg-white/12 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.32em] text-white/92 opacity-0 backdrop-blur-sm animate-[fadeInUp_0.8s_ease-out_forwards]">
                  {slide.subtitle}
                </span>
                <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight mb-6 drop-shadow-lg opacity-0 animate-[fadeInUp_0.8s_ease-out_0.2s_forwards]">
                  {slide.title.split(" ").map((word, i) => (
                    <span key={i}>
                      {word} {i === 1 && <br />}
                    </span>
                  ))}
                </h1>
                <p className="mb-10 max-w-lg rounded-3xl bg-black/12 px-5 py-4 text-lg font-medium leading-relaxed text-white/92 opacity-0 shadow-sm backdrop-blur-[1px] animate-[fadeInUp_0.8s_ease-out_0.4s_forwards] md:text-xl">
                  {slide.description}
                </p>
                <button 
                  onClick={() => navigate("/shop")}
                  className="group/btn flex w-max cursor-pointer items-center gap-2 rounded-full bg-[#fffaf1] px-8 py-4 text-lg font-bold text-primary opacity-0 shadow-xl transition-all hover:-translate-y-1 hover:bg-white hover:shadow-2xl animate-[fadeInUp_0.8s_ease-out_0.6s_forwards]"
                >
                  Khám phá ngay 
                  <ArrowRight size={20} weight="bold" className="group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Arrows */}
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 z-30 flex justify-between px-4 md:px-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={prevSlide}
            className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border border-white/40 bg-white/22 text-white backdrop-blur-md transition-all hover:bg-white/40"
          >
            <CaretLeft size={24} weight="bold" />
          </button>
          <button
            onClick={nextSlide}
            className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border border-white/40 bg-white/22 text-white backdrop-blur-md transition-all hover:bg-white/40"
          >
            <CaretRight size={24} weight="bold" />
          </button>
        </div>

        {/* Indicators */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex gap-3">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                index === currentSlide ? "w-8 bg-white" : "w-2 bg-white/40 hover:bg-white/60"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
