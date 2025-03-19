'use server'

import { API_URL } from "@/app/config/constants";

export interface UserRegistrationParams {
    name: string,
    surname: string,
    email: string,
    password: string,
}

export async function createAccount(userInfo: UserRegistrationParams): Promise<boolean> {
    const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        body: JSON.stringify({
            "name": userInfo.name,
            "surname": userInfo.surname,
            "email": userInfo.email,
            "password": userInfo.password,
        }),
    });
    const data = await response.json();
    if (response.status !== 200 || data.result !== 'OK') {
        return false;
    } else {
        return true;
    }
}