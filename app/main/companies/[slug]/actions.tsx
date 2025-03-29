'use server'

import { API_URL } from "@/app/config/constants";
import { Company } from "@/app/models/company";
import { Feedback } from "@/app/models/feedback";

/**
 * @description Restituisce i feedback della palestra
 */
export async function loadFeedbacks(companyId: string): Promise<Feedback[]> {
    const url = new URL(`${API_URL}/feedbacks/${companyId}`);
    const response = await fetch(url);
    const data: [] = await response.json();
    const feedbacks: Feedback[] = data.map(json => {
        const feedback: Feedback = {
            id: +json['id'],
            companyId: +json['company_id'],
            companyName: json['company_name'],
            message: json['message'] || null,
            score: +json['score'],
            timestamp: +json['timestamp'],
            userName: json['userName'] || null,
        };
        return feedback;
    });
    return feedbacks;
}

/**
 * @description Restituisce i dati della palestra
 */
export async function getCompany(companyId: string): Promise<Company> {
    const url = new URL(`${API_URL}/companies/${companyId}`);
    const response = await fetch(url);
    const json = await response.json();
    const company: Company = {
        id: +json['id'],
        name: json['name'],
        description: json['description'],
    };
    return company;
}