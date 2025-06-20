import React, { useState } from "react";
import {
    Card,
    Button,
    Space,
    Typography,
    message,
    Tooltip,
    Select,
} from "antd";
import {
    CopyOutlined,
    DownloadOutlined,
    ExpandOutlined,
    CompressOutlined,
    EyeOutlined,
    CodeOutlined,
} from "@ant-design/icons";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
    vscDarkPlus,
    vs,
    materialLight,
    materialDark,
    atomDark,
} from "react-syntax-highlighter/dist/esm/styles/prism";
import styles from "./CodeViewer.module.scss";

const { Text } = Typography;
const { Option } = Select;

const THEMES = {
    vscDarkPlus: { theme: vscDarkPlus, name: "VS Code Dark", dark: true },
    vs: { theme: vs, name: "VS Code Light", dark: false },
    materialLight: {
        theme: materialLight,
        name: "Material Light",
        dark: false,
    },
    materialDark: { theme: materialDark, name: "Material Dark", dark: true },
    atomDark: { theme: atomDark, name: "Atom Dark", dark: true },
};

function CodeViewer({
    code,
    language = "xml",
    title = "Code",
    fileName = "code",
    height = "400px",
    showLineNumbers = true,
    wrapLines = false,
}) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [selectedTheme, setSelectedTheme] = useState("vscDarkPlus");
    const [viewMode, setViewMode] = useState("formatted");

    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        message.success("Code copied to clipboard");
    };

    const handleDownload = () => {
        const extension = language === "xml" ? "xml" : "json";
        const blob = new Blob([code], { type: "text/plain" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${fileName}.${extension}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        message.success("File downloaded");
    };

    const formatCode = (rawCode) => {
        if (!rawCode) return "";

        try {
            if (language === "json") {
                const parsed = JSON.parse(rawCode);
                return JSON.stringify(parsed, null, 2);
            } else if (language === "xml") {
                return rawCode
                    .replace(/></g, ">\n<")
                    .replace(/^\s*\n/gm, "")
                    .split("\n")
                    .map((line) => line.trim())
                    .filter((line) => line.length > 0)
                    .map((line, index, array) => {
                        const depth = getXMLDepth(array.slice(0, index + 1));
                        return "  ".repeat(Math.max(0, depth)) + line;
                    })
                    .join("\n");
            }
            return rawCode;
        } catch (error) {
            return rawCode;
        }
    };

    const getXMLDepth = (lines) => {
        let depth = 0;
        for (const line of lines) {
            const openTags = (line.match(/<%[^/]/g) || []).length;
            const closeTags = (line.match(/<\/[^>]+>/g) || []).length;
            const selfClosing = (line.match(/\/>/g) || []).length;
            depth += openTags - closeTags - selfClosing;
        }
        return Math.max(0, depth - 1);
    };

    const displayCode = viewMode === "formatted" ? formatCode(code) : code;
    const currentTheme = THEMES[selectedTheme];

    return (
        <Card
            className={`${styles.codeViewer} ${
                currentTheme.dark ? styles.dark : styles.light
            }`}
            size="small"
        >
            <div className={styles.header}>
                <div className={styles.headerLeft}>
                    <Space>
                        <CodeOutlined />
                        <Text strong>{title}</Text>
                        <Text type="secondary">({language.toUpperCase()})</Text>
                    </Space>
                </div>

                <div className={styles.headerRight}>
                    <Space size="small">
                        <Select
                            size="small"
                            value={selectedTheme}
                            onChange={setSelectedTheme}
                            style={{ width: 120 }}
                        >
                            {Object.entries(THEMES).map(([key, theme]) => (
                                <Option key={key} value={key}>
                                    {theme.name}
                                </Option>
                            ))}
                        </Select>

                        <Button
                            size="small"
                            type={
                                viewMode === "formatted" ? "primary" : "default"
                            }
                            onClick={() =>
                                setViewMode(
                                    viewMode === "formatted"
                                        ? "raw"
                                        : "formatted"
                                )
                            }
                            icon={<EyeOutlined />}
                        >
                            {viewMode === "formatted" ? "Raw" : "Format"}
                        </Button>

                        <Tooltip title="Copy to clipboard">
                            <Button
                                size="small"
                                icon={<CopyOutlined />}
                                onClick={handleCopy}
                            />
                        </Tooltip>

                        <Tooltip title="Download file">
                            <Button
                                size="small"
                                icon={<DownloadOutlined />}
                                onClick={handleDownload}
                            />
                        </Tooltip>

                        <Tooltip title={isExpanded ? "Collapse" : "Expand"}>
                            <Button
                                size="small"
                                icon={
                                    isExpanded ? (
                                        <CompressOutlined />
                                    ) : (
                                        <ExpandOutlined />
                                    )
                                }
                                onClick={() => setIsExpanded(!isExpanded)}
                            />
                        </Tooltip>
                    </Space>
                </div>
            </div>

            <div className={styles.codeContainer}>
                <SyntaxHighlighter
                    language={language}
                    style={currentTheme.theme}
                    showLineNumbers={showLineNumbers}
                    wrapLines={wrapLines}
                    customStyle={{
                        margin: 0,
                        padding: "16px",
                        fontSize: "13px",
                        lineHeight: "1.4",
                        height: isExpanded ? "auto" : height,
                        maxHeight: isExpanded ? "none" : height,
                        overflow: isExpanded ? "visible" : "auto",
                        borderRadius: "6px",
                        border: "none",
                    }}
                    codeTagProps={{
                        style: {
                            fontFamily:
                                '"Fira Code", "JetBrains Mono", "Monaco", "Menlo", monospace',
                        },
                    }}
                >
                    {displayCode}
                </SyntaxHighlighter>
            </div>

            <div className={styles.footer}>
                <Space>
                    <Text type="secondary" style={{ fontSize: "11px" }}>
                        Lines: {displayCode.split("\n").length}
                    </Text>
                    <Text type="secondary" style={{ fontSize: "11px" }}>
                        Size: {new Blob([code]).size} bytes
                    </Text>
                    <Text type="secondary" style={{ fontSize: "11px" }}>
                        Theme: {currentTheme.name}
                    </Text>
                </Space>
            </div>
        </Card>
    );
}

export default CodeViewer;
