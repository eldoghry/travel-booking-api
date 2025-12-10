import { BookingType } from "src/modules/transaction/enums/transaction.enum";

interface BookingAuditFields {
    
}

interface BookingAuditMeta {
    bookingType: BookingType;
    bookingId: number;
    operation: "create" | "update" | "updateStatus" | "cancel" | "delete";
    operationDate: Date;
}

type BookingKeys = keyof BookingAuditFields;


export interface BookingAuditData<T extends BookingKeys> {
  before: Partial<Pick<BookingAuditFields, T>> | null; // null for create
  after: Pick<BookingAuditFields, T>;
  metadata: BookingAuditMeta;
} 