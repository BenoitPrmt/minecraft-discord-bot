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
const discord_js_1 = require("discord.js");
const loadCommands_1 = require("./utils/loadCommands");
const config_1 = __importDefault(require("./config"));
const minecraft_server_util_1 = require("minecraft-server-util");
const dotenv = __importStar(require("dotenv"));
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const ec2_1 = require("./helpers/ec2");
const client = new discord_js_1.Client({ intents: [discord_js_1.GatewayIntentBits.Guilds] });
// @ts-ignore
client.commands = new discord_js_1.Collection();
dotenv.config();
aws_sdk_1.default.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
});
const SERVER_IP = process.env.AWS_IP_ADDRESS;
const SERVER_PORT = 25565;
const CHECK_INTERVAL = 60 * 1000;
const TIMEOUT = 10 * 60 * 1000;
let lastPlayersConnected = Date.now();
let shutdownTimer = null;
const monitorPlayers = () => {
    setInterval(async () => {
        try {
            console.log("Pinging Minecraft server...");
            const res = await (0, minecraft_server_util_1.status)(SERVER_IP, SERVER_PORT);
            const players = res.players.online;
            console.log(` ${players} players connected`);
            if (players > 0) {
                lastPlayersConnected = Date.now();
                if (shutdownTimer) {
                    clearTimeout(shutdownTimer);
                    shutdownTimer = null;
                }
            }
            else {
                console.log(`Stopping instance in ${TIMEOUT / 1000} seconds...`);
                if (!shutdownTimer && Date.now() - lastPlayersConnected > TIMEOUT) {
                    console.log('No players for 10 min, stopping instance...');
                    await (0, ec2_1.stopInstance)();
                }
            }
        }
        catch (err) {
            console.error('Erreur de ping Minecraft :', err);
        }
    }, CHECK_INTERVAL);
};
client.once('ready', () => {
    console.log(`✅ Connecté en tant que ${client.user?.tag}`);
    monitorPlayers();
});
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand())
        return;
    // @ts-ignore
    const command = client.commands.get(interaction.commandName);
    if (!command)
        return;
    if (!config_1.default.whitelist.includes(interaction.user.id)) {
        await interaction.reply({ content: '❌ Tu n\'es pas autorisé à utiliser ce bot.', ephemeral: true });
        return;
    }
    try {
        await command.execute(interaction);
    }
    catch (err) {
        console.error(err);
        await interaction.reply({ content: '❌ Une erreur est survenue.', ephemeral: true });
    }
});
(0, loadCommands_1.loadCommands)(client);
client.login(config_1.default.discordToken);
