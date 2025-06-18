import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { Layout, message } from "antd";
import Header from "../../widgets/Header/Header";
import StatsCards from "../../widgets/StatsCards/StatsCards";
import QuickFilters from "../../widgets/QuickFilters/QuickFilters";
import Filters from "../../widgets/Filters/Filters";
import TransactionTable from "../../widgets/TransactionTable/TransactionTable";
import {
    fetchStats,
    fetchTransactions,
} from "../../features/transactions/transactionSlice";
import {
    fetchErrors,
    fetchFormTypes,
} from "../../features/reference/referenceSlice";
import { setLastUpdate } from "../../features/app/appSlice";
import styles from "./MainPage.module.scss";

const { Content } = Layout;

function MainPage() {
    const dispatch = useDispatch();

    useEffect(() => {
        // Загружаем начальные данные
        const loadInitialData = async () => {
            try {
                await Promise.all([
                    dispatch(fetchStats()),
                    dispatch(fetchErrors()),
                    dispatch(fetchFormTypes()),
                    dispatch(fetchTransactions({ page: 1, limit: 10 })),
                ]);

                dispatch(setLastUpdate());
            } catch (error) {
                message.error("Failed to load initial data", 2);
            }
        };

        loadInitialData();
    }, [dispatch]);

    return (
        <Layout className={styles.layout}>
            <Header />
            <Content className={styles.content}>
                <div className="container">
                    <StatsCards />
                    <QuickFilters />
                    <Filters />
                    <TransactionTable />
                </div>
            </Content>
        </Layout>
    );
}

export default MainPage;
