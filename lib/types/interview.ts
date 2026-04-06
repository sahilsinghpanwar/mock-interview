/**
 * Interview System Type Definitions
 * Comprehensive types for managing mock interviews with VAPI voice integration
 */

// ─── User Interview Level ────────────────────────────────────────────────────

export type InterviewLevel = "junior" | "mid" | "senior";

export interface LevelConfig {
  level: InterviewLevel;
  questionsCount: number;
  description: string;
  estimatedDuration: number; // in minutes
  focusAreas: string[];
}

export const LEVEL_CONFIGS: Record<InterviewLevel, LevelConfig> = {
  junior: {
    level: "junior",
    questionsCount: 5,
    description: "Entry-level. Focus on fundamentals and basic concepts.",
    estimatedDuration: 15,
    focusAreas: ["Fundamentals", "Basic Concepts", "Problem-Solving"],
  },
  mid: {
    level: "mid",
    questionsCount: 10,
    description: "Intermediate-level. Focus on advanced concepts and scenarios.",
    estimatedDuration: 30,
    focusAreas: ["System Design", "Advanced Concepts", "Real-world Scenarios"],
  },
  senior: {
    level: "senior",
    questionsCount: 15,
    description: "Senior-level. Focus on architecture, optimization, and leadership.",
    estimatedDuration: 45,
    focusAreas: ["Architecture", "Optimization", "Leadership & Mentoring"],
  },
};

// ─── Technical Field ────────────────────────────────────────────────────────

export type TechnicalField =
  | "web-development"
  | "android-development"
  | "ios-development"
  | "backend-development"
  | "devops"
  | "data-science"
  | "machine-learning"
  | "cloud-architecture";

export interface FieldConfig {
  id: TechnicalField;
  label: string;
  description: string;
  technologies: string[];
  commonQuestionPatterns: string[];
}

export const FIELD_CONFIGS: Record<TechnicalField, FieldConfig> = {
  "web-development": {
    id: "web-development",
    label: "Web Development",
    description: "Frontend, Backend, and Full-Stack Web Development",
    technologies: ["React", "Vue", "Angular", "Node.js", "Express", "Next.js"],
    commonQuestionPatterns: [
      "Component Lifecycle",
      "State Management",
      "API Integration",
      "Performance Optimization",
      "Security Best Practices",
    ],
  },
  "android-development": {
    id: "android-development",
    label: "Android Development",
    description: "Native Android Development with Kotlin/Java",
    technologies: ["Kotlin", "Java", "Android SDK", "Jetpack Compose", "Firebase"],
    commonQuestionPatterns: [
      "Activity Lifecycle",
      "Fragment Management",
      "Data Persistence",
      "Async Programming",
      "Performance Optimization",
    ],
  },
  "ios-development": {
    id: "ios-development",
    label: "iOS Development",
    description: "Native iOS Development with Swift",
    technologies: ["Swift", "UIKit", "SwiftUI", "Core Data", "Combine"],
    commonQuestionPatterns: [
      "View Controller Lifecycle",
      "Memory Management",
      "Concurrency",
      "Data Persistence",
      "Network Requests",
    ],
  },
  "backend-development": {
    id: "backend-development",
    label: "Backend Development",
    description: "Server-side Development and APIs",
    technologies: ["Node.js", "Python", "Java", "Go", "PostgreSQL", "MongoDB"],
    commonQuestionPatterns: [
      "Database Design",
      "API Design",
      "Authentication",
      "Scalability",
      "Caching Strategies",
    ],
  },
  devops: {
    id: "devops",
    label: "DevOps",
    description: "Infrastructure, Deployment, and CI/CD",
    technologies: ["Docker", "Kubernetes", "AWS", "GCP", "Jenkins", "GitLab CI"],
    commonQuestionPatterns: [
      "Containerization",
      "Orchestration",
      "CI/CD Pipelines",
      "Monitoring",
      "Infrastructure as Code",
    ],
  },
  "data-science": {
    id: "data-science",
    label: "Data Science",
    description: "Data Analysis and Visualization",
    technologies: ["Python", "Pandas", "NumPy", "Matplotlib", "SQL"],
    commonQuestionPatterns: [
      "Data Analysis",
      "Visualization",
      "Statistical Analysis",
      "Data Cleaning",
      "EDA",
    ],
  },
  "machine-learning": {
    id: "machine-learning",
    label: "Machine Learning",
    description: "ML Models and Deep Learning",
    technologies: ["TensorFlow", "PyTorch", "Scikit-learn", "Keras"],
    commonQuestionPatterns: [
      "Model Training",
      "Hyperparameter Tuning",
      "Evaluation Metrics",
      "Deep Learning",
      "NLP",
    ],
  },
  "cloud-architecture": {
    id: "cloud-architecture",
    label: "Cloud Architecture",
    description: "Cloud Design and Solutions",
    technologies: ["AWS", "Azure", "GCP", "Terraform", "CloudFormation"],
    commonQuestionPatterns: [
      "System Architecture",
      "Scalability",
      "High Availability",
      "Security",
      "Cost Optimization",
    ],
  },
};

// ─── Interview Session ────────────────────────────────────────────────────

export interface InterviewQuestion {
  id: string;
  questionText: string;
  category: string;
  difficulty: InterviewLevel;
  expectedKeyPoints: string[];
  followUpQuestions?: string[];
  timeLimit?: number; // in seconds
}

export interface UserAnswer {
  questionId: string;
  answerText: string;
  audioUrl?: string;
  answerDuration: number; // in seconds
  timestamp: Date;
}

export interface AnswerFeedback {
  questionId: string;
  score: number; // 0-100
  strengths: string[];
  areasForImprovement: string[];
  detailedFeedback: string;
  keyPointsDetected: string[];
}

export interface InterviewSession {
  id: string;
  userId: string;
  field: TechnicalField;
  level: InterviewLevel;
  status: "not_started" | "in_progress" | "completed" | "paused";
  questions: InterviewQuestion[];
  userAnswers: UserAnswer[];
  feedback: AnswerFeedback[];
  startTime?: Date;
  endTime?: Date;
  duration?: number; // in seconds
  overallScore?: number; // 0-100
  vapiCallId?: string; // VAPI call ID for reference
}

export interface InterviewBriefFeedback {
  overallScore: number;
  performanceLevel: "poor" | "needs-improvement" | "good" | "excellent";
  summary: string;
  strengths: string[];
  areasForImprovement: string[];
  recommendations: string[];
  comparisonWithLevel: string;
  nextSteps: string[];
}

// ─── VAPI Integration ────────────────────────────────────────────────────

export interface VAPIConfig {
  apiKey: string;
  assistantId: string;
  phoneNumber?: string;
}

export interface VAPIMessage {
  type: "text" | "audio";
  content: string;
  timestamp: Date;
}

export interface VAPICallStatus {
  status: "active" | "ended" | "failed";
  callId: string;
  duration?: number;
  transcript?: string;
  recordingUrl?: string;
}

// ─── Gemini Integration ────────────────────────────────────────────────────

export interface GeminiConfig {
  apiKey: string;
  model: string;
}

export interface GeneratedQuestion {
  questionText: string;
  category: string;
  difficulty: InterviewLevel;
  expectedKeyPoints: string[];
  followUpQuestions?: string[];
}
