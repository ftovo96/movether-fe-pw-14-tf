'use server'

import { API_URL } from "@/app/config/constants";
import { Activity } from "@/app/models/activity";
import { Reservation } from "@/app/models/reservation";

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
    activity: Activity,
    time: string,
    partecipants: number,
    userId: number | null,
    reservationId: number | null,
}

export async function reserveActivity(params: ReserveActivityParams): Promise<Reservation | null> {
    console.log('Params: ', params);
    const response = await fetch(`${API_URL}/reserveActivity`, {
        method: 'POST',
        body: JSON.stringify({
            "activityId": params.activity.id,
            "time": params.time,
            "partecipants": params.partecipants,
            "userId": params.userId,
            "reservationId": params.activity.reservationId,
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