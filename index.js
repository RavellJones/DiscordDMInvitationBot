// ========================
// Dependencies & Config
// ========================
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import http from 'http';
import { Client, GatewayIntentBits, Partials, EmbedBuilder } from 'discord.js';

// ========================
// Start Express Web Server (for Railway uptime)
// ========================
const app = express();
const port = process.env.PORT || 3000;

// Simple route to respond to internal pings
app.get('/', (req, res) => {
  res.send('Bot is online and running!');
});

// Start the web server
app.listen(port, () => {
  console.log(`🟢 Server is running on port ${port}`);
});

// ========================
// Discord Bot Setup
// ========================
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages
  ],
  partials: [Partials.Channel]
});

// Invite links to share in DMs
const SERVER_INVITES = [
  { name: "CTU9YZdW", title: "Midnight Lounge", link: "https://discord.gg/CTU9YZdW " },
  { name: "lavita", title: "La Vita", link: "https://discord.gg/lavita " },
  { name: "varesa", title: "Varesa", link: "https://discord.gg/varesa " },
  { name: "dior", title: "House of Dior", link: "https://discord.gg/dior " },
  { name: "frosted", title: "Frosted Realms", link: "https://discord.gg/frosted " },
  { name: "veil", title: "The Veil", link: "https://discord.gg/veil " },
  { name: "ask-to-dm", title: "Ask to DM", link: "https://discord.gg/ask-to-dm " },
  { name: "qtPPGEAD", title: "Vibeland", link: "https://discord.gg/qtPPGEAD " }
];

// Allowed server IDs from .env
const ALLOWED_SERVER_IDS = process.env.SERVER_IDS?.split(',').map(id => id.trim()) || [];

// ========================
// Helper Functions
// ========================
function createWelcomeEmbed(username, serverName) {
  const embed = new EmbedBuilder()
    .setTitle(`👋 Welcome to ${serverName}!`)
    .setDescription(`Hey ${username}, check out these awesome communities:`)
    .setColor(0x00BFFF)
    .setFooter({ text: `Sent by our friendly bot` });

  SERVER_INVITES.forEach(server => {
    embed.addFields({ name: server.title, value: server.link });
  });

  return embed;
}

// ========================
// Bot Events
// ========================
client.once('ready', () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

client.on('guildMemberAdd', async (member) => {
  const { user, guild } = member;

  if (!ALLOWED_SERVER_IDS.includes(guild.id)) return;

  try {
    const embed = createWelcomeEmbed(user.username, guild.name);
    await user.send({ embeds: [embed] });
    console.log(`📩 Sent welcome DM to ${user.tag}`);
  } catch (error) {
    console.error(`❌ Could not DM ${user.tag}:`, error.message);
  }
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  if (message.content.toLowerCase() === '!invite') {
    try {
      const embed = createWelcomeEmbed(message.author.username, message.guild?.name || 'this server');
      await message.author.send({ embeds: [embed] });
      await message.reply('📬 Check your DMs!');
    } catch (error) {
      await message.reply('❌ Could not send DM. Please enable your DMs.');
    }
  }
});

// ========================
// Keep the bot awake
// ========================
setInterval(() => {
  http.get(`http://localhost:${port}`);
  console.log('🔁 Pinging server to stay awake...');
}, 240000); // Every 4 minutes

// ========================
// Start the Bot
// ========================
client.login(process.env.DISCORD_BOT_TOKEN);