export interface PlanDetails {
  name: string;
  priceUsd: number;
  priceMad: number;
  dmsLimit: number;
  maxAccounts: number;
}

export const PLANS: { [key: string]: PlanDetails } = {
  FREE: { name: "Free Starter", priceUsd: 0, priceMad: 0, dmsLimit: 150, maxAccounts: 1 },
  PRO: { name: "Creator Pro", priceUsd: 5, priceMad: 50, dmsLimit: 3000, maxAccounts: 1 },
  BUSINESS: { name: "Business / Agency", priceUsd: 15, priceMad: 150, dmsLimit: 15000, maxAccounts: 3 }
};
