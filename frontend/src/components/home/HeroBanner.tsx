import { useState, useEffect } from "react";
import { ArrowRight, CaretLeft, CaretRight } from "@phosphor-icons/react";
import { useNavigate } from "react-router";

const slides = [
  {
    id: 1,
    title: "Trồng một mầm xanh",
    subtitle: "Gieo mầm hy vọng",
    description: "Mỗi cái cây bạn trồng không chỉ làm đẹp không gian, mà còn là một lời hứa với tương lai về một hành tinh xanh hơn.",
    image: "https://images.unsplash.com/photo-1416879598555-081e6ae76d05?q=80&w=2069&auto=format&fit=crop",
    color: "from-green-600/80",
  },
  {
    id: 2,
    title: "Chạm vào thiên nhiên",
    subtitle: "Sống chậm lại",
    description: "Mang hơi thở của rừng xanh vào ngôi nhà của bạn. Hãy để sắc xanh xoa dịu tâm hồn sau những giờ làm việc căng thẳng.",
    image: "https://images.unsplash.com/photo-1463936575829-25148e1db1b8?w=2000&auto=format&fit=crop",
    color: "from-emerald-700/80",
  },
  {
    id: 3,
    title: "Món quà từ đất mẹ",
    subtitle: "Gắn kết yêu thương",
    description: "Cây xanh là món quà ý nghĩa nhất dành tặng bản thân và những người thân yêu. Hãy cùng PlantWeb lan tỏa tình yêu thiên nhiên.",
    image: "https://images.unsplash.com/photo-1599839619722-39751411ea63?w=2000&auto=format&fit=crop",
    color: "from-teal-800/80",
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
    <div className="container mx-auto px-6 md:px-12 py-8 mt-2">
      <div className="relative w-full h-[500px] md:h-[600px] rounded-[32px] overflow-hidden bg-secondary shadow-2xl group">
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
                <div className={`absolute inset-0 bg-gradient-to-r ${slide.color} to-transparent z-10`}></div>
              </div>

              {/* Content */}
              <div className="relative z-20 flex flex-col justify-center h-full max-w-2xl p-10 md:p-16 text-white">
                <span className="text-primary-foreground font-bold tracking-[0.2em] uppercase mb-4 opacity-0 animate-[fadeInUp_0.8s_ease-out_forwards]">
                  {slide.subtitle}
                </span>
                <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight mb-6 drop-shadow-lg opacity-0 animate-[fadeInUp_0.8s_ease-out_0.2s_forwards]">
                  {slide.title.split(" ").map((word, i) => (
                    <span key={i}>
                      {word} {i === 1 && <br />}
                    </span>
                  ))}
                </h1>
                <p className="text-lg md:text-xl text-primary-foreground/90 mb-10 max-w-md drop-shadow font-medium leading-relaxed opacity-0 animate-[fadeInUp_0.8s_ease-out_0.4s_forwards]">
                  {slide.description}
                </p>
                <button 
                  onClick={() => navigate("/shop")}
                  className="bg-white text-primary hover:bg-secondary px-8 py-4 rounded-full font-bold text-lg flex items-center gap-2 w-max transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 group/btn cursor-pointer opacity-0 animate-[fadeInUp_0.8s_ease-out_0.6s_forwards]"
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
            className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white hover:bg-white/40 transition-all cursor-pointer"
          >
            <CaretLeft size={24} weight="bold" />
          </button>
          <button
            onClick={nextSlide}
            className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white hover:bg-white/40 transition-all cursor-pointer"
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
