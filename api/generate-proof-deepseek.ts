import { callDeepSeek } from './deepseek-client';

const defaultModel = 'deepseek-chat';
const allowedModels = new Set(['deepseek-chat', 'deepseek-reasoner']);

function buildPrompt(theorem: string, assumptions: string, compact = false) {
  const base = `You are a mathematical proof assistant.
Theorem: ${theorem}
Assumptions: ${assumptions}

Return a proof that can be directly rendered by MathJax in a web page.
Requirements:
1) Use readable sections: Theorem, Key Lemmas, Proof, and Conclusion.
2) Write normal text plus math expressions using \\(...\\) and \\[...\\].
3) Do not output full LaTeX document preamble (no \\documentclass, \\begin{document}, etc).
4) Keep the argument rigorous and concise.
5) End with \\qed or an explicit QED statement.`;

  if (!compact) {
    return base;
  }

  return `Provide a concise, rigorous proof in MathJax-friendly text only.
Theorem: ${theorem}
Assumptions: ${assumptions || '(none)'}
Use sections: Theorem, Proof, Conclusion.
No markdown code fences or full LaTeX preamble.`;
}

function extractProofContent(data: any) {
  const raw = data?.choices?.[0]?.message?.content;
  if (typeof raw !== 'string') return '';
  return raw.trim();
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Server env DEEPSEEK_API_KEY is not configured.' });
  }

  const theorem = typeof req.body?.theorem === 'string' ? req.body.theorem : '';
  const assumptions = typeof req.body?.assumptions === 'string' ? req.body.assumptions : '';
  const requestedModel = typeof req.body?.model === 'string' ? req.body.model : defaultModel;
  const model = allowedModels.has(requestedModel) ? requestedModel : defaultModel;

  if (!theorem.trim()) {
    return res.status(400).json({ error: 'Theorem is required.' });
  }

  try {
    const fallbackModel = model === 'deepseek-chat' ? 'deepseek-reasoner' : 'deepseek-chat';
    const modelCandidates = [model, fallbackModel].filter((candidate, idx, arr) => arr.indexOf(candidate) === idx);
    const promptCandidates = [buildPrompt(theorem, assumptions, false), buildPrompt(theorem, assumptions, true)];
    const errors: string[] = [];

    for (const candidateModel of modelCandidates) {
      for (let promptIndex = 0; promptIndex < promptCandidates.length; promptIndex += 1) {
        try {
          const data = await callDeepSeek({
            apiKey,
            model: candidateModel,
            messages: [{ role: 'user', content: promptCandidates[promptIndex] }],
            temperature: 0.2,
          });

          const proof = extractProofContent(data);
          if (proof) {
            return res.status(200).json({ proof, modelUsed: candidateModel, compactPrompt: promptIndex === 1 });
          }

          errors.push(`${candidateModel}/prompt${promptIndex + 1}: empty content`);
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Unknown DeepSeek request error.';
          errors.push(`${candidateModel}/prompt${promptIndex + 1}: ${message}`);
        }
      }
    }

    return res.status(502).json({
      error: `DeepSeek proof generation failed after retries and model fallback. ${errors.join(' | ')}`,
    });
  } catch (error) {
    console.error('DeepSeek generator error:', error);
    const message = error instanceof Error ? error.message : 'DeepSeek request failed. Please retry later.';
    return res.status(500).json({ error: message });
  }
}
