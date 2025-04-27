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
    const prompt = `generate a 756x756 dark pixel art of ${txtPrompt} and centered with a plain background`;

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
      const prompt = `generate a 756x756 dark pixel art of ${text}, centered with a plain background`;

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
    const { items } = req.body;
    const completions = await openai.chat.completions.create({
      model: "qwen-turbo-latest",
      messages: [
          { role: "system", content: "pretend that you are a God, and you can create the exact opposite of a given item" },
          { role: "user", content: `Create the opposite of ${items}. Answer only the name` }
      ],
    });

    const txtPrompt = completions.choices[0].message.content;


    const client = getImageClient();
    const prompt = `generate a 756x756 dark pixel art of ${txtPrompt} and centered with a plain background`;

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

app.post("/diffuser", async (req, res) => {
  try {
    const { items } = req.body;
    const completions = await openai.chat.completions.create({
      model: "qwen-turbo-latest",
      messages: [
          { role: "system", content: "when you are given an item, create a lesser degree of that item" },
          { role: "user", content: `Create the lesser version of a ${items}. Answer only the name` }
      ],
    });

    const txtPrompt = completions.choices[0].message.content;


    const client = getImageClient();
    const prompt = `generate a 756x756 dark pixel art of ${txtPrompt} and centered with a plain background`;

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

app.post("/serve", async (req, res) => {
  try {
    const { items } = req.body;
    const completions = await openai.chat.completions.create({
      model: "qwen-turbo-latest",
      messages: [
          { role: "system", content: "Imagine you are a customer in a restaurant. You are given something to eat, and also a preference. Give a number between 1-5 of how satisfied you are based on your satisfaction" },
          { role: "user", content: `You prefer something ${items[0]}. You are given ${items[1]}. Give a rating between 1-5 based on how satisfied you were. Give only one number` }
      ],
    });

    const rating = parseInt(completions.choices[0].message.content);

    res.end(JSON.stringify([rating]));
    

  } catch (err) {
    console.error("Error in:", err);
    res.status(500).json({ error: "Failed to generate rating" });
  }
});

app.listen(port, () => {
  console.log(`Image server listening at port :${port}`);
});
