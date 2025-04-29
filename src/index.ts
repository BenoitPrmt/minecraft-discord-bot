import { Client, GatewayIntentBits, Collection } from 'discord.js';
import { loadCommands } from './utils/loadCommands';
import config from './config';
import {status} from "minecraft-server-util";
import * as dotenv from "dotenv";
import AWS from "aws-sdk";
import {stopInstance} from "./helpers/ec2";

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
// @ts-ignore
client.commands = new Collection();

dotenv.config();

AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    region: process.env.AWS_REGION!,
});

const SERVER_IP = process.env.AWS_IP_ADDRESS!;
const SERVER_PORT = 25565;
const CHECK_INTERVAL = 60 * 1000;
const TIMEOUT = 10 * 60 * 1000;

let lastPlayersConnected = Date.now();
let shutdownTimer: NodeJS.Timeout | null = null;

const monitorPlayers = () => {
    setInterval(async () => {
        try {
            console.log("Pinging Minecraft server...");
            const res = await status(SERVER_IP, SERVER_PORT);
            const players = res.players.online;
            console.log(` ${players} players connected`);
            if (players > 0) {
                lastPlayersConnected = Date.now();
                if (shutdownTimer) {
                    clearTimeout(shutdownTimer);
                    shutdownTimer = null;
                }
            } else {
                if (!shutdownTimer && Date.now() - lastPlayersConnected > TIMEOUT) {
                    console.log('No players for 10 min, stopping instance...');
                    await stopInstance();
                }
            }
        } catch (err) {
            console.error('Erreur de ping Minecraft :', err);
        }
    }, CHECK_INTERVAL);
};

client.once('ready', () => {
    console.log(`✅ Connecté en tant que ${client.user?.tag}`);
    monitorPlayers();
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    // @ts-ignore
    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (err) {
        console.error(err);
        await interaction.reply({ content: '❌ Une erreur est survenue.', ephemeral: true });
    }
});

loadCommands(client);
client.login(config.discordToken);
