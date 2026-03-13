import { Navbar } from "../components/layout/Navbar";
import { Footer } from "../components/layout/Footer";
import { HeroBanner } from "../components/home/HeroBanner";
import { Categories } from "../components/home/Categories";
import { BestSelling } from "../components/home/BestSelling";
import { HotSale } from "../components/home/HotSale";
import { TrendingPlants } from "../components/home/TrendingPlants";
import { Blogs } from "../components/home/Blogs";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 selection:bg-secondary">
      {/* Global Layout Headers */}
      <Navbar />

      {/* Main Content */}
      <main>
        <HeroBanner />
        <Categories />
        <BestSelling />
        <HotSale />
        <TrendingPlants />
        <Blogs />
      </main>

      {/* Global Footer */}
      <Footer />
    </div>
  );
}