import { useCallback, useState } from 'react';
import { Upload, FileText, X, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PdfUploadProps {
  file: File | null;
  onFileChange: (file: File | null) => void;
  onMultipleFiles?: (files: File[]) => void;
  error?: string;
}

export default function PdfUpload({ file, onFileChange, onMultipleFiles, error }: PdfUploadProps) {
  const [dragActive, setDragActive] = useState(false);

  const handleFile = useCallback((f: File) => {
    if (f.type !== 'application/pdf') {
      onFileChange(null);
      return;
    }
    onFileChange(f);
  }, [onFileChange]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const files = Array.from(e.dataTransfer.files).filter(f => f.type === 'application/pdf');
    if (files.length > 1 && onMultipleFiles) {
      onMultipleFiles(files);
    } else if (files.length === 1) {
      handleFile(files[0]);
    }
  }, [handleFile, onMultipleFiles]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) handleFile(e.target.files[0]);
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">Resume (PDF)</label>
      {!file ? (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          className={`relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors cursor-pointer
            ${dragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-muted/50'}
            ${error ? 'border-destructive' : ''}`}
          onClick={() => document.getElementById('pdf-input')?.click()}
        >
          <Upload className="mb-3 h-8 w-8 text-muted-foreground" />
          <p className="text-sm font-medium text-foreground">Drop your PDF here or click to browse</p>
          <p className="mt-1 text-xs text-muted-foreground">PDF files only, up to 10MB</p>
          <input
            id="pdf-input"
            type="file"
            accept=".pdf,application/pdf"
            className="hidden"
            onChange={handleInputChange}
          />
        </div>
      ) : (
        <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-medium text-foreground">{file.name}</p>
            <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
          </div>
          <Button variant="ghost" size="icon" onClick={() => onFileChange(null)} className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
      {error && (
        <p className="flex items-center gap-1 text-xs text-destructive">
          <AlertCircle className="h-3 w-3" /> {error}
        </p>
      )}
    </div>
  );
}
