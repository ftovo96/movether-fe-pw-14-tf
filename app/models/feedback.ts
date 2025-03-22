export interface Feedback {
    companyId: number,
    companyName: string,
    id: number,
    message: string | null,
    score: number,
    timestamp: number,
    userName: string | null,
}