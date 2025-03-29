'use server'

import { API_URL } from "@/app/config/constants";

export async function loadSports(): Promise<string[]> {
    try {
        const response = await fetch(`${API_URL}/sports`);
        const data: [] = await response.json();
        console.log('Sports:', data)
        const sports: string[] = data;
        sports.splice(0, 0, 'ALL');
        return sports;
    } catch (e) {
        console.log(e)
        if (e) {}
        return [];
    }
}

export async function loadLocations(): Promise<string[]> {
    try {
        const response = await fetch(`${API_URL}/locations`);
        const data: [] = await response.json();
        const sports: string[] = data;
        sports.splice(0, 0, 'ALL');
        return sports;
    } catch (e) {
        console.log(e)
        if (e) {}
        return [];
    }
}