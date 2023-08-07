import styled from "styled-components"

export const ContainerWrapper = styled.div`
    height: 100%;
    display: grid;
    grid-template-columns: 1fr repeat(12, minmax(auto, 4.2rem)) 1fr;
    grid-template-rows: 7.8rem, 20rem, 4rem auto;
    gap: 0 3rem;
}
`