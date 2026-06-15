import { VoucherPromoBanner } from "@/features/vouchers/components/VoucherPromoBanner"
import { CategoryShowcase } from "../components/CategoryShowcase"
import { ProductRail } from "../components/ProductRail"
import { HomeHero } from "../components/home/HomeHero"
import { TrustBar } from "../components/home/TrustBar"
import { ShopBySpace } from "../components/home/ShopBySpace"
import { SalePromoBanner } from "../components/home/SalePromoBanner"
import { BlogPreview } from "../components/home/BlogPreview"
import { HomeReviewsSection } from "../components/home/HomeReviewsSection"
import { HomeAdvisorCta } from "../components/home/HomeAdvisorCta"
import { NewsletterSignup } from "../components/home/NewsletterSignup"

export function HomePage() {
  return (
    <>
      <HomeHero />
      <TrustBar />
      <CategoryShowcase />
      <ShopBySpace />

      <ProductRail
        title="Đang thịnh hành"
        description="Những cây được yêu thích nhất tuần này"
        sort="trending"
        viewAllHref="/shop?sort=trending"
      />

      <SalePromoBanner />

      <ProductRail
        title="Đang giảm giá"
        description="Săn cây đẹp với giá tốt"
        sort="sale"
        saleOnly
        viewAllHref="/shop?saleOnly=true"
        className="bg-accent/5"
      />

      <BlogPreview />
      <HomeReviewsSection />

      <section className="mx-auto max-w-7xl px-4 py-6">
        <VoucherPromoBanner />
      </section>

      <ProductRail
        title="Bán chạy nhất"
        description="Top sản phẩm được mua nhiều nhất"
        sort="best-selling"
        viewAllHref="/shop?sort=best-selling"
        showRank
      />

      <HomeAdvisorCta />
      <NewsletterSignup />
    </>
  )
}