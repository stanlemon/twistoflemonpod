import React from "react"
import {useStaticQuery, Link, graphql} from "gatsby"
import { NavWrapper } from "../elements"

export const Nav = ({title}) => {

    return (
        <NavWrapper>
            <Link to="/">
                <img src='../images/logo.png' alt="Life with a Twist of Lemon Logo" />
            </Link>
            
            <h1>
                <Link to={`/`}>
                    {title}
                </Link>
            </h1>
        </NavWrapper>
    )
}