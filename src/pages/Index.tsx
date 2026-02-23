import { useState } from 'react';
import { Sparkles, Loader2, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import PdfUpload from '@/components/PdfUpload';
import AnalysisResults from '@/components/AnalysisResults';
import { extractTextFromPDF } from '@/lib/pdf-extract';

const WEBHOOK_URL = 'https://sosankaaa.app.n8n.cloud/webhook/resume-analysis';

interface ResumeEntry {
  id: string;
  file: File | null;
  pdfError: string;
}

interface AnalysisResult {
  fileName: string;
  data: {
    Name: string;
    "Match score": number;
    Strengths: string[];
    Gaps: string[];
    Summary: string;
    Recommendation: string;
  };
}

export default function Index() {
  const [resumes, setResumes] = useState<ResumeEntry[]>([
    { id: crypto.randomUUID(), file: null, pdfError: '' },
  ]);
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<AnalysisResult[]>([]);
  const [jdError, setJdError] = useState('');
  const { toast } = useToast();

  const addResume = () => {
    setResumes((prev) => [...prev, { id: crypto.randomUUID(), file: null, pdfError: '' }]);
  };

  const removeResume = (id: string) => {
    if (resumes.length <= 1) return;
    setResumes((prev) => prev.filter((r) => r.id !== id));
  };

  const updateResume = (id: string, file: File | null) => {
    setResumes((prev) =>
      prev.map((r) => (r.id === id ? { ...r, file, pdfError: '' } : r))
    );
  };

  const handleMultipleFiles = (targetId: string, files: File[]) => {
    setResumes((prev) => {
      const idx = prev.findIndex((r) => r.id === targetId);
      if (idx === -1) return prev;
      const updated = [...prev];
      // Set the first file on the current slot
      updated[idx] = { ...updated[idx], file: files[0], pdfError: '' };
      // Add new slots for the rest
      const newEntries = files.slice(1).map((f) => ({
        id: crypto.randomUUID(),
        file: f,
        pdfError: '',
      }));
      updated.splice(idx + 1, 0, ...newEntries);
      return updated;
    });
  };

  const validate = () => {
    let valid = true;
    const updated = resumes.map((r) => {
      if (!r.file) {
        valid = false;
        return { ...r, pdfError: 'Please upload a PDF resume.' };
      }
      return { ...r, pdfError: '' };
    });
    setResumes(updated);
    if (!jobDescription.trim()) {
      setJdError('Please enter a job description.');
      valid = false;
    } else {
      setJdError('');
    }
    return valid;
  };

  const handleAnalyze = async () => {
    if (!validate()) return;
    setLoading(true);
    setResults([]);

    try {
      const analysisResults: AnalysisResult[] = [];

      for (const resume of resumes) {
        if (!resume.file) continue;
        const resumeText = await extractTextFromPDF(resume.file);

        const res = await fetch(WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            resume_text: resumeText,
            job_description: jobDescription.trim(),
          }),
        });

        if (!res.ok) throw new Error(`Server error (${res.status})`);

        const raw = await res.json();
        // Handle both array and object responses
        const data = Array.isArray(raw) ? raw[0] : raw;

        analysisResults.push({
          fileName: resume.file.name,
          data,
        });
      }

      setResults(analysisResults);
    } catch (err: any) {
      toast({
        title: 'Analysis Failed',
        description: err.message || 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-3xl items-center gap-2 px-4 py-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Sparkles className="h-4 w-4 text-primary-foreground" />
          </div>
          <h1 className="font-heading text-lg font-bold text-foreground">AI Resume Match Analyzer</h1>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8 space-y-8">
        {/* Input Section */}
        <section className="space-y-6">
          <div>
            <h2 className="font-heading text-2xl font-bold text-foreground">Analyze your resumes</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Upload one or more resumes and paste the job description to get AI-powered match analysis.
            </p>
          </div>

          {/* Multiple Resume Uploads */}
          <div className="space-y-4">
            {resumes.map((resume, index) => (
              <div key={resume.id} className="relative">
                {resumes.length > 1 && (
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">Resume {index + 1}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeResume(resume.id)}
                      className="h-6 px-2 text-xs text-destructive hover:text-destructive"
                    >
                      <Trash2 className="mr-1 h-3 w-3" />
                      Remove
                    </Button>
                  </div>
                )}
                <PdfUpload
                  file={resume.file}
                  onFileChange={(f) => updateResume(resume.id, f)}
                  onMultipleFiles={(files) => handleMultipleFiles(resume.id, files)}
                  error={resume.pdfError}
                />
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={addResume} className="w-full">
              <Plus className="mr-1 h-4 w-4" />
              Add Another Resume
            </Button>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Job Description</label>
            <Textarea
              placeholder="Paste the full job description here..."
              value={jobDescription}
              onChange={(e) => { setJobDescription(e.target.value); setJdError(''); }}
              rows={6}
              className={jdError ? 'border-destructive' : ''}
            />
            {jdError && <p className="text-xs text-destructive">{jdError}</p>}
          </div>

          <Button onClick={handleAnalyze} disabled={loading} className="w-full" size="lg">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Analyze Match
              </>
            )}
          </Button>
        </section>

        {/* Results */}
        {results.length > 0 && (
          <section className="space-y-6">
            <h2 className="font-heading text-xl font-bold text-foreground">
              Results ({results.length} resume{results.length > 1 ? 's' : ''})
            </h2>
            {results.map((result, i) => (
              <div key={i}>
                {results.length > 1 && (
                  <p className="mb-2 text-xs font-medium text-muted-foreground">
                    File: {result.fileName}
                  </p>
                )}
                <AnalysisResults data={result.data} />
              </div>
            ))}
          </section>
        )}
      </main>
    </div>
  );
}
