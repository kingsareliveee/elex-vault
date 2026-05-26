import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

import { academicStructure, CourseKey, SemesterKey } from "@/data/academicStructure";

const CoursePage = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();

  const courseKey = (courseId === "bsc" ? "bsc" : "imtech") as CourseKey;
  const title = courseKey === "bsc" ? "BSc Electronics" : "Integrated MTech Electronics";
  
  const semMap = academicStructure[courseKey] || {};
  const activeSemesters = Object.keys(semMap)
    .filter((k) => semMap[k as SemesterKey].length > 0)
    .map((k) => parseInt(k.replace("sem_", "")))
    .sort((a, b) => a - b);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16 px-4">
        <div className="max-w-6xl mx-auto">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </button>

          <motion.h1
            className="text-3xl sm:text-4xl font-display font-bold text-foreground mb-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {title}
          </motion.h1>
          <motion.p
            className="text-muted-foreground mb-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            Select a semester to view subjects and question papers
          </motion.p>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {activeSemesters.map((sem, idx) => (
              <motion.button
                key={sem}
                onClick={() => navigate(`/course/${courseId}/semester/${sem}`)}
                className="bg-card border border-border rounded-xl p-6 text-center shadow-card hover:shadow-glow hover:-translate-y-1 transition-all duration-300 group"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <div className="text-3xl font-display font-bold text-foreground group-hover:text-accent transition-colors mb-1">
                  {sem}
                </div>
                <div className="text-xs text-muted-foreground">Semester {sem}</div>
              </motion.button>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CoursePage;
