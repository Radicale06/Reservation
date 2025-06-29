export interface PaymentResponse {
    success: boolean;
    paymentUrl?: string;
    paymentId?: string;
    error?: string;
}
export interface PaymentGatewayInterface {
    initPayment(amount: number, reservationId: number, successUrl: string, failUrl: string): Promise<PaymentResponse>;
    verifyPayment(paymentId: string): Promise<{
        success: boolean;
        status: string;
    }>;
}
