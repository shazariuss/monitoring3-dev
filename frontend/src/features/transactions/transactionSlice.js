import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

// Async thunk для загрузки транзакций
export const fetchTransactions = createAsyncThunk(
  'transactions/fetchTransactions',
  async (params = {}, { rejectWithValue }) => {
    try {
      // Очищаем параметры от null и пустых значений
      const cleanParams = {}
      
      Object.keys(params).forEach(key => {
        const value = params[key]
        if (value !== null && 
            value !== undefined && 
            value !== '' && 
            value !== 'null' && 
            value !== 'undefined') {
          cleanParams[key] = value
        }
      })
      
      console.log('📡 Fetching transactions with cleaned params:', cleanParams)
      
      const queryString = new URLSearchParams(cleanParams).toString()
      const url = `/api/transactions${queryString ? `?${queryString}` : ''}`
      
      console.log('🌐 Request URL:', url)
      
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      
      console.log('✅ Transactions loaded:', {
        count: data.data?.length || 0,
        total: data.pagination?.total || 0,
        page: data.pagination?.current || 1
      })
      
      return data
    } catch (error) {
      console.error('❌ Error fetching transactions:', error)
      return rejectWithValue(error.message)
    }
  }
)

// Async thunk для загрузки статистики
export const fetchStats = createAsyncThunk(
  'transactions/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      console.log('📊 Fetching transaction statistics...')
      
      const response = await fetch('/api/transactions/stats')
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      
      console.log('✅ Statistics loaded:', data)
      
      return data
    } catch (error) {
      console.error('❌ Error fetching stats:', error)
      return rejectWithValue(error.message)
    }
  }
)

const initialState = {
  transactions: {
    data: [],
    pagination: {
      current: 1,
      pageSize: 10,
      total: 0
    }
  },
  stats: {
    total: 0,
    errors: 0,
    pending: 0,
    success: 0
  },
  loading: false,
  statsLoading: false,
  error: null,
  lastUpdate: null,
  lastStatsUpdate: null
}

const transactionSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {
    clearTransactions: (state) => {
      state.transactions = {
        data: [],
        pagination: {
          current: 1,
          pageSize: 10,
          total: 0
        }
      }
      state.error = null
    },
    updateLastUpdate: (state) => {
      state.lastUpdate = new Date().toISOString()
    },
    clearStats: (state) => {
      state.stats = {
        total: 0,
        errors: 0,
        pending: 0,
        success: 0
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Транзакции
      .addCase(fetchTransactions.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.loading = false
        state.transactions = action.payload
        state.error = null
        state.lastUpdate = new Date().toISOString()
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        console.error('Transaction fetch failed:', action.payload)
      })
      // Статистика
      .addCase(fetchStats.pending, (state) => {
        state.statsLoading = true
      })
      .addCase(fetchStats.fulfilled, (state, action) => {
        state.statsLoading = false
        state.stats = action.payload
        state.lastStatsUpdate = new Date().toISOString()
      })
      .addCase(fetchStats.rejected, (state, action) => {
        state.statsLoading = false
        console.error('Stats fetch failed:', action.payload)
      })
  }
})

export const { clearTransactions, updateLastUpdate, clearStats } = transactionSlice.actions
export default transactionSlice.reducer