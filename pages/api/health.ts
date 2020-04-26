import { NextApiRequest, NextApiResponse } from 'next'

type AliveContract = {
  alive: boolean,
  timestamp: Date
}

export default (req: NextApiRequest, res: NextApiResponse<AliveContract>) => {
  res.status(200).json({ alive: true, timestamp: new Date() })
}
