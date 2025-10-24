import { graphql } from "gatsby";
import BlogIndex from "../components/BlogIndex";

export default BlogIndex;

export const query = graphql`
  query ($tag: String!, $skip: Int!, $limit: Int!) {
    site {
      siteMetadata {
        title
      }
    }
    posts: allMarkdownRemark(
      sort: { fields: [frontmatter___date], order: DESC }
      filter: { frontmatter: { tags: { elemMatch: { slug: { eq: $tag } } } } }
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
