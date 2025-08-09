const { App } = require("@slack/bolt");
require("dotenv").config();
const axios = require("axios");
const { saveToNotion, getPermalink } = require("./utils");

// Initialize Slack Bolt app
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
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

app.message(/#record/, async ({ message, context, say }) => {
  try {
    const permalink = await getPermalink(app, message.channel, message.ts);
    if (!permalink) return;
    await saveToNotion(message, '#record', permalink, []);
    say("Record this! that command works!");
  } catch (error) {
    console.log("err");
    console.error(error);
  }
});

(async () => {
  const port = 3000;
  await app.start(process.env.port || port);
  console.log(`⚡️ Slack Bolt app is running on port ${port}!`);
})();
