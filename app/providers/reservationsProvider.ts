import { API_URL } from "../config/constants";
import { Reservation } from "../models/reservation";

export class ReservationsProvider {
    /**
     * @param {Reservation} reservation 
     * @description Salva la prenotazione nel localStorage.
     * Se già presente la aggiorna.
     */
    public static saveReservation(reservation: Reservation): void {
        const reservations = this.getReservations();
        if (reservations.length) {
            const index = reservations.findIndex(res => res.id === reservation.id);
            if (index !== -1) {
                reservations[index] = reservation;
            } else {
                reservations.push(reservation);
            }
        } else {
            reservations.push(reservation);
        }
        localStorage.setItem('reservations', JSON.stringify(reservations));
    }
    /**
     * @param {number} reservationId 
     * @returns {void}
     * @description Rimuove la prenotazione indicata dal
     * localStorage.
     */
    public static removeReservation(reservationId: number): void {
        const reservations = this.getReservations();
        const index = reservations.findIndex(res => res.id === reservationId);
        reservations.splice(index, 1);
        localStorage.setItem('reservations', JSON.stringify(reservations));
    }
    /**
     * @description Restituisce la lista delle prenotazioni salvate.
     * @returns {Reservation[]}
     */
    public static getReservations(): Reservation[] {
        const savedReservations = localStorage.getItem('reservations');
        let reservations: Reservation[];
        if (savedReservations !== null) {
            const parsedReservations: [] = JSON.parse(savedReservations);
            reservations = parsedReservations!.map(json => {
                console.log(json)
                const reservation: Reservation = {
                    activityId: +json['activityId'],
                    availablePartecipants: 0,
                    companyId: +json['companyId'],
                    companyName: json['companyName'],
                    date: new Date(json['date']),
                    feedbackId: null,
                    id: +json['id'],
                    location: json['location'],
                    maxPartecipants: +json['maxPartecipants'],
                    partecipants: +json['partecipants'],
                    requestedPartecipants: +json['requestedPartecipants'],
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
        } else {
            reservations = [];
        }
        return reservations;
    }
    /**
     * @description Rimuove tutte le prenotazioni salvate
     * dal localStorage
     */
    public static clearReservations() {
        localStorage.removeItem('reservations');
    }
    /**
     * @param {number} userId Id dell'utente a cui associare le prenotazioni
     * "anonime" (cioè create senza aver effettuato l'accesso).
     */
    public static async linkReservations(userId: number) {
        const reservations = this.getReservations();
        if (!reservations.length) {
            return 0;
        }
        const reservationIds = reservations
            // .filter(reservation => !reservation.userId)
            .map(reservation => reservation.id);
        if (!reservationIds.length) {
            return 0;
        }
        const response = await fetch(`${API_URL}/link-reservations`, {
            method: 'POST',
            body: JSON.stringify({
                "reservationIds": reservationIds,
                "userId": userId,
            }),
        })
        .then(result => result.json());
        if (response.result === 'OK') {
            this.clearReservations();
        }
        return response;
    }

}