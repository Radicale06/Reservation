import { CourtService } from './court.service';
export declare class CourtController {
    private readonly courtService;
    constructor(courtService: CourtService);
    findAll(): Promise<import("./entities/court.entity").Court[]>;
    findActive(): Promise<import("./entities/court.entity").Court[]>;
    findOne(id: string): Promise<import("./entities/court.entity").Court | null>;
    create(court: any): Promise<import("./entities/court.entity").Court>;
    update(id: string, court: any): Promise<import("./entities/court.entity").Court | null>;
    toggleActive(id: string): Promise<import("./entities/court.entity").Court | null>;
}
