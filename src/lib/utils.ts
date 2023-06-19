import { REGISTRY_CHAIN_NAME } from "@/constants";
import { assets } from "chain-registry";

const chainAssets = assets.find(
  (a) => a.chain_name === REGISTRY_CHAIN_NAME
)!.assets;

export function findAssetFromDenom(denom: string) {
  return chainAssets.find((c) => c.base === denom) ?? null;
}
