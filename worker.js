const MODEL = "@cf/zai-org/glm-4.7-flash";

const SYSTEM_PROMPTS = {
  fast: "You are Nexora AI, a helpful multilingual assistant. Be accurate, direct, and concise.",
  deep: "You are Nexora AI Deep mode. Reason carefully, verify assumptions, and give structured, high-quality answers.",
  research: "You are Nexora AI Research mode. Separate established facts from uncertainty and clearly state when information cannot be verified.",
  code: "You are Nexora AI Code mode. Provide secure, correct, practical code and explain important implementation details briefly."
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=UTF-8",
      "cache-control": "no-store"
    }
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Health check
    if (url.pathname === "/api/health" && request.method === "GET") {
      return json({
        ok: true,
        service: "Nexora AI",
        ai: !!env.AI,
        model: MODEL
      });
    }

    // AI chat
    if (url.pathname === "/api/chat") {
      if (request.method !== "POST") {
        return json({ error: "Method not allowed" }, 405);
      }

      if (!env.AI) {
        return json(
          { error: "Workers AI binding is not configured." },
          503
        );
      }

      try {
        const body = await request.json();

        const message = String(body?.message || "").trim();
        const mode = SYSTEM_PROMPTS[body?.mode]
          ? body.mode
          : "fast";

        if (!message) {
          return json({ error: "Message required" }, 400);
        }

        if (message.length > 12000) {
          return json(
            { error: "Message is too long (max 12,000 characters)." },
            413
          );
        }

        const result = await env.AI.run(MODEL, {
          messages: [
            {
              role: "system",
              content: SYSTEM_PROMPTS[mode]
            },
            {
              role: "user",
              content: message
            }
          ],
          temperature: mode === "code" ? 0.2 : 0.6,
          max_tokens: 1200
        });

        // Handle different possible response formats
        let answer = null;

        if (typeof result === "string") {
          answer = result;
        } else if (result?.response) {
          answer = result.response;
        } else if (result?.result?.response) {
          answer = result.result.response;
        } else if (
          result?.choices?.[0]?.message?.content
        ) {
          answer = result.choices[0].message.content;
        } else if (
          result?.choices?.[0]?.text
        ) {
          answer = result.choices[0].text;
        }

        if (!answer || !String(answer).trim()) {
          return json(
            {
              error: "The AI returned no text.",
              debug: result
            },
            502
          );
        }

        return json({
          answer: String(answer),
          mode,
          model: MODEL
        });

      } catch (error) {
        return json(
          {
            error: "AI request failed.",
            detail: String(error?.message || error)
          },
          500
        );
      }
    }

    return env.ASSETS.fetch(request);
  }
};
