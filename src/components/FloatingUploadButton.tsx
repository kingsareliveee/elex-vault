import { useNavigate } from 'react-router-dom';
import { Upload } from 'lucide-react';

const FloatingUploadButton = () => {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate('/vault')}
      className="fixed z-50 bottom-6 right-6 sm:bottom-8 sm:right-8 flex items-center gap-2 px-5 py-3 rounded-full bg-slate-900/80 border border-slate-700/60 shadow-xl text-zinc-100 font-semibold text-base sm:text-lg transition-all duration-200 hover:scale-105 hover:bg-slate-800/90 hover:shadow-2xl active:scale-95 fab-glass"
      aria-label="Upload Resource"
    >
      <Upload className="w-6 h-6 text-blue-400 drop-shadow" />
      <span className="hidden sm:inline">Upload Resource</span>
    </button>
  );
};

export default FloatingUploadButton;