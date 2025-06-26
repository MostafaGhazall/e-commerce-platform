import { useEffect, useRef, useState } from "react";
import { useProductStore } from "../contexts/useStore";
import ProductCard from "../components/ProductCard";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const Home = () => {
  const { products, loadProducts } = useProductStore();
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);

  const ads = ["/images/hero1.jpg", "/images/hero2.jpg", "/images/hero3.jpg"];
  const sliderRef = useRef<any>(null);

  useEffect(() => {
    if (products.length === 0) loadProducts();
    setMounted(true); // Ensures slider renders only after mount
  }, []);

  const featured = products.slice(0, 4);

  return (
    <div className="bg-white text-gray-800">
      {/* Hero */}
      <section className="relative h-[380px] md:h-[480px] overflow-hidden text-white">
        {mounted && (
          <Slider
            ref={sliderRef}
            autoplay
            autoplaySpeed={4500}
            infinite
            arrows={false}
            dots={false}
            speed={800}
            pauseOnHover={false}
            className="absolute inset-0 z-0"
          >
            {ads.map((src, i) => (
              <div
                key={i}
                className="h-[380px] md:h-[480px] bg-cover bg-center relative"
              >
                <img
                  src={src}
                  alt={`Ad ${i + 1}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 backdrop-brightness-75 z-10" />
              </div>
            ))}
          </Slider>
        )}

        {/* Text & Button overlay */}
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center px-4 text-center pointer-events-none">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 drop-shadow-lg">
            {t("homePage.welcome")}
          </h1>
          <p className="max-w-xl mx-auto text-lg mb-6 drop-shadow">
            {t("homePage.intro")}
          </p>
          <div className="pointer-events-auto">
            <Link
              to="/products"
              className="inline-block bg-[var(--primary-sun)] text-gray-900 font-semibold px-6 py-3 rounded hover:bg-yellow-300 transition"
            >
              {t("homePage.shopNow")}
            </Link>
          </div>
        </div>
      </section>

      {/* Deals & Sale */}
      <section className="max-w-7xl mx-auto pt-16 px-4 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
        {[
          {
            title: t("homePage.flashSaleTitle"),
            desc: t("homePage.flashSaleDesc"),
            image: "/images/flash-sale2.png",
          },
          {
            title: t("homePage.wheelTitle"),
            desc: t("homePage.wheelDesc"),
            image: "/images/wheel.png",
          },
          {
            title: t("homePage.discountTitle"),
            desc: t("homePage.discountDesc"),
            image: "/images/discount-ticket.png",
          },
        ].map((cat, i) => (
          <div
            key={i}
            className="flex items-center justify-between bg-[var(--primary-sun)] rounded-lg shadow hover:shadow-lg transform hover:scale-105 transition duration-300 cursor-pointer p-7"
          >
            <div className="flex flex-col text-center flex-1">
              <h3 className="text-2xl font-bold text-gray-900">{cat.title}</h3>
              <p className="text-xs text-gray-800 mt-1">{cat.desc}</p>
            </div>
            <img
              src={cat.image}
              alt={cat.title}
              className="w-28 h-24 object-contain ml-4 flex-shrink-0"
            />
          </div>
        ))}
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold mb-6 text-center">
          {t("homePage.featured")}
        </h2>
        {featured.length === 0 ? (
          <p className="text-center text-gray-500">
            {t("homePage.noProducts")}
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="relative text-center py-20 px-4 text-white overflow-hidden">
        {/* Background Image */}
        <img
          src="/images/cta-bg.jpg"
          alt="CTA Background"
          className="absolute inset-0 w-full h-full object-cover z-0"
        />

        {/* Backdrop Overlay using brightness */}
        <div className="absolute inset-0 backdrop-brightness-50 z-10" />

        {/* Content */}
        <div className="relative z-20">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {t("homePage.ctaTitle")}
          </h2>
          <p className="mb-6 text-white/80">{t("homePage.ctaDesc")}</p>
          <Link
            to="/products"
            className="inline-block bg-white text-[var(--primary-orange)] font-medium px-6 py-3 rounded hover:bg-gray-100 transition"
          >
            {t("homePage.ctaButton")}
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
