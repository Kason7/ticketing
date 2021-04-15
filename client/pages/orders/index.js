import useSWR from 'swr'
import axios from 'axios'

const fetcher = (url) => axios.get(url).then((res) => res.data)

const OrderIndex = () => {
  // HANDLERS
  const { data: orders, error } = useSWR(`/api/orders`, fetcher)

  return (
    <div>
      <ul>
        {orders?.map(({ id, ticketId, status }) => {
          return (
            <li key={id}>
              {ticketId.title} - {status}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export default OrderIndex
