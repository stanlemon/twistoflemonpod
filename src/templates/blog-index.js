import React from "react"
import { Link, graphql } from "gatsby"

const Item = ({ post }) => {
  console.log(post)
  return (
    <div key={post.id}>
      <div>{post.frontmatter.date}</div>
      <div>{post.frontmatter.title}!</div>
      <hr />
    </div>
  )
}

const BlogIndex = props => {
  const { pageContext } = props
  const { previousPagePath, nextPagePath } = pageContext

  return (
    <div>
      {props.data.posts.edges.map(edge => (
        <Item post={edge.node} />
      ))}
      <div>
        {previousPagePath ? <Link to={previousPagePath}>Previous</Link> : null}
        {` `}
        {nextPagePath ? <Link to={nextPagePath}>Next</Link> : null}
      </div>
    </div>
  )
}

export default BlogIndex

export const pageQuery = graphql`
  query($skip: Int!, $limit: Int!) {
    posts: allMarkdownRemark(
      sort: { fields: [frontmatter___date], order: DESC }
      skip: $skip
      limit: $limit
    ) {
      edges {
        node {
          id
          excerpt(pruneLength: 280)
          frontmatter {
            date(formatString: "DD MMMM, YYYY")
            title
          }
        }
      }
    }
  }
`
