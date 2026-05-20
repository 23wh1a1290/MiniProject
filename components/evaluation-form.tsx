"use client";

import React from "react";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Upload, FileText, Briefcase, Loader2, X, Sparkles, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface EvaluationFormProps {
  onEvaluate: (resumeText: string, jobDescription: string) => void;
  isLoading: boolean;
}

// Extract text from file using server-side API
async function extractTextFromFile(file: File): Promise<{ text: string; warning?: string }> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/extract-text", {
    method: "POST",
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to extract text from file");
  }

  return { text: data.text || "", warning: data.warning };
}

export function EvaluationForm({ onEvaluate, isLoading }: EvaluationFormProps) {
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionWarning, setExtractionWarning] = useState<string | null>(null);

  const handleFileUpload = useCallback(async (file: File) => {
    if (!file) return;

    const fileNameLower = file.name.toLowerCase();
    const fileType = file.type;
    
    // Check file extension
    const isPDF = fileNameLower.endsWith(".pdf") || fileType === "application/pdf";
    const isDOCX = fileNameLower.endsWith(".docx") || fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    const isDOC = fileNameLower.endsWith(".doc") || fileType === "application/msword";
    const isTXT = fileNameLower.endsWith(".txt") || fileType === "text/plain";

    if (!isPDF && !isDOCX && !isDOC && !isTXT) {
      alert("Please upload a PDF, DOCX, DOC, or TXT file");
      return;
    }

    setFileName(file.name);
    setIsExtracting(true);
    setExtractionWarning(null);

    try {
      const result = await extractTextFromFile(file);
      setResumeText(result.text);
      
      if (result.warning) {
        setExtractionWarning(result.warning);
      }
    } catch (error) {
      console.error("File extraction error:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to extract text from file";
      setExtractionWarning(errorMessage + " Please paste the resume text manually.");
      setResumeText("");
    } finally {
      setIsExtracting(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  }, [handleFileUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (resumeText.trim() && jobDescription.trim()) {
      onEvaluate(resumeText, jobDescription);
    }
  };

  const clearFile = () => {
    setFileName(null);
    setResumeText("");
    setExtractionWarning(null);
  };

  const loadSampleData = () => {
    setJobDescription(`Senior Software Engineer - Full Stack

We are looking for a Senior Software Engineer to join our team.

Requirements:
- 5+ years of experience in software development
- Proficiency in Java, Spring Boot, and microservices architecture
- Experience with React or Angular for frontend development
- Strong knowledge of SQL databases (PostgreSQL, MySQL)
- Experience with AWS or Azure cloud services
- Familiarity with Docker and Kubernetes
- Excellent problem-solving and communication skills
- Agile/Scrum experience preferred

Nice to have:
- Experience with machine learning or data analysis
- Knowledge of GraphQL and REST API design`);

    setResumeText(`JOHN DOE
Software Engineer
john.doe@email.com | (555) 123-4567 | LinkedIn: linkedin.com/in/johndoe

PROFESSIONAL SUMMARY
Experienced software engineer with 4 years of experience building scalable web applications.

SKILLS
Programming: Java, Python, JavaScript, TypeScript
Frameworks: Spring Boot, React, Node.js
Databases: PostgreSQL, MongoDB, Redis
Cloud: AWS (EC2, S3, Lambda), Docker
Tools: Git, Jenkins, Jira, Agile methodologies

EXPERIENCE
Software Engineer | Tech Corp Inc. | January 2021 - Present
- Developed microservices using Java and Spring Boot
- Built responsive frontend applications with React
- Implemented CI/CD pipelines using Jenkins
- Collaborated with cross-functional teams in Agile environment

Junior Developer | StartUp Labs | June 2019 - December 2020
- Created RESTful APIs using Node.js and Express
- Managed PostgreSQL databases and wrote complex SQL queries
- Participated in code reviews and sprint planning

EDUCATION
Bachelor of Science in Computer Science
State University | 2019

CERTIFICATIONS
AWS Certified Developer Associate | 2022`);
    
    setFileName("sample_resume.txt");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Job Description Input */}
      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Briefcase className="w-5 h-5 text-primary" />
          <Label htmlFor="jd" className="text-lg font-semibold text-foreground">Job Description</Label>
        </div>
        <Textarea
          id="jd"
          placeholder="Paste the job description here..."
          className="min-h-[200px] bg-secondary/50 border-border focus:border-primary resize-none"
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
        />
        <p className="text-xs text-muted-foreground mt-2">
          Include requirements, required skills, and experience needed
        </p>
      </div>

      {/* Resume Input */}
      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-5 h-5 text-primary" />
          <Label className="text-lg font-semibold text-foreground">Resume</Label>
        </div>

        {/* File Upload Zone */}
        <div
          className={cn(
            "border-2 border-dashed rounded-lg p-6 text-center transition-colors mb-4",
            isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50",
            (fileName || isExtracting) && "bg-secondary/30"
          )}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          {isExtracting ? (
            <div className="flex items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <span className="text-foreground font-medium">Extracting text from file...</span>
            </div>
          ) : fileName ? (
            <div className="flex items-center justify-center gap-3">
              <FileText className="w-8 h-8 text-primary" />
              <span className="text-foreground font-medium">{fileName}</span>
              <button
                type="button"
                onClick={clearFile}
                className="p-1 hover:bg-secondary rounded-full transition-colors"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          ) : (
            <>
              <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-foreground mb-1">Drag and drop your resume here</p>
              <p className="text-sm text-muted-foreground mb-3">or</p>
              <label className="cursor-pointer">
                <span className="px-4 py-2 bg-secondary hover:bg-secondary/80 text-foreground rounded-lg transition-colors inline-block">
                  Browse Files
                </span>
                <input
                  type="file"
                  className="hidden"
                  accept=".pdf,.docx,.doc,.txt"
                  onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                />
              </label>
              <p className="text-xs text-muted-foreground mt-3">Supports PDF, DOCX, TXT</p>
            </>
          )}
        </div>

        {/* Extraction Warning */}
        {extractionWarning && (
          <div className="flex items-start gap-2 p-3 mb-4 bg-warning/10 border border-warning/30 rounded-lg">
            <AlertCircle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
            <p className="text-sm text-warning">{extractionWarning}</p>
          </div>
        )}

        {/* Text Area */}
        <Textarea
          placeholder="Or paste resume text directly here..."
          className="min-h-[200px] bg-secondary/50 border-border focus:border-primary resize-none"
          value={resumeText}
          onChange={(e) => setResumeText(e.target.value)}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={loadSampleData}
          className="flex-1 bg-transparent"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Load Sample Data
        </Button>
        <Button
          type="submit"
          disabled={!resumeText.trim() || !jobDescription.trim() || isLoading}
          className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Evaluating...
            </>
          ) : (
            "Evaluate Resume"
          )}
        </Button>
      </div>
    </form>
  );
}
