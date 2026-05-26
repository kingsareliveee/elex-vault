import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Zap } from "lucide-react";

const mostSearched = [
  { id: "EL11106", name: "Digital Electronics", icon: "🔌" },
  { id: "EL13101", name: "Analog Electronics and Op-Amp", icon: "📡" },
  { id: "EL14103", name: "Signal & Systems", icon: "📊" },
  { id: "EL11103", name: "Basic Circuit Theory & Network Analysis", icon: "🔗" },
];

const MostSearched = () => {
  const navigate = useNavigate();

  return (
    <section className="py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="flex items-center gap-2 mb-8"
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
        >
          <Zap className="w-5 h-5 text-accent" />
          <h2 className="text-2xl font-display font-bold text-foreground">Most Searched</h2>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {mostSearched.map((item, i) => (
            <motion.button
              key={item.id}
              onClick={() => navigate(`/subject/${item.id}`)}
              className="bg-card border border-border rounded-xl p-6 text-left shadow-card hover:shadow-elevated hover:-translate-y-1 transition-all duration-300 group"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <span className="text-3xl mb-3 block">{item.icon}</span>
              <span className="font-medium text-sm text-foreground group-hover:text-accent transition-colors">
                {item.name}
              </span>
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MostSearched;
