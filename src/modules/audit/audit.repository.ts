import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Audit } from "./entities/audit.entity";

@Injectable()
export class AuditRepository {
    constructor(@InjectRepository(Audit) private readonly auditRepository: Repository<Audit>) { }

    async createAudit(data: Partial<Audit>): Promise<Audit> {
        const audit = this.auditRepository.create(data);
        return await this.auditRepository.save(audit);
    }

}