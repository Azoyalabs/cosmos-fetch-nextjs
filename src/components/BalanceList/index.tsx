import type { Coin } from "@cosmjs/stargate";

import "./index.css";
import React from "react";
type Props = {
  balances: Coin[];
  title: string;
};

export const BalanceList: React.FC<Props> = ({ balances, title }) => {
  return (
    <div className="balances-container">
      <h4>{title}</h4>
      <ul>
        {balances.map((b) => {
          return (
            <li key={b.denom}>
              {b.amount} <span className="symbol">{b.denom}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
