import { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import PdfUpload from '@/components/PdfUpload';
import AnalysisResults from '@/components/AnalysisResults';
import { extractTextFromPDF } from '@/lib/pdf-extract';

const WEBHOOK_URL = 'https://sosankaaa.app.n8n.cloud/webhook/resume-analysis';

export default function Index() {
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [pdfError, setPdfError] = useState('');
  const [jdError, setJdError] = useState('');
  const { toast } = useToast();

  const validate = () => {
    let valid = true;
    if (!file) { setPdfError('Please upload a PDF resume.'); valid = false; } else { setPdfError(''); }
    if (!jobDescription.trim()) { setJdError('Please enter a job description.'); valid = false; } else { setJdError(''); }
    return valid;
  };

  const handleAnalyze = async () => {
    if (!validate() || !file) return;
    setLoading(true);
    setResults(null);

    try {
      const resumeText = await extractTextFromPDF(file);

      const res = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resume_text: resumeText,
          job_description: jobDescription.trim(),
        }),
      });

      if (!res.ok) throw new Error(`Server error (${res.status})`);

      const data = await res.json();
      setResults(data);
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
            <h2 className="font-heading text-2xl font-bold text-foreground">Analyze your resume</h2>
            <p className="mt-1 text-sm text-muted-foreground">Upload your resume and paste the job description to get an AI-powered match analysis.</p>
          </div>

          <PdfUpload file={file} onFileChange={(f) => { setFile(f); setPdfError(''); }} error={pdfError} />

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
        {results && <AnalysisResults data={results} />}
      </main>
    </div>
  );
}
