/**
 * AI Consultant API for incident analysis and construction consultation
 */

const AI_API_URL = process.env.NEXT_PUBLIC_RAG_API_URL || 'http://localhost:8000';

export interface AnalyzeIncidentRequest {
  images: string[];  // Base64 strings
  incident_report: string;
  context?: string;
}

export interface AnalyzeIncidentResponse {
  incident_report: string;
  recommendations: string;
}

export async function analyzeIncident(
  data: AnalyzeIncidentRequest
): Promise<AnalyzeIncidentResponse> {
  const response = await fetch(`${AI_API_URL}/api/v1/analyze-incident`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(error.detail || 'Failed to analyze incident');
  }

  return response.json();
}

// AI Consultation
export interface AIConsultationRequest {
  user_id: string;
  message: string;
}

export interface AIConsultationResponse {
  response: string;
  remaining_messages: number;
}

export async function consultAI(
  data: AIConsultationRequest
): Promise<AIConsultationResponse> {
  const response = await fetch(`${AI_API_URL}/api/v1/ai-consultation`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(error.detail || 'Failed to get AI consultation');
  }

  return response.json();
}
