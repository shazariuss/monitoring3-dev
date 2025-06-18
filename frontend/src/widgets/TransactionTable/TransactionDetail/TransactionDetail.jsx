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
                    Loading transaction details...
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
                    No transaction data available
                </Text>
            </div>
        );
    }

    const formatDateTime = (dateTime) => {
        return dateTime ? dayjs(dateTime).format("DD/MM/YYYY HH:mm:ss") : "N/A";
    };

    const getProcessingTime = () => {
        if (transaction.init_time && transaction.send_time) {
            const init = dayjs(transaction.init_time);
            const send = dayjs(transaction.send_time);
            const diff = send.diff(init, "seconds");
            return `${diff}s`;
        }
        return "N/A";
    };

    const getTimelineData = () => {
        const timeline = [];

        if (transaction.init_time) {
            timeline.push({
                color: "blue",
                dot: <ClockCircleOutlined />,
                children: (
                    <div>
                        <Text strong>Transaction Initiated</Text>
                        <br />
                        <Text type="secondary">
                            {formatDateTime(transaction.init_time)}
                        </Text>
                        <br />
                        {/* <Text type="secondary" style={{ fontSize: '11px' }}>
              User: tuitshoxrux
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
                        <Text strong>Transaction Sent</Text>
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
                                    Error: {transaction.error_message}
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
                        <Text strong>Response Received</Text>
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
                            <span>Overview</span>
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
                                        title="Transaction ID"
                                        value={transaction.id}
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
                                        <Text type="secondary">Status</Text>
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
                                        <Text type="secondary">Direction</Text>
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
                                        title="Processing Time"
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
                                                JSON Data
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
                                                    ? "Available"
                                                    : "Not Available"}
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
                                                    chars
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
                                                XML Data
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
                                                    ? "Available"
                                                    : "Not Available"}
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
                                                    chars
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
                                message={`Error ${transaction.error}: ${
                                    transaction.error_description ||
                                    "Unknown error"
                                }`}
                                description={transaction.error_message}
                                icon={<BugOutlined />}
                                showIcon
                                className={styles.errorAlert}
                            />
                        )}

                        {/* Main Information */}
                        <Card title="Transaction Information" size="small">
                            <Descriptions
                                column={{ xs: 1, sm: 2, md: 3 }}
                                size="small"
                            >
                                <Descriptions.Item label="Message ID">
                                    <Text code>
                                        {transaction.message_id || "N/A"}
                                    </Text>
                                </Descriptions.Item>
                                <Descriptions.Item label="Reference">
                                    <Text code>
                                        {transaction.reference_ || "N/A"}
                                    </Text>
                                </Descriptions.Item>
                                <Descriptions.Item label="Type">
                                    <TypeBadge
                                        type={transaction.type}
                                        typeDescription={
                                            transaction.type_description
                                        }
                                    />
                                </Descriptions.Item>
                                <Descriptions.Item label="File Name">
                                    <Text code>
                                        {transaction.file_name || "N/A"}
                                    </Text>
                                </Descriptions.Item>
                                <Descriptions.Item label="Response File">
                                    <Text code>
                                        {transaction.res_file_name || "N/A"}
                                    </Text>
                                </Descriptions.Item>
                                <Descriptions.Item label="Init Time">
                                    {formatDateTime(transaction.init_time)}
                                </Descriptions.Item>
                                <Descriptions.Item label="Send Time">
                                    {formatDateTime(transaction.send_time)}
                                </Descriptions.Item>
                                <Descriptions.Item label="Response Time">
                                    {formatDateTime(transaction.res_time)}
                                </Descriptions.Item>
                                <Descriptions.Item label="Data">
                                    {formatDateTime(transaction.data)}
                                </Descriptions.Item>
                            </Descriptions>
                        </Card>

                        {/* Session Information */}
                        <Card
                            title="Session Information"
                            size="small"
                            style={{ marginTop: 16 }}
                        >
                            <Descriptions
                                column={{ xs: 1, sm: 2 }}
                                size="small"
                            >
                                <Descriptions.Item label="Current User">
                                    {/* <Text code>tuitshoxrux</Text> */}
                                </Descriptions.Item>
                                <Descriptions.Item label="Current Time">
                                    <Text>2025-06-18 04:49:00</Text>
                                </Descriptions.Item>
                                <Descriptions.Item label="Timezone">
                                    <Text>UTC</Text>
                                </Descriptions.Item>
                                <Descriptions.Item label="Database">
                                    <Text>Oracle 19c</Text>
                                </Descriptions.Item>
                            </Descriptions>
                        </Card>
                    </div>
                </TabPane>

                <TabPane
                    tab={
                        <Space>
                            <HistoryOutlined />
                            <span>Timeline</span>
                        </Space>
                    }
                    key="timeline"
                >
                    <div className={styles.tabContent}>
                        <Card title="Processing Timeline" size="small">
                            <Timeline items={getTimelineData()} />

                            <Divider />

                            <div>
                                <Title level={5}>Processing Summary</Title>
                                <Row gutter={16}>
                                    <Col span={8}>
                                        <Statistic
                                            title="Total Processing Time"
                                            value={getProcessingTime()}
                                            valueStyle={{ color: "#1890ff" }}
                                        />
                                    </Col>
                                    <Col span={8}>
                                        <Statistic
                                            title="Timeline Steps"
                                            value={getTimelineData().length}
                                            valueStyle={{ color: "#52c41a" }}
                                        />
                                    </Col>
                                    <Col span={8}>
                                        <Statistic
                                            title="Status"
                                            value={
                                                transaction.error
                                                    ? "Failed"
                                                    : "Success"
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
                </TabPane>

                <TabPane
                    tab={
                        <Space>
                            <FileTextOutlined />
                            <span>JSON Data</span>
                            {transaction.json_data && (
                                <Tag color="green" size="small">
                                    Available
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
                                title="JSON Source Data"
                                fileName={`transaction-${transaction.id}-json`}
                                height="500px"
                            />
                        ) : (
                            <Alert
                                type="info"
                                message="No JSON Data Available"
                                description="This transaction doesn't have JSON source data."
                                showIcon
                            />
                        )}
                    </div>
                </TabPane>

                <TabPane
                    tab={
                        <Space>
                            <CodeOutlined />
                            <span>XML Data</span>
                            {transaction.xml_data && (
                                <Tag color="green" size="small">
                                    Available
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
                                title="XML Source Data"
                                fileName={`transaction-${transaction.id}-xml`}
                                height="500px"
                            />
                        ) : (
                            <Alert
                                type="info"
                                message="No XML Data Available"
                                description="This transaction doesn't have XML source data."
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
