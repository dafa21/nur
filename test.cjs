const OpenAI = require("openai");

async function test() {
  const openai = new OpenAI({
    apiKey: "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",
    baseURL: "https://integrate.api.nvidia.com/v1",
  });

  try {
    console.log("Testing streaming with qwen3-coder...");
    const completion = await openai.chat.completions.create({
      model: "qwen/qwen3-coder-480b-a35b-instruct",
      messages: [{ role: "user", content: "halo, apa kabar?" }],
      temperature: 0.7,
      top_p: 0.8,
      max_tokens: 100,
      stream: true,
    });

    let fullText = "";
    for await (const chunk of completion) {
      const delta = chunk.choices[0]?.delta?.content;
      if (delta) {
        process.stdout.write(delta);
        fullText += delta;
      }
    }
    console.log("\n\n=== FULL TEXT ===\n" + fullText);
  } catch (error) {
    console.error("Error code:", error.code);
    console.error("Error status:", error.status);
    console.error("Error message:", error.message);
    console.error("Full error:", JSON.stringify(error, null, 2));
  }
}

test();
