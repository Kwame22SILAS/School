
import { NotificationLog } from "../types";

/**
 * Cloud Mail Relay API (Simulated)
 * Interface for automated school communications.
 */
export const sendSecureEmail = async (
  recipient: string,
  subject: string,
  body: string,
  type: NotificationLog['type']
): Promise<Omit<NotificationLog, 'id' | 'timestamp'>> => {
  console.log(`[CLOUD-RELAY-API] Authenticating...`);
  console.log(`[CLOUD-RELAY-API] Dispatching payload to: ${recipient}`);

  // Artificial network latency for realistic feel
  await new Promise(resolve => setTimeout(resolve, 800));

  // High-availability simulation
  const isHealthy = Math.random() > 0.03;

  if (isHealthy) {
    return {
      recipientEmail: recipient,
      studentName: "Verified Ward",
      subject: subject,
      type: type,
      status: 'SENT'
    };
  } else {
    return {
      recipientEmail: recipient,
      studentName: "Verified Ward",
      subject: subject,
      type: type,
      status: 'FAILED'
    };
  }
};
