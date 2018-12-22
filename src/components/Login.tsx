import React, { useReducer, Fragment } from 'react';
import gql from 'graphql-tag';
import { Mutation } from 'react-apollo';
import { AUTH_TOKEN } from '../constants';

const SIGNUP_MUTATION = gql`
  mutation SignupMutation($email: String!, $password: String!, $name: String!) {
    signup(email: $email, password: $password, name: $name) {
      token
    }
  }
`;

const LOGIN_MUTATION = gql`
  mutation LoginMutation($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
    }
  }
`;

function useSetState(initialState: object) {
  return useReducer(
    (state, newState) => ({ ...state, ...newState }),
    initialState
  );
}

function Login(props: any) {
  const [state, setState]: any = useSetState({
    login: true,
    email: '',
    password: '',
    name: '',
  });

  function saveUserData(token: any) {
    localStorage.setItem(AUTH_TOKEN, token);
  }

  async function confirm(data: any) {
    const { token } = state.login ? data.login : data.signup;
    saveUserData(token);
    props.history.push('/');
  }

  return (
    <Fragment>
      <h4 className="mv3">{state.login ? 'Login' : 'Sign Up'}</h4>
      <div className="flex flex-column">
        {!state.login && (
          <input
            value={state.name}
            onChange={e => setState({ name: e.target.value })}
            type="text"
            placeholder="Your name"
          />
        )}
        <input
          value={state.email}
          onChange={e => setState({ email: e.target.value })}
          type="text"
          placeholder="Your email address"
        />
        <input
          value={state.password}
          onChange={e => setState({ password: e.target.value })}
          type="password"
          placeholder="Choose a safe password"
        />
      </div>
      <div className="flex mt3">
        <Mutation
          mutation={state.login ? LOGIN_MUTATION : SIGNUP_MUTATION}
          variables={{
            email: state.email,
            password: state.password,
            name: state.name,
          }}
          onCompleted={data => confirm(data)}
        >
          {(mutation: any) => (
            <div className="pointer mr2 button" onClick={mutation}>
              {state.login ? 'login' : 'create account'}
            </div>
          )}
        </Mutation>

        <div
          className="pointer button"
          onClick={() => setState({ login: !state.login })}
        >
          {state.login
            ? 'need to create an account?'
            : 'already have an account?'}
        </div>
      </div>
    </Fragment>
  );
}

export default Login;
