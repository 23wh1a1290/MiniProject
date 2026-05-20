// ATS Resume Evaluation Engine - Rule-Based System

export interface ATSResult {
  totalScore: number;
  atsScore: number;
  skillsScore: number;
  experienceScore: number;
  verdict: "Excellent" | "Good" | "Average" | "Poor";
  feedback: {
    ats: string[];
    skills: string[];
    experience: string[];
  };
  matchedSkills: string[];
  missingSkills: string[];
  requiredYears: number | null;
  detectedYears: number | null;
}

// Common skill keywords for extraction
const COMMON_SKILLS = [
  // Programming Languages
  "java", "python", "javascript", "typescript", "c++", "c#", "ruby", "go", "rust", "php", "swift", "kotlin",
  // Frameworks & Libraries
  "react", "angular", "vue", "node.js", "spring", "spring boot", "django", "flask", "express", ".net", "rails",
  // Databases
  "sql", "mysql", "postgresql", "mongodb", "oracle", "redis", "elasticsearch", "dynamodb", "cassandra",
  // Cloud & DevOps
  "aws", "azure", "gcp", "docker", "kubernetes", "jenkins", "ci/cd", "terraform", "ansible", "git",
  // Data & AI
  "machine learning", "deep learning", "data analysis", "pandas", "numpy", "tensorflow", "pytorch", "spark",
  // Tools & Methodologies
  "agile", "scrum", "jira", "confluence", "rest api", "graphql", "microservices", "api",
  // Soft Skills
  "leadership", "communication", "teamwork", "problem solving", "project management", "time management",
  // Business Skills
  "excel", "powerpoint", "salesforce", "sap", "crm", "erp", "marketing", "sales", "accounting", "finance",
  // Design
  "figma", "sketch", "adobe", "photoshop", "illustrator", "ui/ux", "design",
];

// Required sections for ATS
const REQUIRED_SECTIONS = ["skills", "experience", "education"];

// Patterns that indicate non-ATS friendly formatting
const NON_ATS_PATTERNS = [
  /\|/g, // Pipe characters (often tables)
  /_{3,}/g, // Long underscores
  /\*{3,}/g, // Stars as decorators
  /={3,}/g, // Equal signs as separators
];

export function evaluateResume(resumeText: string, jobDescription: string): ATSResult {
  const normalizedResume = resumeText.toLowerCase();
  const normalizedJD = jobDescription.toLowerCase();

  // 1. ATS Checks (30 marks)
  const atsResult = checkATSCompatibility(resumeText, normalizedResume);
  
  // 2. Skills Matching (40 marks)
  const skillsResult = matchSkills(normalizedResume, normalizedJD);
  
  // 3. Experience Matching (30 marks)
  const experienceResult = matchExperience(normalizedResume, normalizedJD);
  
  const totalScore = atsResult.score + skillsResult.score + experienceResult.score;
  
  return {
    totalScore: Math.round(totalScore),
    atsScore: Math.round(atsResult.score),
    skillsScore: Math.round(skillsResult.score),
    experienceScore: Math.round(experienceResult.score),
    verdict: getVerdict(totalScore),
    feedback: {
      ats: atsResult.feedback,
      skills: skillsResult.feedback,
      experience: experienceResult.feedback,
    },
    matchedSkills: skillsResult.matchedSkills,
    missingSkills: skillsResult.missingSkills,
    requiredYears: experienceResult.requiredYears,
    detectedYears: experienceResult.detectedYears,
  };
}

function checkATSCompatibility(originalText: string, normalizedText: string): { score: number; feedback: string[] } {
  let score = 30;
  const feedback: string[] = [];

  // Check for sections (10 marks)
  const sectionsFound: string[] = [];
  const sectionsMissing: string[] = [];
  
  for (const section of REQUIRED_SECTIONS) {
    const patterns = [
      new RegExp(`\\b${section}\\b`, "i"),
      new RegExp(`\\b${section}s?\\b`, "i"),
    ];
    
    if (patterns.some(p => p.test(normalizedText))) {
      sectionsFound.push(section);
    } else {
      sectionsMissing.push(section);
    }
  }
  
  if (sectionsMissing.length > 0) {
    const deduction = (sectionsMissing.length / REQUIRED_SECTIONS.length) * 10;
    score -= deduction;
    feedback.push(`Missing sections: ${sectionsMissing.join(", ")}. Add clear section headers.`);
  } else {
    feedback.push("All required sections (Skills, Experience, Education) are present.");
  }

  // Check for complex formatting (10 marks)
  let hasComplexFormatting = false;
  for (const pattern of NON_ATS_PATTERNS) {
    if (pattern.test(originalText)) {
      hasComplexFormatting = true;
      break;
    }
  }
  
  if (hasComplexFormatting) {
    score -= 5;
    feedback.push("Detected complex formatting characters. ATS may have trouble parsing. Use simple formatting.");
  } else {
    feedback.push("Formatting appears clean and ATS-friendly.");
  }

  // Check for contact information (5 marks)
  const hasEmail = /[\w.-]+@[\w.-]+\.\w+/.test(originalText);
  const hasPhone = /[\d\s()+-]{10,}/.test(originalText);
  
  if (!hasEmail || !hasPhone) {
    score -= 5;
    feedback.push("Missing contact information. Ensure email and phone are clearly visible.");
  } else {
    feedback.push("Contact information detected.");
  }

  // Check keyword density (5 marks)
  const wordCount = normalizedText.split(/\s+/).length;
  if (wordCount < 100) {
    score -= 5;
    feedback.push("Resume appears too short. Add more detail for better keyword matching.");
  } else if (wordCount > 1500) {
    score -= 2;
    feedback.push("Resume is quite long. Consider condensing for better readability.");
  } else {
    feedback.push("Resume length is appropriate.");
  }

  return { score: Math.max(0, score), feedback };
}

function matchSkills(normalizedResume: string, normalizedJD: string): { 
  score: number; 
  feedback: string[]; 
  matchedSkills: string[];
  missingSkills: string[];
} {
  const feedback: string[] = [];
  
  // Extract skills from JD
  const jdSkills = extractSkills(normalizedJD);
  
  if (jdSkills.length === 0) {
    return {
      score: 20, // Give partial credit if no skills found in JD
      feedback: ["Could not extract specific skills from job description. Generic evaluation applied."],
      matchedSkills: [],
      missingSkills: [],
    };
  }

  // Match skills in resume
  const matchedSkills: string[] = [];
  const missingSkills: string[] = [];
  
  for (const skill of jdSkills) {
    // Check if skill exists in resume using multiple matching strategies
    if (isSkillPresent(skill, normalizedResume)) {
      matchedSkills.push(skill);
    } else {
      missingSkills.push(skill);
    }
  }

  // Calculate score (40 marks max)
  const matchRatio = jdSkills.length > 0 ? matchedSkills.length / jdSkills.length : 0;
  const score = matchRatio * 40;

  // Generate feedback
  if (matchRatio >= 0.8) {
    feedback.push(`Excellent skill match! ${matchedSkills.length}/${jdSkills.length} required skills found.`);
  } else if (matchRatio >= 0.5) {
    feedback.push(`Good skill match. ${matchedSkills.length}/${jdSkills.length} required skills found.`);
  } else if (matchRatio >= 0.3) {
    feedback.push(`Moderate skill match. ${matchedSkills.length}/${jdSkills.length} required skills found.`);
  } else if (jdSkills.length > 0) {
    feedback.push(`Low skill match. Only ${matchedSkills.length}/${jdSkills.length} required skills found.`);
  }

  if (missingSkills.length > 0) {
    feedback.push(`Consider adding these skills if applicable: ${missingSkills.slice(0, 5).join(", ")}${missingSkills.length > 5 ? "..." : ""}`);
  }

  return { score, feedback, matchedSkills, missingSkills };
}

// Helper function to check if a skill is present in text
function isSkillPresent(skill: string, text: string): boolean {
  const lowerSkill = skill.toLowerCase();
  const lowerText = text.toLowerCase();
  
  // Direct substring check first (handles most cases)
  if (lowerText.includes(lowerSkill)) {
    return true;
  }
  
  // Handle special cases for skills that might be written differently
  const skillVariants: Record<string, string[]> = {
    "javascript": ["javascript", "js", "java script"],
    "typescript": ["typescript", "ts", "type script"],
    "node.js": ["node.js", "nodejs", "node js", "node"],
    "react": ["react", "reactjs", "react.js"],
    "vue": ["vue", "vuejs", "vue.js"],
    "angular": ["angular", "angularjs", "angular.js"],
    "c++": ["c++", "cpp", "c plus plus"],
    "c#": ["c#", "csharp", "c sharp"],
    ".net": [".net", "dotnet", "dot net"],
    "sql": ["sql", "mysql", "postgresql", "postgres", "mssql", "oracle", "sqlite"],
    "mysql": ["mysql", "my sql"],
    "postgresql": ["postgresql", "postgres", "psql"],
    "mongodb": ["mongodb", "mongo"],
    "aws": ["aws", "amazon web services"],
    "gcp": ["gcp", "google cloud"],
    "ci/cd": ["ci/cd", "cicd", "ci cd", "continuous integration"],
    "rest api": ["rest api", "restful", "rest", "restful api"],
    "ui/ux": ["ui/ux", "ui ux", "uiux", "ui", "ux"],
    "machine learning": ["machine learning", "ml", "deep learning", "ai"],
  };
  
  // Check variants if defined
  const variants = skillVariants[lowerSkill];
  if (variants) {
    return variants.some(variant => lowerText.includes(variant));
  }
  
  // Try word boundary match for exact skill
  try {
    const escapedSkill = escapeRegex(lowerSkill);
    const wordBoundaryPattern = new RegExp(`(?:^|[\\s,;.!?()\\[\\]{}])${escapedSkill}(?:[\\s,;.!?()\\[\\]{}]|$)`, "i");
    if (wordBoundaryPattern.test(lowerText)) {
      return true;
    }
  } catch {
    // If regex fails, fall back to includes
  }
  
  return false;
}

function matchExperience(normalizedResume: string, normalizedJD: string): {
  score: number;
  feedback: string[];
  requiredYears: number | null;
  detectedYears: number | null;
} {
  const feedback: string[] = [];
  
  // Extract required years from JD
  const requiredYears = extractYears(normalizedJD);
  
  // Extract actual years from resume
  const detectedYears = extractYearsFromResume(normalizedResume);
  
  // Check if this is a fresher (check for fresher/entry-level indicators in resume)
  const isFresher = checkIfFresher(normalizedResume);

  // If JD doesn't specify experience requirements
  if (requiredYears === null) {
    if (detectedYears !== null && detectedYears > 0) {
      feedback.push(`No specific experience requirement in JD. You have ${detectedYears} years of experience.`);
      return {
        score: 30,
        feedback,
        requiredYears: null,
        detectedYears,
      };
    }
    if (isFresher) {
      feedback.push("No experience requirement in JD - good fit for fresher candidates.");
    } else {
      feedback.push("No specific experience requirement detected in job description.");
    }
    return {
      score: 30, // Full credit since no requirement specified
      feedback,
      requiredYears: null,
      detectedYears: detectedYears ?? 0,
    };
  }

  // JD requires experience but resume shows none or is a fresher
  if (detectedYears === null || detectedYears === 0) {
    if (isFresher) {
      // Fresher applying to experienced role - give partial credit with helpful feedback
      feedback.push(`Fresher Profile: Job requires ${requiredYears} years of experience.`);
      feedback.push("Highlight internships, projects, certifications, and academic achievements.");
      feedback.push("Consider applying for entry-level or fresher-friendly positions.");
      return {
        score: 10, // Partial credit for freshers - they still have potential
        feedback,
        requiredYears,
        detectedYears: 0,
      };
    }
    // Not explicitly a fresher but no experience found
    feedback.push(`Job requires ${requiredYears} years of experience but none detected in resume.`);
    feedback.push("Add date ranges to your work experience (e.g., 'Jan 2020 - Present' or '2020-2023').");
    return {
      score: 5, // Minimal credit - might be formatting issue
      feedback,
      requiredYears,
      detectedYears: 0,
    };
  }

  // Calculate proportional score (30 marks max)
  let score: number;
  
  if (detectedYears >= requiredYears) {
    score = 30;
    feedback.push(`Experience requirement met! Detected ${detectedYears} years vs. ${requiredYears} years required.`);
  } else {
    const ratio = detectedYears / requiredYears;
    score = ratio * 30;
    feedback.push(`Experience gap detected. Found ${detectedYears} years, but ${requiredYears} years required.`);
    
    const gap = requiredYears - detectedYears;
    if (gap <= 1) {
      feedback.push("Close to meeting experience requirements. Highlight relevant projects or certifications.");
    } else {
      feedback.push("Consider gaining more experience or highlighting transferable skills.");
    }
  }

  return { score, feedback, requiredYears, detectedYears };
}

function extractSkills(text: string): string[] {
  const foundSkills: string[] = [];
  
  for (const skill of COMMON_SKILLS) {
    const pattern = new RegExp(`\\b${escapeRegex(skill)}\\b`, "i");
    if (pattern.test(text)) {
      foundSkills.push(skill);
    }
  }
  
  return [...new Set(foundSkills)]; // Remove duplicates
}

function extractYears(text: string): number | null {
  // Match patterns like "3+ years", "3-5 years", "minimum 3 years", "at least 3 years"
  const patterns = [
    /(\d+)\+?\s*(?:years?|yrs?)\s*(?:of)?\s*(?:experience|exp)?/i,
    /(?:minimum|at least|min)\s*(\d+)\s*(?:years?|yrs?)/i,
    /(\d+)\s*-\s*\d+\s*(?:years?|yrs?)/i,
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]) {
      return parseInt(match[1], 10);
    }
  }
  
  return null;
}

function extractYearsFromResume(text: string): number | null {
  // Look for date ranges in experience section
  const datePatterns = [
    /(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*\s*\d{4}\s*[-–—to]+\s*(?:present|current|now|(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*\s*\d{4})/gi,
    /\d{4}\s*[-–—to]+\s*(?:present|current|now|\d{4})/gi,
    /(\d+)\+?\s*years?\s*(?:of)?\s*(?:experience|exp)/i,
  ];
  
  // Try to find explicit years statement first
  const explicitMatch = text.match(/(\d+)\+?\s*years?\s*(?:of)?\s*(?:experience|exp)/i);
  if (explicitMatch?.[1]) {
    return parseInt(explicitMatch[1], 10);
  }

  // Calculate from date ranges
  let totalYears = 0;
  const currentYear = new Date().getFullYear();
  
  for (const pattern of datePatterns.slice(0, 2)) {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      const dateStr = match[0].toLowerCase();
      const years = dateStr.match(/\d{4}/g);
      
      if (years && years.length >= 1) {
        const startYear = parseInt(years[0], 10);
        let endYear = currentYear;
        
        if (years.length >= 2) {
          endYear = parseInt(years[1], 10);
        } else if (dateStr.includes("present") || dateStr.includes("current") || dateStr.includes("now")) {
          endYear = currentYear;
        }
        
        totalYears += Math.max(0, endYear - startYear);
      }
    }
  }
  
  return totalYears > 0 ? totalYears : null;
}

function getVerdict(score: number): "Excellent" | "Good" | "Average" | "Poor" {
  if (score >= 80) return "Excellent";
  if (score >= 60) return "Good";
  if (score >= 40) return "Average";
  return "Poor";
}

function escapeRegex(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Check if resume indicates a fresher/entry-level candidate
function checkIfFresher(normalizedText: string): boolean {
  const fresherIndicators = [
    /\bfresher\b/i,
    /\bfresh graduate\b/i,
    /\brecent graduate\b/i,
    /\bentry[\s-]?level\b/i,
    /\bnew graduate\b/i,
    /\bjust graduated\b/i,
    /\bgraduating\s+in\s+\d{4}\b/i,
    /\bno\s+(?:work\s+)?experience\b/i,
    /\blooking\s+for\s+(?:first|entry)\b/i,
    /\bseeking\s+(?:entry|first|fresher)\b/i,
    /\b0\s*(?:years?|yrs?)\s*(?:of\s+)?experience\b/i,
  ];
  
  // Check for fresher indicators
  for (const pattern of fresherIndicators) {
    if (pattern.test(normalizedText)) {
      return true;
    }
  }
  
  // Check if resume has education section but no experience/work section with actual job entries
  const hasEducation = /\b(?:education|academic|degree|bachelor|master|b\.?tech|b\.?e|b\.?sc|m\.?tech|m\.?sc|university|college)\b/i.test(normalizedText);
  const hasWorkExperience = /\b(?:work\s+experience|professional\s+experience|employment|job|worked\s+(?:at|as|for)|company|organization)\b/i.test(normalizedText);
  
  // If has education but explicitly no work experience section, likely a fresher
  if (hasEducation && !hasWorkExperience) {
    return true;
  }
  
  // Check for internship-only experience (common for freshers)
  const hasOnlyInternship = /\binternship\b/i.test(normalizedText) && !/\b(?:senior|lead|manager|director|head|principal)\b/i.test(normalizedText);
  const hasNoDateRanges = !(/\d{4}\s*[-–—to]+\s*(?:present|current|now|\d{4})/i.test(normalizedText));
  
  if (hasOnlyInternship && hasNoDateRanges) {
    return true;
  }
  
  return false;
}
