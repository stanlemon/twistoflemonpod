import React from "react"
import { ContainerWrapper } from "../elements"
import { Nav } from "../components"


export const Container = ({title, children}) => {
   return <ContainerWrapper>{children}</ContainerWrapper>
}