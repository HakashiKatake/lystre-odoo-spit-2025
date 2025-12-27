"use client";

import Image from "next/image";
import Link from "next/link";
import {
  motion,
  useScroll,
  useTransform,
  useInView,
  AnimatePresence,
  Variants,
} from "framer-motion";
import { Preloader } from "@/app/components/landing/Preloader";
import { Navbar } from "@/app/components/landing/Navbar";
import { Footer } from "@/app/components/landing/Footer";
import { useRef, useState, useEffect } from "react";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/retroui/Button";
import { Card } from "@/components/retroui/Card";

function RotatingBadge() {
  return (
    <div className="relative w-32 h-32 md:w-40 md:h-40 flex items-center justify-center animate-spin-slow">
      <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
        <path
          id="circlePath"
          d="M 50, 50 m -37, 0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0"
          fill="transparent"
        />
        <text className="text-[10px] uppercase font-bold tracking-[0.2em] fill-lystre-black">
          <textPath href="#circlePath" startOffset="0%">
            • 5% CASHBACK • MEMBER EXCLUSIVE • 5% CASHBACK • MEMBER EXCLUSIVE
          </textPath>
        </text>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <ArrowUpRight className="w-8 h-8 md:w-10 md:h-10 text-lystre-black" />
      </div>
    </div>
  );
}

const CATEGORIES = [
  {
    name: "Women",
    image:
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2070&auto=format&fit=crop",
  },
  {
    name: "Men",
    image: "/images/men-category.jpg?v=2",
    className: "object-top",
  },
];

const SIGNATURE_PRODUCTS = [
  { id: 1, image: "/images/signature-1.jpg", price: 29000 },
  { id: 2, image: "/images/signature-2.jpg", price: 35000 },
  { id: 3, image: "/images/signature-3.jpg", price: 24000 },
];

// Scroll animation variants
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 60 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.33, 1, 0.68, 1] },
  },
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1,
    },
  },
};

export default function Home() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);

  // Hero Carousel State
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
  const heroImages = [
    "https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=2070&auto=format&fit=crop",
    "/images/hero-1.jpg",
    "/images/hero-2.jpg",
    "/images/hero-3.jpg",
  ];

  // Auto-advance carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHeroIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000); // Change every 5 seconds

    return () => clearInterval(interval);
  }, [heroImages.length]);

  // Refs for scroll-triggered animations
  const categoriesRef = useRef(null);
  const editorialImageRef = useRef(null);
  const editorialTextRef = useRef(null);
  const productsRef = useRef(null);

  const categoriesInView = useInView(categoriesRef, { margin: "-100px" });
  const editorialImageInView = useInView(editorialImageRef, {
    margin: "-100px",
  });
  const editorialTextInView = useInView(editorialTextRef, { margin: "-100px" });
  const productsInView = useInView(productsRef, { margin: "-100px" });

  return (
    <main
      ref={containerRef}
      className="min-h-screen bg-lystre-white text-lystre-black selection:bg-lystre-black selection:text-lystre-white"
    >
      <Preloader />
      <Navbar />

      {/* Hero Section - Carousel */}
      <section className="relative h-screen w-full overflow-hidden bg-black">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentHeroIndex}
            style={{ y }}
            className="absolute inset-0 z-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/40 z-10" />
            <Image
              src={heroImages[currentHeroIndex]}
              alt={`Hero ${currentHeroIndex + 1}`}
              fill
              sizes="100vw"
              className={`w-full h-full ${currentHeroIndex === 2
                ? "object-cover object-[center_10%]"
                : "object-cover"
                }`}
              priority={currentHeroIndex === 0}
              quality={100}
              unoptimized
            />
          </motion.div>
        </AnimatePresence>

        <div className="absolute inset-x-0 bottom-0 top-0 z-20 flex flex-col justify-end pb-20 px-6 md:px-12 pointer-events-none">
          <div className="max-w-[1920px] mx-auto w-full flex justify-between items-end">
            <motion.h1
              className="text-6xl md:text-[10rem] font-serif leading-[0.8] tracking-tighter text-white mix-blend-difference"
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: "circOut", delay: 3.2 }}
            >
              NEW
              <br />
              ERA
            </motion.h1>

            <motion.div
              className="hidden md:block pointer-events-auto"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, delay: 3.5 }}
            >
              <div className="bg-lystre-white/80 backdrop-blur-sm rounded-full p-2">
                <RotatingBadge />
              </div>
            </motion.div>
          </div>
        </div>

        {/* Carousel Indicators */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-30 flex space-x-2 pointer-events-auto">
          {heroImages.map((_, index) => (
            <Button
              key={index}
              onClick={() => setCurrentHeroIndex(index)}
              variant="outline"
              className={`w-2 h-2 rounded-full p-0 min-w-0 transition-all duration-300 ${index === currentHeroIndex
                ? "bg-white w-8"
                : "bg-white/50 hover:bg-white/75"
                }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </section>

      {/* Category Grid (3 Column - Removed Handbags) */}
      <section
        className="py-24 px-6 md:px-12 bg-lystre-white"
        ref={categoriesRef}
      >
        <motion.div
          className="max-w-[1920px] mx-auto"
          initial="hidden"
          animate={categoriesInView ? "visible" : "hidden"}
          variants={staggerContainer}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[80vh] md:h-[600px]">
            {CATEGORIES.map((cat, i) => (
              <motion.div key={i} variants={fadeInUp}>
                <Link
                  href="/shop"
                  className="group relative h-full w-full overflow-hidden block"
                >
                  <Image
                    src={cat.image}
                    alt={cat.name}
                    fill
                    className={`object-cover grayscale group-hover:grayscale-0 transition-all duration-700 ease-out group-hover:scale-105 ${cat.className || ""
                      }`}
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500" />
                  <div className="absolute bottom-6 left-6 z-10">
                    <h3 className="text-white font-sans text-xl uppercase tracking-widest font-bold group-hover:translate-x-2 transition-transform duration-300">
                      {cat.name}
                    </h3>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Editorial Spread (Asymmetric) - Special Animations */}
      <section className="py-24 bg-lystre-beige text-lystre-black overflow-hidden">
        <div className="max-w-[1920px] mx-auto px-6 md:px-12">
          <div className="flex flex-col md:flex-row gap-12 lg:gap-24 items-center">
            {/* Image from LEFT */}
            <motion.div
              ref={editorialImageRef}
              className="w-full md:w-1/2 relative"
              initial={{ opacity: 0, x: -100 }}
              animate={
                editorialImageInView
                  ? { opacity: 1, x: 0 }
                  : { opacity: 0, x: -100 }
              }
              transition={{ duration: 1, ease: "easeOut" }}
            >
              <div className="aspect-[4/5] relative overflow-hidden">
                <Image
                  src="/beauty-abstract-image.jpg"
                  alt="Editorial"
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
              <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-lystre-accent rounded-full opacity-20 mix-blend-multiply blur-2xl" />
            </motion.div>

            {/* Text from RIGHT */}
            <motion.div
              ref={editorialTextRef}
              className="w-full md:w-1/2 space-y-8"
              initial={{ opacity: 0, x: 100 }}
              animate={
                editorialTextInView
                  ? { opacity: 1, x: 0 }
                  : { opacity: 0, x: 100 }
              }
              transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
            >
              <span className="text-xs uppercase tracking-[0.3em] font-bold">
                The Campaign
              </span>
              <h2 className="text-5xl md:text-7xl font-serif leading-tight">
                Beauty in <br className="hidden md:block" /> the Abstract.
              </h2>
              <p className="max-w-md text-lg text-gray-600 leading-relaxed font-sans">
                Discover the intersection of form and function. Our latest
                collection challenges traditional silhouettes with bold cuts and
                uncompromising quality.
              </p>
              <Link
                href="/shop"
                className="inline-block border-b border-black pb-1 uppercase tracking-widest text-sm hover:opacity-50 transition-opacity"
              >
                View Editorial
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Product Highlight (Clean Grid) */}
      <section
        className="py-32 px-6 md:px-12 bg-lystre-white"
        ref={productsRef}
      >
        <motion.div
          className="max-w-[1920px] mx-auto text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={
            productsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }
          }
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-serif">
            Curated Essentials
          </h2>
        </motion.div>
        <motion.div
          className="max-w-[1920px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-12"
          initial="hidden"
          animate={productsInView ? "visible" : "hidden"}
          variants={staggerContainer}
        >
          {SIGNATURE_PRODUCTS.map((product, i) => (
            <motion.div key={i} variants={fadeInUp} className="w-full">
              <Card className="w-full border-none shadow-none hover:shadow-lg transition-transform duration-300 hover:scale-105 bg-transparent group">
                <Card.Content className="pb-0 aspect-[3/4] overflow-hidden relative">
                  <Image
                    src={product.image}
                    alt={`Lystré Signature ${i + 1}`}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    unoptimized
                  />
                </Card.Content>
                <Card.Header className="pb-0">
                  <Card.Title className="font-serif text-lg">
                    Lystré Signature {i + 1}
                  </Card.Title>
                </Card.Header>
                <Card.Content className="flex justify-between items-center">
                  <p className="text-lg font-semibold">
                    ₹{product.price.toLocaleString("en-IN")}
                  </p>
                  <Button>Add to cart</Button>
                </Card.Content>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </section>

      <Footer />
    </main>
  );
}
