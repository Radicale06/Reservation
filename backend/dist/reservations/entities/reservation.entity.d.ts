import { Court } from '../../court/entities/court.entity';
export declare class Reservation {
    Id: number;
    PlayerFullName: string;
    PlayerPhone: string;
    PlayerEmail: string;
    NumberOfPlayers: number;
    StadiumType: string;
    CourtId: number;
    court: Court;
    StartTime: string;
    EndTime: string;
    Date: Date;
    Price: number;
    Status: number;
    IsPaid: boolean;
    CreatedAt: Date;
    CreatedBy: string;
}
