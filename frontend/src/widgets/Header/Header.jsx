import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    Layout,
    Typography,
    Button,
    Space,
    Badge,
    Switch,
    Select,
    Tooltip,
    Tag,
} from "antd";
import {
    ReloadOutlined,
    DownloadOutlined,
    ClockCircleOutlined,
    WifiOutlined,
    UserOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import {
    fetchTransactions,
    fetchStats,
} from "../../features/transactions/transactionSlice";
import {
    setLastUpdate,
    toggleAutoRefresh,
    setRefreshInterval,
    setOnlineStatus,
} from "../../features/app/appSlice";
import useAutoRefresh from "../../shared/hooks/useAutoRefresh";
import ExportModal from "../ExportModal/ExportModal";
import styles from "./Header.module.scss";

dayjs.extend(relativeTime);

const { Header: AntHeader } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;

function Header() {
    const dispatch = useDispatch();
    const { lastUpdate, autoRefresh, refreshInterval, isOnline } = useSelector(
        (state) => state.app
    );
    const { loading } = useSelector((state) => state.transactions);
    const [exportModalVisible, setExportModalVisible] = useState(false);

    // Используем хук авто-обновления
    const { refreshData } = useAutoRefresh();

    // Проверяем статус подключения
    useEffect(() => {
        const handleOnline = () => dispatch(setOnlineStatus(true));
        const handleOffline = () => dispatch(setOnlineStatus(false));

        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);

        return () => {
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
        };
    }, [dispatch]);

    const handleManualRefresh = () => {
        refreshData();
    };

    const handleExport = () => {
        setExportModalVisible(true);
    };

    const handleAutoRefreshToggle = (checked) => {
        dispatch(toggleAutoRefresh());
    };

    const handleIntervalChange = (value) => {
        dispatch(setRefreshInterval(value));
    };

    const getStatusBadge = () => {
        if (!isOnline) {
            return <Badge status="error" text="Offline" />;
        }
        if (loading) {
            return <Badge status="processing" text="Updating..." />;
        }
        return <Badge status="success" text="Live" />;
    };

    const intervalOptions = [
        { value: 10000, label: "10s" },
        { value: 30000, label: "30s" },
        { value: 60000, label: "1m" },
        { value: 300000, label: "5m" },
    ];

    return (
        <>
            <AntHeader className={styles.header}>
                <div className="container">
                    <div className={styles.headerContent}>
                        <div className={styles.headerLeft}>
                            <Title level={2} className={styles.title}>
                                SWIFT Payment Monitor
                            </Title>
                            <Space className={styles.status} size="middle">
                                {getStatusBadge()}
                                <Text type="secondary">•</Text>
                                {lastUpdate && (
                                    <Tooltip
                                        title={`Last updated: ${dayjs(
                                            lastUpdate
                                        ).format("HH:mm:ss DD/MM/YYYY")}`}
                                    >
                                        <Space>
                                            <ClockCircleOutlined />
                                            <Text type="secondary">
                                                {dayjs(lastUpdate).fromNow()}
                                            </Text>
                                        </Space>
                                    </Tooltip>
                                )}
                            </Space>
                        </div>

                        <div className={styles.headerRight}>
                            <Space size="middle">
                                {/* Текущий пользователь */}
                                <Space>
                                    <UserOutlined />
                                    {/* <Text>tuitshoxrux</Text> */}
                                </Space>

                                {/* Статус подключения */}
                                <Tooltip
                                    title={isOnline ? "Online" : "Offline"}
                                >
                                    <WifiOutlined
                                        style={{
                                            color: isOnline
                                                ? "#52c41a"
                                                : "#ff4d4f",
                                            fontSize: "16px",
                                        }}
                                    />
                                </Tooltip>

                                {/* Настройки авто-обновления */}
                                <Space>
                                    <Text type="secondary">Auto-refresh:</Text>
                                    <Switch
                                        size="small"
                                        checked={autoRefresh}
                                        onChange={handleAutoRefreshToggle}
                                    />
                                    <Select
                                        size="small"
                                        value={refreshInterval}
                                        onChange={handleIntervalChange}
                                        style={{ width: 60 }}
                                        disabled={!autoRefresh}
                                    >
                                        {intervalOptions.map((option) => (
                                            <Option
                                                key={option.value}
                                                value={option.value}
                                            >
                                                {option.label}
                                            </Option>
                                        ))}
                                    </Select>
                                </Space>

                                {/* Кнопки */}
                                <Space>
                                    <Button
                                        icon={<ReloadOutlined spin={loading} />}
                                        onClick={handleManualRefresh}
                                        loading={loading}
                                        disabled={!isOnline}
                                    >
                                        Refresh
                                    </Button>
                                    <Button
                                        type="primary"
                                        icon={<DownloadOutlined />}
                                        onClick={handleExport}
                                    >
                                        Export
                                    </Button>
                                </Space>
                            </Space>
                        </div>
                    </div>
                </div>
            </AntHeader>

            <ExportModal
                visible={exportModalVisible}
                onCancel={() => setExportModalVisible(false)}
            />
        </>
    );
}

export default Header;
