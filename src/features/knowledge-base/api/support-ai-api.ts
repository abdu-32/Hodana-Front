import { apiFetch, authFetch } from "@/lib/api-client";
import { getAccessToken } from "@/features/auth/lib/session-store";

export interface AIChatRequest {
  question: string;
  session_id?: string;
  hackathon_id?: string;
  organization_id?: string;
}

export interface AIChatResponse {
  session_id: string;
  message_id: string;
  answer: string;
  llm_unavailable: boolean;
  retrieved_chunk_count: number;
  related_questions?: string[];
  relatedQuestions?: string[];
}

export interface AIFeedbackRequest {
  message_id: string;
  rating: number; // 1-5
  comment?: string;
}

export interface AIFeedbackResponse {
  id: string;
  message_id: string;
  rating: number;
  comment: string;
  created_at: string;
}

export async function sendAIChatMessage(payload: AIChatRequest): Promise<AIChatResponse> {
  const token = getAccessToken();
  const fetcher = token ? authFetch : apiFetch;
  const res = await fetcher<any>("/ai/chat/", {
    method: "POST",
    body: JSON.stringify({
      ...payload,
      sessionId: payload.session_id,
      hackathonId: payload.hackathon_id,
      organizationId: payload.organization_id,
    }),
  });
  return {
    session_id: res.session_id || res.sessionId,
    message_id: res.message_id || res.messageId,
    answer: res.answer,
    llm_unavailable: res.llm_unavailable ?? res.llmUnavailable ?? false,
    retrieved_chunk_count: res.retrieved_chunk_count ?? res.retrievedChunkCount ?? 0,
    related_questions: res.related_questions || res.relatedQuestions || [],
    relatedQuestions: res.relatedQuestions || res.related_questions || [],
  };
}

export async function sendAIFeedback(payload: AIFeedbackRequest): Promise<AIFeedbackResponse> {
  const token = getAccessToken();
  const fetcher = token ? authFetch : apiFetch;
  return fetcher<AIFeedbackResponse>("/ai/feedback/", {
    method: "POST",
    body: JSON.stringify({
      message_id: payload.message_id,
      messageId: payload.message_id,
      rating: payload.rating,
      comment: payload.comment || "",
    }),
  });
}
