"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.execute = exports.data = void 0;
const discord_js_1 = require("discord.js");
const minecraft_server_util_1 = require("minecraft-server-util");
const config_1 = __importDefault(require("../../config"));
const SERVER_IP = process.env.AWS_IP_ADDRESS;
const SERVER_PORT = 25565;
exports.data = new discord_js_1.SlashCommandBuilder()
    .setName('status')
    .setDescription('Vérifie le statut du serveur Minecraft');
const execute = async (interaction) => {
    const embed = new discord_js_1.EmbedBuilder()
        .setTitle("Statut du serveur Minecraft")
        .setColor(config_1.default.color.default)
        .setDescription('Vérification du statut du serveur Minecraft en cours...')
        .setFooter({ text: config_1.default.embed.footer });
    await interaction.reply({ embeds: [embed] });
    try {
        const res = await (0, minecraft_server_util_1.status)(SERVER_IP, SERVER_PORT);
        console.log(res);
        const players = res.players.online;
        const successEmbed = new discord_js_1.EmbedBuilder()
            .setTitle("Statut du serveur Minecraft")
            .setColor(config_1.default.color.default)
            .setDescription(`
            **✅ Statut du serveur :** En ligne
            **⚔️ Joueurs connectés :** ${players}
            **🗺️ Version :** ${res.version.name}
            `)
            .setFields({
            name: '**👾 Joueurs**',
            value: res.players.sample ? res.players.sample.map((player) => player.name).join(', ') : 'Aucun joueur connecté',
            inline: false
        })
            .setFooter({ text: config_1.default.embed.footer });
        await interaction.editReply({
            embeds: [successEmbed]
        });
    }
    catch (err) {
        const errorEmbed = new discord_js_1.EmbedBuilder()
            .setTitle("Statut du serveur Minecraft")
            .setColor('#FF0000')
            .setDescription('Le serveur est hors ligne.')
            .setFooter({ text: config_1.default.embed.footer });
        await interaction.editReply({
            embeds: [errorEmbed]
        });
    }
};
exports.execute = execute;
