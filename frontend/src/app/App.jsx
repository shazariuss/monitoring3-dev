import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { Layout } from 'antd'
import MainPage from '../pages/MainPage/MainPage'
import styles from './App.module.scss'

const { Content } = Layout

function App() {
  return (
    <Layout className={styles.layout}>
      <Content className={styles.content}>
        <Routes>
          <Route path="/" element={<MainPage />} />
        </Routes>
      </Content>
    </Layout>
  )
}

export default App