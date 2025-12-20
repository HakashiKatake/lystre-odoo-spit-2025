"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/retroui/Button";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-40 transition-all duration-500",
        scrolled
          ? "bg-lystre-white text-lystre-black shadow-sm"
          : "bg-transparent text-lystre-black md:text-lystre-white md:bg-transparent"
      )}
    >
      <div className="max-w-[1920px] mx-auto px-6 h-20 flex items-center justify-between">
        {/* LEFT: Empty (removed hamburger) */}
        <div className="flex-1 flex justify-start"></div>

        {/* CENTER: Logo */}
        <div className="flex-1 flex justify-center">
          <Link
            href="/"
            className="text-3xl font-serif font-bold tracking-widest uppercase relative z-50"
          >
            Lystré
          </Link>
        </div>

        {/* RIGHT: Sign Up & Log In */}
        <div className="flex-1 flex justify-end items-center space-x-4">
          <Button asChild variant="outline" size="md">
            <Link href="/login" className="uppercase tracking-widest">
              Log In
            </Link>
          </Button>
          <Button asChild variant="outline" size="md">
            <Link href="/register" className="uppercase tracking-widest">
              Sign Up
            </Link>
          </Button>
        </div>
      </div>
    </nav>
  );
}
