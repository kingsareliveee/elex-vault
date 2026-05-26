import { motion } from "framer-motion";
import { FileText, BookOpen, Users } from "lucide-react";

const stats = [
  { icon: FileText, label: "Papers Available", value: "100+", color: "text-accent" },
  { icon: BookOpen, label: "Subjects", value: "40+", color: "text-accent" },
  { icon: Users, label: "Students Using Portal", value: "100+", color: "text-accent" },
];

const StatsSection = () => (
  <section id="stats" className="py-16 px-4">
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            className="bg-card border border-border rounded-2xl p-8 text-center shadow-card"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
          >
            <stat.icon className={`w-8 h-8 mx-auto mb-4 ${stat.color}`} />
            <div className="text-3xl font-display font-bold text-foreground mb-1">{stat.value}</div>
            <div className="text-sm text-muted-foreground">{stat.label}</div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default StatsSection;
