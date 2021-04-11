import useSWR from 'swr'
import axios from 'axios'
import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'

const fetcher = (url) => axios.get(url).then((res) => res.data)

const OrderShow = () => {
  // HOOKS
  const router = useRouter()
  const { orderId } = router.query
  const [timeLeft, setTimeLeft] = useState(0)

  // HANDLERS
  const { data: order, error } = useSWR(
    `https://ticketing.dev/api/orders/${orderId}`,
    fetcher,
  )

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

  console.log(timeLeft)

  return (
    <div>
      <h1>Order</h1>
      <p>
        {timeLeft > 0
          ? `Time left to pay: ${timeLeft} seconds`
          : 'Order expired'}
      </p>
      <p>Ticket: {order?.ticketId.title}</p>
    </div>
  )
}

export default OrderShow
