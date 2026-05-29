import {
  type FocusEvent,
  type KeyboardEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { ArrowRight, CaretLeft, CaretRight } from "@phosphor-icons/react";
import { useNavigate } from "react-router";

import { Button } from "@/components/ui/button";

const SLIDE_INTERVAL_MS = 6000;
const CROSSFADE_DURATION_MS = 700;
const TEXT_STAGGER_DELAYS = ["0ms", "100ms", "200ms", "300ms"];

const slides = [
  {
    id: 1,
    eyebrow: "Bộ sưu tập xanh",
    title: "Trồng một mầm xanh",
    description:
      "Lựa chọn những cây dễ chăm, phù hợp với không gian sống và giữ được cảm giác nhẹ nhàng cho ngôi nhà.",
    image:
      "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?q=80&w=2069&auto=format&fit=crop",
  },
  {
    id: 2,
    eyebrow: "Không gian sống",
    title: "Chạm vào thiên nhiên",
    description:
      "Mang thêm sắc xanh vào phòng khách, bàn làm việc hay góc nhỏ thư giãn bằng những gợi ý đơn giản, dễ ứng dụng.",
    image:
      "https://images.unsplash.com/photo-1463936575829-25148e1db1b8?w=2000&auto=format&fit=crop",
  },
  {
    id: 3,
    eyebrow: "Quà tặng tinh tế",
    title: "Món quà từ đất mẹ",
    description:
      "Tìm một món quà gọn gàng, có ý nghĩa và dễ chọn cho sinh nhật, tân gia hoặc những dịp muốn gửi lời quan tâm.",
    image:
      "https://images.unsplash.com/photo-1599839619722-39751411ea63?w=2000&auto=format&fit=crop",
  },
];

const controlButtonClass =
  "flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/12 text-white transition-colors hover:bg-white/22 focus-visible:border-white/70 focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-0";

export function HeroBanner() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const hasMounted = useRef(false);
  const animationTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
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
    const nextIndex = (currentSlide + 1) % slides.length;
    const img = new Image();
    img.src = slides[nextIndex].image;
  }, [currentSlide]);

  useEffect(() => {
    if (isPaused || isReducedMotion) {
      return;
    }

    const timer = setInterval(() => {
      hasMounted.current = true;
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, SLIDE_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [isPaused, isReducedMotion]);

  useEffect(() => {
    return () => clearTimeout(animationTimeoutRef.current);
  }, []);

  const transitionToSlide = useCallback(
    (nextIndex: number) => {
      if (isAnimating || nextIndex === currentSlide) return;
      hasMounted.current = true;
      setIsAnimating(true);
      setCurrentSlide(nextIndex);
      animationTimeoutRef.current = setTimeout(
        () => setIsAnimating(false),
        CROSSFADE_DURATION_MS,
      );
    },
    [isAnimating, currentSlide],
  );

  const nextSlide = useCallback(() => {
    transitionToSlide((currentSlide + 1) % slides.length);
  }, [currentSlide, transitionToSlide]);

  const prevSlide = useCallback(() => {
    transitionToSlide(
      (currentSlide - 1 + slides.length) % slides.length,
    );
  }, [currentSlide, transitionToSlide]);

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
    const relatedTarget = event.relatedTarget as Node | null;

    if (relatedTarget && event.currentTarget.contains(relatedTarget)) {
      return;
    }

    setIsPaused(false);
  };

  const shouldAnimate = !isReducedMotion;
  const shouldStaggerText = shouldAnimate && hasMounted.current;

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
        className="relative overflow-hidden rounded-[28px] border border-white/50 bg-[#dfe8d7] shadow-[0_28px_60px_-42px_rgba(36,53,42,0.55)]"
      >
        <div className="relative min-h-[430px] md:min-h-[520px]">
          {slides.map((slide, index) => {
            const isActive = index === currentSlide;

            return (
              <div
                key={slide.id}
                className={`absolute inset-0 ${
                  shouldAnimate
                    ? "transition-opacity duration-700 ease-in-out"
                    : ""
                } ${
                  isActive
                    ? "z-10 opacity-100"
                    : "pointer-events-none z-0 opacity-0"
                }`}
                aria-hidden={!isActive}
                {...(!isActive && { inert: true as unknown as boolean })}
              >
                <img
                  src={slide.image}
                  alt={slide.title}
                  className={`absolute inset-0 h-full w-full object-cover ${
                    isActive && shouldAnimate
                      ? "animate-[hero-ken-burns_6s_ease-out_forwards]"
                      : ""
                  }`}
                />
                <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(24,40,28,0.78),rgba(24,40,28,0.45),rgba(24,40,28,0.2))]" />

                <div className="relative z-10 flex min-h-[430px] items-end p-6 md:min-h-[520px] md:p-10 lg:p-12">
                  <div className="max-w-xl rounded-[24px] bg-[rgba(19,31,22,0.32)] p-6 text-white backdrop-blur-sm md:p-8">
                    <p
                      className={`text-xs font-semibold uppercase tracking-[0.24em] text-white/78 ${
                        isActive && shouldStaggerText
                          ? "animate-[hero-text-in_500ms_ease-out_forwards] opacity-0"
                          : isActive
                            ? "opacity-100"
                            : "opacity-0"
                      }`}
                      style={
                        isActive && shouldStaggerText
                          ? { animationDelay: TEXT_STAGGER_DELAYS[0] }
                          : undefined
                      }
                    >
                      {slide.eyebrow}
                    </p>
                    <h1
                      className={`mt-3 text-4xl font-black leading-none tracking-[-0.04em] md:text-6xl ${
                        isActive && shouldStaggerText
                          ? "animate-[hero-text-in_500ms_ease-out_forwards] opacity-0"
                          : isActive
                            ? "opacity-100"
                            : "opacity-0"
                      }`}
                      style={
                        isActive && shouldStaggerText
                          ? { animationDelay: TEXT_STAGGER_DELAYS[1] }
                          : undefined
                      }
                    >
                      {slide.title}
                    </h1>
                    <p
                      className={`mt-4 max-w-lg text-sm leading-7 text-white/82 md:text-base ${
                        isActive && shouldStaggerText
                          ? "animate-[hero-text-in_500ms_ease-out_forwards] opacity-0"
                          : isActive
                            ? "opacity-100"
                            : "opacity-0"
                      }`}
                      style={
                        isActive && shouldStaggerText
                          ? { animationDelay: TEXT_STAGGER_DELAYS[2] }
                          : undefined
                      }
                    >
                      {slide.description}
                    </p>

                    <div
                      className={`mt-7 flex flex-col gap-3 sm:flex-row ${
                        isActive && shouldStaggerText
                          ? "animate-[hero-text-in_500ms_ease-out_forwards] opacity-0"
                          : isActive
                            ? "opacity-100"
                            : "opacity-0"
                      }`}
                      style={
                        isActive && shouldStaggerText
                          ? { animationDelay: TEXT_STAGGER_DELAYS[3] }
                          : undefined
                      }
                    >
                      <Button
                        onClick={() => navigate("/shop")}
                        className="h-11 rounded-full bg-[#fff8eb] px-6 font-semibold text-[#24402b] hover:bg-white"
                      >
                        Khám phá ngay
                        <ArrowRight size={18} weight="bold" />
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => navigate("/about")}
                        className="h-11 rounded-full border-white/25 bg-white/8 px-6 font-semibold text-white hover:bg-white/16"
                      >
                        Tìm hiểu thêm
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="absolute inset-x-0 bottom-0 z-20 flex items-center justify-end gap-4 p-4 md:p-6">
          <div className="flex items-center gap-2 rounded-full bg-[rgba(20,31,23,0.38)] p-2 backdrop-blur-sm">
            <button
              onClick={prevSlide}
              aria-label="Slide trước"
              className={controlButtonClass}
            >
              <CaretLeft size={18} weight="bold" />
            </button>
            <span className="min-w-11 text-center text-sm font-medium text-white/78">
              {String(currentSlide + 1).padStart(2, "0")}
            </span>
            <button
              onClick={nextSlide}
              aria-label="Slide tiếp theo"
              className={controlButtonClass}
            >
              <CaretRight size={18} weight="bold" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
