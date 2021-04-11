import useSWR from 'swr'
import axios from 'axios'
import Router, { useRouter } from 'next/router'
import useRequest from '../../hooks/useRequest'

const fetcher = (url) => axios.get(url).then((res) => res.data)

const TicketShow = () => {
  // HOOKS
  const router = useRouter()
  const { ticketId } = router.query

  // HANDLERS
  const { data: ticket, error } = useSWR(
    `https://ticketing.dev/api/tickets/${ticketId}`,
    fetcher,
  )

  // HANDLERS
  const { doRequest, errors } = useRequest({
    url: '/api/orders',
    method: 'post',
    body: {
      ticketId,
    },
    onSuccess: (order) =>
      Router.push('/orders/[orderId]', `/orders/${order.id}`),
  })

  return (
    <div>
      <h1>{ticket?.title}</h1>
      <h4>Price: {ticket?.price}</h4>
      {error}
      {errors}
      <button onClick={doRequest} className="btn btn-primary">
        Purchase
      </button>
    </div>
  )
}

export default TicketShow
