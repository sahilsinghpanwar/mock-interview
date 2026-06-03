"use client";

import React from "react";
import { motion, Variants } from "framer-motion";

interface SectionWithMockupProps {
  title: string | React.ReactNode;
  description: string | React.ReactNode;
  primaryImageSrc: string;
  secondaryImageSrc: string;
  reverseLayout?: boolean;
}

export default function SectionWithMockup({
  title,
  description,
  primaryImageSrc,
  secondaryImageSrc,
  reverseLayout = false,
}: SectionWithMockupProps) {
  const containerVariants: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } },
  };

  const layoutClasses = reverseLayout ? "md:grid-cols-2 md:grid-flow-col-dense" : "md:grid-cols-2";
  const textOrderClass = reverseLayout ? "md:col-start-2" : "";
  const imageOrderClass = reverseLayout ? "md:col-start-1" : "";

  return (
    <section className="relative pt-10 pb-24 md:pt-20 md:pb-40 bg-black overflow-hidden">
      <div className="container max-w-[1220px] w-full px-6 md:px-10 relative z-10 mx-auto">
        <motion.div
          className={`grid grid-cols-1 gap-16 md:gap-8 w-full items-center ${layoutClasses}`}
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {/* Text Content */}
          <motion.div
            className={`flex flex-col items-start gap-4 mt-6 md:mt-0 max-w-[546px] mx-auto md:mx-0 ${textOrderClass}`}
            variants={itemVariants}
          >
            <div className="space-y-2 md:space-y-1">
              <h2 className="text-white text-3xl md:text-[40px] font-semibold leading-tight md:leading-[53px]">
                {title}
              </h2>
            </div>
            <div className="text-[#868f97] text-sm md:text-[15px] leading-6">
              {description}
            </div>
          </motion.div>

          {/* App mockup / Image Content */}
          <motion.div
            className={`relative mt-1 md:mt-0 md:-translate-y-10 md:translate-x-6 mx-auto ${imageOrderClass} w-full max-w-[300px] md:max-w-[471px]`}
            variants={itemVariants}
          >
            {/* Glowing background mesh */}
            <div className="absolute -inset-10 md:-inset-20 bg-gradient-to-tr from-violet-600/25 via-indigo-500/15 to-cyan-400/25 rounded-full blur-[80px] opacity-75 pointer-events-none -z-10" />

            {/* Background decorative card */}
            <motion.div
              className="absolute w-[300px] h-[317px] md:w-[472px] md:h-[500px] bg-[#090909] border border-white/[0.06] rounded-[32px] z-0 overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.3)]"
              style={{
                top: reverseLayout ? "auto" : "10%",
                bottom: reverseLayout ? "10%" : "auto",
                left: reverseLayout ? "auto" : "-20%",
                right: reverseLayout ? "-20%" : "auto",
                transform: reverseLayout ? "translate(0, 0)" : "translateY(10%)",
              }}
              initial={{ y: 0 }}
              whileInView={{ y: reverseLayout ? -20 : -30 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              viewport={{ once: true, amount: 0.5 }}
            >
              <div
                className="relative w-full h-full bg-contain bg-center bg-no-repeat rounded-[32px]"
                style={{ backgroundImage: `url(${secondaryImageSrc})` }}
              />
            </motion.div>

            {/* Main Mockup Card */}
            <motion.div
              className="relative w-full h-[405px] md:h-[637px] bg-[#ffffff0a] rounded-[32px] backdrop-blur-[15px] backdrop-brightness-[100%] border border-white/[0.08] z-10 overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.5)]"
              initial={{ y: 0 }}
              whileInView={{ y: reverseLayout ? 20 : 30 }}
              transition={{ duration: 1.2, ease: "easeOut", delay: 0.1 }}
              viewport={{ once: true, amount: 0.5 }}
            >
              <div className="p-0 h-full">
                <div className="h-full relative" style={{ backgroundSize: "100% 100%" }}>
                  <div
                    className="w-full h-full bg-contain bg-center bg-no-repeat"
                    style={{ backgroundImage: `url(${primaryImageSrc})` }}
                  />
                </div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

      {/* Decorative bottom gradient line */}
      <div
        className="absolute w-full h-px bottom-0 left-0 z-0"
        style={{
          background:
            "radial-gradient(50% 50% at 50% 50%, rgba(255,255,255,0.24) 0%, rgba(255,255,255,0) 100%)",
        }}
      />
    </section>
  );
}
