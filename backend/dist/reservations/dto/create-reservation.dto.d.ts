export declare class CreateReservationDto {
    PlayerFullName: string;
    PlayerPhone: string;
    PlayerEmail?: string;
    NumberOfPlayers: number;
    StadiumType: string;
    CourtId?: number;
    StartTime: string;
    EndTime?: string;
    Date: string;
    Price: number;
    Status: number;
    IsPaid?: boolean;
    CreatedBy: string;
}
