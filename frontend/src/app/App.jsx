import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "antd";
import MainPage from "../pages/MainPage/MainPage";
import styles from "./App.module.scss";

const { Content } = Layout;

function App() {
    return (
        <Layout className={styles.layout}>
            <Content className={styles.content}>
                <Routes>
                    <Route path="/" element={<MainPage />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Content>
        </Layout>
    );
}

export default App;
