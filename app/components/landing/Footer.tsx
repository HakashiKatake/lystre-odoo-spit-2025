"use client";

import Link from "next/link";
import { ArrowUpRight, Mail, Instagram, Twitter } from "lucide-react";
import { Button } from "@/components/retroui/Button";
import { motion } from "framer-motion";

export function Footer() {
  return (
    <footer className="bg-gradient-to-b from-lystre-black to-zinc-900 text-lystre-white relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-lystre-accent/30 to-transparent" />
      <div className="absolute top-20 right-10 w-64 h-64 bg-lystre-accent/5 rounded-full blur-3xl" />
      <div className="absolute bottom-40 left-10 w-48 h-48 bg-lystre-accent/5 rounded-full blur-3xl" />

      {/* Main Footer Content */}
      <div className="relative z-10 py-20 px-6 md:px-12">
        <div className="max-w-[1920px] mx-auto">
          {/* Top Section - Newsletter */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-20">
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <span className="text-lystre-accent text-sm font-medium uppercase tracking-[0.3em]">
                  Newsletter
                </span>
                <h2 className="text-4xl md:text-6xl font-serif leading-tight mt-4">
                  Stay in the know.
                </h2>
                <p className="text-white/60 max-w-md mt-4 text-lg">
                  Subscribe for exclusive access to new collections, special
                  offers, and style inspiration.
                </p>
              </motion.div>
              <motion.div
                className="flex flex-col sm:flex-row gap-3 max-w-xl"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                viewport={{ once: true }}
              >
                <div className="flex-1 relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="w-full h-12 bg-white/5 border border-white/10 rounded-lg pl-12 pr-4 text-white placeholder-white/40 focus:outline-none focus:border-lystre-accent/50 focus:ring-1 focus:ring-lystre-accent/30 transition-all"
                  />
                </div>
                <Button
                  variant="default"
                  className="h-12 bg-lystre-accent text-lystre-black hover:bg-lystre-accent/90 px-8 uppercase tracking-widest text-sm font-bold"
                >
                  Subscribe
                </Button>
              </motion.div>
            </div>

            {/* Links Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8 lg:gap-12 lg:justify-end">
              {/* Explore */}
              <motion.div
                className="space-y-6"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <h3 className="text-sm uppercase tracking-[0.2em] font-bold text-lystre-accent">
                  Explore
                </h3>
                <ul className="space-y-4">
                  {["Shop All", "Collections", "Editorial", "Our Story"].map(
                    (item) => (
                      <li key={item}>
                        <Link
                          href="/shop"
                          className="text-white/70 hover:text-white hover:pl-2 transition-all duration-300 flex items-center group"
                        >
                          <span className="opacity-0 group-hover:opacity-100 transition-opacity mr-2 text-lystre-accent">
                            →
                          </span>
                          {item}
                        </Link>
                      </li>
                    )
                  )}
                </ul>
              </motion.div>

              {/* Customer Care */}
              <motion.div
                className="space-y-6"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                viewport={{ once: true }}
              >
                <h3 className="text-sm uppercase tracking-[0.2em] font-bold text-lystre-accent">
                  Customer Care
                </h3>
                <ul className="space-y-4">
                  {["Contact Us", "Shipping", "Returns", "FAQ"].map((item) => (
                    <li key={item}>
                      <Link
                        href="#"
                        className="text-white/70 hover:text-white hover:pl-2 transition-all duration-300 flex items-center group"
                      >
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity mr-2 text-lystre-accent">
                          →
                        </span>
                        {item}
                      </Link>
                    </li>
                  ))}
                </ul>
              </motion.div>

              {/* Connect */}
              <motion.div
                className="space-y-6"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                viewport={{ once: true }}
              >
                <h3 className="text-sm uppercase tracking-[0.2em] font-bold text-lystre-accent">
                  Connect
                </h3>
                <div className="flex gap-4">
                  <a
                    href="#"
                    className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center hover:bg-lystre-accent hover:border-lystre-accent hover:text-lystre-black transition-all duration-300"
                  >
                    <Instagram className="w-5 h-5" />
                  </a>
                  <a
                    href="#"
                    className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center hover:bg-lystre-accent hover:border-lystre-accent hover:text-lystre-black transition-all duration-300"
                  >
                    <Twitter className="w-5 h-5" />
                  </a>
                </div>
                <div className="pt-4 text-sm text-white/40 space-y-2">
                  <p>© 2025 Lystré Inc.</p>
                  <div className="flex gap-4">
                    <a href="#" className="hover:text-white transition-colors">
                      Terms
                    </a>
                    <a href="#" className="hover:text-white transition-colors">
                      Privacy
                    </a>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section - Large Logo */}
      <div className="relative border-t border-white/5">
        <div className="max-w-[1920px] mx-auto px-6 md:px-12 py-8 flex justify-between items-end">
          <motion.h1
            className="text-[15vw] md:text-[12vw] leading-none font-serif font-bold tracking-tighter text-white/[0.03] select-none"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
          >
            LYSTRÉ
          </motion.h1>
          <motion.button
            className="hidden md:flex items-center gap-2 text-sm uppercase tracking-widest text-white/60 hover:text-lystre-accent transition-colors group pb-4"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <span>Back to Top</span>
            <ArrowUpRight className="w-4 h-4 group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" />
          </motion.button>
        </div>
      </div>
    </footer>
  );
}
