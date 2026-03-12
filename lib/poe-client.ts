export async function callPoeAPI(prompt: string): Promise<string> {
  const POE_API_KEY = process.env.POE_API_KEY;
  if (!POE_API_KEY) throw new Error("POE_API_KEY not configured");

  const response = await fetch("https://api.poe.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${POE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4.6",
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!response.ok) throw new Error(`Poe API error: ${response.status}`);

  const data = await response.json();
  return data.choices[0].message.content;
}
