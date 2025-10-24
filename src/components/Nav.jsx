import React from "react";
import { useStaticQuery, Link, graphql } from "gatsby";
import { NavWrapper } from "../elements";
import Logo from "../images/logo.png";

export const Nav = ({ title }) => {
  return (
    <NavWrapper>
      <Link to="/">
        <img src={Logo} alt="Life with a Twist of Lemon Logo" width="30%" />
      </Link>

      <h1>
        <Link to={`/`}>{title}</Link>
      </h1>
    </NavWrapper>
  );
};
