import { cohere } from "@ai-sdk/cohere";
import { RAG } from "@convex-dev/rag";
import { components } from "./_generated/api";

type FilterTypes = {
  test: string[];
};

export const rag = new RAG<FilterTypes>(components.rag, {
  textEmbeddingModel: cohere.embedding("embed-english-v3.0"),
  embeddingDimension: 1024,
});
