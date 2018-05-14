import React from 'react'
import { StaticQuery, Link } from 'gatsby'
import Helmet from 'react-helmet'

export default ({ children }) => (
  <StaticQuery
    query={graphql`
      query LayoutQuery {
        site {
          siteMetadata {
            title
          }
        }
      }
    `}
    render={data => {
      const title = data.site.siteMetadata.title
      return (
        <div>
          <Helmet title={title} />
          <Link to={`/`}>
            <h2>{title}</h2>
          </Link>
          {children}
        </div>
      )
    }}
  />
)
