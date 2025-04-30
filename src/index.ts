import { Client, GatewayIntentBits, Collection } from 'discord.js';
import { loadCommands } from './utils/loadCommands';
import config from './config';
import * as dotenv from "dotenv";
import AWS from "aws-sdk";
import {monitorPlayers} from "./helpers/monitoring";
import {initDB} from "./helpers/db";

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
// @ts-ignore
client.commands = new Collection();

dotenv.config();

AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    region: process.env.AWS_REGION!,
});


client.once('ready', () => {
    console.log(`[DISCORD] Connecté en tant que ${client.user?.tag}`);
    initDB().then(r => {
        console.log("[DATABASE] Base de données initialisée");
    });
    monitorPlayers();
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    // @ts-ignore
    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    if (config.isWhitelistEnabled && !config.whitelist.includes(interaction.user.id)) {
        await interaction.reply({ content: '❌ Tu n\'es pas autorisé à utiliser ce bot.', ephemeral: true });
        return;
    }

    try {
        await command.execute(interaction);
    } catch (err) {
        console.error(err);
        await interaction.reply({ content: '❌ Une erreur est survenue.', ephemeral: true });
    }
});

loadCommands(client);
client.login(process.env.DISCORD_TOKEN!);
