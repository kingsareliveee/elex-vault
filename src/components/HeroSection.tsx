import { motion } from "framer-motion";
import SmartSearch from "./SmartSearch";
import departmentLogo from "@/assets/department-logo.png";
import heroBg from "@/assets/hero-bg.jpg";

const HeroSection = () => {
  return (
    <section
      className="relative min-h-[90vh] flex flex-col items-center justify-center px-4 overflow-hidden"
    >
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroBg})` }}
      >
        <div className="absolute inset-0 gradient-navy opacity-90" />
      </div>

      <div className="relative z-10 text-center max-w-4xl mx-auto w-full">
        <motion.img
          src={departmentLogo}
          alt="School of Electronics Logo"
          className="w-[200px] h-[200px] mx-auto mb-6 rounded-2xl"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        />

        <motion.h1
          className="text-4xl sm:text-5xl md:text-6xl font-display font-bold text-primary-foreground mb-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          ELEX DAVV
        </motion.h1>

        <motion.p
          className="text-lg sm:text-xl text-primary-foreground/80 font-body mb-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          School of Electronics
        </motion.p>

        <motion.p
          className="text-sm sm:text-base text-primary-foreground/60 font-body mb-10 max-w-lg mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          Access Previous Year Question Papers, Syllabus, and Academic Resources.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <SmartSearch />
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
