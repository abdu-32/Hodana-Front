import {
  getHackathon,
  updateHackathon,
} from "@/features/hackathons/lib/hackathons-client";

export interface PrizePool {
  id: string;
  hackathonId: string;
  currency: "ETB" | "USD";
  totalPrizeBudget?: number;
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
    totalPrizeBudget: 1750000,
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
    totalPrizeBudget: 27000,
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
  // GET prize details for a specific hackathon
  async getPrizeDetails(hackathonId: string): Promise<{
    prizePool: PrizePool;
    paymentMethods: PaymentMethodConfig[];
  }> {
    const prizes = getStoredPrizes();
    const payments = getStoredPayments();

    let hackathonData = null;
    try {
      hackathonData = await getHackathon(hackathonId);
    } catch (err) {
      console.warn("Failed to load hackathon for prize details:", err);
    }

    const fallbackPrize: PrizePool = {
      id: `prz-${hackathonId}`,
      hackathonId,
      currency: "ETB",
      totalPrizeBudget: hackathonData?.totalPrizeBudget ? Number(hackathonData.totalPrizeBudget) : 0,
      firstPlaceAmount: 0,
      firstPlacePerks: "Incubation support and trophy badge",
      firstPlaceBadge: "1st Place Winner Trophy 🏆",
      secondPlaceAmount: 0,
      secondPlacePerks: "Mentorship and certificate",
      secondPlaceBadge: "2nd Place Runner-Up Badge 🥈",
      thirdPlaceAmount: 0,
      thirdPlacePerks: "Co-working membership",
      thirdPlaceBadge: "3rd Place Runner-Up Badge 🥉",
      payoutTerms: "Standard payout terms apply upon judging completion.",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    let prizePool = prizes[hackathonId] || fallbackPrize;

    // If hackathon object has server-side prize_distribution or total_prize_budget, use it
    if (hackathonData) {
      const serverBudget = hackathonData.totalPrizeBudget ? Number(hackathonData.totalPrizeBudget) : undefined;
      const serverDist = (hackathonData.prizeDistribution || {}) as any;

      prizePool = {
        ...prizePool,
        totalPrizeBudget: serverBudget !== undefined ? serverBudget : prizePool.totalPrizeBudget,
        currency: serverDist.currency || prizePool.currency || "ETB",
        firstPlaceAmount: serverDist.firstPlaceAmount !== undefined ? Number(serverDist.firstPlaceAmount) : prizePool.firstPlaceAmount,
        firstPlacePerks: serverDist.firstPlacePerks !== undefined ? serverDist.firstPlacePerks : prizePool.firstPlacePerks,
        firstPlaceBadge: serverDist.firstPlaceBadge !== undefined ? serverDist.firstPlaceBadge : prizePool.firstPlaceBadge,
        secondPlaceAmount: serverDist.secondPlaceAmount !== undefined ? Number(serverDist.secondPlaceAmount) : prizePool.secondPlaceAmount,
        secondPlacePerks: serverDist.secondPlacePerks !== undefined ? serverDist.secondPlacePerks : prizePool.secondPlacePerks,
        secondPlaceBadge: serverDist.secondPlaceBadge !== undefined ? serverDist.secondPlaceBadge : prizePool.secondPlaceBadge,
        thirdPlaceAmount: serverDist.thirdPlaceAmount !== undefined ? Number(serverDist.thirdPlaceAmount) : prizePool.thirdPlaceAmount,
        thirdPlacePerks: serverDist.thirdPlacePerks !== undefined ? serverDist.thirdPlacePerks : prizePool.thirdPlacePerks,
        thirdPlaceBadge: serverDist.thirdPlaceBadge !== undefined ? serverDist.thirdPlaceBadge : prizePool.thirdPlaceBadge,
        payoutTerms: serverDist.payoutTerms !== undefined ? serverDist.payoutTerms : prizePool.payoutTerms,
      };
    }

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

  // POST / update prize details for a specific hackathon
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
      totalPrizeBudget: 0,
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

    // Persist to backend database via updateHackathon
    try {
      await updateHackathon(hackathonId, {
        totalPrizeBudget: updatedPrizePool.totalPrizeBudget ?? 0,
        prizeDistribution: {
          currency: updatedPrizePool.currency,
          firstPlaceAmount: updatedPrizePool.firstPlaceAmount,
          firstPlacePerks: updatedPrizePool.firstPlacePerks,
          firstPlaceBadge: updatedPrizePool.firstPlaceBadge,
          secondPlaceAmount: updatedPrizePool.secondPlaceAmount,
          secondPlacePerks: updatedPrizePool.secondPlacePerks,
          secondPlaceBadge: updatedPrizePool.secondPlaceBadge,
          thirdPlaceAmount: updatedPrizePool.thirdPlaceAmount,
          thirdPlacePerks: updatedPrizePool.thirdPlacePerks,
          thirdPlaceBadge: updatedPrizePool.thirdPlaceBadge,
          payoutTerms: updatedPrizePool.payoutTerms,
        },
      });
    } catch (err) {
      console.warn("Failed saving prize pool to hackathon backend:", err);
    }

    return { success: true, prizePool: updatedPrizePool };
  },
};
