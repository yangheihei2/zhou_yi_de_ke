const defaultModel = 'deepseek-chat';
const allowedModels = new Set(['deepseek-chat', 'deepseek-reasoner']);

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

  const prompt = `You are a mathematical proof assistant.
Theorem: ${theorem}
Assumptions: ${assumptions}

Generate a formal, rigorous mathematical proof in LaTeX format.
Include a "Theorem" section and a "Proof" section.
Use bold text for key theorems like "Heine-Borel Theorem".
End the proof with a QED symbol (■).
Make it look like a professional academic paper.`;

  try {
    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.2,
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      console.error('DeepSeek API error:', response.status, errBody);
      return res.status(500).json({ error: 'DeepSeek request failed. Please retry later.' });
    }

    const data = await response.json();
    const proof = data?.choices?.[0]?.message?.content;

    return res.status(200).json({ proof: proof ?? 'Failed to generate proof.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'DeepSeek request failed. Please retry later.' });
  }
}
