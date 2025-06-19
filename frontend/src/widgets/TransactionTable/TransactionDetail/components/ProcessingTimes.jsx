import React from "react";
import {
    Card,
    Row,
    Col,
    Statistic,
    Timeline,
    Tag,
    Typography,
    Space,
} from "antd";
import {
    ClockCircleOutlined,
    SendOutlined,
    CheckCircleOutlined,
    WarningOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(duration);
dayjs.extend(relativeTime);

const { Text, Title } = Typography;

function ProcessingTimes({ transaction }) {
    const { init_time, send_time, res_time, state, error } = transaction;

    const calculateDuration = (start, end) => {
        if (!start || !end) return null;
        const startTime = dayjs(start);
        const endTime = dayjs(end);
        const diff = endTime.diff(startTime);
        return dayjs.duration(diff);
    };

    const initToSend = calculateDuration(init_time, send_time);
    const sendToResponse = calculateDuration(send_time, res_time);
    const totalTime = calculateDuration(init_time, res_time);

    const getProcessingStatus = () => {
        if (error && error !== 0) {
            return { status: "error", text: "Ошибка обработки", color: "red" };
        }

        switch (parseInt(state)) {
            case 1:
                return { status: "processing", text: "Введен", color: "blue" };
            case 2:
                return {
                    status: "processing",
                    text: "На рассмотрении",
                    color: "orange",
                };
            case 3:
                return {
                    status: "processing",
                    text: "Принят на рассмотрение",
                    color: "orange",
                };
            case 4:
                return { status: "error", text: "Отклонен", color: "red" };
            case 5:
                return {
                    status: "processing",
                    text: "На подтверждение",
                    color: "yellow",
                };
            case 6:
                return {
                    status: "processing",
                    text: "Готов к формированию",
                    color: "cyan",
                };
            case 7:
                return {
                    status: "processing",
                    text: "Отправлен в SWIFT",
                    color: "blue",
                };
            case 8:
                return {
                    status: "error",
                    text: "Не принят SWIFT",
                    color: "red",
                };
            case 9:
                return {
                    status: "success",
                    text: "Успешно обработан",
                    color: "green",
                };
            case 10:
                return {
                    status: "processing",
                    text: "Конвертирован",
                    color: "purple",
                };
            case 11:
                return {
                    status: "error",
                    text: "Не одобрен SWIFT",
                    color: "red",
                };
            default:
                return {
                    status: "processing",
                    text: `Статус ${state}`,
                    color: "gray",
                };
        }
    };

    const status = getProcessingStatus();

    const timelineItems = [
        {
            color: "blue",
            dot: <ClockCircleOutlined />,
            children: (
                <div>
                    <Text strong>Инициализация</Text>
                    <br />
                    <Text type="secondary">
                        {dayjs(init_time).format("DD.MM.YYYY HH:mm:ss")}(
                        {dayjs(init_time).fromNow()})
                    </Text>
                </div>
            ),
        },
    ];

    if (send_time) {
        timelineItems.push({
            color: "orange",
            dot: <SendOutlined />,
            children: (
                <div>
                    <Text strong>Отправка в SWIFT</Text>
                    <br />
                    <Text type="secondary">
                        {dayjs(send_time).format("DD.MM.YYYY HH:mm:ss")}(
                        {dayjs(send_time).fromNow()})
                    </Text>
                    {initToSend && (
                        <>
                            <br />
                            <Text type="secondary" style={{ fontSize: "12px" }}>
                                Время до отправки: {initToSend.humanize()}
                            </Text>
                        </>
                    )}
                </div>
            ),
        });
    }

    if (res_time) {
        timelineItems.push({
            color: status.status === "success" ? "green" : "red",
            dot:
                status.status === "success" ? (
                    <CheckCircleOutlined />
                ) : (
                    <WarningOutlined />
                ),
            children: (
                <div>
                    <Text strong>Получен ответ</Text>
                    <br />
                    <Text type="secondary">
                        {dayjs(res_time).format("DD.MM.YYYY HH:mm:ss")}(
                        {dayjs(res_time).fromNow()})
                    </Text>
                    {sendToResponse && (
                        <>
                            <br />
                            <Text type="secondary" style={{ fontSize: "12px" }}>
                                Время ответа SWIFT: {sendToResponse.humanize()}
                            </Text>
                        </>
                    )}
                </div>
            ),
        });
    }

    return (
        <Card title="Время обработки" size="small" style={{ marginBottom: 16 }}>
            <Row gutter={16} style={{ marginBottom: 24 }}>
                <Col span={6}>
                    <Statistic
                        title="Текущий статус"
                        value={status.text}
                        valueStyle={{ color: status.color, fontSize: "16px" }}
                        prefix={<Tag color={status.color}>{state}</Tag>}
                    />
                </Col>

                {initToSend && (
                    <Col span={6}>
                        <Statistic
                            title="До отправки"
                            value={
                                initToSend.asMinutes() < 60
                                    ? `${Math.round(
                                          initToSend.asMinutes()
                                      )} мин`
                                    : `${Math.round(initToSend.asHours())} ч`
                            }
                            valueStyle={{ color: "#1890ff" }}
                            prefix={<ClockCircleOutlined />}
                        />
                    </Col>
                )}

                {sendToResponse && (
                    <Col span={6}>
                        <Statistic
                            title="Ответ SWIFT"
                            value={
                                sendToResponse.asMinutes() < 60
                                    ? `${Math.round(
                                          sendToResponse.asMinutes()
                                      )} мин`
                                    : `${Math.round(
                                          sendToResponse.asHours()
                                      )} ч`
                            }
                            valueStyle={{ color: "#52c41a" }}
                            prefix={<SendOutlined />}
                        />
                    </Col>
                )}

                {totalTime && (
                    <Col span={6}>
                        <Statistic
                            title="Общее время"
                            value={
                                totalTime.asHours() < 24
                                    ? `${Math.round(totalTime.asHours())} ч`
                                    : `${Math.round(totalTime.asDays())} дн`
                            }
                            valueStyle={{ color: "#722ed1" }}
                            prefix={<CheckCircleOutlined />}
                        />
                    </Col>
                )}
            </Row>

            <Title level={5}>Хронология обработки</Title>
            <Timeline items={timelineItems} />
        </Card>
    );
}

export default ProcessingTimes;
