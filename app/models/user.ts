export interface User {
    uid: number,
    isLoggedIn: boolean,
}

export interface LoggedUser extends User {
    isLoggedIn: true,
    id: number,
    name: string,
    surname: string,
}

export interface AnonymousUser extends User {
    isLoggedIn: false,
}