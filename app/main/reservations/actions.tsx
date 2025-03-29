'use server'

import { API_URL } from "@/app/config/constants";
import { Reservation, ReservationOption } from "@/app/models/reservation";

/**
 * @description Restituisce i dati della prenotazione identificata dall'id
 * passato in input
 */
export async function getReservation(id: number): Promise<Reservation | null> {
    try {
        const url = new URL(`${API_URL}/reservations/${id}`);
        const response = await fetch(url);
        const json = await response.json();
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
    } catch (e) {
        if (e) {}
        return null;
    }
}

/**
 * @description Restituisce la lista delle prenotazioni effettuate dall'utente
 */
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

/**
 * @description Restituisce le "opzioni" di prenotazione, cioè le attività
 * "parallele" all'attività della prenotazione.
 * Nella struttura dati del sistema ogni attività ha un orario, per
 * gestire il fatto che una attività potrebbe avere più slot temporari
 * in cui si svolge (es: alle 09:00 e alle 16:00) le attività vengono
 * raggruppate per giorno e palestra e presentate all'utente come se
 * fossero una. Tramite questa API è possibile passare da un'attività
 * all'altra.
 */
export async function getReservationOptions(reservationId: number): Promise<ReservationOption[]> {
    try {
        const url = new URL(`${API_URL}/reservation-options/${reservationId}`);
        const response = await fetch(url, { method: 'GET' });
        const data: [] = await response.json();
        const reservationOptions: ReservationOption[] = data.map(json => {
            console.log(json)
            const reservationOption: ReservationOption = {
                activityId: +json['id'],
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

export interface EditReservationParams {
    reservationId: number,
    time: string,
    partecipants: number,
    activityId: number | null,
    userId: number | null,
}

/**
 * @description Modifica i dati di una prenotazione effettuata
 */
export async function editReservation(params: EditReservationParams) {
    const reservationOptions = await getReservationOptions(params.reservationId);
    const reservationOption = reservationOptions.find(option => option.time === params.time)!;
    return fetch(`${API_URL}/reservations/${params.reservationId}`, {
        method: 'PUT',
        body: JSON.stringify({
            "activityId": reservationOption.activityId,
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

/**
 * @description Invia il feedback dell'utente riguardo all'attività conclusa
 */
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

/**
 * @description Elimina la prenotazione
 */
export async function deleteReservation(reservation: Reservation) {
    return fetch(`${API_URL}/reservations/${reservation.id}`, {
        method: 'DELETE',
    })
    .then(result => result.status === 200)
    .catch(() => false);
}

/**
 * @description Permette di recuperare una prenotazione effettuata anonimamente
 * tramite numero di prenotazione (che corrisponde al suo id) e codice di
 * sicurezza (una sorta di password) così da permettere ad un utente di gestire
 * una prenotazione anonima anche dopo aver svuotato lo storage del browser o
 * da un altro dispositivo.
 */
export async function addAnonymousReservation(reservationId: number, securityCode: string): Promise<Reservation | null> {
    const url = new URL(`${API_URL}/get-reservation-by-code`);
    url.searchParams.append('id', `${reservationId}`);
    url.searchParams.append('securityCode', securityCode);
    const response = await fetch(url, {
        method: 'GET',
    });
    if (response.status === 200) {
        const json = await response.json();
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
        return reservation;
    } else {
        return null;
    }
}