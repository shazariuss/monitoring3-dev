import React from "react";
import { Tag, Space } from "antd";
import { ArrowRightOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import styles from "./DirectionBadge.module.scss";

function DirectionBadge({ direction, size = "default" }) {
    const isOutbound = direction === 1;

    return (
        <Tag
            className={`${styles.directionBadge} ${
                styles[isOutbound ? "outbound" : "inbound"]
            } ${styles[`size-${size}`]}`}
        >
            <Space size={4}>
                {isOutbound ? (
                    <>
                        <ArrowRightOutlined />
                        <span>Outbound</span>
                    </>
                ) : (
                    <>
                        <ArrowLeftOutlined />
                        <span>Inbound</span>
                    </>
                )}
            </Space>
        </Tag>
    );
}

export default DirectionBadge;
