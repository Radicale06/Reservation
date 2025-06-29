export declare enum PaymentGateway {
    KONNECT = "konnect",
    FLOUCI = "flouci"
}
export declare class InitPaymentDto {
    reservationId: number;
    amount: number;
    gateway: PaymentGateway;
    successUrl: string;
    failUrl: string;
}
export declare class PaymentCallbackDto {
    paymentId: string;
    status: string;
    reservationId: number;
}
