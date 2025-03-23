import { SPORT } from "./sport";

export interface Activity {
    id: number,
    sport: SPORT,
    date: Date,
    times: string[],
    maxPartecipants: number,
    description: string,
    location: string,
    companyId: number,
    companyName: string,
    allowAnonymous: boolean,
    reservationId?: number,
    isBanned: boolean,
    securityCode?: string,
}

