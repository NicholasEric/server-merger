// server.js
require("dotenv").config();
const express = require("express");
const { AzureOpenAI } = require("openai");
const axios = require('axios');


const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

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

app.post("/mixer", async (req, res) => {
  try {
    const client = getClient();
    const { item1, item2 } = req.body;
    const prompt = `generate a 512x512 dark pixel art of ${item1} made out of ${item2} combined together and centered with a plain transparent background`;

    // 1. Generate
    const result = await client.images.generate({
      prompt,
      size: "1024x1024",
      n: 1,
      quality: "standard",
      style: "vivid",
    });

    const imageUrl = result.data[0].url;
    /*
    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    const buffer = Buffer.from(response.data, 'binary');

    // Send the binary image data with proper header
    res.writeHead(200, { 'Content-Type': 'image/png' });
    res.end(buffer);
    */
   res.end(imageUrl)

  } catch (err) {
    console.error("Error in:", err);
    res.status(500).json({ error: "Failed to generate image" });
  }
});

app.post("/seperator", async (req, res) => {
  try {
    const client = getClient();
    const { items } = req.body;
    const itemList = items.split(" ");
    const imgURLs = [];

    for (const item of itemList) {
      const prompt = `generate a 512x512 dark pixel art of ${item}, centered with a plain transparent background`;

      // 1. Generate
      const result = await client.images.generate({
        prompt,
        size: "1024x1024",
        n: 1,
        quality: "standard",
        style: "vivid",
      });

      imgURLs.push(result.data[0].url);
    }
    /*
    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    const buffer = Buffer.from(response.data, 'binary');

    // Send the binary image data with proper header
    res.writeHead(200, { 'Content-Type': 'image/png' });
    res.end(buffer);
    */
    res.end(JSON.stringify(imgURLs));
    

  } catch (err) {
    console.error("Error in:", err);
    res.status(500).json({ error: "Failed to generate image" });
  }
});

app.post("/reverser", async (req, res) => {
  try {
    const client = getClient();
    const { item } = req.body;
    const prompt = `generate a 512x512 dark pixel art of the opposite of ${item} and centered with a plain transparent background`;

    // 1. Generate
    const result = await client.images.generate({
      prompt,
      size: "1024x1024",
      n: 1,
      quality: "standard",
      style: "vivid",
    });

    const imageUrl = result.data[0].url;
    /*
    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    const buffer = Buffer.from(response.data, 'binary');

    // Send the binary image data with proper header
    res.writeHead(200, { 'Content-Type': 'image/png' });
    res.end(buffer);
    */
    res.end(imageUrl);
    

  } catch (err) {
    console.error("Error in:", err);
    res.status(500).json({ error: "Failed to generate image" });
  }
});

app.listen(port, () => {
  console.log(`Image server listening at http://localhost:${port}`);
});
