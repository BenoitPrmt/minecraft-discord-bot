"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.execute = exports.data = void 0;
const discord_js_1 = require("discord.js");
const config_1 = __importDefault(require("../../config"));
exports.data = new discord_js_1.SlashCommandBuilder()
    .setName('ping')
    .setDescription('🔴 Latence du bot et de l\'API Discord');
const execute = async (interaction) => {
    const embed = new discord_js_1.EmbedBuilder()
        .setTitle('Pong ! 🏓')
        .setColor(config_1.default.color.default)
        .setDescription(`Latence bot : ${Date.now() - interaction.createdTimestamp}ms\nLatence API : ${Math.round(interaction.client.ws.ping)}ms`)
        .setFooter({ text: config_1.default.embed.footer });
    await interaction.reply({ embeds: [embed] });
};
exports.execute = execute;
