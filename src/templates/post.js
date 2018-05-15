import React from 'react'
import Helmet from 'react-helmet'
import { Link } from 'gatsby'
import ReactMarkdown from 'react-markdown'
import Layout from '../components/layout'

export default ({ pageContext }) => {
  const { node, previous, next } = pageContext
  return (
    <Layout>
      <div>
        <Helmet title={`${node.title}`} />
        <h1>
          [{node.number}] {node.title}
        </h1>
        <ReactMarkdown source={node.body} />

        {previous && (
          <div>
            prev: <Link to={`/posts/${previous.number}`}>{previous.title}</Link>
          </div>
        )}
        {next && (
          <div>
            next: <Link to={`/posts/${next.number}`}>{next.title}</Link>
          </div>
        )}
      </div>
    </Layout>
  )
}
