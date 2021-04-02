import 'bootstrap/dist/css/bootstrap.css';
import { buildClient } from '../api/buildClient';
import Header from '../components/Header';
import axios from 'axios';

const AppComponent = ({ Component, pageProps, data }) => {
  return (
    <main>
      <Header data={data} />
      <Component {...pageProps} data={data} />
    </main>
  );
};

AppComponent.getInitialProps = async (appContext) => {
  const client = buildClient(appContext.ctx);
  const { data } = await client.get('/api/users/currentuser');

  // ENABLE PAGE GETINITIALPROPS
  let pageProps = {};
  if (appContext.Component.getInitialProps) {
    pageProps = await appContext.Component.getInitialProps(
      appContext.ctx,
      axios,
      data
    );
  }

  return { pageProps, data };
};

export default AppComponent;
