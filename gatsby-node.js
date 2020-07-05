const path = require(`path`);
const { createFilePath } = require(`gatsby-source-filesystem`);
const { paginate } = require("gatsby-awesome-pagination");

const allPagesQuery = `
query AllPages {
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
`;

const pagesByCategoryQuery = `
query Categories($category: String!) {
  allMarkdownRemark(
    sort: { fields: [frontmatter___date], order: DESC }
    limit: 1000
    filter: {
      frontmatter: {
        categories: { elemMatch: { slug: { eq: $category } } }
      }
    }
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
`;

const pagesByTagQuery = `
query Tags($tag: String!) {
  allMarkdownRemark(
    sort: { fields: [frontmatter___date], order: DESC }
    limit: 1000
    filter: {
      frontmatter: {
        tags: { elemMatch: { slug: { eq: $tag } } }
      }
    }
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
`;

const allCategoriesQuery = `
query AllCategories {
  allMarkdownRemark {
    distinct(field: frontmatter___categories___slug)
  }
}
`;

const allTagsQuery = `
query AllTags {
  allMarkdownRemark {
    distinct(field: frontmatter___tags___slug)
  }
}
`;

exports.createPages = async ({ graphql, actions }) => {
  const { createPage } = actions;

  const blogPost = path.resolve(`./src/templates/blog-post.jsx`);
  const blogIndex = path.resolve("./src/templates/blog-index.jsx");

  const allCategoriesResults = await graphql(allCategoriesQuery);
  const allTagsResults = await graphql(allTagsQuery);

  const categories = allCategoriesResults.data.allMarkdownRemark.distinct;
  const tags = allTagsResults.data.allMarkdownRemark.distinct;

  [
    {
      values: categories,
      prefix: "category",
      query: pagesByCategoryQuery,
      component: path.resolve("./src/templates/blog-categories.jsx"),
    },
    {
      values: tags,
      prefix: "tag",
      query: pagesByTagQuery,
      component: path.resolve("./src/templates/blog-tags.jsx"),
    },
  ].forEach(({ values, prefix, query, component }) => {
    values.forEach(async (value) => {
      const results = await graphql(query, { [prefix]: value });

      if (results.errors) {
        throw results.errors;
      }

      const pagePrefix = `/${prefix}/${value}`;

      paginate({
        createPage,
        items: results.data.allMarkdownRemark.edges,
        itemsPerPage: 10,
        pathPrefix: ({ pageNumber, numberOfPages }) => {
          return pagePrefix + (pageNumber === 0 ? "/" : "/page");
        },
        component,
        context: {
          [prefix]: value,
        },
      });
    });
  });

  const pages = await graphql(allPagesQuery);

  if (pages.errors) {
    throw pages.errors;
  }

  paginate({
    createPage,
    items: pages.data.allMarkdownRemark.edges,
    itemsPerPage: 10,
    pathPrefix: ({ pageNumber, numberOfPages }) => {
      return pageNumber === 0 ? "/" : "/page";
    },
    component: blogIndex,
  });

  // Create blog posts pages.
  const posts = pages.data.allMarkdownRemark.edges;

  posts.forEach((post, index) => {
    const previous = index === posts.length - 1 ? null : posts[index + 1].node;
    const next = index === 0 ? null : posts[index - 1].node;

    createPage({
      path: post.node.fields.slug,
      component: blogPost,
      context: {
        slug: post.node.fields.slug,
        previous,
        next,
      },
    });
  });
};

exports.onCreateNode = ({ node, actions, getNode }) => {
  const { createNodeField } = actions;

  if (node.internal.type === `MarkdownRemark`) {
    const value = createFilePath({ node, getNode });
    createNodeField({
      name: `slug`,
      node,
      value,
    });
  }
};

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
