import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    Card,
    Form,
    DatePicker,
    Select,
    Input,
    Button,
    Space,
    Row,
    Col,
    Typography,
    Tag,
} from "antd";
import {
    SearchOutlined,
    ClearOutlined,
    FilterOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import {
    setDateFrom,
    setDateTo,
    setStatus,
    setType,
    setSearch,
    setMessageStatus,
    setPage,
    clearFilters,
} from "../../features/filters/filtersSlice";
import useFormTypes from "../../shared/hooks/useFormTypes";
import useQueryStates from "../../shared/hooks/useQueryStates";
import useMessageStates from "../../shared/hooks/useMessageStates";
import styles from "./Filters.module.scss";

const { RangePicker } = DatePicker;
const { Option } = Select;
const { Text } = Typography;

function Filters() {
    const dispatch = useDispatch();
    const filters = useSelector((state) => state.filters);
    const [form] = Form.useForm();

    // Загружаем справочники
    const { formTypes, loading: formTypesLoading } = useFormTypes();
    const { queryStates, loading: queryStatesLoading } = useQueryStates();
    const { messageStates, loading: messageStatesLoading } = useMessageStates();

    // Синхронизация формы с Redux
    useEffect(() => {
        form.setFieldsValue({
            dateRange:
                filters.dateFrom && filters.dateTo
                    ? [dayjs(filters.dateFrom), dayjs(filters.dateTo)]
                    : null,
            queryStatus: filters.status,
            messageStatus: filters.messageStatus,
            type: filters.type,
            search: filters.search,
        });
    }, [filters, form]);

    // Обработчик изменения диапазона дат
    const handleDateRangeChange = (dates) => {
        if (dates && dates.length === 2) {
            dispatch(setDateFrom(dates[0].format("YYYY-MM-DD")));
            dispatch(setDateTo(dates[1].format("YYYY-MM-DD")));
        } else {
            dispatch(setDateFrom(null));
            dispatch(setDateTo(null));
        }
        dispatch(setPage(1)); // Сброс на первую страницу
    };

    const handleQueryStatusChange = (value) => {
        dispatch(setStatus(value));
        dispatch(setPage(1));
    };

    const handleMessageStatusChange = (value) => {
        dispatch(setMessageStatus(value));
        dispatch(setPage(1));
    };

    const handleTypeChange = (value) => {
        dispatch(setType(value));
        dispatch(setPage(1));
    };

    const handleSearchChange = (value) => {
        dispatch(setSearch(value));
        dispatch(setPage(1));
    };

    const handleClearFilters = () => {
        dispatch(clearFilters());
        form.resetFields();
    };

    const dateRanges = {
        Сегодня: [dayjs().startOf("day"), dayjs().endOf("day")],
        Вчера: [
            dayjs().subtract(1, "day").startOf("day"),
            dayjs().subtract(1, "day").endOf("day"),
        ],
        "Последние 7 дней": [
            dayjs().subtract(7, "days").startOf("day"),
            dayjs().endOf("day"),
        ],
        "Последние 30 дней": [
            dayjs().subtract(30, "days").startOf("day"),
            dayjs().endOf("day"),
        ],
        "Этот месяц": [dayjs().startOf("month"), dayjs().endOf("month")],
        "Прошлый месяц": [
            dayjs().subtract(1, "month").startOf("month"),
            dayjs().subtract(1, "month").endOf("month"),
        ],
    };

    // Подсчет активных фильтров
    const getActiveFiltersCount = () => {
        let count = 0;
        if (filters.dateFrom && filters.dateTo) count++;
        if (filters.status) count++;
        if (filters.messageStatus) count++;
        if (filters.type) count++;
        if (filters.search) count++;
        return count;
    };

    const activeFiltersCount = getActiveFiltersCount();

    return (
        <Card
            className={styles.filters}
            size="small"
            title={
                <Space>
                    <FilterOutlined />
                    <Text strong>Фильтры</Text>
                    {activeFiltersCount > 0 && (
                        <Tag color="blue" size="small">
                            {activeFiltersCount} активных
                        </Tag>
                    )}
                </Space>
            }
            extra={
                <Button
                    icon={<ClearOutlined />}
                    size="small"
                    onClick={handleClearFilters}
                    disabled={activeFiltersCount === 0}
                >
                    Очистить
                </Button>
            }
        >
            <Form form={form} layout="vertical" className={styles.form}>
                <Row gutter={[12, 8]}>
                    {/* Период */}
                    <Col xs={24} sm={12} md={5}>
                        <Form.Item label="Период" name="dateRange">
                            <RangePicker
                                format="DD.MM.YYYY"
                                placeholder={["От", "До"]}
                                presets={dateRanges}
                                onChange={handleDateRangeChange}
                                size="small"
                                style={{ width: "100%" }}
                            />
                        </Form.Item>
                    </Col>

                    {/* Статус обработки */}
                    <Col xs={24} sm={12} md={4}>
                        <Form.Item label="Статус обработки" name="queryStatus">
                            <Select
                                placeholder="Все статусы"
                                allowClear
                                onChange={handleQueryStatusChange}
                                size="small"
                                loading={queryStatesLoading}
                            >
                                {queryStates.map((state) => (
                                    <Option key={state.id} value={state.id}>
                                        <Space>
                                            {state.color && (
                                                <div
                                                    style={{
                                                        width: 8,
                                                        height: 8,
                                                        borderRadius: "50%",
                                                        backgroundColor:
                                                            state.color,
                                                        display: "inline-block",
                                                    }}
                                                />
                                            )}
                                            {state.name}
                                        </Space>
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>

                    {/* Тип транзакции */}
                    <Col xs={24} sm={12} md={4}>
                        <Form.Item label="Тип транзакции" name="type">
                            <Select
                                placeholder="Все типы"
                                allowClear
                                onChange={handleTypeChange}
                                size="small"
                                loading={formTypesLoading}
                                showSearch
                                optionFilterProp="children"
                            >
                                {formTypes.map((type) => (
                                    <Option key={type.alias} value={type.alias}>
                                        <div>
                                            <Text strong>{type.alias}</Text>
                                            <br />
                                            <Text
                                                type="secondary"
                                                style={{ fontSize: "11px" }}
                                            >
                                                {type.short_title}
                                            </Text>
                                        </div>
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>

                    {/* Поиск */}
                    <Col xs={24} sm={12} md={4}>
                        <Form.Item label="Поиск" name="search">
                            <Input
                                placeholder="ID, референс, файл..."
                                prefix={<SearchOutlined />}
                                onChange={(e) =>
                                    handleSearchChange(e.target.value)
                                }
                                size="small"
                                allowClear
                            />
                        </Form.Item>
                    </Col>

                    {/* Статус сообщения */}
                    <Col xs={24} sm={12} md={4}>
                        <Form.Item
                            label="Статус сообщения"
                            name="messageStatus"
                        >
                            <Select
                                placeholder="Все статусы"
                                allowClear
                                onChange={handleMessageStatusChange}
                                size="small"
                                loading={messageStatesLoading}
                            >
                                {messageStates.map((state) => (
                                    <Option key={state.code} value={state.code}>
                                        <Space>
                                            {state.color && (
                                                <div
                                                    style={{
                                                        width: 8,
                                                        height: 8,
                                                        borderRadius: "50%",
                                                        backgroundColor:
                                                            state.color ===
                                                            "success"
                                                                ? "#52c41a"
                                                                : state.color ===
                                                                  "error"
                                                                ? "#ff4d4f"
                                                                : "#d9d9d9",
                                                        display: "inline-block",
                                                    }}
                                                />
                                            )}
                                            {state.name}
                                        </Space>
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>

                    {/* Остальное место занято пустым Col для равномерного распределения */}
                    <Col xs={24} sm={12} md={3}>
                        {/* Пустое место для баланса */}
                    </Col>
                </Row>
            </Form>
        </Card>
    );
}

export default Filters;
