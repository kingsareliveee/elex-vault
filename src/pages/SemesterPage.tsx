import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, BookOpen } from "lucide-react";
import { academicStructure, CourseKey, SemesterKey } from "@/data/academicStructure";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const SemesterPage = () => {
  const { courseId, semId } = useParams<{ courseId: string; semId: string }>();
  const navigate = useNavigate();
  const semester = parseInt(semId || "1");
  const course = (courseId === "bsc" ? "bsc" : "imtech") as CourseKey;
  const semesterKey = `sem_${semester}` as SemesterKey;

  const subjects = academicStructure[course]?.[semesterKey] || [];

  const courseTitle = course === "bsc" ? "BSc Electronics" : "Integrated MTech Electronics";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16 px-4">
        <div className="max-w-6xl mx-auto">
          <button
            onClick={() => navigate(`/course/${courseId}`)}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to {courseTitle}
          </button>

          <motion.h1
            className="text-3xl sm:text-4xl font-display font-bold text-foreground mb-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Semester {semester}
          </motion.h1>
          <motion.p
            className="text-muted-foreground mb-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            {courseTitle} — Semester {semester} Subjects
          </motion.p>

          {subjects.length === 0 ? (
            <p className="text-muted-foreground text-center py-12">No subjects listed yet for this semester.</p>
          ) : (
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              {subjects.map((subject, idx) => (
                <motion.button
                  key={subject.code}
                  onClick={() => navigate(`/subject/${subject.code}`)}
                  className="bg-card border border-border rounded-xl p-6 text-left shadow-card hover:shadow-elevated hover:-translate-y-1 transition-all duration-300 group"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.08 }}
                >
                  <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
                    <BookOpen className="w-5 h-5 text-accent" />
                  </div>
                  <h3 className="font-semibold text-foreground group-hover:text-accent transition-colors">
                    {subject.name}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">{subject.code}</p>
                  <p className="text-xs text-muted-foreground mt-1">View papers & syllabus →</p>
                </motion.button>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default SemesterPage;
