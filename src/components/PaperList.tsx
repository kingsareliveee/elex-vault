import { motion } from 'framer-motion';
import { Download, User } from 'lucide-react';
import type { Paper } from '@/data/subjects';

type Props = {
  papers: Paper[];
};

export default function PaperList({ papers }: Props) {
  if (!papers || papers.length === 0) return null;

  return (
    <div className="space-y-3">
      {papers
        .sort((a, b) => b.year - a.year || a.type.localeCompare(b.type))
        .map((paper, idx) => (
          <motion.div
            key={paper.id}
            className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 + idx * 0.04 }}
          >
            <div className="flex flex-col gap-1">
              <span className="font-medium text-sm text-foreground">
                {paper.type} {paper.year}
              </span>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <User className="w-3 h-3" />
                <span>Uploaded by {paper.contributor || 'Anonymous'}</span>
              </div>
            </div>
            <a
              href={paper.downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => {
                if (!paper.downloadUrl || paper.downloadUrl === '#' || paper.downloadUrl.startsWith('#')) {
                  e.preventDefault();
                  alert('PDF download will be available once papers are uploaded.');
                }
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg gradient-accent text-accent-foreground text-xs font-medium hover:opacity-90 transition-opacity"
            >
              <Download className="w-3.5 h-3.5" />
              Download PDF
            </a>
          </motion.div>
        ))}
    </div>
  );
}
