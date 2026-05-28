import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, Users, Clock, ShieldCheck } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";

interface AnimatedCounterProps {
  value: number;
}

const AnimatedCounter = ({ value }: AnimatedCounterProps) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    const duration = 2000;

    const animate = (time: number) => {
      if (!startTime) startTime = time;
      const progress = time - startTime;
      const percentage = Math.min(progress / duration, 1);
      
      const easeOut = 1 - Math.pow(1 - percentage, 4);
      setCount(Math.floor(easeOut * value));

      if (progress < duration) {
        requestAnimationFrame(animate);
      } else {
        setCount(value);
      }
    };

    requestAnimationFrame(animate);
  }, [value]);

  return <>{count}</>;
};

const StatsSection = () => {
  const { data: statsData, isLoading, isError } = useQuery({
    queryKey: ['homepage-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('elex_papers')
        .select('is_approved, subject_code, contributor_name');

      if (error) throw error;

      let approved = 0;
      let pending = 0;
      const subjects = new Set<string>();
      const contributors = new Set<string>();

      data?.forEach((paper) => {
        if (paper.is_approved) {
          approved++;
          subjects.add(paper.subject_code);
          
          const name = paper.contributor_name?.toLowerCase().trim();
          if (name && !['anonymous', 'system', 'test', 'null', 'admin'].includes(name)) {
            contributors.add(name);
          }
        } else {
          pending++;
        }
      });

      return {
        approved,
        pending,
        subjects: subjects.size,
        contributors: contributors.size
      };
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  const cards = [
    { 
      id: 'approved',
      icon: ShieldCheck, 
      title: "Verified Resources",
      value: statsData?.approved || 0, 
      color: "text-green-400",
      bg: "bg-green-500/10",
      microcopy: "Papers verified by moderators",
      status: "Moderation active"
    },
    { 
      id: 'contributors',
      icon: Users, 
      title: "Active Students",
      value: statsData?.contributors || 0, 
      color: "text-blue-400",
      bg: "bg-blue-500/10",
      microcopy: "Students actively contributing",
      status: "Community maintained"
    },
    { 
      id: 'subjects',
      icon: BookOpen, 
      title: "Academic Subjects",
      value: statsData?.subjects || 0, 
      color: "text-purple-400",
      bg: "bg-purple-500/10",
      microcopy: "Unique course codes covered",
      status: "Archive growing"
    },
  ];

  return (
    <section id="stats" className="py-16 px-4">
      <div className="max-w-6xl mx-auto">
        
        {/* Live Status Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-6 gap-3">
          <div>
            <div className="flex items-center space-x-2 mb-1.5">
              <div className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </div>
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                System Status: Live
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-zinc-200">Vault Activity</h2>
          </div>
          <p className="text-[11px] sm:text-xs text-zinc-500 font-medium">
            Updated dynamically from live vault activity
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {isLoading || isError ? (
            // Skeleton Loaders
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-card border border-border rounded-xl p-5 sm:p-6 shadow-card animate-pulse text-left flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 bg-slate-800 rounded-lg"></div>
                  <div className="w-20 h-5 bg-slate-800 rounded-md"></div>
                </div>
                <div className="h-8 w-16 bg-slate-800 mb-3 rounded"></div>
                <div className="h-4 w-32 bg-slate-800 mb-2 rounded"></div>
                <div className="h-3 w-40 bg-slate-800 rounded"></div>
              </div>
            ))
          ) : (
            // Live Cards
            cards.map((stat, i) => (
              <motion.div
                key={stat.id}
                className="bg-card border border-border rounded-xl p-5 sm:p-6 shadow-card relative overflow-hidden group hover:border-slate-700 transition-colors text-left flex flex-col"
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.3 }}
              >
                {/* Subtle background glow effect on hover */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-900/50 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                
                <div className="flex justify-between items-start mb-4 relative z-10">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.bg} border border-slate-800/50`}>
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <div className="text-[9px] sm:text-[10px] font-medium text-zinc-400 bg-slate-800/30 px-2 py-1 rounded-md border border-slate-800/50 tracking-wide uppercase">
                    {stat.status}
                  </div>
                </div>
                
                <div className="mb-1 relative z-10">
                  <div className="text-3xl sm:text-4xl font-display font-bold text-foreground tracking-tight font-mono">
                    <AnimatedCounter value={stat.value} />
                  </div>
                </div>
                
                <div className="relative z-10">
                  <h3 className="text-sm font-semibold text-zinc-200 mb-1">{stat.title}</h3>
                  <p className="text-[11px] sm:text-xs text-muted-foreground leading-snug">{stat.microcopy}</p>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
