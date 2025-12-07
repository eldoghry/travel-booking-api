// audit.worker.ts
import { Injectable, OnModuleInit } from "@nestjs/common";
import { RabbitMQService } from "../rabbitmq/rabbitmq.service";
import { RabbitMQQueue } from "../rabbitmq/rabbitmq.enum";
import { ConsumeMessage } from "amqplib";
import { AuditService } from "./audit.service";

@Injectable()
export class AuditWorker implements OnModuleInit {
    constructor(
        private readonly rabbitService: RabbitMQService,
        private readonly auditService: AuditService
    ) { }

    async onModuleInit() {
        await this.rabbitService.consume(
            RabbitMQQueue.AUDIT_QUEUE,
            (msg) => this.processMessage(msg),
            10 // prefetch worker pool = 10 parallel
        );
    }

    private async processMessage(msg: ConsumeMessage) {
        try {
            const {userId, auditEventType, auditData  } = JSON.parse(msg.content.toString());

            // Save to DB
            await this.auditService.createAudit({
                userId: userId ?? null,
                auditEventType,
                auditData,
                auditDate: new Date(),
            });

            this.rabbitService.ack(msg);
        } catch (err) {
            console.error("Audit processing error:", err);
            this.rabbitService.nack(msg, false, false);
        }
    }
} 