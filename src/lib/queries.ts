import {
  FNS_NFT_ADDRESS,
  FNS_NFT_TOKEN_ID,
  LUNA_CW20_ADDRESS,
  LUNA_CW20_OWNER_ADDRESS,
} from "@/constants";
import { CosmWasmClient } from "@cosmjs/cosmwasm-stargate";

export async function fetchCW721Info(client: CosmWasmClient) {
  const {
    name,
    symbol,
  }: {
    name: string;
    symbol: string;
  } = await client.queryContractSmart(FNS_NFT_ADDRESS, {
    contract_info: {},
  });

  const tokenInfo: {
    access: { owner: string; approvals: string[] };
    info: {
      extension: {
        image: string;
        description: string;
      };
    };
  } = await client.queryContractSmart(FNS_NFT_ADDRESS, {
    all_nft_info: {
      token_id: FNS_NFT_TOKEN_ID,
    },
  });

  return {
    name,
    owner: tokenInfo.access.owner,
    symbol: symbol,
    image: tokenInfo.info.extension.image,
    description: tokenInfo.info.extension.description,
  };
}

export async function fetchCW20Balance(client: CosmWasmClient) {
  const { balance }: { balance: string } = await client.queryContractSmart(
    LUNA_CW20_ADDRESS,
    {
      balance: {
        address: LUNA_CW20_OWNER_ADDRESS,
      },
    }
  );

  const tokenInfo: {
    name: string;
    symbol: string;
    decimals: number;
    total_supply: string;
  } = await client.queryContractSmart(LUNA_CW20_ADDRESS, {
    token_info: {},
  });

  return {
    name: tokenInfo.name,
    symbol: tokenInfo.symbol,
    balance: parseInt(balance) * Math.pow(10, -tokenInfo.decimals),
  };
}
