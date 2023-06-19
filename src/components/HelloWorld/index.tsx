import React from "react";
import { CHAIN_NAME, PRETTY_NAME } from "@/constants";
import "./HelloWorld.css";

export const HelloWorld: React.FC<{ msg: string }> = ({ msg }) => {
  return (
    <>
      <div className="greetings">
        <h1 className="green">{msg}</h1>
        <h3>
          You’ve successfully created a project with{" "}
          <a href="https://nextjs.org" target="_blank" rel="noopener">
            NextJS
          </a>{" "}
          on the{" "}
          <span id="chain-name">
            {PRETTY_NAME} {CHAIN_NAME}
          </span>{" "}
          network. What&apos;s next?
        </h3>
      </div>
    </>
  );
};
