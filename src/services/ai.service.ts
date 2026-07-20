/**
 * AI service — PLACEHOLDER (no business logic).
 * Method signatures only; implementations arrive in Phase 6 (AI Platform).
 * Source of truth: docs/BACKEND.md §11.
 */

const notImplemented = <T>(name: string): Promise<T> =>
  Promise.reject(new Error(`aiService.${name} not implemented`));

export const aiService = {
  ask: () => notImplemented<null>("ask"),
  generateProposal: () => notImplemented<null>("generateProposal"),
  suggestPricing: () => notImplemented<null>("suggestPricing"),
  analyzeProject: () => notImplemented<null>("analyzeProject"),
};
