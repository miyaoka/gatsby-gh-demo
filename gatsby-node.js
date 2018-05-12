require('dotenv').config()
const path = require('path')
const { createApolloFetch } = require('apollo-fetch')
const crypto = require('crypto')

const apolloFetch = createApolloFetch({
  uri: 'https://api.github.com/graphql'
})

apolloFetch.use(({ request, options }, next) => {
  options.headers = {
    ...options.headers,
    authorization: `Bearer ${process.env.GH_READONLY_TOKEN}`
  }
  next()
})

const query = `query getIssues(
  $repoOwner: String!
  $repoName: String!
  $fetchIssuePerPage: Int = 5
  $endCursor: String
) {
  repository(owner: $repoOwner, name: $repoName) {
    issues(
      orderBy: { field: CREATED_AT, direction: DESC }
      first: $fetchIssuePerPage
      after: $endCursor
    ) {
      totalCount
      pageInfo {
        endCursor
        hasNextPage
      }
      nodes {
        id
        number
        title
        body
        url
      }
    }
  }
}`

const fetchContents = async () => {
  try {
    let totalNodes = []
    let endCursor = null
    let hasNextPage = false
    do {
      const { data } = await apolloFetch({
        query,
        variables: {
          repoOwner: process.env.GH_REPO_OWNER,
          repoName: process.env.GH_REPO_NAME,
          fetchIssuePerPage: 100,
          endCursor: endCursor
        }
      })

      const { totalCount, nodes, pageInfo, append } = data.repository.issues
      endCursor = pageInfo.endCursor
      hasNextPage = pageInfo.hasNextPage
      totalNodes = [...totalNodes, ...nodes]

      console.log(`fetching... ${totalNodes.length}/${totalCount}`)
    } while (hasNextPage)

    return totalNodes
  } catch (err) {
    console.error(err)
  }
}

exports.sourceNodes = async ({ actions }) => {
  const { createNode } = actions
  const contents = await fetchContents()

  contents.forEach(c => {
    createNode({
      ...c,
      children: [],
      parent: '__SOURCE__',
      internal: {
        type: `GitHubIssueField`,
        contentDigest: crypto
          .createHash(`md5`)
          .update(JSON.stringify(c))
          .digest(`hex`)
      }
    })
  })
  return
}

exports.createPages = async ({ graphql, actions }) => {
  const { createPage } = actions
  const { data } = await graphql(`
    {
      allGitHubIssueField(sort: { fields: [number], order: DESC }) {
        edges {
          previous {
            id
            title
          }
          next {
            id
            title
          }
          node {
            id
            title
            number
            url
            body
          }
        }
      }
    }
  `)

  const postComponent = path.resolve('./src/templates/post.js')

  return data.allGitHubIssueField.edges.forEach(({ node, next, previous }) => {
    createPage({
      path: `posts/${node.id}`,
      component: postComponent,
      context: { node, next, previous }
    })
  })
}
