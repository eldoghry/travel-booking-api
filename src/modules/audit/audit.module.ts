import { TypeOrmModule } from "@nestjs/typeorm";
import { Audit } from "./entities/audit.entity";
import { Module } from "@nestjs/common";
import { AuditService } from "./audit.service";
import { AuditPublisher } from "./audit.publisher";
import { AuditWorker } from "./audit.worker";
import { RabbitMQModule } from "src/modules/rabbitmq/rabbitmq.module";
import { AuditRepository } from "./audit.repository";

@Module({
    imports: [TypeOrmModule.forFeature([Audit]), RabbitMQModule],
    providers: [AuditService, AuditPublisher, AuditWorker , AuditRepository],
    exports: [AuditPublisher]
})
export class AuditModule { }  