import { z } from "zod";

const LPBreakdownSchema = z.object({
  price: z.number(),
  tokens: z.array(z.string()),
  balances: z.array(z.string()),
  totalSupply: z.string()
});

// Schema for individual vault data
export const BeefyVaultSchema = z.object({
  name: z.string(),
  description: z.string(),
  apy: z.number(),
  tvl: z.number(),
  platform: z.string(),
  chain: z.string(),
  assets: z.array(z.string()),
  risks: z.array(z.string()).optional(),
  addLiquidityUrl: z.string(),
  lastHarvest: z.number().optional(),
  lpBreakdown: LPBreakdownSchema.optional(),
  safetyScore: z.number().optional(),
});

// Type for vault data
export type BeefyVault = z.infer<typeof BeefyVaultSchema>;

// Response format for the API
export const BeefyResponseSchema = z.object({
  vaults: z.array(BeefyVaultSchema),
  timestamp: z.string()
});

export const ErrorResponseSchema = z.object({
  error: z.string(),
});

export type BeefyResponse = z.infer<typeof BeefyResponseSchema>;
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;

// Schema for transaction request
export const CreateTransactionSchema = z.object({
  vaultId: z.string(),
  amount: z.string(),
  userWallet: z.string()
});

// Schema for transaction response
export const TransactionResponseSchema = z.object({
  receiverId: z.string(),
  actions: z.array(
    z.object({
      type: z.literal("FunctionCall"),
      params: z.object({
        methodName: z.string(),
        args: z.object({
          vaultId: z.string(),
          amount: z.string()
        }),
        gas: z.string(),
        deposit: z.string()
      })
    })
  ),
  meta: z.object({
    instructions: z.string(),
    userWallet: z.string()
  })
});

export type CreateTransaction = z.infer<typeof CreateTransactionSchema>;
export type TransactionResponse = z.infer<typeof TransactionResponseSchema>;
