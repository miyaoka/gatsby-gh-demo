import React from 'react'
import { Link } from 'gatsby'
import Layout from '../components/layout'

export default ({ data: { allGitHubIssueField: posts } }) => {
  return (
    <Layout>
      <div>
        <h4>total: {posts.totalCount} Posts</h4>
        {posts.edges.map(({ node }) => (
          <div key={node.id}>
            <Link to={`posts/${node.id}`}>
              <h3>
                [{node.number}] {node.title}
              </h3>
            </Link>
          </div>
        ))}
      </div>
    </Layout>
  )
}

export const query = graphql`
  query PostsQuery {
    allGitHubIssueField(sort: { fields: [number], order: DESC }) {
      totalCount
      edges {
        node {
          id
          title
          number
          url
        }
      }
    }
  }
`
