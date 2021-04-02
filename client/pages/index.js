const HomePage = ({ data }) => {
  const currentUser = data?.currentUser;
  return currentUser ? (
    <h1>You are signed in</h1>
  ) : (
    <h1>You are not signed in</h1>
  );
};

// export async function getServerSideProps(context) {
//   const client = buildClient(context);
//   const { data } = await client.get('/api/users/currentuser');

//   return {
//     props: {
//       data,
//     },
//   };
// }

export default HomePage;
