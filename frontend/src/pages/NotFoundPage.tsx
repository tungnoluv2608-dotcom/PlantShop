import { Link } from "react-router";
import { Plant, ArrowLeft } from "@phosphor-icons/react";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 text-center">
      <div className="bg-primary text-primary-foreground p-5 rounded-3xl shadow-lg mb-8">
        <Plant size={56} weight="fill" />
      </div>

      <h1 className="text-7xl font-black text-primary mb-4">404</h1>
      <h2 className="text-2xl font-bold text-foreground mb-3">
        Trang không tồn tại
      </h2>
      <p className="text-foreground/70 mb-8 max-w-md">
        Có vẻ như bạn đã lạc vào một khu rừng chưa được khám phá. 
        Hãy quay về trang chủ để tiếp tục hành trình nhé!
      </p>

      <Link
        to="/"
        className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-3 rounded-full font-bold hover:bg-primary/90 transition-all shadow-md hover:-translate-y-0.5"
      >
        <ArrowLeft weight="bold" />
        Về trang chủ
      </Link>
    </div>
  );
}
