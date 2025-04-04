'use server'

import { API_URL } from "@/app/config/constants";
import { RedeemedReward, Reward } from "@/app/models/reward";

/**
 * @description Restituisce la lista dei premi
 */
export async function loadRewards(userId: number): Promise<Reward[]> {
    const url = new URL(`${API_URL}/rewards`);
    url.searchParams.append('userId', `${userId}`);
    const jsonData: [] = await fetch(url)
        .then(result => result.json())
        .catch(() => []);
    const rewards: Reward[] = jsonData.map(json => {
        const reward: Reward = {
            id: +json['id'],
            description: json['description'],
        }
        return reward;
    });
    return rewards;
}

/**
 * @description Restituisce la lista dei premi riscattati dall'utente
 */
export async function loadRedeemedRewards(userId: number): Promise<RedeemedReward[]> {
    const url = new URL(`${API_URL}/redeemed-rewards`);
    url.searchParams.append('userId', `${userId}`);
    const jsonData: [] = await fetch(url)
        .then(result => result.json())
        .catch(() => []);
    const redeededRewards: RedeemedReward[] = jsonData.map(json => {
        const redeemedReward: RedeemedReward = {
            code: json['code'],
            description: json['description'],
        };
        return redeemedReward;
    });
    return redeededRewards;
}

/**
 * @description Restituisce i punti dell'utente, che corrispondono
 * al numero di attività convalidate meno il numero di premi riscattati.
 * Sono necessari per riscattare i premi.
 */
export async function loadUserPoints(userId: number): Promise<number> {
    const url = new URL(`${API_URL}/user-points`);
    url.searchParams.append('userId', `${userId}`);
    const result = await fetch(url)
        .then(result => result.json())
        .catch(() => null);
    const userPoints: number = result?.points;
    return userPoints;
}

/**
 * @description Permette di riscattare il premio scelto dall'utente.
 * Viene generato un codice e scalato un punto.
 */
export async function redeemReward(rewardId: number, userId: number): Promise<RedeemedReward | null> {
    const redeemedReward = await fetch(`${API_URL}/redeem-reward`, {
            method: 'POST',
            body: JSON.stringify({
                "rewardId": rewardId,
                "userId": userId,
            }),
        })
        .then(result => result.json())
        .then(json => {
            const _redeemedReward: RedeemedReward = {
                code: json['code'],
                description: '',
            };
            return _redeemedReward;
        })
        .catch(() => null);
    return redeemedReward;
}