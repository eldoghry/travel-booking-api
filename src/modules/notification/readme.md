# Notification Module & Workers

## Overview

The Notification Module is responsible for handling notifications within the travel booking API. It utilizes event emitters to send notifications through various channels, such as email and SMS. The workers process these notifications asynchronously.

## Directory Structure

```
src/
├── modules/
│   └── notification/
│       ├── channels/
│       │   ├── email.service.ts
│       │   └── sms.service.ts
│       ├── dto/
│       │   └── send-notification.dto.ts
│       ├── enum/
│       │   └── notification-event.enum.ts
│       ├── notification.listener.ts
│       ├── notification.module.ts
│       └── notification.service.ts
└── workers/
    ├── email.worker.ts
    └── sms.worker.ts
```

## Sending Notifications

To send a notification, you can use the `NotificationListener` which emits jobs that are listened to by the workers.

### Example Usage

#### Using NotificationListener

1. **Import the Notification Service:**

   ```typescript
   import { NotificationListener } from './modules/notification/notification.listener';
   ```

2. **Send a Notification:**

   ```typescript
   const notificationListener = new NotificationListener();
   notificationListener.handleUserRegistered({
      ...
   });
   ```

#### Using Event Emitter

The Notification Module uses an event emitter to handle notifications. When a notification is sent, an event is emitted which is then processed by the corresponding worker.

##### Example of Event Emission

In `notification.service.ts`, you might have:

```typescript
import { EventEmitter2 } from '@nestjs/event-emitter';

eventEmitter = new EventEmitter2();
const payload = {};
eventEmitter.emit('NotificationEvent', payload);
```

##### NotificationEvent

you can find NotificationEvent example under `./modules/notification/enum/notification-event.enum.ts`

## Running the Workers

To run the workers, you can execute the following commands in your terminal:

1. **For Email Worker:**

   ```bash
   # running 3 instance
   pm2 start dist/workers/email.worker.js --name email-worker -i 3
   ```

2. **For SMS Worker:**

   ```bash
   # running 1 instance
   pm2 start dist/workers/sms.worker.js --name sms-worker -i 1
   ```

Make sure you have `pm2` installed globally or use it within your project.

## Conclusion

This README provides an overview of the Notification Module and Workers. By utilizing event emitters, the system can efficiently handle notifications through various channels. For further customization, feel free to modify the services and workers as per your requirements.
