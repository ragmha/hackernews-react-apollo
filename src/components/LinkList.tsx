import React, { SFC, Fragment } from 'react';
import { Query } from 'react-apollo';
import { RouteComponentProps } from 'react-router-dom';
import gql from 'graphql-tag';

import { LINKS_PER_PAGE } from '../constants';
import Link from './Link';

const mockData = [
  {
    id: '1',
    description:
      'Prisma replaces traditional ORMs and makes it easy to build GraphQL servers 😎',
    url: 'https://www.prisma.io',
  },
  {
    id: '2',
    description: 'The best GraphQL client',
    url: 'https://www.apollographql.com/docs/react/',
  },
];

export const FEED_QUERY = gql`
  query FeedQuery($first: Int, $skip: Int, $orderBy: LinkOrderByInput) {
    feed(first: $first, skip: $skip, orderBy: $orderBy) {
      links {
        id
        createdAt
        url
        description
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
      count
    }
  }
`;

const NEW_LINKS_SUBSCRIPTION = gql`
  subscription {
    newLink {
      node {
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

const NEW_VOTES_SUBSCRIPTION = gql`
  subscription {
    newVote {
      node {
        id
        link {
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
        user {
          id
        }
      }
    }
  }
`;

type linkT = { id: any };

type linkRouterProps = { page: any };
type Props = RouteComponentProps<linkRouterProps>;

function LinkList(props: Props) {
  function _getLinksToRender(data: any) {
    const isNewPage = props.location.pathname.includes('new');
    if (isNewPage) return data.feed.links;
    const rankedLinks = data.feed.links.slice();
    rankedLinks.sort((l1: any, l2: any) => l2.votes.length - l1.votes.length);

    return rankedLinks;
  }

  function _getQueryVariables() {
    const isNewPage = props.location.pathname.includes('new');
    const page = parseInt(props.match.params.page, 10);

    const skip = isNewPage ? (page - 1) * LINKS_PER_PAGE : 0;
    const first = isNewPage ? LINKS_PER_PAGE : 100;
    const orderBy = isNewPage ? 'createdAt_DESC' : null;
    return { first, skip, orderBy };
  }

  function _updateCacheAfterVote(store: any, createVote: any, linkId: number) {
    const isNewPage = props.location.pathname.includes('new');
    const page = parseInt(props.match.params.page, 10);

    const skip = isNewPage ? (page - 1) * LINKS_PER_PAGE : 0;
    const first = isNewPage ? LINKS_PER_PAGE : 100;
    const orderBy = isNewPage ? 'createdAt_DESC' : null;
    const data = store.readQuery({
      query: FEED_QUERY,
      variables: { first, skip, orderBy },
    });

    const votedLink = data.feed.links.find((link: linkT) => link.id === linkId);
    votedLink.votes = createVote.link.votes;
    store.writeQuery({ query: FEED_QUERY, data });
  }

  async function _subscribeToNewLinks(subscribeToMore: any) {
    return subscribeToMore({
      document: NEW_LINKS_SUBSCRIPTION,
      updateQuery: (prev: any, { subscriptionData }: any) => {
        if (!subscriptionData.data) return prev;
        const newLink = subscriptionData.data.newLink.node;

        return {
          ...prev,
          feed: {
            ...prev.feed,
            links: [newLink, ...prev.feed.links],
            count: prev.feed.count + 1,
            __typename: prev.feed.__typename,
          },
        };
      },
    });
  }

  async function _subscribeToNewVotes(subscribeToMore: any) {
    return subscribeToMore({
      document: NEW_VOTES_SUBSCRIPTION,
    });
  }

  function _nextPage(data: any) {
    const page = parseInt(props.match.params.page, 10);
    if (page <= data.feed.count / LINKS_PER_PAGE) {
      const nextPage = page + 1;
      props.history.push(`/next/${nextPage}`);
    }
  }

  function _previousPage(data: any) {
    const page = parseInt(props.match.params.page, 10);
    if (page > 1) {
      const previousPage = page - 1;
      props.history.push(`/new/${previousPage}`);
    }
  }

  return (
    <Query query={FEED_QUERY} variables={_getQueryVariables()}>
      {({ loading, error, data, subscribeToMore }) => {
        if (loading) return <div>Loading...</div>;
        if (error) return <div>Error</div>;

        _subscribeToNewLinks(subscribeToMore);
        _subscribeToNewVotes(subscribeToMore);

        const linksToRender = _getLinksToRender(data);
        const isNewPage = props.location.pathname.includes('new');
        const pageIndex = props.match.params.page
          ? props.match.params.page - 1 * LINKS_PER_PAGE
          : 0;

        return (
          <Fragment>
            {linksToRender.map((link: any, index: number) => (
              <Link
                key={link.id}
                index={index + pageIndex}
                link={link}
                updateStoreAfterVote={_updateCacheAfterVote}
              />
            ))}
            {isNewPage && (
              <div className="flex ml4 mv3 gray">
                <div className="pointer mr2" onClick={_previousPage}>
                  Previous
                </div>
                <div className="pointer" onClick={() => _nextPage(data)}>
                  Next
                </div>
              </div>
            )}
          </Fragment>
        );
      }}
    </Query>
  );
}

export default LinkList;
