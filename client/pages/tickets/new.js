import Router from 'next/router'
import { useState } from 'react'
import useRequest from '../../hooks/useRequest'

const NewTicket = () => {
  // HOOKS
  const [title, setTitle] = useState('')
  const [price, setPrice] = useState('')

  // FORMATTING
  const onBlur = () => {
    const value = parseFloat(price)

    // Do nothing if input is not a number
    if (isNaN(value)) {
      return
    }

    // Rounding number to two decimals
    setPrice(value.toFixed(2))
  }

  // HANDLERS
  const { doRequest, errors } = useRequest({
    url: '/api/tickets',
    method: 'post',
    body: {
      title,
      price,
    },
    onSuccess: () => Router.push('/'),
  })

  // SUBMITS
  const onSubmit = (e) => {
    e.preventDefault()

    doRequest()
  }

  return (
    <div>
      <h1>Create a ticket</h1>
      <form onSubmit={onSubmit}>
        <div className="form-group">
          <label>Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="form-control"
          />
        </div>
        <div className="form-group">
          <label>Price</label>
          <input
            value={price}
            onBlur={onBlur}
            onChange={(e) => setPrice(e.target.value)}
            className="form-control"
          />
        </div>
        {errors}
        <button className="btn btn-primary">Submit</button>
      </form>
    </div>
  )
}

export default NewTicket
