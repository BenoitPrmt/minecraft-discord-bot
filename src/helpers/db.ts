import {QuickDB} from "quick.db";

export const db = new QuickDB();

export const initDB = async () => {
    await db.init();

    const playersTable = await db.get('players');
    if (!playersTable) {
        await db.set('players', {});
    }
}

export const playerTable = db.table("players");