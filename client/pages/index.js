import useSWR from 'swr'
import axios from 'axios'
import Link from 'next/link'

const fetcher = (url) => axios.get(url).then((res) => res.data)

const HomePage = ({ data }) => {
  const currentUser = data?.currentUser

  // HANDLERS
  const { data: tickets, error } = useSWR(
    'https://ticketing.dev/api/tickets',
    fetcher,
  )

  // RENDERS
  const ticketList = tickets?.reverse().map(({ id, title, price }) => {
    return (
      <tr key={id}>
        <td>{title}</td>
        <td>{price}</td>
        <td>
          <Link href="/tickets/[ticketId]" as={`/tickets/${id}`}>
            <a>View</a>
          </Link>
        </td>
      </tr>
    )
  })

  // MAIN RENDER
  return (
    <div>
      <h2>Tickets</h2>
      <table className="table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Price</th>
            <th>Link</th>
          </tr>
        </thead>
        <tbody>{ticketList}</tbody>
      </table>
    </div>
  )
}

export default HomePage
