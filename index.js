// server.js
require("dotenv").config();
const express = require("express");
const OpenAI= require("openai");
const axios = require('axios');


const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

const endpoint = `${process.env.API_URL}?api-version=${process.env.API_VER}`;
const apiKey = process.env.API_KEY;
const apiVersion = process.env.OPENAI_API_VERSION || "2024-02-01";
const deploymentName = process.env.AZURE_OPENAI_DEPLOYMENT_NAME || "dall-e-3";

function getImageClient() {
  return new OpenAI.AzureOpenAI({
    endpoint,
    apiKey,
    apiVersion,
    deployment: deploymentName,
  });
}

const openai = new OpenAI(
    {
        apiKey: process.env.API_KEY_2,
        baseURL: "https://dashscope-intl.aliyuncs.com/compatible-mode/v1"
    }
);


app.post("/mixer", async (req, res) => {
  try {
    const { items } = req.body;
    const completions = await openai.chat.completions.create({
      model: "qwen-turbo-latest",
      messages: [
          { role: "system", content: "pretend that you are an infinite craft function that generates an Item from a list of items" },
          { role: "user", content: `Combine ${items}. Answer only the name` }
      ],
    });


    const txtPrompt = completions.choices[0].message.content;

    const client = getImageClient();
    const prompt = `generate a 512x512 dark pixel art of ${txtPrompt} and centered with a plain transparent background`;

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
   res.end(JSON.stringify([{txt: txtPrompt, img: imageUrl}]));

  } catch (err) {
    console.error("Error in:", err);
    res.status(500).json({ error: "Failed to generate image" });
  }
});

app.post("/seperator", async (req, res) => {

  try {

    const { items } = req.body;
    const completions = await openai.chat.completions.create({
      model: "qwen-turbo-latest",
      messages: [
          { role: "system", content: "pretend that you can deconstruct items into two separate items based on their names" },
          { role: "user", content: `Separate ${items} into two items. Separate the two items with a comma` }
      ],

    });

    const txtPrompt = completions.choices[0].message.content;

    const client = getImageClient();
    const imgURLs = [];

    for (let i = 0; i <= 1; i++) {
      const text = txtPrompt.split(",")[i];
      const prompt = `generate a 512x512 dark pixel art of ${text}, centered with a plain transparent background`;

      // 1. Generate
      const result = await client.images.generate({
        prompt,
        size: "1024x1024",
        n: 1,
        quality: "standard",
        style: "vivid",
      });

      imgURLs.push({ txt: text , img: result.data[0].url});
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
    const client = getImageClient();
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
  console.log(`Image server listening at port :${port}`);
});
