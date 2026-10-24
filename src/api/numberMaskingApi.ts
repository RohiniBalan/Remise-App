import { gatewayClient } from './client';

export interface MaskedCallResponse {
  success: boolean;
  message?: string;
  data?: {
    callSid: string;
    status: string;
    relationship?: string;
  };
}

export interface MaskedCallStatusResponse {
  success: boolean;
  data?: {
    callSid: string;
    status: string;
    durationSec?: number;
    startedAt?: string;
    endedAt?: string;
  };
}

export const numberMaskingApi = {
  /**
   * Initiates a privacy-preserving Edesy masked call for an order.
   * Phone numbers are resolved authoritatively on the backend.
   */
  initiateCall: (orderId: string, relationship?: string) =>
    gatewayClient.post<MaskedCallResponse>('/api/orders/number-masking/calls', {
      orderId,
      relationship,
    }),

  /**
   * Fetches the current lifecycle status of an initiated masked call.
   */
  getCallStatus: (callSid: string) =>
    gatewayClient.get<MaskedCallStatusResponse>(`/api/orders/number-masking/calls/${encodeURIComponent(callSid)}/status`),
};
