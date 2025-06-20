import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    Table,
    Tag,
    Space,
    Typography,
    Tooltip,
    Button,
    Modal,
    Spin,
    Alert,
} from "antd";
import {
    ExclamationCircleOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    SyncOutlined,
    SendOutlined,
    QuestionCircleOutlined,
    EyeOutlined,
    ReloadOutlined,
    DownloadOutlined,
} from "@ant-design/icons";
import {
    fetchTransactions,
    setPage,
    setPageSize,
} from "../../features/transactions/transactionSlice";
import {
    setPage as setFiltersPage,
    setLimit as setFiltersLimit,
} from "../../features/filters/filtersSlice";
import useMessageStates from "../../shared/hooks/useMessageStates";
import useQueryStates from "../../shared/hooks/useQueryStates";

import TransactionDetails from "../TransactionDetails/TransactionDetails";
import styles from "./TransactionTable.module.scss";

const { Text, Title } = Typography;

function TransactionTable() {
    const dispatch = useDispatch();
    const { data, loading, error, pagination } = useSelector(
        (state) => state.transactions
    );
    const filters = useSelector((state) => state.filters);
    const { messageStates } = useMessageStates();
    const { queryStates } = useQueryStates();

    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [detailsVisible, setDetailsVisible] = useState(false);

    useEffect(() => {
        const searchFilters = {
            page: filters.page || 1,
            limit: filters.limit || 10,
            dateFrom: filters.dateFrom,
            dateTo: filters.dateTo,
            status: filters.status,
            type: filters.type,
            search: filters.search,
            errorsOnly: filters.errorsOnly,
        };

        dispatch(fetchTransactions(searchFilters));
    }, [dispatch, filters]);

    const getQueryStatusInfo = (state, statusName, statusColor) => {
        if (statusName) {
            return {
                name: statusName,
                color: statusColor || getDefaultStatusColor(state),
                icon: getStatusIcon(state),
            };
        }

        const statusMap = {
            0: {
                name: "Инициализация",
                color: "blue",
                icon: <ClockCircleOutlined />,
            },
            1: {
                name: "В обработке",
                color: "processing",
                icon: <SyncOutlined spin />,
            },
            2: {
                name: "Валидация",
                color: "warning",
                icon: <ExclamationCircleOutlined />,
            },
            3: {
                name: "Проверка",
                color: "processing",
                icon: <SyncOutlined />,
            },
            4: {
                name: "Подготовка",
                color: "processing",
                icon: <SyncOutlined />,
            },
            5: {
                name: "Отбракован",
                color: "error",
                icon: <ExclamationCircleOutlined />,
            },
            6: {
                name: "Авторизован",
                color: "success",
                icon: <CheckCircleOutlined />,
            },
            7: {
                name: "Принят",
                color: "success",
                icon: <CheckCircleOutlined />,
            },
            8: {
                name: "Отправлен",
                color: "processing",
                icon: <SendOutlined />,
            },
            9: {
                name: "Завершен",
                color: "success",
                icon: <CheckCircleOutlined />,
            },
        };

        return (
            statusMap[state] || {
                name: `Статус ${state}`,
                color: "default",
                icon: <QuestionCircleOutlined />,
            }
        );
    };

    const getMessageStatusInfo = (status) => {
        const messageState = messageStates.find(
            (state) => state.code === status
        );

        if (messageState) {
            return {
                name: messageState.name,
                color:
                    messageState.color || getDefaultMessageStatusColor(status),
            };
        }

        const statusMap = {
            7: { name: "Отправлено", color: "success" },
            9: { name: "Завершено", color: "success" },
            11: { name: "Отклонено", color: "error" },
        };

        return (
            statusMap[status] || {
                name: status ? `Статус ${status}` : "Нет статуса",
                color: "default",
            }
        );
    };

    const getStatusIcon = (state) => {
        const iconMap = {
            0: <ClockCircleOutlined />,
            1: <SyncOutlined spin />,
            2: <ExclamationCircleOutlined />,
            3: <SyncOutlined />,
            4: <SyncOutlined />,
            5: <ExclamationCircleOutlined />,
            6: <CheckCircleOutlined />,
            7: <CheckCircleOutlined />,
            8: <SendOutlined />,
            9: <CheckCircleOutlined />,
        };
        return iconMap[state] || <QuestionCircleOutlined />;
    };

    const getDefaultStatusColor = (state) => {
        const colorMap = {
            0: "blue",
            1: "processing",
            2: "warning",
            3: "processing",
            4: "processing",
            5: "error",
            6: "success",
            7: "success",
            8: "processing",
            9: "success",
        };
        return colorMap[state] || "default";
    };

    const getDefaultMessageStatusColor = (status) => {
        const colorMap = {
            7: "success",
            9: "success",
            11: "error",
        };
        return colorMap[status] || "default";
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return "-";
        try {
            const date = new Date(dateString);
            return date.toLocaleString("ru-RU", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
            });
        } catch (error) {
            return dateString;
        }
    };

    const getDirectionInfo = (direction) => {
        const directionMap = {
            1: { name: "Входящий", color: "green" },
            2: { name: "Исходящий", color: "blue" },
        };
        return (
            directionMap[direction] || {
                name: `Направление ${direction}`,
                color: "default",
            }
        );
    };

    const handleViewDetails = (record) => {
        setSelectedTransaction(record);
        setDetailsVisible(true);
    };

    const handleDownloadFile = (fileName, type = "request") => {
        if (!fileName) return;

        const downloadUrl = `/api/files/download?file=${encodeURIComponent(
            fileName
        )}&type=${type}`;
        window.open(downloadUrl, "_blank");
    };

    const handleRefresh = () => {
        const searchFilters = {
            page: filters.page || 1,
            limit: filters.limit || 10,
            dateFrom: filters.dateFrom,
            dateTo: filters.dateTo,
            status: filters.status,
            type: filters.type,
            search: filters.search,
            errorsOnly: filters.errorsOnly,
        };

        dispatch(fetchTransactions(searchFilters));
    };

    const handlePageChange = (page, pageSize) => {
        dispatch(setFiltersPage(page));
        if (pageSize !== filters.limit) {
            dispatch(setFiltersLimit(pageSize));
        }
    };

    const handlePageSizeChange = (current, size) => {
        dispatch(setFiltersLimit(size));
        dispatch(setFiltersPage(1));
    };

    const columns = [
        {
            title: "ID",
            dataIndex: "id",
            key: "id",
            width: 60,
            fixed: "left",
            align: "center",
            render: (text) => (
                <Text code style={{ fontSize: "16px" }}>
                    {text}
                </Text>
            ),
        },
        {
            title: "Время создания",
            dataIndex: "init_time",
            key: "init_time",
            align: "center",
            width: 60,
            render: (text) => (
                <Text style={{ fontSize: "12px" }}>{formatDateTime(text)}</Text>
            ),
        },
        {
            title: "Тип",
            dataIndex: "type",
            key: "type",
            width: 60,
            align: "center",
            render: (text, record) => (
                <Space direction="vertical" size={1}>
                    <Tag color="blue" style={{ fontSize: "10px" }}>
                        {text}
                    </Tag>
                    {record.type_short_title && (
                        <Text type="secondary" style={{ fontSize: "9px" }}>
                            {record.type_short_title}
                        </Text>
                    )}
                </Space>
            ),
        },
        {
            title: "Направление",
            dataIndex: "direction",
            key: "direction",
            width: 60,
            align: "center",

            render: (direction) => {
                const directionInfo = getDirectionInfo(direction);
                return (
                    <Tag
                        color={directionInfo.color}
                        style={{ fontSize: "12px" }}
                    >
                        {directionInfo.name}
                    </Tag>
                );
            },
        },
        {
            title: "Статус",
            key: "status",
            width: 180,
            render: (_, record) => {
                const queryStatusInfo = getQueryStatusInfo(
                    record.conv_state,
                    record.conv_status_name,
                    record.conv_status_color
                );
                const messageStatusInfo = getMessageStatusInfo(
                    record.message_status
                );
                const hasError = record.error && record.error !== 0;

                return (
                    <Space direction="vertical" size={2}>
                        {/* Статус обработки (из CONV_QUERIES) */}
                        <div>
                            <Text type="secondary" style={{ fontSize: "12px" }}>
                                Обработка:
                            </Text>
                            <Tag
                                icon={queryStatusInfo.icon}
                                color={queryStatusInfo.color}
                                style={{ fontSize: "12px", marginLeft: 4 }}
                            >
                                {queryStatusInfo.name}
                            </Tag>
                        </div>

                        {/* Статус сообщения (из MESSAGES) если есть */}
                        {record.message_status && (
                            <div>
                                <Text
                                    type="secondary"
                                    style={{ fontSize: "12px" }}
                                >
                                    Сообщение:
                                </Text>
                                <Tag
                                    color={messageStatusInfo.color}
                                    style={{ fontSize: "9px", marginLeft: 4 }}
                                >
                                    {messageStatusInfo.name}
                                </Tag>
                            </div>
                        )}

                        {/* Ошибка если есть */}
                        {hasError && (
                            <Tooltip
                                title={
                                    record.error_description ||
                                    `Ошибка: ${record.error}`
                                }
                            >
                                <Tag
                                    icon={<ExclamationCircleOutlined />}
                                    color="red"
                                    size="small"
                                    style={{ fontSize: "12px" }}
                                >
                                    Ошибка: {record.error}
                                </Tag>
                            </Tooltip>
                        )}
                    </Space>
                );
            },
        },
        {
            title: "Референс",
            dataIndex: "reference_",
            key: "reference",
            width: 140,
            render: (text) => (
                <Text code style={{ fontSize: "11px" }}>
                    {text || "-"}
                </Text>
            ),
        },

        {
            title: "Действия",
            key: "actions",
            width: 60,
            fixed: "right",
            align: "center",
            render: (_, record) => (
                <Button
                    type="primary"
                    size="small"
                    icon={<EyeOutlined />}
                    onClick={() => handleViewDetails(record)}
                >
                    Детали
                </Button>
            ),
        },
    ];

    const paginationConfig = {
        current: filters.page || 1,
        pageSize: filters.limit || 10,
        total: pagination?.total || 0,
        showSizeChanger: false,
        showTotal: (total, range) =>
            `${range[0]}-${range[1]} из ${total} записей`,
        onChange: handlePageChange,
        onShowSizeChange: handlePageSizeChange,
    };

    if (error) {
        return (
            <Alert
                message="Ошибка загрузки данных"
                description={error}
                type="error"
                showIcon
                action={
                    <Button size="small" onClick={handleRefresh}>
                        Повторить
                    </Button>
                }
            />
        );
    }

    return (
        <div className={styles.transactionTable}>
            {/* Заголовок с кнопкой обновления */}
            <div className={styles.header}>
                <Title level={4} style={{ margin: 0 }}>
                    Транзакции SWIFT
                </Title>
                <Space>
                    <Text type="secondary" style={{ fontSize: "12px" }}>
                        Обновлено: {new Date().toLocaleTimeString("ru-RU")}
                    </Text>
                    <Button
                        icon={<ReloadOutlined />}
                        onClick={handleRefresh}
                        loading={loading}
                        size="small"
                    >
                        Обновить
                    </Button>
                </Space>
            </div>

            {/* Основная таблица */}
            <Table
                columns={columns}
                dataSource={data}
                loading={loading}
                pagination={paginationConfig}
                scroll={{ x: 1200, y: 600 }}
                size="small"
                rowKey="id"
                className={styles.table}
            />

            {/* Модальное окно с TransactionDetails компонентом */}
            <Modal
                title={`Детали транзакции #${selectedTransaction?.id}`}
                open={detailsVisible}
                onCancel={() => setDetailsVisible(false)}
                footer={null}
                width="90%"
                style={{ top: 20 }}
                bodyStyle={{
                    padding: 0,
                    maxHeight: "calc(100vh - 200px)",
                    overflow: "auto",
                }}
            >
                {selectedTransaction && (
                    <TransactionDetails
                        transaction={selectedTransaction}
                        onClose={() => setDetailsVisible(false)}
                    />
                )}
            </Modal>
        </div>
    );
}

export default TransactionTable;
