import React, { useState } from "react";
import {
    Tabs,
    Card,
    Descriptions,
    Tag,
    Space,
    Typography,
    Timeline,
    Alert,
    Row,
    Col,
    Statistic,
    Divider,
} from "antd";
import {
    InfoCircleOutlined,
    ClockCircleOutlined,
    CodeOutlined,
    HistoryOutlined,
    FileTextOutlined,
    BugOutlined,
    CheckCircleOutlined,
    ExclamationCircleOutlined,
    ReloadOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import StatusBadge from "../../../shared/components/StatusBadge/StatusBadge";
import DirectionBadge from "../../../shared/components/DirectionBadge/DirectionBadge";
import TypeBadge from "../../../shared/components/TypeBadge/TypeBadge";
import CodeViewer from "../../../shared/components/CodeViewer/CodeViewer";
import styles from "./TransactionDetail.module.scss";

const { TabPane } = Tabs;
const { Text, Title } = Typography;

function TransactionDetail({ transaction, loading }) {
    const [activeTab, setActiveTab] = useState("overview");

    if (loading) {
        return (
            <div className={styles.loading}>
                <ReloadOutlined
                    spin
                    style={{ fontSize: 32, color: "#1890ff" }}
                />
                <Text
                    type="secondary"
                    style={{ marginTop: 16, display: "block" }}
                >
                    Загрузка деталей транзакции...
                </Text>
            </div>
        );
    }

    if (!transaction) {
        return (
            <div className={styles.noData}>
                <ExclamationCircleOutlined
                    style={{ fontSize: 32, color: "#faad14" }}
                />
                <Text
                    type="secondary"
                    style={{ marginTop: 16, display: "block" }}
                >
                    Данные о транзакции отсутствуют
                </Text>
            </div>
        );
    }

    const formatDateTime = (dateTime) => {
        return dateTime ? dayjs(dateTime).format("DD/MM/YYYY HH:mm:ss") : "Н/Д";
    };

    const getProcessingTime = () => {
        if (transaction.init_time && transaction.send_time) {
            const init = dayjs(transaction.init_time);
            const send = dayjs(transaction.send_time);
            const diff = send.diff(init, "seconds");
            return `${diff}с`;
        }
        return "Н/Д";
    };

    const getTimelineData = () => {
        const timeline = [];

        if (transaction.init_time) {
            timeline.push({
                color: "blue",
                dot: <ClockCircleOutlined />,
                children: (
                    <div>
                        <Text strong>Транзакция инициирована</Text>
                        <br />
                        <Text type="secondary">
                            {formatDateTime(transaction.init_time)}
                        </Text>
                        <br />
                        {/* <Text type="secondary" style={{ fontSize: '11px' }}>
              User: User
            </Text> */}
                    </div>
                ),
            });
        }

        if (transaction.send_time) {
            timeline.push({
                color: transaction.error ? "red" : "green",
                dot: <ClockCircleOutlined />,
                children: (
                    <div>
                        <Text strong>Транзакция отправлена</Text>
                        <br />
                        <Text type="secondary">
                            {formatDateTime(transaction.send_time)}
                        </Text>
                        {transaction.error && (
                            <>
                                <br />
                                <Text
                                    type="danger"
                                    style={{ fontSize: "11px" }}
                                >
                                    Ошибка: {transaction.error_message}
                                </Text>
                            </>
                        )}
                    </div>
                ),
            });
        }

        if (transaction.res_time) {
            timeline.push({
                color: "green",
                dot: <CheckCircleOutlined />,
                children: (
                    <div>
                        <Text strong>Получен ответ</Text>
                        <br />
                        <Text type="secondary">
                            {formatDateTime(transaction.res_time)}
                        </Text>
                    </div>
                ),
            });
        }

        return timeline;
    };

    return (
        <div className={styles.transactionDetail}>
            <Tabs
                activeKey={activeTab}
                onChange={setActiveTab}
                type="card"
                className={styles.mainTabs}
            >
                <TabPane
                    tab={
                        <Space>
                            <InfoCircleOutlined />
                            <span>Обзор</span>
                        </Space>
                    }
                    key="overview"
                >
                    <div className={styles.tabContent}>
                        {/* Status Cards */}
                        <Row gutter={16} className={styles.statusCards}>
                            <Col xs={24} sm={12} md={6}>
                                <Card
                                    size="small"
                                    className={styles.statusCard}
                                >
                                    <Statistic
                                        title="ID Транзакции"
                                        value={transaction.id}
                                        formatter={(value) => value}
                                        valueStyle={{
                                            fontSize: "16px",
                                            fontFamily: "monospace",
                                        }}
                                    />
                                </Card>
                            </Col>
                            <Col xs={24} sm={12} md={6}>
                                <Card
                                    size="small"
                                    className={styles.statusCard}
                                >
                                    <div className={styles.statusCardContent}>
                                        <Text type="secondary">Статус</Text>
                                        <StatusBadge
                                            state={transaction.state}
                                            error={transaction.error}
                                            errorMessage={
                                                transaction.error_message
                                            }
                                            size="large"
                                        />
                                    </div>
                                </Card>
                            </Col>
                            <Col xs={24} sm={12} md={6}>
                                <Card
                                    size="small"
                                    className={styles.statusCard}
                                >
                                    <div className={styles.statusCardContent}>
                                        <Text type="secondary">
                                            Направление
                                        </Text>
                                        <DirectionBadge
                                            direction={transaction.direction}
                                            size="large"
                                        />
                                    </div>
                                </Card>
                            </Col>
                            <Col xs={24} sm={12} md={6}>
                                <Card
                                    size="small"
                                    className={styles.statusCard}
                                >
                                    <Statistic
                                        title="Время обработки"
                                        value={getProcessingTime()}
                                        valueStyle={{
                                            fontSize: "16px",
                                            color: "#52c41a",
                                        }}
                                    />
                                </Card>
                            </Col>
                        </Row>

                        {/* Data Availability */}
                        <Row gutter={16} style={{ marginBottom: 24 }}>
                            <Col xs={24} sm={12}>
                                <Card size="small" className={styles.dataCard}>
                                    <div className={styles.statusCardContent}>
                                        <Space>
                                            <FileTextOutlined
                                                style={{ color: "#1890ff" }}
                                            />
                                            <Text type="secondary">
                                                Данные JSON
                                            </Text>
                                        </Space>
                                        <Space>
                                            <Tag
                                                color={
                                                    transaction.json_data
                                                        ? "green"
                                                        : "red"
                                                }
                                            >
                                                {transaction.json_data
                                                    ? "Доступно"
                                                    : "Недоступно"}
                                            </Tag>
                                            {transaction.json_data && (
                                                <Text
                                                    type="secondary"
                                                    style={{ fontSize: "11px" }}
                                                >
                                                    {
                                                        transaction.json_data
                                                            .length
                                                    }{" "}
                                                    символов
                                                </Text>
                                            )}
                                        </Space>
                                    </div>
                                </Card>
                            </Col>
                            <Col xs={24} sm={12}>
                                <Card size="small" className={styles.dataCard}>
                                    <div className={styles.statusCardContent}>
                                        <Space>
                                            <CodeOutlined
                                                style={{ color: "#52c41a" }}
                                            />
                                            <Text type="secondary">
                                                Данные XML
                                            </Text>
                                        </Space>
                                        <Space>
                                            <Tag
                                                color={
                                                    transaction.xml_data
                                                        ? "green"
                                                        : "red"
                                                }
                                            >
                                                {transaction.xml_data
                                                    ? "Доступно"
                                                    : "Недоступно"}
                                            </Tag>
                                            {transaction.xml_data && (
                                                <Text
                                                    type="secondary"
                                                    style={{ fontSize: "11px" }}
                                                >
                                                    {
                                                        transaction.xml_data
                                                            .length
                                                    }{" "}
                                                    символов
                                                </Text>
                                            )}
                                        </Space>
                                    </div>
                                </Card>
                            </Col>
                        </Row>

                        {/* Error Alert */}
                        {transaction.error && transaction.error !== 0 && (
                            <Alert
                                type="error"
                                message={`Ошибка ${transaction.error}: ${
                                    transaction.error_description ||
                                    "Неизвестная ошибка"
                                }`}
                                description={transaction.error_message}
                                icon={<BugOutlined />}
                                showIcon
                                className={styles.errorAlert}
                            />
                        )}

                        {/* Main Information */}
                        <Card title="Информация о транзакции" size="small">
                            <Descriptions
                                column={{ xs: 1, sm: 2, md: 3 }}
                                size="small"
                            >
                                <Descriptions.Item label="ID Сообщения">
                                    <Text code>
                                        {transaction.message_id || "Н/Д"}
                                    </Text>
                                </Descriptions.Item>
                                <Descriptions.Item label="Ссылка">
                                    <Text code>
                                        {transaction.reference_ || "Н/Д"}
                                    </Text>
                                </Descriptions.Item>
                                <Descriptions.Item label="Тип">
                                    <TypeBadge
                                        type={transaction.type}
                                        typeDescription={
                                            transaction.type_description
                                        }
                                    />
                                </Descriptions.Item>
                                <Descriptions.Item label="Имя файла">
                                    <Text code>
                                        {transaction.file_name || "Н/Д"}
                                    </Text>
                                </Descriptions.Item>
                                <Descriptions.Item label="Файл ответа">
                                    <Text code>
                                        {transaction.res_file_name || "Н/Д"}
                                    </Text>
                                </Descriptions.Item>
                                <Descriptions.Item label="Время инициации">
                                    {formatDateTime(transaction.init_time)}
                                </Descriptions.Item>
                                <Descriptions.Item label="Время отправки">
                                    {formatDateTime(transaction.send_time)}
                                </Descriptions.Item>
                                <Descriptions.Item label="Время ответа">
                                    {formatDateTime(transaction.res_time)}
                                </Descriptions.Item>
                                <Descriptions.Item label="Данные">
                                    {formatDateTime(transaction.data)}
                                </Descriptions.Item>
                            </Descriptions>
                        </Card>

                        {/* <Card
                            title="Информация о сессии"
                            size="small"
                            style={{ marginTop: 16 }}
                        >
                            <Descriptions
                                column={{ xs: 1, sm: 2 }}
                                size="small"
                            >
                                <Descriptions.Item label="Текущий пользователь">
                                </Descriptions.Item>
                                <Descriptions.Item label="Текущее время">
                                    <Text>2025-06-18 04:49:00</Text>
                                </Descriptions.Item>
                                <Descriptions.Item label="Часовой пояс">
                                    <Text>UTC</Text>
                                </Descriptions.Item>
                                <Descriptions.Item label="База данных">
                                    <Text>Oracle 19c</Text>
                                </Descriptions.Item>
                            </Descriptions>
                        </Card> */}
                    </div>
                </TabPane>

                {/* <TabPane
                    tab={
                        <Space>
                            <HistoryOutlined />
                            <span>Хронология</span>
                        </Space>
                    }
                    key="timeline"
                >
                    <div className={styles.tabContent}>
                        <Card title="Хронология обработки" size="small">
                            <Timeline items={getTimelineData()} />

                            <Divider />

                            <div>
                                <Title level={5}>Сводка обработки</Title>
                                <Row gutter={16}>
                                    <Col span={8}>
                                        <Statistic
                                            title="Общее время обработки"
                                            value={getProcessingTime()}
                                            valueStyle={{ color: "#1890ff" }}
                                        />
                                    </Col>
                                    <Col span={8}>
                                        <Statistic
                                            title="Шаги хронологии"
                                            value={getTimelineData().length}
                                            valueStyle={{ color: "#52c41a" }}
                                        />
                                    </Col>
                                    <Col span={8}>
                                        <Statistic
                                            title="Статус"
                                            value={
                                                transaction.error
                                                    ? "Неудача"
                                                    : "Успех"
                                            }
                                            valueStyle={{
                                                color: transaction.error
                                                    ? "#ff4d4f"
                                                    : "#52c41a",
                                            }}
                                        />
                                    </Col>
                                </Row>
                            </div>
                        </Card>
                    </div>
                </TabPane> */}

                <TabPane
                    tab={
                        <Space>
                            <FileTextOutlined />
                            <span>Данные JSON</span>
                            {transaction.json_data && (
                                <Tag color="green" size="small">
                                    Доступно
                                </Tag>
                            )}
                        </Space>
                    }
                    key="json"
                >
                    <div className={styles.tabContent}>
                        {transaction.json_data ? (
                            <CodeViewer
                                code={transaction.json_data}
                                language="json"
                                title="Исходные данные JSON"
                                fileName={`transaction-${transaction.id}-json`}
                                height="500px"
                            />
                        ) : (
                            <Alert
                                type="info"
                                message="Данные JSON недоступны"
                                description="У этой транзакции отсутствуют исходные данные JSON."
                                showIcon
                            />
                        )}
                    </div>
                </TabPane>

                <TabPane
                    tab={
                        <Space>
                            <CodeOutlined />
                            <span>Данные XML</span>
                            {transaction.xml_data && (
                                <Tag color="green" size="small">
                                    Доступно
                                </Tag>
                            )}
                        </Space>
                    }
                    key="xml"
                >
                    <div className={styles.tabContent}>
                        {transaction.xml_data ? (
                            <CodeViewer
                                code={transaction.xml_data}
                                language="xml"
                                title="Исходные данные XML"
                                fileName={`transaction-${transaction.id}-xml`}
                                height="500px"
                            />
                        ) : (
                            <Alert
                                type="info"
                                message="Данные XML недоступны"
                                description="У этой транзакции отсутствуют исходные данные XML."
                                showIcon
                            />
                        )}
                    </div>
                </TabPane>
            </Tabs>
        </div>
    );
}

export default TransactionDetail;
