import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    Table,
    Card,
    Space,
    Button,
    Modal,
    message,
    Tooltip,
    Badge,
    Row,
    Col,
    Statistic,
    Typography,
    Tag,
} from "antd";
import {
    EyeOutlined,
    ReloadOutlined,
    ClockCircleOutlined,
    CheckCircleOutlined,
    ExclamationCircleOutlined,
    BugOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { fetchTransactions } from "../../features/transactions/transactionSlice";
import StatusBadge from "../../shared/components/StatusBadge/StatusBadge";
import DirectionBadge from "../../shared/components/DirectionBadge/DirectionBadge";
import TypeBadge from "../../shared/components/TypeBadge/TypeBadge";
import TransactionDetail from "./TransactionDetail/TransactionDetail";
import styles from "./TransactionTable.module.scss";

const { Text } = Typography;

function TransactionTable() {
    const dispatch = useDispatch();
    const { transactions, loading, lastUpdate } = useSelector(
        (state) => state.transactions
    );

    const filters = useSelector((state) => state.filters);

    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const [loadingDetail, setLoadingDetail] = useState(false);

    useEffect(() => {
        console.log("🔄 Filters changed, reloading transactions...");
        handleTableChange({ current: 1, pageSize: 10 });
    }, [filters]);

    const handleTableChange = (paginationConfig, filtersConfig, sorter) => {
        const params = {
            page: paginationConfig.current,
            limit: paginationConfig.pageSize,
            ...filters,
        };

        console.log("📋 Loading transactions with params:", params);
        dispatch(fetchTransactions(params));
    };

    const handleViewDetail = async (record) => {
        try {
            setLoadingDetail(true);
            setDetailModalVisible(true);

            console.log(`🔍 Loading transaction detail for ID: ${record.id}`);

            const response = await fetch(`/api/transactions/${record.id}`);

            if (!response.ok) {
                throw new Error(
                    `HTTP ${response.status}: ${response.statusText}`
                );
            }

            const transactionDetail = await response.json();

            console.log("✅ Transaction detail loaded:", {
                id: transactionDetail.id,
                hasJson: !!transactionDetail.json_data,
                hasXml: !!transactionDetail.xml_data,
            });

            setSelectedTransaction(transactionDetail);
        } catch (error) {
            console.error("❌ Error loading transaction detail:", error);
            message.error("Failed to load transaction details");
            setDetailModalVisible(false);
        } finally {
            setLoadingDetail(false);
        }
    };

    const handleCloseDetail = () => {
        setDetailModalVisible(false);
        setSelectedTransaction(null);
        setLoadingDetail(false);
    };

    // Безопасная функция подсчета ошибок
    const getErrorCount = () => {
        if (!transactions?.data || !Array.isArray(transactions.data)) {
            return 0;
        }
        return transactions.data.filter((t) => t.error && t.error !== 0).length;
    };

    // Безопасная функция подсчета успешных транзакций
    const getSuccessCount = () => {
        if (!transactions?.data || !Array.isArray(transactions.data)) {
            return 0;
        }
        return transactions.data.filter(
            (t) => t.state === 9 && (!t.error || t.error === 0)
        ).length;
    };

    // Безопасная функция подсчета обрабатываемых транзакций
    const getPendingCount = () => {
        if (!transactions?.data || !Array.isArray(transactions.data)) {
            return 0;
        }
        return transactions.data.filter((t) => [1, 2, 3].includes(t.state))
            .length;
    };

    // Безопасная функция получения общего количества
    const getTotalCount = () => {
        if (!transactions?.data || !Array.isArray(transactions.data)) {
            return 0;
        }
        return transactions.data.length;
    };

    const formatDateTime = (dateTime) => {
        if (!dateTime) return "N/A";
        return dayjs(dateTime).format("DD/MM/YYYY HH:mm:ss");
    };

    const columns = [
        {
            title: "ID",
            dataIndex: "id",
            key: "id",
            width: 120,
            render: (text) => <Text code>{text}</Text>,
            sorter: true,
        },
        {
            title: "Message ID",
            dataIndex: "message_id",
            key: "message_id",
            width: 150,
            render: (text) =>
                text ? (
                    <Text code>{text}</Text>
                ) : (
                    <Text type="secondary">N/A</Text>
                ),
        },
        {
            title: "Type",
            dataIndex: "type",
            key: "type",
            width: 200,
            render: (text, record) => (
                <TypeBadge
                    type={text}
                    typeDescription={record.type_description}
                />
            ),
        },
        {
            title: "Direction",
            dataIndex: "direction",
            key: "direction",
            width: 100,
            align: "center",
            render: (direction) => <DirectionBadge direction={direction} />,
        },
        {
            title: "Status",
            dataIndex: "state",
            key: "state",
            width: 120,
            align: "center",
            render: (state, record) => (
                <StatusBadge
                    state={state}
                    error={record.error}
                    errorMessage={record.error_message}
                />
            ),
        },
        {
            title: "Init Time",
            dataIndex: "init_time",
            key: "init_time",
            width: 180,
            render: (dateTime) => (
                <Tooltip title={formatDateTime(dateTime)}>
                    <Space direction="vertical" size={0}>
                        <Text style={{ fontSize: "12px" }}>
                            {dayjs(dateTime).format("DD/MM/YYYY")}
                        </Text>
                        <Text type="secondary" style={{ fontSize: "11px" }}>
                            {dayjs(dateTime).format("HH:mm:ss")}
                        </Text>
                    </Space>
                </Tooltip>
            ),
            sorter: true,
        },
        {
            title: "File Name",
            dataIndex: "file_name",
            key: "file_name",
            width: 200,
            render: (text) =>
                text ? (
                    <Tooltip title={text}>
                        <Text code style={{ fontSize: "11px" }}>
                            {text.length > 25
                                ? `${text.substring(0, 25)}...`
                                : text}
                        </Text>
                    </Tooltip>
                ) : (
                    <Text type="secondary">N/A</Text>
                ),
        },
        {
            title: "Reference",
            dataIndex: "reference_",
            key: "reference_",
            width: 150,
            render: (text) =>
                text ? (
                    <Text code>{text}</Text>
                ) : (
                    <Text type="secondary">N/A</Text>
                ),
        },
        {
            title: "Actions",
            key: "actions",
            width: 100,
            align: "center",
            render: (_, record) => (
                <Space>
                    <Tooltip title="View Details">
                        <Button
                            type="primary"
                            icon={<EyeOutlined />}
                            size="small"
                            onClick={() => handleViewDetail(record)}
                        />
                    </Tooltip>
                </Space>
            ),
        },
    ];

    return (
        <div className={styles.transactionTable}>
            {/* Statistics Cards */}
            {/* <Row gutter={16} className={styles.statsCards}>
                <Col xs={24} sm={12} md={6}>
                    <Card size="small" className={styles.statCard}>
                        <Statistic
                            title="Total Transactions"
                            value={getTotalCount()}
                            prefix={
                                <ClockCircleOutlined
                                    style={{ color: "#1890ff" }}
                                />
                            }
                            valueStyle={{ color: "#1890ff" }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card size="small" className={styles.statCard}>
                        <Statistic
                            title="Successful"
                            value={getSuccessCount()}
                            prefix={
                                <CheckCircleOutlined
                                    style={{ color: "#52c41a" }}
                                />
                            }
                            valueStyle={{ color: "#52c41a" }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card size="small" className={styles.statCard}>
                        <Statistic
                            title="Processing"
                            value={getPendingCount()}
                            prefix={
                                <ExclamationCircleOutlined
                                    style={{ color: "#faad14" }}
                                />
                            }
                            valueStyle={{ color: "#faad14" }}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card size="small" className={styles.statCard}>
                        <Statistic
                            title="Errors"
                            value={getErrorCount()}
                            prefix={
                                <BugOutlined style={{ color: "#ff4d4f" }} />
                            }
                            valueStyle={{ color: "#ff4d4f" }}
                        />
                    </Card>
                </Col>
            </Row> */}

            {/* Main Table */}
            <Card
                title={
                    <Space>
                        <Text strong>SWIFT Transactions</Text>
                        {/* <Text type="secondary" style={{ fontSize: '12px' }}>
              Current User: tuitshoxrux | Time: 2025-06-18 04:49:00 UTC
            </Text> */}
                        {lastUpdate && (
                            <Text type="secondary" style={{ fontSize: "12px" }}>
                                | Last updated:{" "}
                                {dayjs(lastUpdate).format(
                                    "HH:mm:ss DD/MM/YYYY"
                                )}
                            </Text>
                        )}
                    </Space>
                }
                extra={
                    <Space>
                        <Badge
                            status={loading ? "processing" : "success"}
                            text={loading ? "Loading..." : "Live"}
                        />
                        <Button
                            icon={<ReloadOutlined spin={loading} />}
                            onClick={() =>
                                handleTableChange({ current: 1, pageSize: 10 })
                            }
                            loading={loading}
                            size="small"
                        >
                            Refresh
                        </Button>
                    </Space>
                }
                size="small"
                className={styles.tableCard}
            >
                <Table
                    columns={columns}
                    dataSource={transactions?.data || []}
                    loading={loading}
                    pagination={{
                        current: transactions?.pagination?.current || 1,
                        pageSize: transactions?.pagination?.pageSize || 10,
                        total: transactions?.pagination?.total || 0,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total, range) =>
                            `${range[0]}-${range[1]} of ${total} transactions`,
                        pageSizeOptions: ["10", "20", "50", "100"],
                        size: "small",
                    }}
                    onChange={handleTableChange}
                    rowKey="id"
                    size="small"
                    scroll={{ x: 1200 }}
                    className={styles.transactionTableInner}
                />
            </Card>

            {/* Transaction Detail Modal */}
            <Modal
                title={
                    <Space>
                        <EyeOutlined />
                        <span>Transaction Details</span>
                        {selectedTransaction && (
                            <Tag color="blue">ID: {selectedTransaction.id}</Tag>
                        )}
                    </Space>
                }
                open={detailModalVisible}
                onCancel={handleCloseDetail}
                footer={null}
                width="90%"
                style={{ top: 20 }}
                className={styles.detailModal}
            >
                <TransactionDetail
                    transaction={selectedTransaction}
                    loading={loadingDetail}
                />
            </Modal>
        </div>
    );
}

export default TransactionTable;
