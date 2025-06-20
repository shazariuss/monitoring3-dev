import React from "react";
import { Tag, Tooltip } from "antd";
import {
    CheckCircleOutlined,
    ExclamationCircleOutlined,
    ClockCircleOutlined,
    SyncOutlined,
    CloseCircleOutlined,
} from "@ant-design/icons";
import styles from "./StatusBadge.module.scss";

const STATUS_CONFIG = {
    1: {
        color: "#faad14",
        bgColor: "#fff7e6",
        borderColor: "#ffd666",
        icon: <ClockCircleOutlined />,
        label: "Pending",
        description: "Transaction is waiting to be processed",
    },
    2: {
        color: "#1890ff",
        bgColor: "#e6f7ff",
        borderColor: "#91d5ff",
        icon: <SyncOutlined spin />,
        label: "Processing",
        description: "Transaction is being processed",
    },
    3: {
        color: "#1890ff",
        bgColor: "#e6f7ff",
        borderColor: "#91d5ff",
        icon: <SyncOutlined spin />,
        label: "Processing",
        description: "Transaction is in progress",
    },
    8: {
        color: "#ff4d4f",
        bgColor: "#fff2f0",
        borderColor: "#ffb3b3",
        icon: <CloseCircleOutlined />,
        label: "Failed",
        description: "Transaction failed with error",
    },
    9: {
        color: "#52c41a",
        bgColor: "#f6ffed",
        borderColor: "#b7eb8f",
        icon: <CheckCircleOutlined />,
        label: "Success",
        description: "Transaction completed successfully",
    },
};

function StatusBadge({
    state,
    error,
    errorMessage,
    showIcon = true,
    size = "default",
}) {
    const finalState = error && error !== 0 ? 8 : state;
    const config = STATUS_CONFIG[finalState] || STATUS_CONFIG[1];

    const tooltipTitle =
        error && error !== 0
            ? `Error ${error}: ${errorMessage || "Unknown error"}`
            : config.description;

    const tagContent = (
        <>
            {showIcon && config.icon}
            <span>{config.label}</span>
        </>
    );

    return (
        <Tooltip title={tooltipTitle}>
            <Tag
                className={`${styles.statusBadge} ${styles[`size-${size}`]}`}
                style={{
                    color: config.color,
                    backgroundColor: config.bgColor,
                    borderColor: config.borderColor,
                    border: `1px solid ${config.borderColor}`,
                }}
            >
                {tagContent}
            </Tag>
        </Tooltip>
    );
}

export default StatusBadge;
