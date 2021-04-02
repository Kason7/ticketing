import Router from 'next/router';
import { useEffect } from 'react';
import useRequest from '../../hooks/useRequest';

export const signout = () => {
  const { doRequest } = useRequest({
    url: '/api/users/signout',
    method: 'post',
    body: {},
    onSuccess: () => Router.push('/'),
  });
  useEffect(() => {
    doRequest();
  }, []);

  return (
    <div>
      <h1>Sign Out</h1>
    </div>
  );
};

export default signout;
