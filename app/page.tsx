"use client";

import React from "react"

import { useState, useCallback } from "react";
import { Header } from "@/components/header";
import { EvaluationForm } from "@/components/evaluation-form";
import { ScoreDisplay } from "@/components/score-display";
import { evaluateResume, type ATSResult } from "@/lib/ats-evaluator";
import { FileSearch, Target, Zap, Shield } from "lucide-react";

export default function Home() {
  const [result, setResult] = useState<ATSResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleEvaluate = useCallback((resumeText: string, jobDescription: string) => {
    setIsLoading(true);
    
    // Simulate processing time for better UX
    setTimeout(() => {
      const evaluationResult = evaluateResume(resumeText, jobDescription);
      setResult(evaluationResult);
      setIsLoading(false);
    }, 800);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-balance">
            ATS-Friendly Resume Evaluation
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-pretty">
            Get instant feedback on your resume{"'"}s ATS compatibility, skills match, and experience alignment.
            Our rule-based system works for any role - IT or Non-IT.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-4 gap-4 mb-10">
          <FeatureCard
            icon={FileSearch}
            title="ATS Check"
            description="Verify resume formatting and section structure"
          />
          <FeatureCard
            icon={Target}
            title="Skills Match"
            description="Compare your skills against job requirements"
          />
          <FeatureCard
            icon={Zap}
            title="Experience Analysis"
            description="Evaluate years of experience alignment"
          />
          <FeatureCard
            icon={Shield}
            title="Detailed Feedback"
            description="Get actionable improvement suggestions"
          />
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Form */}
          <div>
            <h3 className="text-xl font-semibold text-foreground mb-4">Input</h3>
            <EvaluationForm onEvaluate={handleEvaluate} isLoading={isLoading} />
          </div>

          {/* Results */}
          <div>
            <h3 className="text-xl font-semibold text-foreground mb-4">Results</h3>
            {result ? (
              <ScoreDisplay result={result} />
            ) : (
              <div className="bg-card border border-border rounded-xl p-12 text-center">
                <div className="w-16 h-16 rounded-full bg-secondary mx-auto mb-4 flex items-center justify-center">
                  <FileSearch className="w-8 h-8 text-muted-foreground" />
                </div>
                <h4 className="text-lg font-medium text-foreground mb-2">No Evaluation Yet</h4>
                <p className="text-muted-foreground">
                  Enter a job description and resume to see the evaluation results here.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Info Footer */}
        <div className="mt-12 bg-card border border-border rounded-xl p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">How Scoring Works</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">30</span>
                <span className="font-medium text-foreground">ATS Compatibility</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Checks for proper sections, clean formatting, contact info, and keyword readability.
              </p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">40</span>
                <span className="font-medium text-foreground">Skills Matching</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Extracts skills from the JD and matches them against your resume with partial match support.
              </p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">30</span>
                <span className="font-medium text-foreground">Experience Match</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Compares required years from JD with detected experience from your resume.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, description }: { icon: React.ComponentType<{ className?: string }>; title: string; description: string }) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 hover:border-primary/50 transition-colors">
      <Icon className="w-8 h-8 text-primary mb-3" />
      <h3 className="font-semibold text-foreground mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
