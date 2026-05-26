import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { searchSubjects, getDidYouMean, type DetailedSubject } from "@/data/academicStructure";

const SmartSearch = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<DetailedSubject[]>([]);
  const [didYouMean, setDidYouMean] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleChange = (value: string) => {
    setQuery(value);
    if (value.trim().length > 1) {
      const found = searchSubjects(value);
      setResults(found);
      setDidYouMean(getDidYouMean(value));
      setIsOpen(true);
    } else {
      setResults([]);
      setDidYouMean(null);
      setIsOpen(false);
    }
  };

  const handleSelect = (subject: DetailedSubject) => {
    setIsOpen(false);
    setQuery(subject.name);
    navigate(`/subject/${subject.code}`);
  };

  const handleDidYouMean = () => {
    if (didYouMean) {
      setQuery(didYouMean);
      handleChange(didYouMean);
    }
  };

  return (
    <div ref={wrapperRef} className="relative w-full max-w-2xl mx-auto" id="search">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => query.length > 1 && setIsOpen(true)}
          placeholder="Search subjects, papers, syllabus..."
          className="w-full pl-12 pr-4 py-4 rounded-2xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent shadow-elevated text-base transition-all"
        />
      </div>

      {isOpen && (results.length > 0 || didYouMean) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-elevated overflow-hidden z-50 search-dropdown animate-fade-in">
          {didYouMean && didYouMean.toLowerCase() !== query.toLowerCase() && (
            <button
              onClick={handleDidYouMean}
              className="w-full px-4 py-3 text-left text-sm border-b border-border hover:bg-secondary transition-colors"
            >
              <span className="text-muted-foreground">Did you mean: </span>
              <span className="font-semibold text-accent">{didYouMean}</span>?
            </button>
          )}
          {results.slice(0, 6).map((subject) => (
            <button
              key={subject.code}
              onClick={() => handleSelect(subject)}
              className="w-full px-4 py-3 text-left text-sm hover:bg-secondary transition-colors flex items-center justify-between"
            >
              <span className="text-foreground font-medium">{subject.name}</span>
              <span className="text-xs text-muted-foreground ml-2">{subject.code}</span>
              <span className="text-xs text-muted-foreground">
                {subject.courses.map((c) => (c === "bsc" ? "BSc" : "I.MTech")).join(" & ")} • Sem {subject.semester}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SmartSearch;
