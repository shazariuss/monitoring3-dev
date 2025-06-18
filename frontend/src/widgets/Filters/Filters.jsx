import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    Card,
    Row,
    Col,
    DatePicker,
    Select,
    Input,
    Button,
    Space,
    Tag,
    Typography,
    Divider,
    Tooltip,
    Spin,
    Collapse,
} from "antd";
import {
    SearchOutlined,
    ClearOutlined,
    CalendarOutlined,
    FilterOutlined,
    ClockCircleOutlined,
    BugOutlined,
    CheckCircleOutlined,
    ExclamationCircleOutlined,
    DownOutlined,
    UpOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import {
    setDateFrom,
    setDateTo,
    setDateRange,
    setStatus,
    setType,
    setSearch,
    setErrorsOnly,
    setQuickFilter,
    clearFilters,
} from "../../features/filters/filtersSlice";
import useMessageStates from "../../shared/hooks/useMessageStates";
import styles from "./Filters.module.scss";

const { RangePicker } = DatePicker;
const { Option } = Select;
const { Search } = Input;
const { Text } = Typography;
const { Panel } = Collapse;

function Filters() {
    const dispatch = useDispatch();
    const filters = useSelector((state) => state.filters);

    const [localSearch, setLocalSearch] = useState(filters.search || "");
    const [isExpanded, setIsExpanded] = useState(false);

    // Загружаем статусы из базы данных
    const {
        messageStates,
        loading: statesLoading,
        error: statesError,
    } = useMessageStates();

    const handleDateRangeChange = (dates) => {
        if (dates && dates.length === 2) {
            dispatch(
                setDateRange({
                    dateFrom: dates[0].format("YYYY-MM-DD"),
                    dateTo: dates[1].format("YYYY-MM-DD"),
                })
            );
        } else {
            dispatch(setDateRange({ dateFrom: undefined, dateTo: undefined }));
        }
    };

    const handleSearchChange = (value) => {
        setLocalSearch(value);
        dispatch(setSearch(value));
    };

    const handleQuickFilter = (filterType) => {
        dispatch(setQuickFilter(filterType));
    };

    const handleClearFilters = () => {
        setLocalSearch("");
        dispatch(clearFilters());
    };

    const handleExpandToggle = () => {
        setIsExpanded(!isExpanded);
    };

    const getActiveFiltersCount = () => {
        let count = 0;
        if (filters.dateFrom || filters.dateTo) count++;
        if (filters.status) count++;
        if (filters.type) count++;
        if (filters.search) count++;
        if (filters.errorsOnly) count++;
        return count;
    };

    // Формируем опции для статусов из базы данных
    const statusOptions = messageStates.map((state) => ({
        value: state.code.toString(),
        label: state.name,
        color: state.color || "#1890ff",
    }));

    const typeOptions = [
        { value: "pacs.008", label: "Перевод денежных средств (pacs.008)" },
        { value: "pacs.002", label: "Отчет о статусе платежа (pacs.002)" },
        { value: "camt.056", label: "Запрос отмены перевода (camt.056)" },
        { value: "camt.029", label: "Разрешение расследования (camt.029)" },
    ];

    // Получаем краткое описание активных фильтров для заголовка
    const getActiveFiltersPreview = () => {
        const previews = [];

        if (filters.dateFrom || filters.dateTo) {
            previews.push(
                `📅 ${filters.dateFrom || "?"} - ${filters.dateTo || "?"}`
            );
        }

        if (filters.status) {
            const statusName =
                statusOptions.find((s) => s.value === filters.status)?.label ||
                `Статус ${filters.status}`;
            previews.push(`📊 ${statusName}`);
        }

        if (filters.type) {
            const typeName =
                typeOptions.find((t) => t.value === filters.type)?.label ||
                filters.type;
            previews.push(`🔧 ${typeName}`);
        }

        if (filters.search) {
            previews.push(`🔍 "${filters.search}"`);
        }

        if (filters.errorsOnly) {
            previews.push(`❌ Только ошибки`);
        }

        return previews.join(" • ");
    };

    return (
        <Card
            size="small"
            className={styles.filtersCard}
            bodyStyle={{ padding: isExpanded ? "16px" : "8px 16px" }}
        >
            {/* Заголовок с кнопкой разворачивания */}
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    cursor: "pointer",
                    padding: isExpanded ? "0 0 16px 0" : "8px 0",
                }}
                onClick={handleExpandToggle}
            >
                <Space>
                    <FilterOutlined />
                    <Text strong>Фильтры</Text>
                    {getActiveFiltersCount() > 0 && (
                        <Tag color="blue" size="small">
                            {getActiveFiltersCount()}
                        </Tag>
                    )}
                    {isExpanded ? <UpOutlined /> : <DownOutlined />}
                </Space>

                <Space>
                    {!isExpanded && getActiveFiltersCount() > 0 && (
                        <Text
                            type="secondary"
                            style={{ fontSize: "12px", maxWidth: "400px" }}
                            ellipsis
                        >
                            {getActiveFiltersPreview()}
                        </Text>
                    )}

                    {getActiveFiltersCount() > 0 && (
                        <Button
                            type="text"
                            icon={<ClearOutlined />}
                            onClick={(e) => {
                                e.stopPropagation();
                                handleClearFilters();
                            }}
                            size="small"
                            title="Очистить все фильтры"
                        >
                            Очистить
                        </Button>
                    )}
                </Space>
            </div>

            {/* Контент фильтров - показывается только при разворачивании */}
            {isExpanded && (
                <>
                    {/* Быстрые фильтры */}
                    <div
                        className={styles.quickFilters}
                        style={{ marginBottom: "16px" }}
                    >
                        <Text strong style={{ marginRight: 16 }}>
                            Быстрые фильтры:
                        </Text>
                        <Space wrap>
                            <Button
                                type={
                                    filters.quickFilter === "today"
                                        ? "primary"
                                        : "default"
                                }
                                size="small"
                                icon={<CalendarOutlined />}
                                onClick={() => handleQuickFilter("today")}
                            >
                                Сегодня
                            </Button>
                            <Button
                                type={
                                    filters.quickFilter === "yesterday"
                                        ? "primary"
                                        : "default"
                                }
                                size="small"
                                icon={<ClockCircleOutlined />}
                                onClick={() => handleQuickFilter("yesterday")}
                            >
                                Вчера
                            </Button>
                            <Button
                                type={
                                    filters.quickFilter === "last7days"
                                        ? "primary"
                                        : "default"
                                }
                                size="small"
                                icon={<CalendarOutlined />}
                                onClick={() => handleQuickFilter("last7days")}
                            >
                                Последние 7 дней
                            </Button>
                            <Button
                                type={
                                    filters.quickFilter === "errors"
                                        ? "primary"
                                        : "default"
                                }
                                size="small"
                                icon={<BugOutlined />}
                                onClick={() => handleQuickFilter("errors")}
                                danger={filters.quickFilter === "errors"}
                            >
                                Только ошибки
                            </Button>
                            <Button
                                type={
                                    filters.quickFilter === "sent"
                                        ? "primary"
                                        : "default"
                                }
                                size="small"
                                icon={<CheckCircleOutlined />}
                                onClick={() => handleQuickFilter("sent")}
                            >
                                Отправлено
                            </Button>
                            <Button
                                type={
                                    filters.quickFilter === "ready"
                                        ? "primary"
                                        : "default"
                                }
                                size="small"
                                icon={<ExclamationCircleOutlined />}
                                onClick={() => handleQuickFilter("ready")}
                            >
                                Готово
                            </Button>
                            <Button
                                type={
                                    filters.quickFilter === "all"
                                        ? "primary"
                                        : "default"
                                }
                                size="small"
                                onClick={() => handleQuickFilter("all")}
                            >
                                Все
                            </Button>
                        </Space>
                    </div>

                    <Divider style={{ margin: "16px 0" }} />

                    {/* Детальные фильтры */}
                    <Row gutter={16}>
                        <Col xs={24} sm={12} md={8} lg={6}>
                            <div className={styles.filterGroup}>
                                <Text
                                    type="secondary"
                                    className={styles.filterLabel}
                                >
                                    Диапазон дат
                                </Text>
                                <RangePicker
                                    value={
                                        filters.dateFrom && filters.dateTo
                                            ? [
                                                  dayjs(filters.dateFrom),
                                                  dayjs(filters.dateTo),
                                              ]
                                            : null
                                    }
                                    onChange={handleDateRangeChange}
                                    format="DD.MM.YYYY"
                                    size="small"
                                    style={{ width: "100%" }}
                                    placeholder={["Дата с", "Дата по"]}
                                />
                            </div>
                        </Col>

                        <Col xs={24} sm={12} md={8} lg={6}>
                            <div className={styles.filterGroup}>
                                <Text
                                    type="secondary"
                                    className={styles.filterLabel}
                                >
                                    Статус
                                    {statesLoading && (
                                        <Spin
                                            size="small"
                                            style={{ marginLeft: 8 }}
                                        />
                                    )}
                                    {statesError && (
                                        <Tooltip
                                            title={`Ошибка загрузки статусов: ${statesError}`}
                                        >
                                            <Text
                                                type="danger"
                                                style={{ marginLeft: 8 }}
                                            >
                                                ⚠
                                            </Text>
                                        </Tooltip>
                                    )}
                                </Text>
                                <Select
                                    value={filters.status}
                                    onChange={(value) =>
                                        dispatch(setStatus(value))
                                    }
                                    placeholder="Выберите статус"
                                    allowClear
                                    size="small"
                                    style={{ width: "100%" }}
                                    loading={statesLoading}
                                    notFoundContent={
                                        statesLoading ? (
                                            <Spin size="small" />
                                        ) : (
                                            "Нет данных"
                                        )
                                    }
                                >
                                    {statusOptions.map((option) => (
                                        <Option
                                            key={option.value}
                                            value={option.value}
                                        >
                                            <Space>
                                                <div
                                                    style={{
                                                        width: 8,
                                                        height: 8,
                                                        borderRadius: "50%",
                                                        backgroundColor:
                                                            option.color,
                                                    }}
                                                />
                                                {option.label}
                                            </Space>
                                        </Option>
                                    ))}
                                </Select>
                            </div>
                        </Col>

                        <Col xs={24} sm={12} md={8} lg={6}>
                            <div className={styles.filterGroup}>
                                <Text
                                    type="secondary"
                                    className={styles.filterLabel}
                                >
                                    Тип сообщения
                                </Text>
                                <Select
                                    value={filters.type}
                                    onChange={(value) =>
                                        dispatch(setType(value))
                                    }
                                    placeholder="Выберите тип"
                                    allowClear
                                    size="small"
                                    style={{ width: "100%" }}
                                    showSearch
                                    filterOption={(input, option) =>
                                        option.children
                                            .toLowerCase()
                                            .indexOf(input.toLowerCase()) >= 0
                                    }
                                >
                                    {typeOptions.map((option) => (
                                        <Option
                                            key={option.value}
                                            value={option.value}
                                        >
                                            {option.label}
                                        </Option>
                                    ))}
                                </Select>
                            </div>
                        </Col>

                        <Col xs={24} sm={12} md={8} lg={6}>
                            <div className={styles.filterGroup}>
                                <Text
                                    type="secondary"
                                    className={styles.filterLabel}
                                >
                                    Поиск
                                </Text>
                                <Search
                                    value={localSearch}
                                    onChange={(e) =>
                                        handleSearchChange(e.target.value)
                                    }
                                    placeholder="ID транзакции, имя файла, референс..."
                                    allowClear
                                    size="small"
                                    enterButton={<SearchOutlined />}
                                    onSearch={handleSearchChange}
                                />
                            </div>
                        </Col>
                    </Row>

                    {/* Отображение активных фильтров */}
                    {getActiveFiltersCount() > 0 && (
                        <>
                            <Divider style={{ margin: "16px 0" }} />
                            <div className={styles.activeFilters}>
                                <Text
                                    type="secondary"
                                    style={{ marginRight: 12 }}
                                >
                                    Активные фильтры:
                                </Text>
                                <Space wrap>
                                    {(filters.dateFrom || filters.dateTo) && (
                                        <Tag
                                            closable
                                            onClose={() =>
                                                dispatch(
                                                    setDateRange({
                                                        dateFrom: undefined,
                                                        dateTo: undefined,
                                                    })
                                                )
                                            }
                                            color="blue"
                                            size="small"
                                        >
                                            Дата: {filters.dateFrom || "?"} -{" "}
                                            {filters.dateTo || "?"}
                                        </Tag>
                                    )}
                                    {filters.status && (
                                        <Tag
                                            closable
                                            onClose={() =>
                                                dispatch(setStatus(undefined))
                                            }
                                            color="green"
                                            size="small"
                                        >
                                            Статус:{" "}
                                            {statusOptions.find(
                                                (s) =>
                                                    s.value === filters.status
                                            )?.label || filters.status}
                                        </Tag>
                                    )}
                                    {filters.type && (
                                        <Tag
                                            closable
                                            onClose={() =>
                                                dispatch(setType(undefined))
                                            }
                                            color="purple"
                                            size="small"
                                        >
                                            Тип:{" "}
                                            {typeOptions.find(
                                                (t) => t.value === filters.type
                                            )?.label || filters.type}
                                        </Tag>
                                    )}
                                    {filters.search && (
                                        <Tag
                                            closable
                                            onClose={() =>
                                                handleSearchChange("")
                                            }
                                            color="orange"
                                            size="small"
                                        >
                                            Поиск: "{filters.search}"
                                        </Tag>
                                    )}
                                    {filters.errorsOnly && (
                                        <Tag
                                            closable
                                            onClose={() =>
                                                dispatch(setErrorsOnly(false))
                                            }
                                            color="red"
                                            size="small"
                                        >
                                            Только ошибки
                                        </Tag>
                                    )}
                                </Space>
                            </div>
                        </>
                    )}
                </>
            )}
        </Card>
    );
}

export default Filters;
