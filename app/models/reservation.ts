import { SPORT } from "./sport"

export interface Reservation {
    id: number,
    activityId: number,
    partecipants: number
    maxPartecipants: number
    requestedPartecipants: number,
    availablePartecipants: number,
    sport: SPORT,
    date: Date,
    time: string,
    location: string,
    companyId: number,
    companyName: string
    feedbackId: number | null,
    validated: boolean | null,
    securityCode?: string,
}

export interface ReservationOption {
    activityId: number,
    reservationId: number | null,
    time: string,
    availablePartecipants: number,
}