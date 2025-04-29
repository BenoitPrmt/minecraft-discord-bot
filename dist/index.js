"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv = __importStar(require("dotenv"));
const aws_sdk_1 = require("aws-sdk");
const discord_js_1 = require("discord.js");
const minecraft_server_util_1 = require("minecraft-server-util");
const aws_sdk_2 = __importDefault(require("aws-sdk"));
dotenv.config();
// Configurer AWS SDK avec les variables d'environnement
aws_sdk_2.default.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
});
const ec2 = new aws_sdk_1.EC2();
const INSTANCE_ID = process.env.AWS_INSTANCE_ID;
const SERVER_IP = process.env.AWS_IP_ADDRESS;
const SERVER_PORT = 25565;
const CHECK_INTERVAL = 60 * 1000;
const TIMEOUT = 10 * 60 * 1000;
let lastPlayersConnected = Date.now();
let shutdownTimer = null;
const client = new discord_js_1.Client({ intents: [discord_js_1.GatewayIntentBits.Guilds] });
// Fonction de démarrage et arrêt de l'instance EC2
const startInstance = async () => {
    await ec2.startInstances({ InstanceIds: [INSTANCE_ID] }).promise();
};
const stopInstance = async () => {
    await ec2.stopInstances({ InstanceIds: [INSTANCE_ID] }).promise();
};
// Surveille les joueurs connectés au serveur Minecraft
const monitorPlayers = () => {
    setInterval(async () => {
        try {
            const res = await (0, minecraft_server_util_1.status)(SERVER_IP, SERVER_PORT);
            const players = res.players.online;
            if (players > 0) {
                lastPlayersConnected = Date.now();
                if (shutdownTimer) {
                    clearTimeout(shutdownTimer);
                    shutdownTimer = null;
                }
            }
            else {
                if (!shutdownTimer && Date.now() - lastPlayersConnected > TIMEOUT) {
                    console.log('No players for 10 min, stopping instance...');
                    await stopInstance();
                }
            }
        }
        catch (err) {
            console.error('Erreur de ping Minecraft :', err);
        }
    }, CHECK_INTERVAL);
};
client.once('ready', () => {
    console.log(`Logged in as ${client.user?.tag}`);
    monitorPlayers();
});
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand())
        return;
    if (interaction.commandName === 'start') {
        await interaction.reply('Démarrage de l\'instance EC2...');
        await startInstance();
    }
});
// Crée et enregistre la commande `/start`
const commands = [new discord_js_1.SlashCommandBuilder().setName('start').setDescription('Démarre le serveur Minecraft')].map(cmd => cmd.toJSON());
const rest = new discord_js_1.REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
(async () => {
    try {
        console.log(process.env.DISCORD_TOKEN);
        await rest.put(discord_js_1.Routes.applicationCommands(process.env.DISCORD_BOT_ID), { body: commands });
        await client.login(process.env.DISCORD_TOKEN);
    }
    catch (error) {
        console.error(error);
    }
})();
