import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";
import { AuditEventType } from "../enums/audit-event.enum";

@Entity()
export class Audit {
    @PrimaryGeneratedColumn()
    auditId: number;

    @Column({ nullable: true })
    userId?: number;

    @Column({ type: "varchar" , length: 250 , default: AuditEventType.DEFAULT , nullable: true})
    auditEventType: AuditEventType;

    @Column({ type: "jsonb" , nullable: false})
    auditData: {
        before?: Record<string, any> | null;
        after?: Record<string, any> | null;
        payload?: Record<string, any> | null;
        metadata: Record<string, any>;
    };

    @Column({ type: "timestamp" , nullable: false})
    auditDate: Date;

    @CreateDateColumn()
    createdAt: Date;
}