import React from "react";
import { Container } from './Container'
import { Nav } from './Nav'
import { Main } from './Main'

const Layout = ({ location, title, children }) => {
  const rootPath = `${__PATH_PREFIX__}/`;
  let header;
  
  return (
    <Container title={title}>
    <Nav title={title}/>
    
    <Main children={children}/>
  
    </Container>
  );
};

export default Layout;
