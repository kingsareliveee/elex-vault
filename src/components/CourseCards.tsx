import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { GraduationCap, Cpu } from "lucide-react";

import { academicStructure, CourseKey, SemesterKey } from "@/data/academicStructure";

const getSemesterCount = (courseId: CourseKey) => {
  const semesters = academicStructure[courseId];
  return Object.keys(semesters).filter(
    (k) => semesters[k as SemesterKey].length > 0
  ).length;
};

const CourseCards = () => {
  const navigate = useNavigate();

  const courses = [
    {
      id: "bsc" as CourseKey,
      title: "BSc Electronics",
      semesters: getSemesterCount("bsc"),
      icon: GraduationCap,
      description: "3-year undergraduate programme",
    },
    {
      id: "imtech" as CourseKey,
      title: "Integrated MTech Electronics",
      semesters: getSemesterCount("imtech"),
      icon: Cpu,
      description: "5-year integrated master's programme",
    },
  ];

  return (
    <section className="py-16 px-4 bg-secondary/50">
      <div className="max-w-6xl mx-auto">
        <motion.h2
          className="text-3xl font-display font-bold text-foreground text-center mb-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          Choose Your Course
        </motion.h2>
        <motion.p
          className="text-center text-muted-foreground mb-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          Select your programme to browse semester-wise question papers
        </motion.p>

        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {courses.map((course, i) => (
            <motion.button
              key={course.id}
              onClick={() => navigate(`/course/${course.id}`)}
              className="bg-card border border-border rounded-2xl p-8 text-left shadow-card hover:shadow-glow hover:-translate-y-2 transition-all duration-300 group"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
            >
              <div className="w-14 h-14 rounded-xl gradient-accent flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <course.icon className="w-7 h-7 text-accent-foreground" />
              </div>
              <h3 className="text-xl font-display font-bold text-foreground mb-2">{course.title}</h3>
              <p className="text-sm text-muted-foreground mb-3">{course.description}</p>
              <span className="text-xs font-medium text-accent">{course.semesters} Semesters →</span>
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CourseCards;
