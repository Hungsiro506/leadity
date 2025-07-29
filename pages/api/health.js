// Health check endpoint for Docker container monitoring
export default function handler(req, res) {
  if (req.method === 'GET') {
    return res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      service: 'leadity-loan-comparison'
    })
  }
  
  return res.status(405).json({ error: 'Method not allowed' })
} 