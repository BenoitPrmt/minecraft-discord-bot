export type Player = {
    username: string;
    playtime: number; // in minutes
    firstSeen: Date;
    lastSeen: Date;
}

export type CompletePlayer = Player & {
    id: string;
}

export type DbPlayer = {
    id: string;
    value: Player;
}