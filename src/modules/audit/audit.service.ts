import { Injectable, Logger } from "@nestjs/common";
import { AuditRepository } from "./audit.repository";
import { Audit } from "./entities/audit.entity";

@Injectable()

export class AuditService {
    constructor(private readonly auditRepository: AuditRepository) { }
    private readonly logger = new Logger(AuditService.name);

    async createAudit(data: Partial<Audit>): Promise<Audit> {
        try {
            const audit = await this.auditRepository.createAudit(data);
            this.logger.log('create audit successfully : ', data.auditEventType);
            return audit;
        } catch (error) {
            console.log('error in create audit : ', error);
            this.logger.error('create audit failed : ', error);
            throw error;
        }
    }

} 