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
import { Loader2, Upload, CheckCircle } from 'lucide-react';
import { academicStructure, CourseKey, SemesterKey } from '@/data/academicStructure';
import { supabase } from '@/lib/supabaseClient';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

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

  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

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
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== 'application/pdf') {
        toast.error('Only PDF files are allowed.');
        return;
      }
      if (selectedFile.size > MAX_FILE_SIZE) {
        toast.error('PDF size must be less than 5 MB.');
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      toast.error('Please select a PDF file');
      return;
    }

    if (file.type !== 'application/pdf') {
      toast.error('Only PDF files are allowed.');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error('PDF size must be less than 5 MB.');
      return;
    }

    if (!formData.course || !formData.semester || !formData.subject_code || !formData.contributor_name || !formData.resource_type) {
      toast.error('Please select course, semester, subject, resource type, and enter contributor name');
      return;
    }
    setIsLoading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const subjectCode = formData.subject_code;
      const matchedSubject = subjectOptions.find((s) => s.value === subjectCode);
      const subjectName = matchedSubject ? matchedSubject.nameOnly : '';
      const fileName = `${subjectCode}_${formData.semester}_${Date.now()}.${fileExt}`;

      // Upload to Supabase storage bucket 'papers_pdf'
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('papers_pdf')
        .upload(fileName, file, { cacheControl: '3600', upsert: false });

      console.log('UPLOAD STORAGE RESPONSE', { uploadData, uploadError });
      if (uploadError) throw uploadError;

      // Get public URL
      const { data: publicUrlData, error: publicUrlError } = await supabase.storage
        .from('papers_pdf')
        .getPublicUrl(fileName);

      console.log('GET PUBLIC URL RESPONSE', { publicUrlData, publicUrlError });
      if (publicUrlError) throw publicUrlError;

      const publicUrl = (publicUrlData as any)?.publicUrl ?? '';
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
      };

      console.log('UPLOAD PAYLOAD', payload);

      // Insert metadata row into elex_papers, mark as not approved
      const { data: insertData, error: insertError } = await supabase
        .from('elex_papers')
        .insert([payload]);

      console.log('INSERT RESPONSE', { insertData, insertError });
      if (insertError) throw insertError;

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
      setFile(null);

      setTimeout(() => setUploadSuccess(false), 3000);
    } catch (err) {
      console.error('Upload error:', err);
      toast.error(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsLoading(false);
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

              {/* PDF Upload */}
              <div>
                <Label htmlFor="pdf" className="text-zinc-200 font-medium">
                  Upload PDF
                </Label>
                <div className="mt-2 relative">
                  <input
                    id="pdf"
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={isLoading}
                  />
                  <label
                    htmlFor="pdf"
                    className="flex flex-col items-center justify-center w-full p-6 border-2 border-dashed border-slate-600 rounded-xl bg-slate-800/30 cursor-pointer hover:bg-slate-800/50 transition-colors"
                  >
                    <Upload className="w-8 h-8 text-blue-400 mb-2" />
                    <span className="text-zinc-300 font-medium">
                      {file ? file.name : 'Click to upload PDF'}
                    </span>
                    <span className="text-zinc-500 text-sm mt-1">
                      Max 5MB
                    </span>
                  </label>
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
                    Uploading...
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
