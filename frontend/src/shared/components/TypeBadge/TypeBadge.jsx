import React from "react";
import { Tag, Tooltip } from "antd";
import styles from "./TypeBadge.module.scss";

const TYPE_COLORS = {
    "pacs.008": "#1890ff",
    "pacs.009": "#52c41a",
    "pacs.004": "#faad14",
    "pacs.002": "#722ed1",
    "camt.054": "#13c2c2",
    "camt.053": "#eb2f96",
    "pain.001": "#f5222d",
    "camt.110": "#fa8c16",
    "camt.111": "#a0d911",
    "camt.055": "#fadb14",
    "camt.056": "#fa541c",
    "camt.029": "#9254de",
};

function TypeBadge({ type, typeDescription, size = "default" }) {
    if (!type) return <Tag>Unknown</Tag>;

    const baseType = type.split(".").slice(0, 2).join(".");
    const color = TYPE_COLORS[baseType] || "#666666";

    return (
        <Tooltip title={typeDescription || type}>
            <Tag
                className={`${styles.typeBadge} ${styles[`size-${size}`]}`}
                style={{
                    color: color,
                    backgroundColor: `${color}15`,
                    borderColor: `${color}40`,
                }}
            >
                <code>{baseType}</code>
            </Tag>
        </Tooltip>
    );
}

export default TypeBadge;
