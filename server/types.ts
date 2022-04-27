export type TUser = {
    username: string;
}

export type TPlayer = {
    id: string;
    lastWord: string;
    submittedWord: string;
}

export type TRoom = {
    category?: string;
    player1: TPlayer;
    player2?: TPlayer;
}