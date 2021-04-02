import axios from 'axios';

export const buildClient = ({ req }) => {
  const isServer = !!req
    ? {
        url: 'http://ingress-nginx-controller.kube-system.svc.cluster.local',
        headers: req.headers,
      }
    : { url: '/', headers: '' };

  // REQUEST
  return axios.create({ baseURL: isServer.url, headers: isServer.headers });
};
