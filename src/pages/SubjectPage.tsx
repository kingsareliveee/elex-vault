import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, FileText, BookOpen, Loader2 } from "lucide-react";
import { findSubjectByCode } from "@/data/academicStructure";
import { supabase } from "@/lib/supabaseClient";
import { useState, useEffect } from "react";
import PaperList from '@/components/PaperList';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const SubjectPage = () => {
  const { subjectId } = useParams<{ subjectId: string }>();
  const navigate = useNavigate();

  const subject = subjectId ? findSubjectByCode(subjectId) : null;
  // Remove dbPapers, use only categorized
  const [categorized, setCategorized] = useState({
    mst_1: [],
    mst_2: [],
    mst_3: [],
    endsem: [],
    syllabus: [],
    assignment: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchPapers() {
      if (!subjectId) return;
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('elex_papers')
          .select('*')
          .eq('is_approved', true)
          .eq('subject_code', subjectId)
          .order('exam_year', { ascending: false });

        if (error) throw error;
        // Categorize by resource_type
        const cat = { mst_1: [], mst_2: [], mst_3: [], endsem: [], syllabus: [], assignment: [] };
        (data || []).forEach((row) => {
          if (cat[row.resource_type]) cat[row.resource_type].push(row);
        });
        setCategorized(cat);
      } catch (err) {
        console.error('Error fetching papers:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchPapers();
  }, [subjectId]);

  if (!subject) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 px-4 text-center">
          <p className="text-muted-foreground">Subject not found.</p>
          <button onClick={() => navigate("/")} className="text-accent mt-4 underline">Go Home</button>
        </div>
      </div>
    );
  }

  const courseTitle = subject.courses
    .map((c) => (c === "bsc" ? "BSc Electronics" : "Integrated MTech Electronics"))
    .join(" & ");

  // Remove subjectPapers, use categorized and mapPapers instead
  // Helper to map paper rows to PaperList format

  const mapPapers = (arr, label) =>
    arr.map((p) => ({
      id: String(p.id),
      subjectId: p.subject_code || subjectId,
      type: label,
      year: p.exam_year,
      downloadUrl: p.file_url,
      contributor: p.contributor_name,
    }));

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>

          {/* Subject Header */}
          <motion.div
            className="bg-card border border-border rounded-2xl overflow-hidden shadow-elevated mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="gradient-navy p-8">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-medium text-primary-foreground/60 bg-primary-foreground/10 px-3 py-1 rounded-full">
                  {courseTitle}
                </span>
                <span className="text-xs font-medium text-primary-foreground/60 bg-primary-foreground/10 px-3 py-1 rounded-full">
                  Semester {subject.semester}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-display font-bold text-primary-foreground">
                {subject.name}
              </h1>
              <p className="text-sm text-primary-foreground/80 mt-2">{subject.code}</p>
            </div>
          </motion.div>

          {/* Syllabus Section */}
          <motion.div
            className="bg-card border border-border rounded-xl p-6 shadow-card mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <BookOpen className="w-5 h-5 text-accent" />
              <h2 className="text-lg font-display font-bold text-foreground">Syllabus</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              Syllabus document will be available soon. Check back later or contact the department.
            </p>
          </motion.div>

          {/* Papers Section */}
          <motion.div
            className="bg-card border border-border rounded-xl p-6 shadow-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <FileText className="w-5 h-5 text-accent" />
              <h2 className="text-lg font-display font-bold text-foreground">Previous Year Question Papers</h2>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-accent" />
                <span className="text-sm text-muted-foreground ml-2">Loading papers...</span>
              </div>
            ) : subjectPapers.length === 0 ? (
              <p className="text-sm text-muted-foreground">No papers uploaded yet for this subject.</p>
            ) : (
              <PaperList papers={subjectPapers} />
            )}
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default SubjectPage;
