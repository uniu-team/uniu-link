import api from './client'

export async function getDashboardStats(granularity: 'hourly' | 'daily' = 'hourly') {
  const res = await api.get('/stats', { params: { granularity } })
  return res.data
}
