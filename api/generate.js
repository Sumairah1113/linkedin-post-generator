export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  console.log('API KEY:', process.env.ANTHROPIC_API_KEY ? 'Found' : 'NOT FOUND');

  try {
    // 1. Fetch trending HN stories about AI tooling
    const hnRes = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json');
    const topIds = await hnRes.json();
    const top20 = topIds.slice(0, 20);

    const stories = await Promise.all(
      top20.map(id =>
        fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`).then(r => r.json())
      )
    );

    const aiStories = stories
      .filter(s => s && s.title && /ai|llm|claude|gpt|cursor|copilot|agent|openai|anthropic|model|ml|workflow/i.test(s.title))
      .slice(0, 5)
      .map(s => `- ${s.title} (${s.score} points)`);

    const trendBrief = aiStories.length > 0
      ? aiStories.join('\n')
      : '- AI tooling continues to evolve rapidly with new model releases and workflow innovations';

    // 2. Style guide based on high-performing B2B LinkedIn posts
    const styleGuide = `
STYLE GUIDE (based on top 1% B2B LinkedIn posts):
- Hook: First line must stop the scroll. Use a bold claim, surprising stat, or counterintuitive take. No "I'm excited to share..."
- Structure: Short punchy lines. Max 2 sentences per paragraph. Heavy white space.
- Credibility: Use specific numbers, tool names, real workflows. No vague claims.
- Length: 150-250 words. Never more.
- No hashtags. No emojis. No "game-changer". No "delighted to announce".
- End with a single concrete takeaway or question. No "follow me for more".
- Tone: Practitioner talking to practitioners. Confident, direct, slightly opinionated.
- Format: Plain text only. Line breaks between every 1-2 sentences.
    `;

    // 3. Build the prompt
    const prompt = `
You are a ghostwriter for a senior software engineer with 10 years of experience in AI tooling and developer workflows.

${styleGuide}

CURRENT TRENDS IN AI TOOLING (from Hacker News right now):
${trendBrief}

TASK:
Write exactly 3 LinkedIn posts about AI tooling and developer workflows (Claude, Cursor, AI agents, LLM workflows, etc.).

Each post must:
- Be inspired by (but not copy) one of the trends above
- Follow the style guide strictly
- Feel like a real practitioner wrote it, not an AI
- Have a different hook style each time (stat, story, hot take)
- Include a concrete workflow tip or insight a dev could use today

Separate each post with: ---

Do not number the posts. Do not add any intro text. Just the 3 posts separated by ---.
    `;

    // 4. Call Anthropic API
    const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-opus-4-5',
        max_tokens: 1500,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await anthropicRes.json();
console.log('Anthropic response:', JSON.stringify(data));
if (data.error) throw new Error(data.error.message);
const text = data.content[0].text;
    const posts = text.split('---').map(p => p.trim()).filter(Boolean);

    res.status(200).json({ posts, trends: trendBrief });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong', detail: err.message });
  }
}