const { App, ExpressReceiver } = require("@slack/bolt");
require("dotenv").config();
const axios = require("axios");
const { saveToNotion, getPermalink } = require("./utils");
// const express = require('express');
const botToken = process.env.SLACK_BOT_TOKEN;
const signingSecret = process.env.SLACK_SIGNING_SECRET;

if (!process.env.SLACK_BOT_TOKEN) {
    throw new Error(
      "Missing SLACK_BOT_TOKEN (should start with xoxb-). Set it in Railway Variables."
    );
  }
  if (!process.env.SLACK_SIGNING_SECRET) {
    throw new Error(
      "Missing SLACK_SIGNING_SECRET. Set it in Railway Variables."
    );
  }
// Initialize ExpressReceiver
const receiver = new ExpressReceiver({
  signingSecret: signingSecret,
  endpoints: { events: "/slack/events", commands: "/slack/commands" },
  processBeforeResponse: true,
});

// Initialize Slack Bolt app
const app = new App({
  token: botToken,
  receiver,
  // signingSecret: process.env.SLACK_SIGNING_SECRET,
  // socketMode:true, // enable the following to use socket mode
  // appToken: process.env.SLACK_APP_TOKEN
});

app.command("/knowledge", async ({ command, ack, say }) => {
  try {
    await ack();
    say("Yeahh ! The command works !");
  } catch (error) {
    console.log("err: ", error);
  }
});

app.message(/#lucc/, async ({ message, context, say }) => {
  try {
    const permalink = await getPermalink(app, message.channel, message.ts);
    if (!permalink) return;
    await saveToNotion(message, "#record", permalink, []);
    say("Record this! that command works!");
  } catch (error) {
    console.log("err");
    console.error(error);
  }
});

// Catch-all for unrecognized events
// app.event(/.*/, async ({ event, ack }) => {
//   await ack();
//   console.log("Unrecognized event received:", JSON.stringify(event, null, 2));
// });


(async () => {
  
  const port = process.env.PORT || 3000;
  await app.start(port);
  console.log(`⚡️ Slack Bolt app is running on port ${port}`);
})();
