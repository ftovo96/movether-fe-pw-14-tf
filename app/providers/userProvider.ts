import { API_URL } from "../config/constants";
import { AnonymousUser, LoggedUser } from "../models/user";
import { createContext } from 'react';
import { ReservationsProvider } from "./reservationsProvider";

export interface LoginCredentials {
    email: string,
    password: string,
}

export class LoginProvider {
    public static getUser(): LoggedUser | AnonymousUser {
        let uid: number;
        if (localStorage.getItem('userUid') !== null) {
            uid = +localStorage.getItem('userUid')!;
        } else {
            uid = Math.floor(Math.random() * 1000000000);
            localStorage.setItem('userUid', `${uid}`);
        }
        const isLoggedIn = localStorage.getItem('userId') !== null;
        if (isLoggedIn) {
            const user: LoggedUser = {
                isLoggedIn: true,
                id: +localStorage.getItem('userId')!,
                uid: uid,
                name: localStorage.getItem('userName')!,
                surname: localStorage.getItem('userSurname')!,
            };
            return user;
        } else {
            const user: AnonymousUser = {
                isLoggedIn: false,
                uid: uid,
            };
            return user;
        }
    }
    public static isLoggedIn(): boolean {
        return this.getUser().isLoggedIn;
    }
    public static async login(params: LoginCredentials): Promise<LoggedUser | null> {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            body: JSON.stringify({
                "email": params.email,
                "password": params.password,
            }),
        });
        const data = await response.json();
        if (response.status !== 200 || data.result !== 'OK') {
            return null;
        }
        const user: LoggedUser = {
            isLoggedIn: true,
            uid: +localStorage.getItem('userUid')!,
            id: +data['user']['id']!,
            name: data['user']['name']!,
            surname: data['user']['surname']!,
        };
        localStorage.setItem('userId', `${user.id}`);
        localStorage.setItem('userName', `${user.name}`);
        localStorage.setItem('userSurname', `${user.surname}`);
        ReservationsProvider.linkReservations(user.id);
        return user;
    }
    public static logout() {
        localStorage.removeItem('userId');
        localStorage.removeItem('userName');
        localStorage.removeItem('userSurname');
        ReservationsProvider.clearReservations();
    }
}

export const UserContext = createContext(LoginProvider.getUser());