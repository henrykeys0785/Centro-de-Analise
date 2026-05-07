export enum Sentiment {
  POSITIVE = "Positivo",
  NEGATIVE = "Negativo",
}

export interface Article {
  id: string;
  title: string;
  content: string;
  category: string;
  sentiment: Sentiment;
  createdAt: number;
  authorId: string;
  status: 'pending' | 'classified' | 'rejected';
  explanation?: string;
  metadata?: {
    source?: string;
    url?: string;
    keywords?: string[];
  };
}

export interface TrainingStats {
  totalArticles: number;
  classifiedToday: number;
  positiveCount: number;
  negativeCount: number;
  accuracy: number; // Simulated or calculated progress
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: 'admin' | 'user';
  createdAt: number;
}
