import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { RedisService } from 'src/common/redis/redis.service';
import { TransactionService } from 'src/modules/transaction/transaction.service';
import { AuditPublisher } from 'src/modules/audit/audit.publisher';
import { of } from 'rxjs';
import { BadRequestException } from '@nestjs/common';
import { PayPalService } from '../../services/paypal.service';

const mockHttpService = { post: jest.fn() }
const mockRedisService = {
    get: jest.fn(),
    set: jest.fn()
}
const mockTransactionService = {
    getOneTransactionOrFailBy: jest.fn(),
    addTransactionDetail: jest.fn(),
    updateTransaction: jest.fn(),
}
const mockAuditPublisher = {
    publishAudit: jest.fn()
}

describe('PayPalService', () => {
    let service: PayPalService;
    let httpService: HttpService;
    let redisService: RedisService;
    let transactionService: TransactionService;
    let auditPublisher: AuditPublisher;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PayPalService,
                { provide: HttpService, useValue: mockHttpService },
                { provide: RedisService, useValue: mockRedisService },
                {
                    provide: TransactionService,
                    useValue: mockTransactionService,
                },
                { provide: AuditPublisher, useValue: mockAuditPublisher },
            ],
        }).compile();

        service = module.get(PayPalService);
        httpService = module.get(HttpService);
        redisService = module.get(RedisService);
        transactionService = module.get(TransactionService);
        auditPublisher = module.get(AuditPublisher);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should call auditPublisher.publishAudit in handleAuditPayment', async () => {
        const data = { auditData: { payload: {}, metadata: { provider: 'paypal' } } };
        await service.handleAuditPayment(data as any);
        expect(auditPublisher.publishAudit).toHaveBeenCalledWith(data);
    });

    describe('getAccessToken', () => {
        it('should return cached token if exists', async () => {
            (redisService.get as jest.Mock).mockResolvedValue('cached-token');
            const token = await (service as any).getAccessToken();
            expect(token).toBe('cached-token');
        });

        it('should fetch token from PayPal if not cached', async () => {
            (redisService.get as jest.Mock).mockResolvedValue(null);
            (httpService.post as jest.Mock).mockReturnValueOnce(
                of({ data: { access_token: 'token123', expires_in: 3600 } }),
            );

            const token = await (service as any).getAccessToken();
            expect(token).toBe('token123');
            expect(redisService.set).toHaveBeenCalledWith('paypal_access_token', 'token123', 3600);
        });
    });

    it('should create order successfully', async () => {
        (service as any).getAccessToken = jest.fn().mockResolvedValue('token');
        (httpService.post as jest.Mock).mockReturnValueOnce(of({ data: { id: 'order123' } }));

        const result = await service.createOrder(100, 'USD');
        expect(result).toEqual({ id: 'order123' });
    });

    it('should capture order', async () => {
        (service as any).getAccessToken = jest.fn().mockResolvedValue('token');
        (httpService.post as jest.Mock).mockReturnValueOnce(of({ data: { id: 'capture123' } }));

        const result = await (service as any).captureOrder('order123');
        expect(result).toEqual({ id: 'capture123' });
    });

    it('should verify webhook signature success', async () => {
        (service as any).getAccessToken = jest.fn().mockResolvedValue('token');
        (httpService.post as jest.Mock).mockReturnValueOnce(of({ data: { verification_status: 'SUCCESS' } }));

        const req: any = { headers: {}, body: {} };
        const result = await service.verifyWebhookSignature(req);
        expect(result).toBe(true);
    });

    it('should throw error if webhook signature invalid', async () => {
        (service as any).getAccessToken = jest.fn().mockResolvedValue('token');
        (httpService.post as jest.Mock).mockReturnValueOnce(of({ data: { verification_status: 'FAIL' } }));

        const req: any = { headers: {}, body: {} };
        await expect(service.verifyWebhookSignature(req)).rejects.toThrow('Invalid PayPal webhook signature');
    });

    it('should handle approval payment', async () => {
        (transactionService.getOneTransactionOrFailBy as jest.Mock).mockResolvedValue({ transactionId: 'tx123' });

        await service.handleApprovalPayment('order123');
        expect(transactionService.addTransactionDetail).toHaveBeenCalled();
        expect(transactionService.updateTransaction).toHaveBeenCalledWith('tx123', { status: 'APPROVED' });
    });

    it('should handle capture payment successfully', async () => {
        const transaction = { transactionId: 'tx123' };
        (transactionService.getOneTransactionOrFailBy as jest.Mock).mockResolvedValue(transaction);
        (service as any).captureOrder = jest.fn().mockResolvedValue({
            purchase_units: [{ reference_id: 'ref123', payments: { captures: [{ id: 'cap123' }] } }],
        });

        const result = await service.handleCapturePayment({ orderId: 'order123' });
        expect(result.purchase_units[0].reference_id).toBe('ref123');
        expect(transactionService.updateTransaction).toHaveBeenCalledWith('tx123', expect.objectContaining({ status: 'CAPTURED' }));
    });

    it('should handle capture payment failure', async () => {
        const transaction = { transactionId: 'tx123' };
        (transactionService.getOneTransactionOrFailBy as jest.Mock).mockResolvedValue(transaction);
        (service as any).captureOrder = jest.fn().mockRejectedValue(new Error('PayPal error'));

        await expect(service.handleCapturePayment({ orderId: 'order123' })).rejects.toThrow(BadRequestException);
        expect(transactionService.updateTransaction).toHaveBeenCalledWith('tx123', expect.objectContaining({ status: 'FAILED' }));
    });

    it('should handle payment completed', async () => {
        const transaction = { transactionId: 'tx123' };
        (transactionService.getOneTransactionOrFailBy as jest.Mock).mockResolvedValue(transaction);

        await service.handlePaymentCompleted({
            supplementary_data: { related_ids: { order_id: 'order123' } },
        });
        expect(transactionService.addTransactionDetail).toHaveBeenCalledWith(expect.objectContaining({ action: 'webhook_payment_completed' }));
        expect(transactionService.updateTransaction).toHaveBeenCalledWith('tx123', { status: 'COMPLETED' });
    });

    it('should handle payment failed', async () => {
        const transaction = { transactionId: 'tx123' };
        (transactionService.getOneTransactionOrFailBy as jest.Mock).mockResolvedValue(transaction);

        await service.handlePaymentFailed({
            supplementary_data: { related_ids: { order_id: 'order123' } },
        });
        expect(transactionService.addTransactionDetail).toHaveBeenCalledWith(expect.objectContaining({ action: 'webhook_payment_failed' }));
        expect(transactionService.updateTransaction).toHaveBeenCalledWith('tx123', { status: 'FAILED' });
    });
});
