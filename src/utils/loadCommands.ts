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

        console.log(`[COMMAND] Chargement des commandes dans le dossier ${folderPath}`);
        console.log("[COMMAND] Fichiers trouvés :", files);

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
        // await rest.put(Routes.applicationCommands(process.env.DISCORD_BOT_ID!), { body: commands });
        await rest.put(Routes.applicationGuildCommands(process.env.DISCORD_BOT_ID!, "689895625508257874"), { body: commands });
        console.log('✔️  Toutes les commandes ont été enregistrées');
    } catch (err) {
        console.error('❌ Erreur d’enregistrement des commandes:', err);
    }
};
