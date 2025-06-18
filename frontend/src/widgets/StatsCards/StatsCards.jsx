import React from "react";
import { useSelector } from "react-redux";
import { Row, Col, Card, Statistic, Progress, Space, Typography } from "antd";
import {
    RiseOutlined,
    FallOutlined,
    SyncOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
} from "@ant-design/icons";
import styles from "./StatsCards.module.scss";

const { Text } = Typography;

function StatsCards() {
    const { stats } = useSelector((state) => state.transactions);

    const successRate =
        stats.total > 0
            ? ((stats.total - stats.errors) / stats.total) * 100
            : 0;
    const errorRate = stats.total > 0 ? (stats.errors / stats.total) * 100 : 0;
    const pendingRate =
        stats.total > 0 ? (stats.pending / stats.total) * 100 : 0;

    return (
        <Row gutter={[16, 16]} className={styles.statsRow}>
            <Col xs={24} sm={12} lg={6}>
                <Card className={styles.statCard}>
                    <Statistic
                        title="Total Transactions"
                        value={stats.total}
                        prefix={<RiseOutlined style={{ color: "#1890ff" }} />}
                        valueStyle={{
                            color: "#1890ff",
                            fontSize: "24px",
                            fontWeight: 600,
                        }}
                    />
                    <div className={styles.subInfo}>
                        <Text type="secondary">All time transactions</Text>
                    </div>
                </Card>
            </Col>

            <Col xs={24} sm={12} lg={6}>
                <Card className={styles.statCard}>
                    <Statistic
                        title="Success Rate"
                        value={successRate}
                        precision={1}
                        suffix="%"
                        prefix={
                            <CheckCircleOutlined style={{ color: "#52c41a" }} />
                        }
                        valueStyle={{
                            color: "#52c41a",
                            fontSize: "24px",
                            fontWeight: 600,
                        }}
                    />
                    <div className={styles.progressContainer}>
                        <Progress
                            percent={successRate}
                            strokeColor="#52c41a"
                            size="small"
                            showInfo={false}
                        />
                        <Text type="secondary" style={{ fontSize: "12px" }}>
                            {stats.total - stats.errors} successful
                        </Text>
                    </div>
                </Card>
            </Col>

            <Col xs={24} sm={12} lg={6}>
                <Card className={styles.statCard}>
                    <Statistic
                        title="Errors"
                        value={stats.errors}
                        prefix={<FallOutlined style={{ color: "#ff4d4f" }} />}
                        valueStyle={{
                            color: "#ff4d4f",
                            fontSize: "24px",
                            fontWeight: 600,
                        }}
                    />
                    <div className={styles.progressContainer}>
                        <Progress
                            percent={errorRate}
                            strokeColor="#ff4d4f"
                            size="small"
                            showInfo={false}
                        />
                        <Text type="secondary" style={{ fontSize: "12px" }}>
                            {errorRate.toFixed(1)}% error rate
                        </Text>
                    </div>
                </Card>
            </Col>

            <Col xs={24} sm={12} lg={6}>
                <Card className={styles.statCard}>
                    <Statistic
                        title="Pending"
                        value={stats.pending}
                        prefix={
                            <ClockCircleOutlined style={{ color: "#faad14" }} />
                        }
                        valueStyle={{
                            color: "#faad14",
                            fontSize: "24px",
                            fontWeight: 600,
                        }}
                    />
                    <div className={styles.progressContainer}>
                        <Progress
                            percent={pendingRate}
                            strokeColor="#faad14"
                            size="small"
                            showInfo={false}
                        />
                        <Text type="secondary" style={{ fontSize: "12px" }}>
                            {pendingRate.toFixed(1)}% pending
                        </Text>
                    </div>
                </Card>
            </Col>
        </Row>
    );
}

export default StatsCards;
