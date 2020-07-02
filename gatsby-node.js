const path = require(`path`)
const { createFilePath } = require(`gatsby-source-filesystem`)
const { paginate } = require("gatsby-awesome-pagination")

exports.createPages = async ({ graphql, actions }) => {
  const { createPage } = actions

  const blogPost = path.resolve(`./src/templates/blog-post.jsx`)
  const blogIndex = path.resolve("./src/templates/blog-index.jsx")

  const result = await graphql(
    `
      {
        allMarkdownRemark(
          sort: { fields: [frontmatter___date], order: DESC }
          limit: 1000
        ) {
          edges {
            node {
              fields {
                slug
              }
              frontmatter {
                title
              }
            }
          }
        }
      }
    `
  )

  if (result.errors) {
    throw result.errors
  }

  paginate({
    createPage,
    items: result.data.allMarkdownRemark.edges,
    itemsPerPage: 10,
    pathPrefix: ({ pageNumber, numberOfPages }) => {
      return pageNumber === 0 ? "/" : "/page"
    },
    component: blogIndex,
  })

  // Create blog posts pages.
  const posts = result.data.allMarkdownRemark.edges

  posts.forEach((post, index) => {
    const previous = index === posts.length - 1 ? null : posts[index + 1].node
    const next = index === 0 ? null : posts[index - 1].node

    createPage({
      path: post.node.fields.slug,
      component: blogPost,
      context: {
        slug: post.node.fields.slug,
        previous,
        next,
      },
    })
  })
}

exports.onCreateNode = ({ node, actions, getNode }) => {
  const { createNodeField } = actions

  if (node.internal.type === `MarkdownRemark`) {
    const value = createFilePath({ node, getNode })
    createNodeField({
      name: `slug`,
      node,
      value,
    })
  }
}

// This isn't needed right now, but I'm leaving it here in case I do in the future.
/**
exports.createSchemaCustomization = ({ actions }) => {
  const { createTypes } = actions
  const typeDefs = `
    type MarkdownRemark implements Node {
      frontmatter: MarkdownRemarkFrontmatter!
    }
    type MarkdownRemarkFrontmatter {
      enclosure: Enclosure @dontInfer
    }
    type Enclosure @dontInfer {
        url: String
        length: Int
        type: String
    }
  `
  createTypes(typeDefs)
}
*/
