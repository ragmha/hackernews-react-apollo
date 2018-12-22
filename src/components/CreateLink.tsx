import React, { useState, Fragment } from 'react';
import gql from 'graphql-tag';
import { Mutation } from 'react-apollo';
import { FEED_QUERY } from './LinkList';
import { LINKS_PER_PAGE } from '../constants';

type State = {
  description: string;
  url: string;
};

const POST_MUTATION = gql`
  mutation PostMutation($description: String!, $url: String!) {
    post(description: $description, url: $url) {
      id
      createdAt
      url
      description
    }
  }
`;

function CreateLink(props: any) {
  const [description, setDescription] = useState('');
  const [url, setURL] = useState('');

  return (
    <Fragment>
      <div className="flex flex-column mt3">
        <input
          className="mb2"
          value={description}
          onChange={e => setDescription(e.target.value)}
          type="text"
          placeholder="A description for the link"
        />
        <input
          className="mb2"
          value={url}
          onChange={e => setURL(e.target.value)}
          type="text"
          placeholder="The URL for the link"
        />
      </div>
      <Mutation
        mutation={POST_MUTATION}
        variables={{
          description,
          url,
        }}
        onCompleted={() => props.history.push('/')}
        update={(store, { data: { post } }) => {
          const first = LINKS_PER_PAGE;
          const skip = 0;
          const orderBy = 'createdAt_DESC';
          const data: any = store.readQuery({
            query: FEED_QUERY,
            variables: { first, skip, orderBy },
          });
          data.feed.links.unshift(post);
          store.writeQuery({
            query: FEED_QUERY,
            data,
            variables: { first, skip, orderBy },
          });
        }}
      >
        {(postMutation: any) => <button onClick={postMutation}>Submit</button>}
      </Mutation>
    </Fragment>
  );
}

export default CreateLink;
