import { BeefyResponse, BeefyVault } from './schemas';

// API endpoints for Beefy Finance
const BEEFY_API = {
  VAULTS: 'https://api.beefy.finance/vaults',
  APY: 'https://api.beefy.finance/apy',
  APY_BREAKDOWN: 'https://api.beefy.finance/apy/breakdown',
  TVL: 'https://api.beefy.finance/tvl',
  LP_BREAKDOWN: 'https://api.beefy.finance/lps/breakdown'
} as const;

/**
 * Transforms and validates vault data
 */
function transformVaultData(
  vaults: Record<string, any>,
  apys: Record<string, number>,
  apyBreakdowns: Record<string, any>,
  tvls: Record<string, { [key: string]: number }>,
  lpBreakdowns: Record<string, {
    price: number;
    tokens: string[];
    balances: string[];
    totalSupply: string;
  }>,
): BeefyVault[] {
  // Flatten TVL data from all chains
  const flatTvls = Object.values(tvls).reduce((acc, chainTvls) => ({
    ...acc,
    ...chainTvls
  }), {});

  return Object.values(vaults)
    .filter(vault => vault.status === 'active')
    .map(vault => {
      const breakdown = apyBreakdowns[vault.id];
      const apy = breakdown?.totalApy || apys[vault.id] || 0;
      const tvl = flatTvls[vault.id] || 0;
      
      return {
        name: vault.name,
        description: `Yield optimization for ${vault.name}`,
        apy: apy * 100,
        tvl: tvl,
        platform: vault.platformId,
        chain: vault.network || vault.chain,
        assets: vault.assets,
        risks: vault.risks,
        addLiquidityUrl: `https://app.beefy.com/vault/${vault.id}`,
        lastHarvest: vault.lastHarvest,
        lpBreakdown: lpBreakdowns[vault.id],
        safetyScore: calculateSafetyScore(vault.risks || [])
      };
    })
    .filter(vault => 
      vault.apy > 0 && 
      vault.apy < 1000 && // Reasonable APY filter
      vault.tvl > 10000   // Minimum TVL filter
    )
    .sort((a, b) => b.tvl - a.tvl) // Sort by TVL
    .slice(0, 100);      // Return top 100 vaults
}

/**
 * Calculates a normalized safety score (0-100) for a vault based on its risk factors.
 * Higher scores indicate lower risk. The scoring system considers:
 * 
 * High Impact Factors (+15-20 points):
 * - AUDIT: Smart contract has been audited (+20)
 * - CONTRACTS_VERIFIED: Code is verified on blockchain explorer (+15)
 * - BATTLE_TESTED: Protocol has proven track record (+15)
 * - IL_NONE: No impermanent loss risk (+15)
 * 
 * Medium Impact Factors (+10 points):
 * - COMPLEXITY_LOW: Simple, straightforward strategy
 * - MCAP_LARGE: Large market cap tokens
 * - PLATFORM_ESTABLISHED: Well-established platform
 * - IL_LOW: Low impermanent loss risk
 * 
 * Low/Negative Impact (-5 to +5 points):
 * - MCAP_MEDIUM: Medium market cap (+5)
 * - MCAP_SMALL: Small market cap (0)
 * - MCAP_MICRO: Micro market cap (-5)
 * - IL_HIGH: High impermanent loss risk (-5)
 * 
 * Raw scores range from -10 to 95, normalized to 0-100
 * 
 * @param risks - Array of risk factors from the vault
 * @returns number - Normalized safety score between 0 and 100
 */
function calculateSafetyScore(risks: string[] = []): number {
  const scores: Record<string, number> = {
    'AUDIT': 20,
    'CONTRACTS_VERIFIED': 15,
    'BATTLE_TESTED': 15,
    'COMPLEXITY_LOW': 10,
    'MCAP_LARGE': 10,
    'PLATFORM_ESTABLISHED': 10,
    'IL_LOW': 10,
    'IL_NONE': 15,
    'MCAP_MEDIUM': 5,
    'MCAP_SMALL': 0,
    'MCAP_MICRO': -5,
    'IL_HIGH': -5,
  };

  const rawScore = risks.reduce((total, risk) => total + (scores[risk] || 0), 0);
  
  // Normalize from -10...95 to 0...100
  return Math.max(0, Math.min(100, ((rawScore + 10) * 100) / 105));
}

/**
 * Fetches and returns the top yield opportunities from Beefy Finance
 * @returns Promise with vault data and timestamp
 * @throws Error if API requests fail
 */
export async function getTopBeefyVaults(): Promise<BeefyResponse> {
  try {
    const [vaults, apys, apyBreakdowns, tvls, lpBreakdowns] = await Promise.all([
      fetch(BEEFY_API.VAULTS).then(r => r.json()),
      fetch(BEEFY_API.APY).then(r => r.json()),
      fetch(BEEFY_API.APY_BREAKDOWN).then(r => r.json()),
      fetch(BEEFY_API.TVL).then(r => r.json()),
      fetch(BEEFY_API.LP_BREAKDOWN).then(r => r.json())
    ]);

    const transformedVaults = transformVaultData(vaults, apys, apyBreakdowns, tvls, lpBreakdowns);
    
    // Convert timestamp to human-readable date
    const currentDate = new Date().toISOString();
    
    return {
      vaults: transformedVaults,
      timestamp: currentDate
    };
  } catch (error: unknown) {
    console.error('Error fetching Beefy data:', error);
    throw new Error(`Failed to fetch Beefy data: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
