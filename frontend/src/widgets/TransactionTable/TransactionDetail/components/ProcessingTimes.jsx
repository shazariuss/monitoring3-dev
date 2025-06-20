import React from "react";
import { Card, Row, Col, Statistic } from "antd";
import dayjs from "dayjs";

function ProcessingTimes({ transaction }) {
    const calculateDuration = (start, end) => {
        if (!start || !end) return "Н/Д";
        const duration = dayjs(end).diff(dayjs(start), "seconds");
        return `${duration}с`;
    };

    const formatDateTime = (dateTime) => {
        return dateTime ? dayjs(dateTime).format("DD/MM/YYYY HH:mm:ss") : "Н/Д";
    };

    return (
        <Card title="Времена обработки" size="small" style={{ marginTop: 16 }}>
            <Row gutter={16}>
                <Col span={6}>
                    <Statistic
                        title="Инициация"
                        value={formatDateTime(transaction.init_time)}
                        valueStyle={{ fontSize: "12px" }}
                    />
                </Col>
                <Col span={6}>
                    <Statistic
                        title="Отправка"
                        value={formatDateTime(transaction.send_time)}
                        valueStyle={{ fontSize: "12px" }}
                    />
                </Col>
                <Col span={6}>
                    <Statistic
                        title="Ответ"
                        value={formatDateTime(transaction.res_time)}
                        valueStyle={{ fontSize: "12px" }}
                    />
                </Col>
                <Col span={6}>
                    <Statistic
                        title="Общее время"
                        value={calculateDuration(
                            transaction.init_time,
                            transaction.res_time
                        )}
                        valueStyle={{ fontSize: "12px", color: "#1890ff" }}
                    />
                </Col>
            </Row>
        </Card>
    );
}

export default ProcessingTimes;
