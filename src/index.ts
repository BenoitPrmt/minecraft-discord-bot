import * as dotenv from 'dotenv';
import { EC2 } from 'aws-sdk';
import { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } from 'discord.js';
import { status } from 'minecraft-server-util';
import AWS from 'aws-sdk';

dotenv.config();

AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    region: process.env.AWS_REGION!,
});

const ec2 = new EC2();
const INSTANCE_ID = process.env.AWS_INSTANCE_ID!;
const SERVER_IP = process.env.AWS_IP_ADDRESS!;
const SERVER_PORT = 25565;
const CHECK_INTERVAL = 60 * 1000;
const TIMEOUT = 10 * 60 * 1000;

let lastPlayersConnected = Date.now();
let shutdownTimer: NodeJS.Timeout | null = null;

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

const startInstance = async () => {
    await ec2.startInstances({ InstanceIds: [INSTANCE_ID] }).promise();
};

const stopInstance = async () => {
    await ec2.stopInstances({ InstanceIds: [INSTANCE_ID] }).promise();
};

const monitorPlayers = () => {
    setInterval(async () => {
        try {
            console.log("Pinging Minecraft server...");
            const res = await status(SERVER_IP, SERVER_PORT);
            const players = res.players.online;
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
    console.log(`Logged in as ${client.user?.tag}`);
    monitorPlayers();
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;
    if (interaction.commandName === 'start') {
        await interaction.reply('Démarrage de l\'instance EC2...');
        await startInstance().then(() => {
            interaction.followUp('Instance démarrée.');
        });
    } else if (interaction.commandName === 'stop') {
        await interaction.reply('Arrêt de l\'instance EC2...');
        await stopInstance().then(() => {
            interaction.followUp('Instance arrêtée.');
        })
    } else if (interaction.commandName === 'status') {
        await interaction.reply('Vérification du statut du serveur Minecraft...');
        try {
            const res = await status(SERVER_IP, SERVER_PORT);
            const players = res.players.online;
            interaction.followUp(`Le serveur est en ligne avec ${players} joueur(s) connecté(s).`);
        } catch (err) {
            interaction.followUp('Le serveur est hors ligne.');
        }
    }
});

const commands = [
    new SlashCommandBuilder()
        .setName('start')
        .setDescription('Démarre le serveur Minecraft'),
    new SlashCommandBuilder()
        .setName('stop')
        .setDescription('Arrête le serveur Minecraft'),
    new SlashCommandBuilder()
        .setName('status')
        .setDescription('Vérifie le statut du serveur Minecraft'),
].map(cmd => cmd.toJSON());

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN!);

(async () => {
    try {
        console.log(process.env.DISCORD_TOKEN);
        await rest.put(Routes.applicationCommands(process.env.DISCORD_BOT_ID!), { body: commands });
        await client.login(process.env.DISCORD_TOKEN!);
    } catch (error) {
        console.error(error);
    }
})();
