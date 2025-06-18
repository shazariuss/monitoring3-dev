import React from "react";
import { Tag, Tooltip } from "antd";
import styles from "./TypeBadge.module.scss";

const TYPE_COLORS = {
    "pacs.008": "#1890ff", // Клиентские платежи - синий
    "pacs.009": "#52c41a", // Межбанковские переводы - зеленый
    "pacs.004": "#faad14", // Возврат платежа - оранжевый
    "pacs.002": "#722ed1", // Отчет о состоянии - фиолетовый
    "camt.054": "#13c2c2", // Списание/начисление - бирюзовый
    "camt.053": "#eb2f96", // Балансовый отчет - розовый
    "pain.001": "#f5222d", // Платежи ЦБ - красный
    "camt.110": "#fa8c16", // Запрос на расследование - оранжевый
    "camt.111": "#a0d911", // Ответ на расследование - лайм
    "camt.055": "#fadb14", // Запрос на отмену клиентского платежа - желтый
    "camt.056": "#fa541c", // Запрос на отмену платежа ФО - оранжево-красный
    "camt.029": "#9254de", // Ответ на запрос по отмене - светло-фиолетовый
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
