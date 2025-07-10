import { CourtService } from './court.service';
import { CreateCourtDto } from './dto/create-court.dto';
import { UpdateCourtDto } from './dto/update-court.dto';
export declare class CourtController {
    private readonly courtService;
    constructor(courtService: CourtService);
    findAll(): Promise<import("./entities/court.entity").Court[]>;
    findActive(): Promise<import("./entities/court.entity").Court[]>;
    findOne(id: string): Promise<import("./entities/court.entity").Court | null>;
    create(court: CreateCourtDto): Promise<import("./entities/court.entity").Court>;
    update(id: string, court: UpdateCourtDto): Promise<import("./entities/court.entity").Court | null>;
    toggleActive(id: string): Promise<import("./entities/court.entity").Court | null>;
    debug(): Promise<{
        totalCourts: number;
        courts: {
            id: number;
            name: string;
            type: string;
            stadiumType: string;
            sportType: string;
            isActive: boolean;
        }[];
    }>;
}
