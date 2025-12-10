import { Injectable } from "@nestjs/common";
import { RabbitMQService } from "src/modules/rabbitmq/rabbitmq.service";
import { Audit } from "./entities/audit.entity";
import { RabbitMQQueue } from "src/modules/rabbitmq/rabbitmq.enum";
import { RequestContext } from "src/contexts/request-context";

@Injectable()
export class AuditPublisher {
    constructor(private readonly rabbitMQService: RabbitMQService) { }

    private async formateAuditMessage(message: Partial<Audit>) {
        const userId = RequestContext.getUserId();
        const ip = RequestContext.getIp();
        const userAgent = RequestContext.getUserAgent();
        const requestId = RequestContext.getRequestId() || null;
        const auditData = {
            ...message.auditData,
            metadata: {
                ...message.auditData!.metadata,
                ip,
                userAgent,
                requestId
            }
        };
        message.userId = userId || undefined;
        message.auditData = auditData;
        return message;
    }

    async publishAudit(data: Partial<Audit>) {
        const formatedMessage = await this.formateAuditMessage(data);
        await this.rabbitMQService.sendToQueue(RabbitMQQueue.AUDIT_QUEUE, formatedMessage);
    }
} 