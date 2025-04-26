// server.js
require("dotenv").config();
const express = require("express");
const { AzureOpenAI } = require("openai");
const { removeBackground } = require("@imgly/background-removal-node");

const app = express();
const port = process.env.PORT || 3000;

const endpoint = `${process.env.API_URL}?api-version=${process.env.API_VER}`;
const apiKey = process.env.API_KEY;
const apiVersion = process.env.OPENAI_API_VERSION || "2024-02-01";
const deploymentName = process.env.AZURE_OPENAI_DEPLOYMENT_NAME || "dall-e-3";

function getClient() {
  return new AzureOpenAI({
    endpoint,
    apiKey,
    apiVersion,
    deployment: deploymentName,
  });
}

app.get("/", async (req, res) => {
  try {
    const client = getClient();
    const prompt = "generate a 756x756 pixel art of burger made of bananas in the center with a plain background";

    // 1. Generate
    const result = await client.images.generate({
      prompt,
      size: "1024x1024",
      n: 1,
      quality: "standard",
      style: "vivid",
    });

    const imageUrl = result.data[0].url;

    // 2. Remove background
    const blob = await removeBackground(imageUrl);
    const arrayBuffer = await blob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 3. Send as PNG
    res.writeHead(200, {
      "Content-Type": "image/png",
      "Content-Length": buffer.length,
    });
    res.end(buffer);

  } catch (err) {
    console.error("Error in /burger:", err);
    res.status(500).json({ error: "Failed to generate image" });
  }
});

app.listen(port, () => {
  console.log(`Image server listening at http://localhost:${port}`);
});
