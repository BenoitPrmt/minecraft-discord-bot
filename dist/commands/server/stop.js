"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.execute = exports.data = void 0;
const discord_js_1 = require("discord.js");
const ec2_1 = require("../../helpers/ec2");
const config_1 = __importDefault(require("../../config"));
exports.data = new discord_js_1.SlashCommandBuilder()
    .setName('stop')
    .setDescription('Arrête le serveur Minecraft');
const execute = async (interaction) => {
    const embed = new discord_js_1.EmbedBuilder()
        .setTitle("Arrêt de l'instance EC2")
        .setColor(config_1.default.color.default)
        .setDescription('Arrêt de l\'instance EC2 en cours...')
        .setFooter({ text: config_1.default.embed.footer });
    await interaction.reply({ embeds: [embed] });
    await (0, ec2_1.stopInstance)().then(() => {
        const successEmbed = new discord_js_1.EmbedBuilder()
            .setTitle("Instance EC2 arrêtée")
            .setColor(config_1.default.color.success)
            .setDescription('L\'instance EC2 a été arrêtée avec succès.')
            .setFooter({ text: config_1.default.embed.footer });
        interaction.editReply({
            embeds: [successEmbed]
        });
    });
};
exports.execute = execute;
