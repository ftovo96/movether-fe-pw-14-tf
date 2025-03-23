'use server'

import { API_URL } from "@/app/config/constants";
import { Reservation, ReservationOption } from "@/app/models/reservation";

export async function loadReservations(params: Map<string, string | null>): Promise<Reservation[]> {
    try {
        const url = new URL(`${API_URL}/reservations`);
        params.keys()
            for (const [key, value] of params) {
                if (!value || value === 'ALL') continue;
                url.searchParams.append(key, value);
            }
        const response = await fetch(url, { method: 'GET' });
        const data: [] = await response.json();
        const reservations: Reservation[] = data.map(json => {
            console.log(json)
            const reservation: Reservation = {
                activityId: +json['activity_id'],
                availablePartecipants: 0,
                companyId: +json['company_id'],
                companyName: json['company_name'],
                date: new Date(json['date']),
                feedbackId: null,
                id: +json['id'],
                location: json['location'],
                maxPartecipants: +json['max_partecipants'],
                partecipants: +json['partecipants'],
                requestedPartecipants: +json['requested_partecipants'],
                sport: json['sport'],
                time: json['time'],
                validated: null,
            };
            reservation.availablePartecipants = reservation.maxPartecipants - reservation.requestedPartecipants + reservation.partecipants;
            if (json['feedbackId']) {
                reservation.feedbackId = +json['feedbackId'];
            }
            if (json['validated']) {
                reservation.validated = json['validated'] === 'true';
            }
            return reservation;
        });
        return reservations;
    } catch (e) {
        if (e) {}
        return [];
    }
}

export async function getReservationOptions(reservationId: number) {
    try {
        const url = new URL(`${API_URL}/reservations/${reservationId}`);
        const response = await fetch(url, { method: 'GET' });
        const data: [] = await response.json();
        const reservationOptions: ReservationOption[] = data.map(json => {
            console.log(json)
            const reservationOption: ReservationOption = {
                reservationId: null,
                time: json['time'],
                availablePartecipants: +json['availablePartecipants'],
            };
            if (json['reservationId']) {
                reservationOption.reservationId = +json['reservationId'];
            }
            return reservationOption;
        });
        return reservationOptions;
    } catch (e) {
        if (e) {}
        return [];
    }
}

interface ActivityForReservation {
    availablePartecipants: number,
    id: number, // Activity.id
    reservationId: number | null,
    time: string,
}

export interface EditReservationParams {
    reservationId: number,
    time: string,
    partecipants: number,
    activityId: number | null,
    userId: number,
}

export async function editReservation(params: EditReservationParams) {
    const url = new URL(`${API_URL}/reservations/${params.reservationId}`);
    const activitiesForReservation: ActivityForReservation[] = await fetch(url)
        .then(result => result.json())
        .then((result: []) => result.map(json => {
            const activity: ActivityForReservation = {
                availablePartecipants: +json['availablePartecipants'],
                id: +json['id'],
                reservationId: null,
                time: json['time'],
            };
            if (json['reservationId']) {
                activity.reservationId = +json['reservationId'];
            }
            return activity;
        }));
    const activity = activitiesForReservation.find(activity => activity.time === params.time)!;
    return fetch(`${API_URL}/reservations/${params.reservationId}`, {
        method: 'PUT',
        body: JSON.stringify({
            "activityId": activity.id,
            "time": params.time,
            "partecipants": params.partecipants,
            "userId": params.userId,
            "reservationId": params.reservationId,
        }),
    })
    .then(result => result.status === 200)
    .catch(() => false);
}

export interface FeedbackParams {
    reservationId: number,
    feedbackScore: number,
    feedbackMessage: string | null,
    userId: number,
}

export async function sendFeedback(params: FeedbackParams) {
    const requestParams = {
        "score": params.feedbackScore,
        "message": params.feedbackMessage,
        "userId": params.userId,
    };
    console.log(requestParams);
    return fetch(`${API_URL}/send-feedback/${params.reservationId}`, {
        method: 'POST',
        body: JSON.stringify(requestParams),
    })
    .then(result => result.status === 200)
    .catch(() => false);
}

export async function deleteReservation(reservation: Reservation) {
    return fetch(`${API_URL}/reservations/${reservation.id}`, {
        method: 'DELETE',
    })
    .then(result => result.status === 200)
    .catch(() => false);
}