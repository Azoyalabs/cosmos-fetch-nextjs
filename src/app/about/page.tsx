import React from "react";
import "./index.css";

const AboutView: React.FC = () => {
  return (
    <>
      <div className="about">
        <div>
          This template was created by the{" "}
          <a href="https://azoyalabs.com">AzoyaLabs</a> team. Show us your
          support and follow us on{" "}
          <a
            href="https://twitter.com/AzoyaLabs"
            rel="noopener"
            target="_blank"
          >
            Twitter
          </a>{" "}
          or join our{" "}
          <a href="https://discord.gg/s9PdgkA8" rel="noopener" target="_blank">
            Discord
          </a>
        </div>
      </div>
    </>
  );
};
export default AboutView;
