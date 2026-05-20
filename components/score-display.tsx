"use client";

import type { ATSResult } from "@/lib/ats-evaluator";
import { cn } from "@/lib/utils";
import { Award, CheckCircle2, XCircle, AlertCircle, TrendingUp } from "lucide-react";

interface ScoreDisplayProps {
  result: ATSResult;
}

export function ScoreDisplay({ result }: ScoreDisplayProps) {
  const getVerdictColor = (verdict: string) => {
    switch (verdict) {
      case "Excellent":
        return "text-emerald-400";
      case "Good":
        return "text-primary";
      case "Average":
        return "text-amber-400";
      default:
        return "text-destructive";
    }
  };

  const getScoreColor = (score: number, max: number) => {
    const percentage = (score / max) * 100;
    if (percentage >= 70) return "bg-emerald-500";
    if (percentage >= 50) return "bg-primary";
    if (percentage >= 30) return "bg-amber-500";
    return "bg-destructive";
  };

  return (
    <div className="space-y-6">
      {/* Main Score Card */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Award className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Overall Score</p>
              <p className="text-4xl font-bold text-foreground">{result.totalScore}<span className="text-xl text-muted-foreground">/100</span></p>
            </div>
          </div>
          <div className={cn("text-2xl font-bold", getVerdictColor(result.verdict))}>
            {result.verdict}
          </div>
        </div>

        {/* Score Breakdown */}
        <div className="grid grid-cols-3 gap-4">
          <ScoreBar label="ATS Compatibility" score={result.atsScore} max={30} color={getScoreColor(result.atsScore, 30)} />
          <ScoreBar label="Skills Match" score={result.skillsScore} max={40} color={getScoreColor(result.skillsScore, 40)} />
          <ScoreBar label="Experience" score={result.experienceScore} max={30} color={getScoreColor(result.experienceScore, 30)} />
        </div>
      </div>

      {/* Skills Analysis */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <h3 className="font-semibold text-foreground">Matched Skills</h3>
            <span className="ml-auto text-sm text-muted-foreground">{result.matchedSkills.length}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {result.matchedSkills.length > 0 ? (
              result.matchedSkills.map((skill, index) => (
                <span key={index} className="px-3 py-1 text-sm rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {skill}
                </span>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No skills matched</p>
            )}
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <XCircle className="w-5 h-5 text-destructive" />
            <h3 className="font-semibold text-foreground">Missing Skills</h3>
            <span className="ml-auto text-sm text-muted-foreground">{result.missingSkills.length}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {result.missingSkills.length > 0 ? (
              result.missingSkills.slice(0, 10).map((skill, index) => (
                <span key={index} className="px-3 py-1 text-sm rounded-full bg-destructive/10 text-destructive border border-destructive/20">
                  {skill}
                </span>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">All required skills present!</p>
            )}
          </div>
        </div>
      </div>

      {/* Experience Analysis */}
      {(result.requiredYears !== null || result.detectedYears !== null) && (
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">Experience Analysis</h3>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="text-center p-4 rounded-lg bg-secondary/50">
              <p className="text-sm text-muted-foreground mb-1">Required</p>
              <p className="text-2xl font-bold text-foreground">
                {result.requiredYears !== null ? `${result.requiredYears} years` : "Not specified"}
              </p>
            </div>
            <div className="text-center p-4 rounded-lg bg-secondary/50">
              <p className="text-sm text-muted-foreground mb-1">Detected</p>
              <p className="text-2xl font-bold text-foreground">
                {result.detectedYears !== null ? `${result.detectedYears} years` : "Not detected"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Detailed Feedback */}
      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <AlertCircle className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">Detailed Feedback</h3>
        </div>
        <div className="space-y-4">
          <FeedbackSection title="ATS Compatibility" items={result.feedback.ats} />
          <FeedbackSection title="Skills Analysis" items={result.feedback.skills} />
          <FeedbackSection title="Experience Evaluation" items={result.feedback.experience} />
        </div>
      </div>
    </div>
  );
}

function ScoreBar({ label, score, max, color }: { label: string; score: number; max: number; color: string }) {
  const percentage = (score / max) * 100;
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="text-foreground font-medium">{score}/{max}</span>
      </div>
      <div className="h-2 bg-secondary rounded-full overflow-hidden">
        <div 
          className={cn("h-full rounded-full transition-all duration-500", color)}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function FeedbackSection({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h4 className="text-sm font-medium text-muted-foreground mb-2">{title}</h4>
      <ul className="space-y-1">
        {items.map((item, index) => (
          <li key={index} className="text-sm text-foreground flex items-start gap-2">
            <span className="text-primary mt-1">•</span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
