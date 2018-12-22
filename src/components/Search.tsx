import React, { useState, Fragment } from 'react';
import { withApollo } from 'react-apollo';
import gql from 'graphql-tag';
import Link from './Link';

const FEED_SEARCH_QUERY = gql`
  query FeedSearchQuery($filter: String!) {
    feed(filter: $filter) {
      links {
        id
        url
        description
        createdAt
        postedBy {
          id
          name
        }
        votes {
          id
          user {
            id
          }
        }
      }
    }
  }
`;

type Props = { client: any };
function Search(props: Props) {
  const [links, setLinks] = useState([]);
  const [filter, setFilter] = useState('');

  async function _executeSearch() {
    const result = await props.client.query({
      query: FEED_SEARCH_QUERY,
      variables: { filter },
    });
    const links = result.data.feed.links;
    setLinks(links);
  }

  return (
    <Fragment>
      <div>
        Search
        <input type="text" onChange={e => setFilter(e.target.value)} />
        <button onClick={_executeSearch}>OK</button>
      </div>
      {links.map((link: any, index: number) => (
        <Link key={link.id} link={link} index={index} />
      ))}
    </Fragment>
  );
}

export default withApollo(Search);
