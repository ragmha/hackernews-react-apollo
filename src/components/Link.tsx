import React from 'react';
import { AUTH_TOKEN } from '../constants';
import { timeDifferenceForDate } from '../utils';
import gql from 'graphql-tag';
import { Mutation } from 'react-apollo';

type Post = {
  name: string;
};

type LinkT = {
  id: number;
  description: string;
  url: string;
  votes: Array<any>;
  postedBy: Post;
  createdAt: any;
};

type Props = {
  index: number;
  link: LinkT;
  updateStoreAfterVote?: (store: any, vote: any, id: number) => void;
};

const VOTE_MUTATION = gql`
  mutation VoteMutation($linkId: ID!) {
    vote(linkId: $linkId) {
      id
      link {
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
`;

function Link(props: Props) {
  const authToken = localStorage.getItem(AUTH_TOKEN);

  return (
    <div className="flex mt2 items-start">
      <div className="flex items-center">
        <span className="gray">{props.index + 1}.</span>
        {authToken && (
          <Mutation
            mutation={VOTE_MUTATION}
            variables={{
              linkId: props.link.id,
            }}
            update={(store, { data: { vote } }) => {
              if (props.updateStoreAfterVote) {
                props.updateStoreAfterVote(store, vote, props.link.id);
              }
            }}
          >
            {(voteMutation: any) => (
              <div
                className="ml1 gray f11"
                onClick={voteMutation}
                style={{
                  cursor: 'pointer',
                }}
              >
                ▲
              </div>
            )}
          </Mutation>
        )}
        <div className="ml1">
          <div>
            {props.link.description} ({props.link.url})
          </div>
          <div className="f6 lh-copy gray">
            {props.link.votes.length} votes | by{' '}
            {props.link.postedBy ? props.link.postedBy.name : 'Unknown'}{' '}
            {timeDifferenceForDate(props.link.createdAt)}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Link;
