import React from "react"
import { Link, graphql } from "gatsby"

import Bio from "../components/Bio"
import Layout from "../components/Layout"
import SEO from "../components/SEO"
import { rhythm } from "../utils/typography"

const BlogPost = ({ post }) => {
  const { fields, frontmatter, excerpt } = post

  return (
    <article key={fields.slug}>
      <header>
        <h3
          style={{
            marginBottom: rhythm(1 / 4),
          }}
        >
          <Link style={{ boxShadow: `none` }} to={fields.slug}>
            {frontmatter.title}
          </Link>
        </h3>
        <small>{frontmatter.date}</small>
      </header>
      <section>
        <p
          dangerouslySetInnerHTML={{
            __html: frontmatter.description || excerpt,
          }}
        />
      </section>
    </article>
  )
}

const BlogIndex = ({ data, location, pageContext }) => {
  const siteTitle = data.site.siteMetadata.title
  const posts = data.posts
  const { previousPagePath, nextPagePath } = pageContext

  return (
    <Layout location={location} title={siteTitle}>
      <SEO title="All posts" />
      <Bio />

      {posts.edges.map(edge => (
        <BlogPost key={edge.node.id} post={edge.node} />
      ))}
      <div>
        {previousPagePath ? <Link to={previousPagePath}>Previous</Link> : null}
        {` `}
        {nextPagePath ? <Link to={nextPagePath}>Next</Link> : null}
      </div>
    </Layout>
  )
}

export default BlogIndex

export const pageQuery = graphql`
  query($skip: Int!, $limit: Int!) {
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
          }
        }
      }
    }
  }
`
