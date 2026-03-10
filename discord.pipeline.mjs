// discordPipeline.mjs
import dotenv from "dotenv";
import { Client, GatewayIntentBits } from "discord.js";

dotenv.config();

const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const DISCORD_CHANNEL_ID = process.env.DISCORD_CHANNEL_ID;

if (!DISCORD_BOT_TOKEN || !DISCORD_CHANNEL_ID) {
  console.error("Discord token or channel ID missing!");
  process.exit(1);
}

// Create a client
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

// Wrap login in a function so it can be called once
async function loginClient() {
  if (!client.isReady()) {
    await client.login(DISCORD_BOT_TOKEN);
    await new Promise((resolve) => client.once("ready", resolve));
    console.log(`Logged in as ${client.user.tag}`);
  }
}

class DiscordPipeline {
  async sendMessage(message) {
    try {
      await loginClient(); // ensure client is logged in
      const channel = await client.channels.fetch(DISCORD_CHANNEL_ID);
      if (channel) await channel.send(message);
    } catch (err) {
      console.error("Failed to send Discord message:", err.message);
    }
  }
}

export default DiscordPipeline;
