import React from "react";
import "./style.css";

type Props = {
  children: string | JSX.Element | JSX.Element[];
};

type ContainerProps = {
  icon: string | JSX.Element;
  children: string | JSX.Element;
  heading: string | JSX.Element;
};

const Container: React.FC<ContainerProps> = ({ icon, children, heading }) => {
  return (
    <div className="item">
      {icon}
      <div className="details">
        <h3>{heading}</h3>
        {children}
      </div>
    </div>
  );
};
const Icon: React.FC<Props> = ({ children }) => {
  return <i>{children}</i>;
};

export { Container, Icon };
