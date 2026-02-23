import { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, User, TrendingUp, AlertTriangle, FileText, Award } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface AnalysisData {
  Name: string;
  "Match score": number;
  Strengths: string[];
  Gaps: string[];
  Summary: string;
  Recommendation: string;
}

interface AnalysisResultsProps {
  data: AnalysisData;
}

function ScoreBar({ score }: { score: number }) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setWidth(score), 100);
    return () => clearTimeout(t);
  }, [score]);

  const color = score >= 70 ? 'bg-success' : score >= 40 ? 'bg-warning' : 'bg-destructive';

  return (
    <div className="space-y-2">
      <div className="flex items-end justify-between">
        <span className="text-sm font-medium text-muted-foreground">Match Score</span>
        <span className="text-3xl font-bold font-heading text-foreground">{score}%</span>
      </div>
      <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full rounded-full transition-all duration-1000 ease-out ${color}`}
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}

export default function AnalysisResults({ data }: AnalysisResultsProps) {
  const isRecommended = data.Recommendation?.toLowerCase().includes('not') === false
    && data.Recommendation?.toLowerCase().includes('recommend');

  return (
    <div className="space-y-6 animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-5">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <User className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold font-heading text-foreground">{data.Name || 'Candidate'}</h2>
          <Badge variant={isRecommended ? 'default' : 'destructive'} className="mt-1">
            <Award className="mr-1 h-3 w-3" />
            {data.Recommendation}
          </Badge>
        </div>
      </div>

      {/* Score */}
      <div className="rounded-xl border border-border bg-card p-5">
        <ScoreBar score={data["Match score"]} />
      </div>

      {/* Strengths & Gaps */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="mb-3 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-success" />
            <h3 className="font-heading font-semibold text-foreground">Strengths</h3>
          </div>
          <ul className="space-y-2">
            {data.Strengths?.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                {s}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="mb-3 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-warning" />
            <h3 className="font-heading font-semibold text-foreground">Gaps</h3>
          </div>
          <ul className="space-y-2">
            {data.Gaps?.map((g, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                {g}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Summary */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="mb-3 flex items-center gap-2">
          <FileText className="h-4 w-4 text-primary" />
          <h3 className="font-heading font-semibold text-foreground">Summary</h3>
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground">{data.Summary}</p>
      </div>
    </div>
  );
}
