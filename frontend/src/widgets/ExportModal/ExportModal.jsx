import React, { useState, useEffect } from "react";
import {
    Modal,
    Button,
    Space,
    Radio,
    Typography,
    Statistic,
    Alert,
    Progress,
    Card,
} from "antd";
import {
    DownloadOutlined,
    FileExcelOutlined,
    FileTextOutlined,
} from "@ant-design/icons";
import { useSelector } from "react-redux";
import { cleanFiltersForAPI } from "../../shared/utils/filterUtils";
import styles from "./ExportModal.module.scss";

const { Text, Title } = Typography;

function ExportModal({ visible, onCancel }) {
    const [format, setFormat] = useState("xlsx");
    const [loading, setLoading] = useState(false);
    const [preview, setPreview] = useState(null);
    const [previewLoading, setPreviewLoading] = useState(false);

    const filters = useSelector((state) => state.filters);

    useEffect(() => {
        if (visible) {
            loadPreview();
        }
    }, [visible, filters]);

    const loadPreview = async () => {
        setPreviewLoading(true);
        try {
            const cleanedFilters = cleanFiltersForAPI(filters);
            const params = new URLSearchParams(cleanedFilters).toString();

            console.log("Loading preview with params:", cleanedFilters);

            const response = await fetch(`/api/export/preview?${params}`);
            const data = await response.json();
            setPreview(data);
        } catch (error) {
            console.error("Failed to load export preview:", error);
            setPreview({ totalRecords: 0, willExport: 0, hasMore: false });
        } finally {
            setPreviewLoading(false);
        }
    };

    const handleExport = async () => {
        setLoading(true);
        try {
            const cleanedFilters = cleanFiltersForAPI(filters);
            const params = new URLSearchParams({
                ...cleanedFilters,
                format,
            }).toString();

            console.log("Exporting with params:", {
                ...cleanedFilters,
                format,
            });

            const response = await fetch(`/api/export/transactions?${params}`);

            if (!response.ok) {
                throw new Error("Export failed");
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;

            const timestamp = new Date()
                .toISOString()
                .replace(/[:.]/g, "-")
                .substring(0, 19);
            a.download = `swift-transactions-${timestamp}.${format}`;

            document.body.appendChild(a);
            a.click();

            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            onCancel();
        } catch (error) {
            console.error("Export failed:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title={
                <Space>
                    <DownloadOutlined />
                    <span>Экспортные транзакции</span>
                </Space>
            }
            open={visible}
            onCancel={onCancel}
            footer={[
                <Button key="cancel" onClick={onCancel}>
                    Отмена
                </Button>,
                <Button
                    key="export"
                    type="primary"
                    icon={<DownloadOutlined />}
                    loading={loading}
                    onClick={handleExport}
                    disabled={!preview || preview.totalRecords === 0}
                >
                    Экспорт {format.toUpperCase()}
                </Button>,
            ]}
            width={550}
            className={styles.exportModal}
        >
            {/* Preview Statistics */}
            {previewLoading ? (
                <div className={styles.loadingContainer}>
                    <Progress type="circle" size={60} />
                    <Text type="secondary">
                        Загрузка предварительного просмотра экспорта...
                    </Text>
                </div>
            ) : (
                preview && (
                    <Card
                        title="Экспортировать предварительный просмотр"
                        size="small"
                        className={styles.previewCard}
                    >
                        <div className={styles.statsRow}>
                            <div className={styles.statItem}>
                                <Statistic
                                    title="Всего найдено записей"
                                    value={preview.totalRecords}
                                    valueStyle={{
                                        color: "#1890ff",
                                        fontSize: "20px",
                                    }}
                                />
                            </div>
                            <div className={styles.statItem}>
                                <Statistic
                                    title="Буден экспортирован"
                                    value={preview.willExport}
                                    valueStyle={{
                                        color: preview.hasMore
                                            ? "#faad14"
                                            : "#52c41a",
                                        fontSize: "20px",
                                    }}
                                />
                            </div>
                        </div>

                        {preview.hasMore && (
                            <Alert
                                type="warning"
                                message="Достигнут лимит экспорта"
                                description={`Только первые ${preview.maxExportLimit} записи будут экспортированы. Рассмотрите возможность применения фильтров для сокращения набора данных.`}
                                showIcon
                                size="small"
                                style={{ marginTop: 12 }}
                            />
                        )}

                        {preview.totalRecords === 0 && (
                            <Alert
                                type="info"
                                message="Данные не найдены"
                                description="Ни одна транзакция не соответствует вашим текущим фильтрам."
                                showIcon
                                size="small"
                                style={{ marginTop: 12 }}
                            />
                        )}
                    </Card>
                )
            )}

            {/* Format Selection */}
            <Card
                title="Выберите формат экспорта"
                size="small"
                className={styles.formatCard}
            >
                <div className={styles.formatOptions}>
                    <div
                        className={`${styles.formatOption} ${
                            format === "xlsx" ? styles.selected : ""
                        }`}
                        onClick={() => setFormat("xlsx")}
                    >
                        <div className={styles.formatHeader}>
                            <Radio checked={format === "xlsx"} />
                            <FileExcelOutlined
                                style={{ color: "#1D6F42", fontSize: "20px" }}
                            />
                            <Text strong>Excel (.xlsx)</Text>
                        </div>
                        {/* <Text
                            type="secondary"
                            className={styles.formatDescription}
                        >
                            Best for data analysis and charts
                        </Text> */}
                    </div>

                    <div
                        className={`${styles.formatOption} ${
                            format === "csv" ? styles.selected : ""
                        }`}
                        onClick={() => setFormat("csv")}
                    >
                        <div className={styles.formatHeader}>
                            <Radio checked={format === "csv"} />
                            <FileTextOutlined
                                style={{ color: "#FF6B35", fontSize: "20px" }}
                            />
                            <Text strong>CSV (.csv)</Text>
                        </div>
                        {/* <Text
                            type="secondary"
                            className={styles.formatDescription}
                        >
                            Universal format, works with any spreadsheet app
                        </Text> */}
                    </div>
                </div>
            </Card>

            {/* Export Information */}
            <Alert
                type="info"
                message="Экспорт информации"
                description={
                    <div className={styles.infoList}>
                        <div>
                            • Экспорт включает все видимые столбцы и текущие
                            фильтры.
                        </div>
                        <div>
                            • Даты будут отформатированы в формате YYYY-MM-DD
                            HH:MM:SS
                        </div>
                        <div>
                            • Максимальный лимит экспорта: 10 000 записей.
                        </div>
                        <div>• Файл будет загружен автоматически</div>
                    </div>
                }
                showIcon
                className={styles.infoAlert}
            />
        </Modal>
    );
}

export default ExportModal;
