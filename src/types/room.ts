import { TUser } from "./user";

export type TRoom = {
    id: string | null;
    users: { [key: string]: Partial<TUser> };
}