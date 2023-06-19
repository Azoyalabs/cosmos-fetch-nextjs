import React from "react";
import "./index.css";

type Props = {
  onClick: () => unknown;
  children: JSX.Element | string;
};
export const PrimaryButton: React.FC<Props> = ({ children, onClick }) => {
  return <button onClick={onClick}>{children}</button>;
};
