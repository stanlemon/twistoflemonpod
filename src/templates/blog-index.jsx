import { graphql } from "gatsby";
import BlogIndex from "../components/BlogIndex";

export default BlogIndex;

export const pageQuery = graphql`
  query ($skip: Int!, $limit: Int!) {
    site {
      siteMetadata {
        title
      }
    }
    posts: allMarkdownRemark(
      sort: { fields: [frontmatter___date], order: DESC }
      skip: $skip
      limit: $limit
    ) {
      edges {
        node {
          id
          excerpt(pruneLength: 280)
          fields {
            slug
          }
          frontmatter {
            date(formatString: "MMMM DD, YYYY")
            title
            categories {
              name
              slug
            }
            tags {
              name
              slug
            }
          }
        }
      }
    }
  }
`;
