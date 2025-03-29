'use server'

import { API_URL } from "@/app/config/constants";
import { Activity } from "@/app/models/activity";
import { Reservation } from "@/app/models/reservation";

/**
 * @param {Map<string, string | null>} params Parametri per filtrare le attività (sport, luogo, testo ricerca...)
 * @returns {Promise<Activity[]>} Lista attività
 * @description Restituisce la lista delle attività, filtrate in base
 * ai parametri passati in input.
 */
export async function loadActivities(params: Map<string, string | null>): Promise<Activity[]> {
    try {
        const url = new URL(`${API_URL}/activities`);
        params.keys()
            for (const [key, value] of params) {
                if (!value || value === 'ALL') continue;
                url.searchParams.append(key, value);
            }
            console.log(url)
        const response = await fetch(url, { method: 'GET' });
        const data: [] = await response.json();
        const activities: Activity[] = data.map(json => {
            console.log('RawData: ', json)
            const activity: Activity = {
                id: +json['id'],
                allowAnonymous: json['allowAnonymous'] === 'true',
                companyId: +json['company_id'],
                companyName: json['company_name'],
                date: new Date(json['date']),
                description: json['description'],
                location: json['location'],
                maxPartecipants: json['max_partecipants'],
                sport: json['sport'],
                times: (json['times'] as string).split('; '),
                reservationId: json['reservationId'],
                isBanned: json['isBanned'] === 'true',
            };
            return activity;
        });
        return activities;
    } catch (e) {
        console.log(e)
        if (e) {}
        return [];
    }
}

export interface ReserveActivityParams {
    activityOption: ActivityOption,
    partecipants: number,
    userId: number | null,
    reservationId: number | null,
}

/**
 * @param {ReserveActivityParams} params parametri per prenotazione
 * @returns {Promise<Reservation | null>} Prenotazione effettuata
 * @description Crea la prenotazione di una attività e ne restituisce
 * i dati o, se non è possibile prenotarla, restituisce null.
 */
export async function reserveActivity(params: ReserveActivityParams): Promise<Reservation | null> {
    const response = await fetch(`${API_URL}/reserveActivity`, {
        method: 'POST',
        body: JSON.stringify({
            "activityId": params.activityOption.activityId,
            "time": params.activityOption.time,
            "partecipants": params.partecipants,
            "userId": params.userId,
            "reservationId": params.activityOption.reservationId || params.reservationId,
        }),
    });
    if (response.status === 200) {
        const json = await response.json();
        const reservation: Reservation = {
            id: +json['id'],
            securityCode: json['securityCode'],
            companyId: +json['company_id'],
            companyName: json['company_name'],
            date: new Date(json['date']),
            location: json['location'],
            maxPartecipants: json['max_partecipants'],
            sport: json['sport'],
            time: json['time'],
            activityId: +json['activity_id'],
            availablePartecipants: +json['available_partecipants'],
            feedbackId: null,
            partecipants: +json['partecipants'],
            requestedPartecipants: +json['requested_partecipants'],
            validated: false,
        };
        return reservation;
    } else {
        return null;
    }
}

export interface ActivityOption {
    activityId: number,
    reservationId: number | null,
    time: string,
    availablePartecipants: number,
}

/**
 * @param {number} activityId id attività
 * @param {number} userId id utente
 * @returns {Promise<ActivityOption[]>} Lista "opzioni" prenotazione
 * @description Restituisce la lista delle "opzioni" di prenotazione,
 * che corrispondono effettivamente alle attività che hanno in comune
 * con quella con id = activityId data e palestra.
 * Nella struttura dati del sistema ogni attività ha un orario, per
 * gestire il fatto che una attività potrebbe avere più slot temporari
 * in cui si svolge (es: alle 09:00 e alle 16:00) le attività vengono
 * raggruppate per giorno e palestra e presentate all'utente come se
 * fossero una. Tramite questa API è possibile passare da un'attività
 * all'altra.
 */
export async function getActivitiesOptions(activityId: number, userId: number | null): Promise<ActivityOption[]> {
    try {
        const url = new URL(`${API_URL}/activities/${activityId}`);
        url.searchParams.append('userId', `${userId}`);
        const response = await fetch(url, { method: 'GET' });
        const data: [] = await response.json();
        const activityOptions: ActivityOption[] = data.map(json => {
            console.log('RawData: ', json)
            const activityOption: ActivityOption = {
                activityId: +json['id'],
                availablePartecipants: +json['availablePartecipants'],
                time: json['time'],
                reservationId: null,
            };
            if (json['reservationId']) {
                activityOption.reservationId = +json['reservationId'];
            }
            return activityOption;
        });
        return activityOptions;
    } catch (e) {
        console.log(e)
        if (e) {}
        return [];
    }
}