"use client";

import Image from "next/image";
import "./page.css";
import { ExplainContainer, PrimaryButton, BalanceList } from "@/components";
import { IconDocumentation } from "@/components/icons/IconDocumentation";
import {
  CHAIN_NAME,
  LUNA_CW20_OWNER_ADDRESS,
  LUNA_CW20_ADDRESS,
  FNS_NFT_TOKEN_ID,
  FNS_NFT_ADDRESS,
} from "@/constants";
import { fetchCW20Balance, fetchCW721Info } from "@/lib/queries";
import { findAssetFromDenom } from "@/lib/utils";
import {
  useSignerStore,
  useWasmQueryClient,
  useTendermintQueryClient,
  useQueryClient,
} from "@/stores/wallet";
import { Coin } from "@keplr-wallet/types";
import { useState, useEffect } from "react";
import type { DenomTrace } from "cosmjs-types/ibc/applications/transfer/v1/transfer";

export default function Home() {
  const { signer, connectToWallet, isConnected, account } = useSignerStore();
  const { useInitializedClient: useInitializedCosmWasmClient } =
    useWasmQueryClient();
  const cosmwasmClient = useInitializedCosmWasmClient();
  const { useInitializedClient: useInitializedTendermintClient } =
    useTendermintQueryClient();
  const tmClient = useInitializedTendermintClient();

  const { useInitializedClient } = useQueryClient();
  const stargateClient = useInitializedClient();

  const [cw721Info, setcw721Info] = useState<{
    name: string;
    owner: string;
    symbol: string;
    image: string;
    description: string;
  } | null>(null);

  const [cw20Info, setcw20Info] = useState<{
    name: string;
    symbol: string;
    balance: number;
  } | null>(null);

  const [balances, setBalances] = useState<Coin[] | null>(null);
  const [smartBalances, setSmartBalances] = useState<Coin[] | null>(null);
  const [ibcDenoms, setIbcDenoms] = useState<DenomTrace[] | null>(null);

  useEffect(() => {
    async function fetchIbcDenoms() {
      const client = await tmClient;
      const { denomTraces } = await client.ibc.transfer.allDenomTraces();
      setIbcDenoms(denomTraces);
    }

    fetchIbcDenoms();
  }, [ibcDenoms, tmClient]);

  return (
    <>
      <main>
        <ExplainContainer.Container
          heading={<>Wallet Connection</>}
          icon={
            <ExplainContainer.Icon>
              <IconDocumentation></IconDocumentation>
            </ExplainContainer.Icon>
          }
        >
          <>
            <div>
              <div>
                {account ? (
                  <>
                    <div>Your connected wallet address is:</div>

                    <div className="address">{account.address}</div>
                  </>
                ) : (
                  <div>
                    <button onClick={connectToWallet}>
                      Connect to your fetch wallet
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-2">
              Your crypto address is a unique identifier, it is used to receive
              and send messages, interact with the network and handle funds.
            </div>
          </>
        </ExplainContainer.Container>

        <ExplainContainer.Container
          heading={<>Bank Balances</>}
          icon={
            <ExplainContainer.Icon>
              <IconDocumentation></IconDocumentation>
            </ExplainContainer.Icon>
          }
        >
          <div>
            An address' balances can be queried using the Stargate or CosmWasm
            client. These balances are raw and you'll need to take into account
            both the decimals and the actual token denomination to display
            something comprehensible to the users. Your own balances will be
            shown after connecting your wallet.
            {isConnected() && !balances && (
              <div className="mt-2">
                <PrimaryButton
                  onClick={async () => {
                    const initialized = await stargateClient;
                    const balances = await initialized.getAllBalances(
                      account!.address
                    );
                    setBalances([...balances]);

                    setSmartBalances(
                      balances
                        .map((b) => {
                          return {
                            ...findAssetFromDenom(b.denom),
                            ...b,
                          };
                        })
                        .map((c) => {
                          // NOTE: chain-registry is misconfigured for atestfet
                          const decimals =
                            c.denom_units?.find(
                              (d) =>
                                d.denom === c.display || d.denom === "testfet"
                            )?.exponent ?? 1;
                          return {
                            amount: (
                              Math.pow(10, -decimals) * parseInt(c.amount)
                            ).toString(),
                            denom: c.display ?? c.denom,
                          };
                        })
                    );
                  }}
                >
                  Query Balances
                </PrimaryButton>
              </div>
            )}
            {balances && (
              <div>
                <BalanceList
                  balances={balances}
                  title="Raw Balances"
                ></BalanceList>
              </div>
            )}
            {smartBalances && (
              <div>
                <BalanceList
                  balances={smartBalances}
                  title="Smart Balances"
                ></BalanceList>
              </div>
            )}
            <div className="mt-2">
              These balances will also include Interchain tokens, most commonly
              known as IBC tokens. You'll be able to spot them thanks to their
              special denomination as it starts with <code>ibc</code>.
            </div>
            <br />
            {ibcDenoms && (
              <div>
                <h4>
                  The {CHAIN_NAME} network handles {ibcDenoms.length} such
                  assets.
                </h4>

                <div className="mt-2">
                  These are:
                  <ul>
                    {ibcDenoms.map((ibc) => {
                      return (
                        <li key={ibc.baseDenom}>
                          <span className="symbol">{ibc.baseDenom}</span> using
                          the ibc path {ibc.path}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            )}
            <br />
            Any time you find yourself dealing with such a denomination, you can
            use the
            <code>
              ibc extension for the tendermint client and its
              ibc.transfer.denomTrace
            </code>{" "}
            to translate it into one of the human readable symbol, we've just
            shown. Token informations can usually be found in the{" "}
            <a href="https://github.com/cosmos/chain-registry">
              chain registry repository
            </a>
            .
          </div>
        </ExplainContainer.Container>

        <ExplainContainer.Container
          heading={<>Smart contract - Token (CW20)</>}
          icon={
            <ExplainContainer.Icon>
              <IconDocumentation></IconDocumentation>
            </ExplainContainer.Icon>
          }
        >
          <>
            The Cosmos ecosystem has its own version of the ERC20 token standard
            from EVM chains. These are treated differently from native
            denominations and require CosmWasm and a CosmWasm client to be
            interacted with.
            <br />
            Contrary to Native denominations, CW20 includes optional marketing
            info fields.
            <div className="mt-2">
              Balance for{" "}
              <span className="address">{LUNA_CW20_OWNER_ADDRESS}</span> on the
              sample <span className="address">{LUNA_CW20_ADDRESS}</span> token:
            </div>
            <div className="mt-2">
              {cw20Info ? (
                <div>
                  <div>
                    <div>{cw20Info.name}</div>

                    <div>
                      {cw20Info.balance.toFixed(5)}
                      <span className="symbol"> {cw20Info.symbol}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <PrimaryButton
                    onClick={async () => {
                      const info = await fetchCW20Balance(await cosmwasmClient);
                      setcw20Info(info);
                    }}
                  >
                    Query Balance
                  </PrimaryButton>
                </div>
              )}
            </div>
          </>
        </ExplainContainer.Container>

        <ExplainContainer.Container
          heading={<>Smart contract - NFTs (CW721)</>}
          icon={
            <ExplainContainer.Icon>
              <IconDocumentation></IconDocumentation>
            </ExplainContainer.Icon>
          }
        >
          <>
            <div>
              Just like the CW20 standard, the CW721 standard is inspired by the
              EVM one. You can query any NFT collection, its information and all
              of its individual tokens using a CosmWasm compatible client.
              <div className="mt-2">
                NFT Info for <span className="symbol">{FNS_NFT_TOKEN_ID}</span>{" "}
                from the <span className="address">{FNS_NFT_ADDRESS}</span>{" "}
                collection.
              </div>
            </div>

            <div className="mt-2">
              {cw721Info ? (
                <div>
                  <div className="nft__container">
                    <div className="placeholder">
                      <img src={cw721Info.image} />
                    </div>
                    <div className="">
                      <div className="nft__container-title">
                        {cw721Info.name}
                        <span className="symbol">({cw721Info.symbol})</span>
                      </div>

                      <div>
                        <div>
                          <h5>Owner</h5>
                          {cw721Info.owner}
                        </div>
                        <div>
                          <h5>Description</h5>

                          {cw721Info.description}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <PrimaryButton
                    onClick={async () => {
                      const info = await fetchCW721Info(await cosmwasmClient);
                      setcw721Info(info);
                    }}
                  >
                    Query NFT info
                  </PrimaryButton>
                </div>
              )}
            </div>
          </>
        </ExplainContainer.Container>

        <ExplainContainer.Container
          heading={<>Ecosystem</>}
          icon={
            <ExplainContainer.Icon>
              <IconDocumentation></IconDocumentation>
            </ExplainContainer.Icon>
          }
        >
          <>
            If you need more resources on developing for Cosmos chains, we
            suggest paying{" "}
            <a
              href="https://github.com/cosmos/awesome-cosmos"
              target="_blank"
              rel="noopener"
            >
              Awesome Cosmos
            </a>{" "}
            a visit.
            <br />
            You can also discover innovative projects on the Fetch.ai blockchain
            on their{" "}
            <a
              href="https://fetch.ai/ecosystem/"
              target="_blank"
              rel="noopener"
            >
              ecosystem page
            </a>
            .
          </>
        </ExplainContainer.Container>
      </main>
    </>
  );
}
