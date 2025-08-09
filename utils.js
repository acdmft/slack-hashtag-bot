const axios = require("axios");
require("dotenv").config();

const NOTION_API_URL = "https://api.notion.com/v1/pages";
const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID;
const notionHeaders = {
  Authorization: `Bearer ${process.env.NOTION_API_TOKEN}`,
  "Content-Type": "application/json",
  "Notion-Version": "2022-06-28",
};

// Function to save message to Notion
async function saveToNotion(message, hashtag, permalink, replies) {
  try {
    const response = await axios.post(
      NOTION_API_URL,
      {
        parent: { database_id: NOTION_DATABASE_ID },
        properties: {
          title: {
            rich_text: [
              {
                text: { content: message.text.substring(0, 50) || "Untitled" },
              },
            ],
          },
          hashtag: { multi_select: [{ name: hashtag }] },
          "slack link": { url: permalink },
          content: {
            rich_text: [{ text: { content: message.text || "No content" } }],
          },
          replies: {
            rich_text: [
              { text: { content: replies.join("\n") || "No replies" } },
            ],
          },
          timestamp: {
            date: { start: new Date(message.ts * 1000).toISOString() },
          },
        },
      },
      { headers: notionHeaders }
    );
    console.log("Saved to Notion:", response.data);
  } catch (error) {
    console.error(
      "Error saving to Notion:",
      error.response ? error.response.data : error.message
    );
  }
}

// Function to get Slack message permalink
async function getPermalink(app, channel, ts) {
  try {
    const result = await app.client.chat.getPermalink({
      channel,
      message_ts: ts,
    });
    return result.permalink;
  } catch (error) {
    console.error("Error getting permalink:", error);
    return null;
  }
}

module.exports = { saveToNotion, getPermalink };
