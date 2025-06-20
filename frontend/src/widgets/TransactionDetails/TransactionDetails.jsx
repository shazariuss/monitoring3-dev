import React, { useState } from "react";
import {
    Card,
    Descriptions,
    Tag,
    Space,
    Button,
    Tabs,
    Typography,
    Row,
    Col,
    Divider,
    Timeline,
    Alert,
} from "antd";
import {
    DownloadOutlined,
    FileTextOutlined,
    CodeOutlined,
    ClockCircleOutlined,
    CheckCircleOutlined,
    ExclamationCircleOutlined,
    SendOutlined,
    InfoCircleOutlined,
    HistoryOutlined,
} from "@ant-design/icons";
import CodeViewer from "../../shared/components/CodeViewer/CodeViewer";
import styles from "./TransactionDetails.module.scss";

const { Text, Title } = Typography;
const { TabPane } = Tabs;

function TransactionDetails({ transaction, onClose }) {
    const [activeTab, setActiveTab] = useState("overview");
    const [xmlData, setXmlData] = useState(null);
    const [jsonData, setJsonData] = useState(null);
    const [loading, setLoading] = useState(false);

    const loadFileData = async (fileName, type) => {
        if (!fileName) return;

        setLoading(true);
        try {
            const response = await fetch(
                `/api/files/content?file=${encodeURIComponent(
                    fileName
                )}&type=${type}`
            );

            if (!response.ok) {
                throw new Error(
                    `HTTP ${response.status}: ${response.statusText}`
                );
            }

            const data = await response.text();

            if (type === "xml") {
                setXmlData(data);
            } else {
                setJsonData(data);
            }
        } catch (error) {
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadFile = (fileName, type = "request") => {
        if (!fileName) return;

        const downloadUrl = `/api/files/download?file=${encodeURIComponent(
            fileName
        )}&type=${type}`;
        window.open(downloadUrl, "_blank");
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

    const formatAmount = (amount, currency) => {
        if (!amount) return "-";

        const formattedAmount = new Intl.NumberFormat("ru-RU", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amount);

        return currency ? `${formattedAmount} ${currency}` : formattedAmount;
    };

    const getDirectionInfo = (direction) => {
        const directionMap = {
            1: { name: "Входящий", color: "green", icon: <DownloadOutlined /> },
            2: { name: "Исходящий", color: "blue", icon: <SendOutlined /> },
        };
        return (
            directionMap[direction] || {
                name: `Направление ${direction}`,
                color: "default",
                icon: <InfoCircleOutlined />,
            }
        );
    };

    const getQueryStatusInfo = (state, statusName) => {
        if (statusName) {
            return { name: statusName, color: "processing" };
        }

        const statusMap = {
            0: { name: "Инициализация", color: "blue" },
            1: { name: "В обработке", color: "processing" },
            5: { name: "Отбракован", color: "error" },
            6: { name: "Авторизован", color: "success" },
            7: { name: "Принят", color: "success" },
            8: { name: "Отправлен", color: "processing" },
            9: { name: "Завершен", color: "success" },
        };

        return (
            statusMap[state] || { name: `Статус ${state}`, color: "default" }
        );
    };

    const getProcessingTimeline = () => {
        const events = [];

        if (transaction.init_time) {
            events.push({
                time: transaction.init_time,
                title: "Инициализация",
                icon: <ClockCircleOutlined />,
                color: "blue",
            });
        }

        if (transaction.send_time) {
            events.push({
                time: transaction.send_time,
                title: "Отправлено",
                icon: <SendOutlined />,
                color: "processing",
            });
        }

        if (transaction.res_time) {
            events.push({
                time: transaction.res_time,
                title: "Получен ответ",
                icon: <CheckCircleOutlined />,
                color: "success",
            });
        }

        if (transaction.error && transaction.error !== 0) {
            events.push({
                time: transaction.init_time,
                title: "Ошибка обработки",
                icon: <ExclamationCircleOutlined />,
                color: "red",
                description:
                    transaction.error_description ||
                    `Код ошибки: ${transaction.error}`,
            });
        }

        return events.sort((a, b) => new Date(a.time) - new Date(b.time));
    };

    const directionInfo = getDirectionInfo(transaction.direction);
    const statusInfo = getQueryStatusInfo(
        transaction.conv_state,
        transaction.conv_status_name
    );
    const timeline = getProcessingTimeline();

    const hasJsonData =
        transaction.json_data && transaction.json_data.length > 0;

    const getJsonData = () => {
        if (jsonData) return jsonData;
        if (
            transaction.json_data &&
            typeof transaction.json_data === "string"
        ) {
            try {
                const parsed = JSON.parse(transaction.json_data);
                return JSON.stringify(parsed, null, 2);
            } catch (e) {
                return transaction.json_data;
            }
        }

        return JSON.stringify(transaction, null, 2);
    };

    const hasXmlData = transaction.xml_data && transaction.xml_data.length > 0;
    const getXmlData = () => {
        if (xmlData) return xmlData;
        if (transaction.xml_data && typeof transaction.xml_data === "string") {
            return transaction.xml_data;
        }
        return null;
    };

    return (
        <div className={styles.transactionDetails}>
            <Tabs
                activeKey={activeTab}
                onChange={setActiveTab}
                className={styles.tabs}
            >
                {/* Обзор */}
                <TabPane
                    tab={
                        <Space>
                            <InfoCircleOutlined />
                            <span>Обзор</span>
                        </Space>
                    }
                    key="overview"
                >
                    <Row gutter={[16, 16]}>
                        <Col span={12}>
                            <Card title="Основная информация" size="small">
                                <Descriptions bordered size="small" column={1}>
                                    <Descriptions.Item label="ID транзакции">
                                        <Text code>{transaction.id}</Text>
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Message ID">
                                        <Text code>
                                            {transaction.message_id || "-"}
                                        </Text>
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Тип">
                                        <Space direction="vertical" size={2}>
                                            <Tag color="blue">
                                                {transaction.type}
                                            </Tag>
                                            <Text style={{ fontSize: "12px" }}>
                                                {transaction.type_description ||
                                                    transaction.type_short_title}
                                            </Text>
                                        </Space>
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Направление">
                                        <Tag
                                            color={directionInfo.color}
                                            icon={directionInfo.icon}
                                        >
                                            {directionInfo.name}
                                        </Tag>
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Статус">
                                        <Tag color={statusInfo.color}>
                                            {statusInfo.name}
                                        </Tag>
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Референс">
                                        <Text code>
                                            {transaction.reference_ || "-"}
                                        </Text>
                                    </Descriptions.Item>
                                </Descriptions>
                            </Card>
                        </Col>

                        <Col span={12}>
                            <Card title="Временная линия" size="small">
                                <Timeline>
                                    {timeline.map((event, index) => (
                                        <Timeline.Item
                                            key={index}
                                            dot={event.icon}
                                            color={event.color}
                                        >
                                            <div>
                                                <Text strong>
                                                    {event.title}
                                                </Text>
                                                <br />
                                                <Text
                                                    type="secondary"
                                                    style={{ fontSize: "12px" }}
                                                >
                                                    {formatDateTime(event.time)}
                                                </Text>
                                                {event.description && (
                                                    <>
                                                        <br />
                                                        <Text
                                                            type="danger"
                                                            style={{
                                                                fontSize:
                                                                    "11px",
                                                            }}
                                                        >
                                                            {event.description}
                                                        </Text>
                                                    </>
                                                )}
                                            </div>
                                        </Timeline.Item>
                                    ))}
                                </Timeline>
                            </Card>
                        </Col>
                    </Row>

                    {/* Участники платежа */}
                    {(transaction.payer ||
                        transaction.receiver ||
                        transaction.amount) && (
                        <Card
                            title="Информация о платеже"
                            style={{ marginTop: 16 }}
                            size="small"
                        >
                            <Row gutter={[16, 8]}>
                                {transaction.payer && (
                                    <Col span={8}>
                                        <Text type="secondary">
                                            Плательщик:
                                        </Text>
                                        <br />
                                        <Text strong>{transaction.payer}</Text>
                                    </Col>
                                )}
                                {transaction.receiver && (
                                    <Col span={8}>
                                        <Text type="secondary">
                                            Получатель:
                                        </Text>
                                        <br />
                                        <Text strong>
                                            {transaction.receiver}
                                        </Text>
                                    </Col>
                                )}
                                {transaction.amount && (
                                    <Col span={8}>
                                        <Text type="secondary">Сумма:</Text>
                                        <br />
                                        <Text
                                            strong
                                            style={{
                                                fontSize: "16px",
                                                color: "#1890ff",
                                            }}
                                        >
                                            {formatAmount(
                                                transaction.amount,
                                                transaction.currency
                                            )}
                                        </Text>
                                    </Col>
                                )}
                            </Row>
                        </Card>
                    )}

                    {/* Ошибка если есть */}
                    {transaction.error && transaction.error !== 0 && (
                        <Alert
                            style={{ marginTop: 16 }}
                            message={`Ошибка обработки (Код: ${transaction.error})`}
                            description={
                                transaction.error_description ||
                                transaction.error_message
                            }
                            type="error"
                            showIcon
                        />
                    )}

                    {/* Детальная информация */}
                    <Card
                        title="Детальная информация"
                        style={{ marginTop: 16 }}
                        size="small"
                    >
                        <Descriptions bordered size="small" column={2}>
                            <Descriptions.Item label="Время создания">
                                {formatDateTime(transaction.init_time)}
                            </Descriptions.Item>
                            <Descriptions.Item label="Время отправки">
                                {formatDateTime(transaction.send_time)}
                            </Descriptions.Item>
                            <Descriptions.Item label="Время ответа">
                                {formatDateTime(transaction.res_time)}
                            </Descriptions.Item>
                            <Descriptions.Item label="Файл запроса">
                                <Space>
                                    <Text code style={{ fontSize: "11px" }}>
                                        {transaction.file_name || "-"}
                                    </Text>
                                    {/* {transaction.file_name && (
                                        <Button
                                            type="link"
                                            size="small"
                                            icon={<DownloadOutlined />}
                                            onClick={() =>
                                                handleDownloadFile(
                                                    transaction.file_name,
                                                    "request"
                                                )
                                            }
                                        >
                                            Скачать
                                        </Button>
                                    )} */}
                                </Space>
                            </Descriptions.Item>
                            <Descriptions.Item label="Файл ответа">
                                <Space>
                                    <Text code style={{ fontSize: "11px" }}>
                                        {transaction.res_file_name || "-"}
                                    </Text>
                                    {transaction.res_file_name && (
                                        <Button
                                            type="link"
                                            size="small"
                                            icon={<DownloadOutlined />}
                                            onClick={() =>
                                                handleDownloadFile(
                                                    transaction.res_file_name,
                                                    "response"
                                                )
                                            }
                                        >
                                            Скачать
                                        </Button>
                                    )}
                                </Space>
                            </Descriptions.Item>
                        </Descriptions>
                    </Card>
                </TabPane>

                {/* Хронология */}
                {/* <TabPane
                    tab={
                        <Space>
                            <HistoryOutlined />
                            <span>Хронология</span>
                        </Space>
                    }
                    key="timeline"
                >
                    <Card title="Хронология обработки" size="small">
                        <Timeline>
                            {timeline.map((event, index) => (
                                <Timeline.Item
                                    key={index}
                                    dot={event.icon}
                                    color={event.color}
                                >
                                    <div>
                                        <Text strong>{event.title}</Text>
                                        <br />
                                        <Text
                                            type="secondary"
                                            style={{ fontSize: "12px" }}
                                        >
                                            {formatDateTime(event.time)}
                                        </Text>
                                        <br />

                                        {event.description && (
                                            <>
                                                <br />
                                                <Text
                                                    type="danger"
                                                    style={{ fontSize: "11px" }}
                                                >
                                                    {event.description}
                                                </Text>
                                            </>
                                        )}
                                    </div>
                                </Timeline.Item>
                            ))}
                        </Timeline>
                    </Card>
                </TabPane> */}

                {/* JSON данные */}
                <TabPane
                    tab={
                        <Space>
                            <FileTextOutlined />
                            <span>Данные JSON</span>
                            {hasJsonData && (
                                <Tag color="green" size="small">
                                    Доступно
                                </Tag>
                            )}
                        </Space>
                    }
                    key="json"
                >
                    <div className={styles.tabContent}>
                        {hasJsonData ? (
                            <CodeViewer
                                code={getJsonData()}
                                language="json"
                                title="Исходные данные JSON"
                                fileName={`transaction-${transaction.id}-json`}
                                height="600px"
                            />
                        ) : (
                            <Alert
                                type="info"
                                message="Данные JSON недоступны"
                                description="У этой транзакции отсутствуют исходные данные JSON."
                                showIcon
                                // action={
                                //     transaction.file_name && (
                                //         <Button
                                //             size="small"
                                //             onClick={() =>
                                //                 loadFileData(
                                //                     transaction.file_name,
                                //                     "json"
                                //                 )
                                //             }
                                //             loading={loading}
                                //         >
                                //             Попробовать загрузить из файла
                                //         </Button>
                                //     )
                                // }
                            />
                        )}
                    </div>
                </TabPane>

                {/* XML данные */}
                <TabPane
                    tab={
                        <Space>
                            <CodeOutlined />
                            <span>Данные XML</span>
                            {hasXmlData && (
                                <Tag color="green" size="small">
                                    Доступно
                                </Tag>
                            )}
                        </Space>
                    }
                    key="xml"
                >
                    <div className={styles.tabContent}>
                        {hasXmlData ? (
                            <CodeViewer
                                code={getXmlData()}
                                language="xml"
                                title="Исходные данные XML"
                                fileName={`transaction-${transaction.id}-xml`}
                                height="600px"
                            />
                        ) : (
                            <Alert
                                type="info"
                                message="Данные XML недоступны"
                                description="У этой транзакции отсутствуют исходные данные XML."
                                showIcon
                                // action={
                                //     transaction.file_name && (
                                //         <Button
                                //             size="small"
                                //             onClick={() =>
                                //                 loadFileData(
                                //                     transaction.file_name,
                                //                     "xml"
                                //                 )
                                //             }
                                //             loading={loading}
                                //         >
                                //             Попробовать загрузить из файла
                                //         </Button>
                                //     )
                                // }
                            />
                        )}
                    </div>
                </TabPane>

                {/* Полные данные транзакции */}
                <TabPane
                    tab={
                        <Space>
                            <CodeOutlined />
                            <span>Полные данные</span>
                        </Space>
                    }
                    key="raw"
                >
                    <div className={styles.tabContent}>
                        <CodeViewer
                            code={JSON.stringify(transaction, null, 2)}
                            language="json"
                            title="Полные данные транзакции"
                            fileName={`transaction-${transaction.id}-full`}
                            height="600px"
                        />
                    </div>
                </TabPane>
            </Tabs>
        </div>
    );
}

export default TransactionDetails;
