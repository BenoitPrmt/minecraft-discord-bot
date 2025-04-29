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
exports.loadCommands = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const discord_js_1 = require("discord.js");
const config_1 = __importDefault(require("../config"));
const loadCommands = async (client) => {
    const commands = [];
    // @ts-ignore
    client.commands = new Map();
    const commandsPath = path_1.default.join(__dirname, '../commands');
    const folders = fs_1.default.readdirSync(commandsPath);
    for (const folder of folders) {
        const folderPath = path_1.default.join(commandsPath, folder);
        const files = fs_1.default.readdirSync(folderPath).filter(file => file.endsWith('.ts') || file.endsWith('.js'));
        for (const file of files) {
            const filePath = path_1.default.join(folderPath, file);
            const command = await Promise.resolve(`${filePath}`).then(s => __importStar(require(s)));
            if (command.data && command.execute) {
                commands.push(command.data.toJSON());
                // @ts-ignore
                client.commands.set(command.data.name, command);
                console.log(`[COMMAND] ${command.data.name} chargée`);
            }
        }
    }
    const rest = new discord_js_1.REST({ version: '10' }).setToken(config_1.default.discordToken);
    try {
        await rest.put(discord_js_1.Routes.applicationCommands(config_1.default.botId), { body: commands });
        console.log('✔️  Toutes les commandes ont été enregistrées');
    }
    catch (err) {
        console.error('❌ Erreur d’enregistrement des commandes:', err);
    }
};
exports.loadCommands = loadCommands;
