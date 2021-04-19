import axios from 'axios'

export const buildClient = ({ req }) => {
  const isServer = !!req
    ? {
        url: 'http://www.performance-marketing.us',
        headers: req.headers,
      }
    : { url: '/', headers: '' }

  // REQUEST
  return axios.create({ baseURL: isServer.url, headers: isServer.headers })
}
