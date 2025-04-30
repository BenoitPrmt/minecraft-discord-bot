import fs from 'fs';
import path from 'path';
import { REST, Routes, Client } from 'discord.js';
import { Command } from '../types/Command';
import config from '../config';

export const loadCommands = async (client: Client) => {
    const commands: Command[] = [];
    // @ts-ignore
    client.commands = new Map();

    const commandsPath = path.join(__dirname, '../commands');
    const folders = fs.readdirSync(commandsPath);

    for (const folder of folders) {
        const folderPath = path.join(commandsPath, folder);
        const files = fs.readdirSync(folderPath).filter(file => file.endsWith('.ts') || file.endsWith('.js'));

        for (const file of files) {
            const filePath = path.join(folderPath, file);
            const command = await import(filePath);

            if (command.data && command.execute) {
                commands.push(command.data.toJSON());
                // @ts-ignore
                client.commands.set(command.data.name, command);
                console.log(`[COMMAND] ${command.data.name} chargée`);
            }
        }
    }

    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN!);

    try {
        if (process.env.DEBUG === 'true' && process.env.DEV_GUILD_ID) {
            console.log("[DEBUG] Enregistrement des commandes dans le serveur de développement");
            await rest.put(Routes.applicationGuildCommands(process.env.DISCORD_BOT_ID!, process.env.DEV_GUILD_ID), { body: commands });
        } else {
            console.log("[PROD] Enregistrement des commandes globalement");
            await rest.put(Routes.applicationCommands(process.env.DISCORD_BOT_ID!), { body: commands });
        }
        console.log('[COMMANDS] Toutes les commandes ont été enregistrées');
    } catch (err) {
        console.error('[ERROR] Erreur d’enregistrement des commandes:', err);
    }
};
