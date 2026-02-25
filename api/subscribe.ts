import type { VercelRequest, VercelResponse } from '@vercel/node'

const allowCors = (fn: (req: VercelRequest, res: VercelResponse) => Promise<VercelResponse>) =>
  async (req: VercelRequest, res: VercelResponse) => {
    res.setHeader('Access-Control-Allow-Credentials', 'true')
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'POST')
    res.setHeader(
      'Access-Control-Allow-Headers',
      'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    )
    if (req.method === 'OPTIONS') {
      res.status(200).end()
      return
    }
    if (req.method !== 'POST') {
      res.status(405).json('Method not allowed').end()
      return
    }
    return await fn(req, res)
  }

const handler = async (req: VercelRequest, res: VercelResponse) => {
  const { listId, email } = req.body

  if (!listId || !email) {
    return res.json({ message: 'Missing listId or email', status: 400 })
  }

  const ITERABLE_API_KEY = process.env.ITERABLE_API_KEY

  try {
    const response = await fetch('https://api.iterable.com/api/lists/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Api-Key': ITERABLE_API_KEY || ''
      },
      body: JSON.stringify({
        listId: Number(listId),
        subscribers: [{
          email: email,
        }]
      })
    });
    const data = await response.json()
    return res.json({ message: 'Successfully subscribed.', status: 200, data })
  } catch (error: any) {
    const errorMessage = error.response?.data?.errors || error.message || 'Request failed'
    return res.json({ message: errorMessage, status: 500 })
  }
}

export default allowCors(handler)
