import useSWR from 'swr'
import axios from 'axios'
import Router, { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import StripeCheckout from 'react-stripe-checkout'
import useRequest from '../../hooks/useRequest'

const fetcher = (url) => axios.get(url).then((res) => res.data)

const OrderShow = ({ data }) => {
  // HOOKS
  const router = useRouter()
  const { orderId } = router.query
  const [timeLeft, setTimeLeft] = useState(0)

  // HANDLERS
  const { data: order, error } = useSWR(`/api/orders/${orderId}`, fetcher)
  const { doRequest, errors } = useRequest({
    url: '/api/payments',
    method: 'post',
    body: {
      orderId: order?.id,
    },
    onSuccess: () => Router.push('/orders'),
  })

  // LIFECYCLE
  useEffect(() => {
    const findTimeLeft = () => {
      const msLeft = new Date(order?.expiresAt) - new Date()
      setTimeLeft(Math.round(msLeft / 1000))
    }
    findTimeLeft()
    const timerId = setInterval(findTimeLeft, 1000)

    return () => {
      clearInterval(timerId)
    }
  }, [order])

  return (
    <div>
      <h1>Order</h1>
      <p>
        {timeLeft > 0
          ? `Time left to pay: ${timeLeft} seconds`
          : 'Order expired'}
      </p>
      <p>Ticket: {order?.ticketId.title}</p>
      <StripeCheckout
        token={({ id }) => doRequest({ token: id })}
        stripeKey="pk_test_51IeLn3HeNGJ10Jfi6UisnVkWHzvU9YObafc24G2daBAUPugNTXlgxDTos5I0CnBLrjUcjnAcEQw36OzJBBleGFCc00kTMwT1fn"
        amount={order?.ticketId.price * 100}
        email={data?.currentUser?.email}
      />
      {errors}
    </div>
  )
}

export default OrderShow
