const OpenAI = require("openai");

const client = new OpenAI();

async function main() {
  const response = await client.responses.create({
    model: "gpt-5-mini",
    input: "Say hello to Vyasa Academy in one short sentence."
  });

  console.log(response.output_text);
}

main().catch(console.error);
