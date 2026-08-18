export interface PrizePool {
  id: string;
  hackathonId: string;
  currency: "ETB" | "USD";
  firstPlaceAmount: number;
  firstPlacePerks?: string;
  firstPlaceBadge?: string;
  secondPlaceAmount: number;
  secondPlacePerks?: string;
  secondPlaceBadge?: string;
  thirdPlaceAmount: number;
  thirdPlacePerks?: string;
  thirdPlaceBadge?: string;
  payoutTerms?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentMethodConfig {
  id: string;
  hackathonId: string;
  providerType: "BANK_TRANSFER" | "MOBILE_MONEY" | "CRYPTO";
  providerName: string; // e.g., "Commercial Bank of Ethiopia", "Telebirr", "Chapa"
  accountName?: string;
  accountNumber?: string;
  walletAddress?: string;
  isActive: boolean;
}

const PRIZE_STORAGE_KEY = "hodana_prize_pools_v1";
const PAYMENT_STORAGE_KEY = "hodana_payment_methods_v1";

const INITIAL_PRIZE_POOLS: Record<string, PrizePool> = {
  "hck-agritech": {
    id: "prz-agritech",
    hackathonId: "hck-agritech",
    currency: "ETB",
    firstPlaceAmount: 1000000,
    firstPlacePerks: "Incubation at AAU Tech Hub + AWS Cloud Credits $10k",
    firstPlaceBadge: "Golden Harvester Trophy 🏆",
    secondPlaceAmount: 500000,
    secondPlacePerks: "Direct Mentorship with Ministry of Agriculture CTO",
    secondPlaceBadge: "Silver Seed Award 🥈",
    thirdPlaceAmount: 250000,
    thirdPlacePerks: "6 Months Free Co-Working Space Access",
    thirdPlaceBadge: "Bronze Sprout Badge 🥉",
    payoutTerms: "Disbursement completed within 14 business days following final judging verification. Winners must submit valid government ID and tax declaration form.",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  "hck-fintech": {
    id: "prz-fintech",
    hackathonId: "hck-fintech",
    currency: "USD",
    firstPlaceAmount: 15000,
    firstPlacePerks: "Fast-track consideration for National Bank FinTech Sandbox + $20k Grant",
    firstPlaceBadge: "FinTech Pioneer Trophy 🏆",
    secondPlaceAmount: 8000,
    secondPlacePerks: "Chapa Payment Gateway Fee Waiver for 1 Year",
    secondPlaceBadge: "Digital Wallet Innovation Award 🥈",
    thirdPlaceAmount: 4000,
    thirdPlacePerks: "Technical Audit & Security Review by CyberShield",
    thirdPlaceBadge: "Financial Inclusion Badge 🥉",
    payoutTerms: "USD payouts subject to currency regulation guidelines or direct wire to business bank accounts.",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
};

const INITIAL_PAYMENT_METHODS: Record<string, PaymentMethodConfig[]> = {
  "hck-agritech": [
    {
      id: "pm-1",
      hackathonId: "hck-agritech",
      providerType: "BANK_TRANSFER",
      providerName: "Commercial Bank of Ethiopia (CBE)",
      accountName: "Ethiopia Innovation Hub Org",
      accountNumber: "1000293848123",
      isActive: true,
    },
    {
      id: "pm-2",
      hackathonId: "hck-agritech",
      providerType: "MOBILE_MONEY",
      providerName: "Telebirr SuperApp",
      accountName: "EthioInnovate Disbursement",
      accountNumber: "+251911223344",
      isActive: true,
    },
    {
      id: "pm-3",
      hackathonId: "hck-agritech",
      providerType: "MOBILE_MONEY",
      providerName: "Chapa Gateway",
      accountName: "Chapa Merchant Portal",
      accountNumber: "CHAPA-ORG-9981",
      isActive: true,
    },
    {
      id: "pm-3b",
      hackathonId: "hck-agritech",
      providerType: "MOBILE_MONEY",
      providerName: "Cheche Pay (Kacha)",
      accountName: "Cheche Merchant ID",
      accountNumber: "CHECHE-AGRI-8821",
      isActive: true,
    },
  ],
  "hck-fintech": [
    {
      id: "pm-4",
      hackathonId: "hck-fintech",
      providerType: "BANK_TRANSFER",
      providerName: "Dashen Bank Wire",
      accountName: "FinTech Frontier Ltd",
      accountNumber: "DASH-55443322",
      isActive: true,
    },
    {
      id: "pm-5",
      hackathonId: "hck-fintech",
      providerType: "MOBILE_MONEY",
      providerName: "Chapa Payment Gateway",
      accountName: "FinTech Chapa Direct",
      accountNumber: "CHAPA-FT-4412",
      isActive: true,
    },
    {
      id: "pm-6",
      hackathonId: "hck-fintech",
      providerType: "MOBILE_MONEY",
      providerName: "Cheche Pay",
      accountName: "Cheche Digital Wallet",
      accountNumber: "+251911998877",
      isActive: true,
    },
  ],
};

function getStoredPrizes(): Record<string, PrizePool> {
  if (typeof window === "undefined") return INITIAL_PRIZE_POOLS;
  try {
    const raw = localStorage.getItem(PRIZE_STORAGE_KEY);
    return raw ? JSON.parse(raw) : INITIAL_PRIZE_POOLS;
  } catch {
    return INITIAL_PRIZE_POOLS;
  }
}

function getStoredPayments(): Record<string, PaymentMethodConfig[]> {
  if (typeof window === "undefined") return INITIAL_PAYMENT_METHODS;
  try {
    const raw = localStorage.getItem(PAYMENT_STORAGE_KEY);
    return raw ? JSON.parse(raw) : INITIAL_PAYMENT_METHODS;
  } catch {
    return INITIAL_PAYMENT_METHODS;
  }
}

export const prizesClient = {
  // GET /api/organizer/hackathons/:id/prizes or public GET /api/hackathons/:id/prizes
  async getPrizeDetails(hackathonId: string): Promise<{
    prizePool: PrizePool;
    paymentMethods: PaymentMethodConfig[];
  }> {
    const prizes = getStoredPrizes();
    const payments = getStoredPayments();

    const fallbackPrize: PrizePool = {
      id: `prz-${hackathonId}`,
      hackathonId,
      currency: "ETB",
      firstPlaceAmount: 500000,
      firstPlacePerks: "Incubation support and trophy badge",
      firstPlaceBadge: "1st Place Winner Trophy 🏆",
      secondPlaceAmount: 250000,
      secondPlacePerks: "Mentorship and certificate",
      secondPlaceBadge: "2nd Place Runner-Up Badge 🥈",
      thirdPlaceAmount: 100000,
      thirdPlacePerks: "Co-working membership",
      thirdPlaceBadge: "3rd Place Runner-Up Badge 🥉",
      payoutTerms: "Standard payout terms apply upon judging completion.",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const prizePool = prizes[hackathonId] || fallbackPrize;
    const paymentMethods = payments[hackathonId] || [
      {
        id: `pm-default-1`,
        hackathonId,
        providerType: "BANK_TRANSFER",
        providerName: "Commercial Bank of Ethiopia",
        accountName: "HODANA Organizers",
        accountNumber: "1000000000",
        isActive: true,
      },
      {
        id: `pm-default-2`,
        hackathonId,
        providerType: "MOBILE_MONEY",
        providerName: "Telebirr",
        accountName: "Ethio Telecom Mobile Money",
        accountNumber: "+251900000000",
        isActive: true,
      },
    ];

    return { prizePool, paymentMethods };
  },

  // POST /api/organizer/hackathons/:id/prizes
  async savePrizeDetails(
    hackathonId: string,
    prizePoolData: Partial<PrizePool>,
    paymentMethodsData: PaymentMethodConfig[]
  ): Promise<{ success: boolean; prizePool: PrizePool }> {
    const prizes = getStoredPrizes();
    const payments = getStoredPayments();

    const existingPrize = prizes[hackathonId] || {
      id: `prz-${hackathonId}`,
      hackathonId,
      currency: "ETB",
      firstPlaceAmount: 0,
      secondPlaceAmount: 0,
      thirdPlaceAmount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updatedPrizePool: PrizePool = {
      ...existingPrize,
      ...prizePoolData,
      updatedAt: new Date().toISOString(),
    };

    prizes[hackathonId] = updatedPrizePool;
    payments[hackathonId] = paymentMethodsData;

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(PRIZE_STORAGE_KEY, JSON.stringify(prizes));
        localStorage.setItem(PAYMENT_STORAGE_KEY, JSON.stringify(payments));
      } catch (err) {
        console.error("Failed to persist prizes:", err);
      }
    }

    return { success: true, prizePool: updatedPrizePool };
  },
};
