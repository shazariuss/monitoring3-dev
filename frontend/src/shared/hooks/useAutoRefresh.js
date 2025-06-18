import { useEffect, useCallback } from 'react'
import { useDispatch } from 'react-redux'
import { fetchTransactions, fetchStats } from '../../features/transactions/transactionSlice'

const useAutoRefresh = (interval = 30000, enabled = true) => {
  const dispatch = useDispatch()

  const refreshData = useCallback(() => {
    if (!enabled) return
    
    console.log('🔄 Auto-refreshing data... Time:', new Date().toISOString())
    
    // Обновляем транзакции с текущими параметрами
    dispatch(fetchTransactions({ page: 1, limit: 10 }))
    
    // Обновляем статистику
    dispatch(fetchStats())
  }, [dispatch, enabled])

  useEffect(() => {
    if (!enabled) return

    console.log(`⏰ Setting up auto-refresh every ${interval}ms`)
    
    const intervalId = setInterval(refreshData, interval)

    return () => {
      console.log('🛑 Clearing auto-refresh interval')
      clearInterval(intervalId)
    }
  }, [refreshData, interval, enabled])

  return refreshData
}

export default useAutoRefresh