import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2, Upload, CheckCircle, X } from 'lucide-react';
import { academicStructure, CourseKey, SemesterKey } from '@/data/academicStructure';
import { supabase } from '@/lib/supabaseClient';
const MAX_TOTAL_SIZE = 10 * 1024 * 1024; // 10 MB limit for multiple files
const MAX_FILE_COUNT = 10;

interface UploadFormData {
  course: string;
  semester: string;
  subject_code: string;
  exam_year: number;
  contributor_name: string;
  resource_type: string;
}

export const VaultUploadSection = () => {
  const [formData, setFormData] = useState<UploadFormData>({
    course: '',
    semester: '',
    subject_code: '',
    exam_year: new Date().getFullYear(),
    contributor_name: '',
    resource_type: '',
  });
  // Resource type options
  const resourceTypeOptions = [
    { value: 'mst_1', label: 'MST 1' },
    { value: 'mst_2', label: 'MST 2' },
    { value: 'mst_3', label: 'MST 3' },
    { value: 'endsem', label: 'EndSem' },
    { value: 'syllabus', label: 'Syllabus' },
    { value: 'assignment', label: 'Assignment' },
  ];

  const [files, setFiles] = useState<File[]>([]);
  const [conversionProgress, setConversionProgress] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [processingStep, setProcessingStep] = useState<string>('');

  const coursesOptions = [
    { value: 'bsc', label: 'BSc Electronics' },
    { value: 'imtech', label: 'Integrated MTech Electronics' },
  ];

  // Dynamically compute semesters based on course
  const semestersOptions = useMemo(() => {
    if (!formData.course) return [];
    const maxSem = formData.course === 'bsc' ? 6 : 10;
    return Array.from({ length: maxSem }, (_, i) => {
      const semVal = `sem_${i + 1}`;
      return { value: semVal, label: `Semester ${i + 1}` };
    });
  }, [formData.course]);

  // Dynamically compute subjects based on course + semester
  const subjectOptions = useMemo(() => {
    if (!formData.course || !formData.semester) return [];
    const subjects = academicStructure[formData.course as CourseKey]?.[formData.semester as SemesterKey] || [];
    return subjects.map((sub) => ({
      value: sub.code,
      label: `${sub.name} (${sub.code})`,
      nameOnly: sub.name
    }));
  }, [formData.course, formData.semester]);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - i);

  const handleInputChange = (field: keyof UploadFormData, value: string | number) => {
    setFormData((prev) => {
      const updated = {
        ...prev,
        [field]: value,
      };
      
      // If course changes, reset semester and subject
      if (field === 'course') {
        updated.semester = '';
        updated.subject_code = '';
      }
      // If semester changes, reset subject
      if (field === 'semester') {
        updated.subject_code = '';
      }
      
      return updated;
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
      
      const validFiles = selectedFiles.filter(f => allowedTypes.includes(f.type));
      if (validFiles.length !== selectedFiles.length) {
        toast.error('Only PDF, JPG, JPEG, and PNG files are allowed.');
      }
      
      const totalSize = [...files, ...validFiles].reduce((acc, f) => acc + f.size, 0);
      if (totalSize > MAX_TOTAL_SIZE) {
        toast.error('Total file size exceeds 10 MB limit.');
        return;
      }
      if (files.length + validFiles.length > MAX_FILE_COUNT) {
        toast.error('You can only upload a maximum of 10 images at once.');
        return;
      }

      const hasPdf = files.some(f => f.type === 'application/pdf') || validFiles.some(f => f.type === 'application/pdf');
      if (hasPdf && (files.length + validFiles.length > 1)) {
        toast.error('Cannot combine multiple files if a PDF is included. Upload images only to merge them.');
        return;
      }

      setFiles(prev => [...prev, ...validFiles]);
      e.target.value = '';
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (files.length === 0) {
      toast.error('Please select a PDF or image files');
      return;
    }

    if (!formData.course || !formData.semester || !formData.subject_code || !formData.contributor_name || !formData.resource_type) {
      toast.error('Please select course, semester, subject, resource type, and enter contributor name');
      return;
    }

    // --- FEATURE 1: NAME QUALITY FILTER ---
    const rawName = formData.contributor_name.trim();
    if (rawName.length < 3 || rawName.length > 40) {
      toast.error('Contributor name must be between 3 and 40 characters.');
      return;
    }

    const spamRegex = /^(abc|xyz|qwerty|123|anonymous|test|null|admin|asd)$/i;
    // Basic protection against entirely numeric or special-char-only names
    if (spamRegex.test(rawName) || /^[^a-zA-Z]+$/.test(rawName)) {
      toast.error('Please enter a valid contributor name.');
      return;
    }

    setIsLoading(true);
    setProcessingStep('Checking for duplicates...');

    try {
      const subjectCode = formData.subject_code;

      // --- FEATURE 2: DUPLICATE PREVENTION ---
      const { data: existingPapers, error: checkError } = await supabase
        .from('elex_papers')
        .select('id')
        .eq('subject_code', subjectCode)
        .eq('resource_type', formData.resource_type)
        .eq('exam_year', formData.exam_year)
        .eq('is_approved', true)
        .limit(1);

      if (checkError) throw checkError;

      if (existingPapers && existingPapers.length > 0) {
        toast.error('This paper already exists in the vault.');
        setIsLoading(false);
        setProcessingStep('');
        return; // BLOCK upload
      }

      // Process files based on type
      let fileToUpload: File;
      if (files.length === 1 && files[0].type === 'application/pdf') {
        fileToUpload = files[0];
      } else {
        setProcessingStep('Loading PDF generator...');
        setConversionProgress(0);
        // Dynamically import heavy libraries for code splitting
        const { jsPDF } = await import('jspdf');
        const imageCompression = (await import('browser-image-compression')).default;
        
        const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
        const a4Width = 210;
        const a4Height = 297;
        
        for (let i = 0; i < files.length; i++) {
          setProcessingStep(`Compressing image ${i + 1} of ${files.length}...`);
          setConversionProgress(Math.round(((i) / files.length) * 100));
          
          const options = { maxSizeMB: 1, maxWidthOrHeight: 1920, useWebWorker: true };
          let compressedFile = files[i];
          try {
            compressedFile = await imageCompression(files[i], options);
          } catch (err) {
            console.error('Compression error:', err);
          }
          
          setProcessingStep(`Adding page ${i + 1} to PDF...`);
          
          await new Promise<void>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
              const imgDataUrl = e.target?.result as string;
              const img = new Image();
              img.onload = () => {
                const imgWidth = img.naturalWidth || img.width;
                const imgHeight = img.naturalHeight || img.height;
                const aspectRatio = imgWidth / imgHeight;
                const a4AspectRatio = a4Width / a4Height;
                let width = a4Width, height = a4Height, x = 0, y = 0;
                
                if (aspectRatio > a4AspectRatio) {
                  width = a4Width;
                  height = a4Width / aspectRatio;
                  y = (a4Height - height) / 2;
                } else {
                  height = a4Height;
                  width = a4Height * aspectRatio;
                  x = (a4Width - width) / 2;
                }
                
                let format = 'JPEG';
                if (compressedFile.type === 'image/png') format = 'PNG';
                
                if (i > 0) pdf.addPage();
                pdf.addImage(imgDataUrl, format, x, y, width, height, undefined, 'FAST');
                resolve();
              };
              img.onerror = () => reject(new Error('Failed to load image for PDF'));
              img.src = imgDataUrl;
            };
            reader.onerror = () => reject(new Error('Failed to read image file'));
            reader.readAsDataURL(compressedFile);
          });
        }
        
        setProcessingStep('Finalizing PDF...');
        setConversionProgress(100);
        const pdfBlob = pdf.output('blob');
        const baseName = files[0].name.split('.').slice(0, -1).join('.') || 'document';
        fileToUpload = new File([pdfBlob], `${baseName}_merged.pdf`, { type: 'application/pdf' });
      }

      setProcessingStep('Uploading PDF to vault...');
      const matchedSubject = subjectOptions.find((s) => s.value === subjectCode);
      const subjectName = matchedSubject ? matchedSubject.nameOnly : '';
      const fileExt = fileToUpload.type === 'application/pdf' ? 'pdf' : fileToUpload.name.split('.').pop() || 'pdf';
      const fileName = `${subjectCode}_${formData.semester}_${Date.now()}.${fileExt}`;

      // Upload to Supabase storage bucket 'papers_pdf'
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('papers_pdf')
        .upload(fileName, fileToUpload, { cacheControl: '3600', upsert: false });

      console.log('UPLOAD STORAGE RESPONSE', { uploadData, uploadError });
      if (uploadError) throw uploadError;

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from('papers_pdf')
        .getPublicUrl(fileName);

      console.log('GET PUBLIC URL RESPONSE', { publicUrlData });

      const publicUrl = publicUrlData?.publicUrl ?? '';
      if (!publicUrl) {
        throw new Error('Public URL was not returned from Supabase storage');
      }

      const payload = {
        course: formData.course,
        semester: formData.semester,
        subject_code: subjectCode,
        subject_name: subjectName,
        exam_year: formData.exam_year,
        contributor_name: formData.contributor_name,
        file_url: publicUrl,
        is_approved: false,
        resource_type: formData.resource_type,
        storage_path: fileName,
      };

      console.log('UPLOAD PAYLOAD', payload);

      setProcessingStep('Saving metadata...');
      // Insert metadata row into elex_papers, mark as not approved
      const { data: insertData, error: insertError } = await supabase
        .from('elex_papers')
        .insert([payload]);

      console.log('INSERT RESPONSE', { insertData, insertError });
      if (insertError) {
        // Rollback storage upload to prevent orphaned file
        await supabase.storage
          .from('papers_pdf')
          .remove([fileName]);

        if (insertError.code === '23505') {
          throw new Error('This paper has already been submitted or approved in the vault. Please verify your resource details.');
        }
        throw insertError;
      }

      setUploadSuccess(true);
      toast.success('Paper uploaded successfully — pending admin approval.');

      // Reset form
      setFormData({
        course: '',
        semester: '',
        subject_code: '',
        exam_year: new Date().getFullYear(),
        contributor_name: '',
        resource_type: '',
      });
      setFiles([]);
      setConversionProgress(0);

      setTimeout(() => setUploadSuccess(false), 3000);
    } catch (err) {
      console.error('Upload error:', err);
      toast.error(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsLoading(false);
      setProcessingStep('');
    }
  };

  return (
    <section className="relative min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 overflow-hidden">
      {/* Animated background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(148,163,184,0.05)_1px,transparent_1px),linear-gradient(rgba(148,163,184,0.05)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none" />
      
      {/* Gradient orbs */}
      <div className="absolute top-20 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-2xl mx-auto px-4 py-16 sm:py-24">
        <div className="mb-12 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-zinc-200 via-zinc-100 to-blue-200 mb-4">
            Contribute Papers
          </h1>
          <p className="text-zinc-400 text-lg max-w-md mx-auto">
            Share your exam papers to help fellow engineering students prepare
          </p>
        </div>

        <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 shadow-2xl">
          {uploadSuccess ? (
            <div className="flex flex-col items-center justify-center py-12">
              <CheckCircle className="w-16 h-16 text-green-500 mb-4 animate-bounce" />
              <h3 className="text-xl font-semibold text-zinc-100 mb-2">Upload Successful!</h3>
              <p className="text-zinc-400 text-center">
                Your paper has been submitted for review. We'll notify you once it's approved.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Resource Type Dropdown */}
              <div>
                <Label htmlFor="resource_type" className="text-zinc-200 font-medium">
                  Resource Type
                </Label>
                <Select
                  value={formData.resource_type}
                  onValueChange={(value) => handleInputChange('resource_type', value)}
                  disabled={isLoading}
                >
                  <SelectTrigger className="mt-2 bg-slate-800/50 border-slate-600 text-zinc-100 focus:border-blue-500 focus:ring-blue-500/20">
                    <SelectValue placeholder="Select resource type" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600">
                    {resourceTypeOptions.map((r) => (
                      <SelectItem key={r.value} value={r.value} className="text-zinc-100">
                        {r.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {/* Course Selection */}
              <div>
                <Label htmlFor="course" className="text-zinc-200 font-medium">
                  Course
                </Label>
                <Select
                  value={formData.course}
                  onValueChange={(value) => handleInputChange('course', value)}
                  disabled={isLoading}
                >
                  <SelectTrigger className="mt-2 bg-slate-800/50 border-slate-600 text-zinc-100 focus:border-blue-500 focus:ring-blue-500/20">
                    <SelectValue placeholder="Select course" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600">
                    {coursesOptions.map((c) => (
                      <SelectItem key={c.value} value={c.value} className="text-zinc-100">
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Semester & Year Row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="semester" className="text-zinc-200 font-medium">
                    Semester
                  </Label>
                  <Select
                    value={formData.semester}
                    onValueChange={(value) => handleInputChange('semester', value)}
                    disabled={isLoading || !formData.course}
                  >
                    <SelectTrigger className="mt-2 bg-slate-800/50 border-slate-600 text-zinc-100 focus:border-blue-500 focus:ring-blue-500/20">
                      <SelectValue placeholder={formData.course ? 'Select semester' : 'Select course first'} />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-600">
                      {semestersOptions.length === 0 ? (
                        <SelectItem value="no-semesters" disabled className="text-zinc-400">No semesters</SelectItem>
                      ) : (
                        semestersOptions.map((sem) => (
                          <SelectItem key={sem.value} value={sem.value} className="text-zinc-100">
                            {sem.label}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="year" className="text-zinc-200 font-medium">
                    Exam Year
                  </Label>
                  <Select value={String(formData.exam_year)} onValueChange={(value) => handleInputChange('exam_year', parseInt(value))} disabled={isLoading}>
                    <SelectTrigger className="mt-2 bg-slate-800/50 border-slate-600 text-zinc-100 focus:border-blue-500 focus:ring-blue-500/20">
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-600">
                      {years.map((year) => (
                        <SelectItem key={year} value={String(year)} className="text-zinc-100">
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Subject Dropdown */}
              <div>
                <Label htmlFor="subject" className="text-zinc-200 font-medium">
                  Subject
                </Label>
                <Select
                  value={formData.subject_code}
                  onValueChange={(value) => handleInputChange('subject_code', value)}
                  disabled={isLoading || !formData.semester}
                >
                  <SelectTrigger className="mt-2 bg-slate-800/50 border-slate-600 text-zinc-100 focus:border-blue-500 focus:ring-blue-500/20">
                    <SelectValue placeholder={formData.semester ? 'Select subject' : 'Select semester first'} />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600">
                    {subjectOptions.length === 0 ? (
                      <SelectItem value="no-subjects" disabled className="text-zinc-400">No subjects</SelectItem>
                    ) : (
                      subjectOptions.map((s) => (
                        <SelectItem key={s.value} value={s.value} className="text-zinc-100 hover:bg-slate-700">
                          {s.label}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Contributor Name */}
              <div>
                <Label htmlFor="contributor" className="text-zinc-200 font-medium">
                  Contributor Name
                </Label>
                <Input
                  id="contributor"
                  placeholder="Your name"
                  value={formData.contributor_name}
                  onChange={(e) => handleInputChange('contributor_name', e.target.value)}
                  className="mt-2 bg-slate-800/50 border-slate-600 text-zinc-100 placeholder:text-zinc-500 focus:border-blue-500 focus:ring-blue-500/20"
                  disabled={isLoading}
                />
              </div>

              {/* PDF or Image Upload */}
              <div>
                <Label htmlFor="pdf" className="text-zinc-200 font-medium">
                  Upload PDF or Images
                </Label>
                <div className="mt-2 space-y-4">
                  <div className="relative">
                    <input
                      id="pdf"
                      type="file"
                      multiple
                      accept=".pdf,image/jpeg,image/jpg,image/png"
                      onChange={handleFileChange}
                      className="hidden"
                      disabled={isLoading}
                    />
                    <label
                      htmlFor="pdf"
                      className="flex flex-col items-center justify-center w-full p-6 border-2 border-dashed border-slate-600 rounded-xl bg-slate-800/30 cursor-pointer hover:bg-slate-800/50 transition-colors"
                    >
                      <Upload className="w-8 h-8 text-blue-400 mb-2" />
                      <span className="text-zinc-300 font-medium text-center">
                        Click to upload PDF or Images
                      </span>
                      <span className="text-zinc-500 text-xs mt-1 text-center font-normal">
                        Multiple images will be merged into a single PDF.
                      </span>
                      <span className="text-zinc-500 text-xs mt-1">
                        Max 10MB total, up to 10 files
                      </span>
                    </label>
                  </div>

                  {files.length > 0 && (
                    <div className="bg-slate-800/30 border border-slate-700 p-3 rounded-xl">
                      <div className="flex items-center justify-between mb-3 border-b border-slate-700/50 pb-2">
                        <span className="text-xs font-semibold text-zinc-300">Selected Files ({files.length})</span>
                        {conversionProgress > 0 && conversionProgress < 100 && (
                          <span className="text-xs font-bold text-blue-400">{conversionProgress}% Converted</span>
                        )}
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {files.map((f, idx) => (
                          <div key={idx} className="relative group rounded-lg overflow-hidden border border-slate-700 bg-slate-800/50 flex flex-col items-center p-2">
                            {f.type.startsWith('image/') ? (
                              <img src={URL.createObjectURL(f)} alt="preview" className="h-16 object-contain mb-2" />
                            ) : (
                              <div className="h-16 flex items-center justify-center mb-2">
                                <span className="text-xs font-bold text-red-400">PDF</span>
                              </div>
                            )}
                            <span className="text-[10px] text-zinc-400 truncate w-full text-center">{f.name}</span>
                            <button
                              type="button"
                              onClick={() => removeFile(idx)}
                              disabled={isLoading}
                              className="absolute top-1 right-1 bg-red-500/80 hover:bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-2 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {processingStep || 'Uploading...'}
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Paper
                  </>
                )}
              </Button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};
