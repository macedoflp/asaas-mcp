export type BillingType = "BOLETO" | "CREDIT_CARD" | "PIX" | "UNDEFINED";

export type PaymentStatus =
  | "PENDING"
  | "RECEIVED"
  | "CONFIRMED"
  | "OVERDUE"
  | "REFUNDED"
  | "RECEIVED_IN_CASH"
  | "REFUND_REQUESTED"
  | "REFUND_IN_PROGRESS"
  | "CHARGEBACK_REQUESTED"
  | "CHARGEBACK_DISPUTE"
  | "AWAITING_CHARGEBACK_REVERSAL"
  | "DUNNING_REQUESTED"
  | "DUNNING_RECEIVED"
  | "AWAITING_RISK_ANALYSIS";

export type SubscriptionCycle =
  | "WEEKLY"
  | "BIWEEKLY"
  | "MONTHLY"
  | "BIMONTHLY"
  | "QUARTERLY"
  | "SEMIANNUALLY"
  | "YEARLY";

export interface AsaasSplitItem {
  walletId: string;
  fixedValue?: number;
  percentualValue?: number;
  totalFixedValue?: number;
  description?: string;
}

export interface AsaasDiscount {
  value: number;
  dueDateLimitDays?: number;
  type?: "FIXED" | "PERCENTAGE";
}

export interface AsaasInterest {
  value: number;
}

export interface AsaasFine {
  value: number;
  type?: "FIXED" | "PERCENTAGE";
}

export interface AsaasPayment {
  id: string;
  dateCreated: string;
  customer: string;
  paymentLink?: string;
  value: number;
  netValue?: number;
  billingType: BillingType;
  status: PaymentStatus;
  dueDate: string;
  originalDueDate?: string;
  paymentDate?: string;
  clientPaymentDate?: string;
  installmentNumber?: number;
  invoiceUrl?: string;
  bankSlipUrl?: string;
  transactionReceiptUrl?: string;
  description?: string;
  externalReference?: string;
  split?: AsaasSplitItem[];
}

export interface AsaasCustomer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  mobilePhone?: string;
  cpfCnpj: string;
  postalCode?: string;
  address?: string;
  addressNumber?: string;
  complement?: string;
  province?: string;
  externalReference?: string;
  notificationDisabled?: boolean;
}

export interface AsaasPixQrCode {
  encodedImage: string;
  payload: string;
  expirationDate: string;
}

export interface AsaasSubscription {
  id: string;
  customer: string;
  billingType: BillingType;
  value: number;
  nextDueDate: string;
  cycle: SubscriptionCycle;
  description?: string;
  status: "ACTIVE" | "INACTIVE" | "EXPIRED";
  split?: AsaasSplitItem[];
}
