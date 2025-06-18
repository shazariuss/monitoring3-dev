import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  Card,
  Row,
  Col,
  DatePicker,
  Select,
  Input,
  Button,
  Space,
  Tag,
  Typography,
  Divider,
  Tooltip
} from 'antd'
import {
  SearchOutlined,
  ClearOutlined,
  CalendarOutlined,
  FilterOutlined,
  ClockCircleOutlined,
  BugOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons'
import dayjs from 'dayjs'
import {
  setDateFrom,
  setDateTo,
  setDateRange,
  setStatus,
  setType,
  setSearch,
  setErrorsOnly,
  setQuickFilter,
  clearFilters
} from '../../features/filters/filtersSlice'
import styles from './Filters.module.scss'

const { RangePicker } = DatePicker
const { Option } = Select
const { Search } = Input
const { Text } = Typography

function Filters() {
  const dispatch = useDispatch()
  const filters = useSelector(state => state.filters)
  
  const [localSearch, setLocalSearch] = useState(filters.search || '')

  const handleDateRangeChange = (dates) => {
    if (dates && dates.length === 2) {
      dispatch(setDateRange({
        dateFrom: dates[0].format('YYYY-MM-DD'),
        dateTo: dates[1].format('YYYY-MM-DD')
      }))
    } else {
      dispatch(setDateRange({ dateFrom: undefined, dateTo: undefined }))
    }
  }

  const handleSearchChange = (value) => {
    setLocalSearch(value)
    dispatch(setSearch(value))
  }

  const handleQuickFilter = (filterType) => {
    console.log(`🔍 Quick filter applied: ${filterType} by user: tuitshoxrux at 2025-06-18 04:52:12`)
    dispatch(setQuickFilter(filterType))
  }

  const handleClearFilters = () => {
    console.log('🧹 Filters cleared by user: tuitshoxrux at 2025-06-18 04:52:12')
    setLocalSearch('')
    dispatch(clearFilters())
  }

  const getActiveFiltersCount = () => {
    let count = 0
    if (filters.dateFrom || filters.dateTo) count++
    if (filters.status) count++
    if (filters.type) count++
    if (filters.search) count++
    if (filters.errorsOnly) count++
    return count
  }

  const statusOptions = [
    { value: '1', label: 'Pending', color: '#faad14' },
    { value: '2', label: 'Processing', color: '#1890ff' },
    { value: '3', label: 'Sent', color: '#722ed1' },
    { value: '9', label: 'Success', color: '#52c41a' },
    { value: '0', label: 'Failed', color: '#ff4d4f' }
  ]

  const typeOptions = [
    { value: 'pacs.008', label: 'FIToFICstmrCdtTrf (pacs.008)' },
    { value: 'pacs.002', label: 'FIToFIPmtStsRpt (pacs.002)' },
    { value: 'camt.056', label: 'FIToFICstmrCdtTrfCxlReq (camt.056)' },
    { value: 'camt.029', label: 'ResolutionOfInvestigation (camt.029)' }
  ]

  return (
    <Card 
      title={
        <Space>
          <FilterOutlined />
          <Text strong>Filters</Text>
          {getActiveFiltersCount() > 0 && (
            <Tag color="blue">{getActiveFiltersCount()} active</Tag>
          )}
          <Text type="secondary" style={{ fontSize: '12px' }}>
            User: tuitshoxrux | Time: 2025-06-18 04:52:12 UTC
          </Text>
        </Space>
      }
      extra={
        <Button
          type="text"
          icon={<ClearOutlined />}
          onClick={handleClearFilters}
          size="small"
          disabled={getActiveFiltersCount() === 0}
        >
          Clear All
        </Button>
      }
      size="small"
      className={styles.filtersCard}
    >
      {/* Quick Filters */}
      <div className={styles.quickFilters}>
        <Text strong style={{ marginRight: 16 }}>Quick Filters:</Text>
        <Space wrap>
          <Button
            type={filters.quickFilter === 'today' ? 'primary' : 'default'}
            size="small"
            icon={<CalendarOutlined />}
            onClick={() => handleQuickFilter('today')}
          >
            Today
          </Button>
          <Button
            type={filters.quickFilter === 'yesterday' ? 'primary' : 'default'}
            size="small"
            icon={<ClockCircleOutlined />}
            onClick={() => handleQuickFilter('yesterday')}
          >
            Yesterday
          </Button>
          <Button
            type={filters.quickFilter === 'last7days' ? 'primary' : 'default'}
            size="small"
            icon={<CalendarOutlined />}
            onClick={() => handleQuickFilter('last7days')}
          >
            Last 7 Days
          </Button>
          <Button
            type={filters.quickFilter === 'errors' ? 'primary' : 'default'}
            size="small"
            icon={<BugOutlined />}
            onClick={() => handleQuickFilter('errors')}
            danger={filters.quickFilter === 'errors'}
          >
            Errors Only
          </Button>
          <Button
            type={filters.quickFilter === 'pending' ? 'primary' : 'default'}
            size="small"
            icon={<ExclamationCircleOutlined />}
            onClick={() => handleQuickFilter('pending')}
          >
            Pending
          </Button>
          <Button
            type={filters.quickFilter === 'success' ? 'primary' : 'default'}
            size="small"
            icon={<CheckCircleOutlined />}
            onClick={() => handleQuickFilter('success')}
          >
            Success
          </Button>
          <Button
            type={filters.quickFilter === 'all' ? 'primary' : 'default'}
            size="small"
            onClick={() => handleQuickFilter('all')}
          >
            All
          </Button>
        </Space>
      </div>

      <Divider style={{ margin: '16px 0' }} />

      {/* Detailed Filters */}
      <Row gutter={16}>
        <Col xs={24} sm={12} md={8} lg={6}>
          <div className={styles.filterGroup}>
            <Text type="secondary" className={styles.filterLabel}>Date Range</Text>
            <RangePicker
              value={
                filters.dateFrom && filters.dateTo
                  ? [dayjs(filters.dateFrom), dayjs(filters.dateTo)]
                  : null
              }
              onChange={handleDateRangeChange}
              format="DD/MM/YYYY"
              size="small"
              style={{ width: '100%' }}
              placeholder={['From Date', 'To Date']}
            />
          </div>
        </Col>

        <Col xs={24} sm={12} md={8} lg={6}>
          <div className={styles.filterGroup}>
            <Text type="secondary" className={styles.filterLabel}>Status</Text>
            <Select
              value={filters.status}
              onChange={(value) => dispatch(setStatus(value))}
              placeholder="Select status"
              allowClear
              size="small"
              style={{ width: '100%' }}
            >
              {statusOptions.map(option => (
                <Option key={option.value} value={option.value}>
                  <Space>
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        backgroundColor: option.color
                      }}
                    />
                    {option.label}
                  </Space>
                </Option>
              ))}
            </Select>
          </div>
        </Col>

        <Col xs={24} sm={12} md={8} lg={6}>
          <div className={styles.filterGroup}>
            <Text type="secondary" className={styles.filterLabel}>Message Type</Text>
            <Select
              value={filters.type}
              onChange={(value) => dispatch(setType(value))}
              placeholder="Select type"
              allowClear
              size="small"
              style={{ width: '100%' }}
              showSearch
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
            >
              {typeOptions.map(option => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>
          </div>
        </Col>

        <Col xs={24} sm={12} md={8} lg={6}>
          <div className={styles.filterGroup}>
            <Text type="secondary" className={styles.filterLabel}>Search</Text>
            <Search
              value={localSearch}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Transaction ID, File Name, Reference..."
              allowClear
              size="small"
              enterButton={<SearchOutlined />}
              onSearch={handleSearchChange}
            />
          </div>
        </Col>
      </Row>

      {/* Active Filters Display */}
      {getActiveFiltersCount() > 0 && (
        <>
          <Divider style={{ margin: '16px 0' }} />
          <div className={styles.activeFilters}>
            <Text type="secondary" style={{ marginRight: 12 }}>Active Filters:</Text>
            <Space wrap>
              {(filters.dateFrom || filters.dateTo) && (
                <Tag 
                  closable 
                  onClose={() => dispatch(setDateRange({ dateFrom: undefined, dateTo: undefined }))}
                  color="blue"
                >
                  Date: {filters.dateFrom || '?'} - {filters.dateTo || '?'}
                </Tag>
              )}
              {filters.status && (
                <Tag 
                  closable 
                  onClose={() => dispatch(setStatus(undefined))}
                  color="green"
                >
                  Status: {statusOptions.find(s => s.value === filters.status)?.label}
                </Tag>
              )}
              {filters.type && (
                <Tag 
                  closable 
                  onClose={() => dispatch(setType(undefined))}
                  color="purple"
                >
                  Type: {filters.type}
                </Tag>
              )}
              {filters.search && (
                <Tag 
                  closable 
                  onClose={() => handleSearchChange('')}
                  color="orange"
                >
                  Search: "{filters.search}"
                </Tag>
              )}
              {filters.errorsOnly && (
                <Tag 
                  closable 
                  onClose={() => dispatch(setErrorsOnly(false))}
                  color="red"
                >
                  Errors Only
                </Tag>
              )}
            </Space>
          </div>
        </>
      )}
    </Card>
  )
}

export default Filters