import { Repository } from 'typeorm';
import { Court } from './entities/court.entity';
export declare class CourtService {
    private courtRepository;
    constructor(courtRepository: Repository<Court>);
    findAll(): Promise<Court[]>;
    findActive(): Promise<Court[]>;
    findOne(id: number): Promise<Court | null>;
    create(court: Partial<Court>): Promise<Court>;
    update(id: number, court: Partial<Court>): Promise<Court | null>;
    toggleActive(id: number): Promise<Court | null>;
}
