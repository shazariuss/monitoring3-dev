// import React from "react";
// import { useSelector, useDispatch } from "react-redux";
// import { Card, Space, Button, Badge, Statistic, Row, Col } from "antd";
// import {
//     ClockCircleOutlined,
//     ExclamationCircleOutlined,
//     CheckCircleOutlined,
//     FilterOutlined,
//     ReloadOutlined,
//     CalendarOutlined,
//     ThunderboltOutlined,
// } from "@ant-design/icons";
// import {
//     setQuickFilter,
//     clearFilters,
// } from "../../features/filters/filtersSlice";
// import { fetchTransactions } from "../../features/transactions/transactionSlice";
// import styles from "./QuickFilters.module.scss";

// function QuickFilters() {
//     const dispatch = useDispatch();
//     const { quickFilter } = useSelector((state) => state.filters);
//     const { stats, data } = useSelector((state) => state.transactions);

//     const quickFilterOptions = [
//         {
//             key: "last1h",
//             label: "Last 1 Hour",
//             icon: <ClockCircleOutlined />,
//             color: "#1890ff",
//             description: "Transactions from the last hour",
//         },
//         {
//             key: "today",
//             label: "Today",
//             icon: <CalendarOutlined />,
//             color: "#52c41a",
//             description: "Today's transactions",
//         },
//         {
//             key: "errorsOnly",
//             label: "Errors Only",
//             icon: <ExclamationCircleOutlined />,
//             color: "#ff4d4f",
//             description: "Show only failed transactions",
//             count: stats.errors,
//         },
//         {
//             key: "successOnly",
//             label: "Success Only",
//             icon: <CheckCircleOutlined />,
//             color: "#52c41a",
//             description: "Show only successful transactions",
//         },
//         {
//             key: "pendingOnly",
//             label: "Pending",
//             icon: <ThunderboltOutlined />,
//             color: "#faad14",
//             description: "Show pending/processing transactions",
//             count: stats.pending,
//         },
//     ];

//     const handleQuickFilter = (filterKey) => {
//         if (quickFilter === filterKey) {
//             dispatch(clearFilters());
//             dispatch(fetchTransactions({ page: 1 }));
//         } else {
//             dispatch(setQuickFilter(filterKey));

//             const now = new Date();
//             const params = { page: 1 };

//             switch (filterKey) {
//                 case "last1h":
//                     const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
//                     params.dateFrom = oneHourAgo.toISOString();
//                     params.dateTo = now.toISOString();
//                     break;
//                 case "today":
//                     const todayStart = new Date(
//                         now.getFullYear(),
//                         now.getMonth(),
//                         now.getDate()
//                     );
//                     params.dateFrom = todayStart.toISOString();
//                     params.dateTo = now.toISOString();
//                     break;
//                 case "errorsOnly":
//                     params.errorsOnly = "true";
//                     break;
//                 case "successOnly":
//                     params.status = 9;
//                     break;
//                 case "pendingOnly":
//                     params.status = "1,2,3";
//                     break;
//             }

//             dispatch(fetchTransactions(params));
//         }
//     };

//     const handleClearAll = () => {
//         dispatch(clearFilters());
//         dispatch(fetchTransactions({ page: 1 }));
//     };

//     return (
//         <Card className={styles.quickFiltersCard} size="small">
//             <div className={styles.filtersHeader}>
//                 <Space>
//                     <FilterOutlined />
//                     <span className={styles.title}>Quick Filters</span>
//                 </Space>
//                 <Button
//                     type="text"
//                     size="small"
//                     onClick={handleClearAll}
//                     className={styles.clearButton}
//                 >
//                     Clear All
//                 </Button>
//             </div>

//             <div className={styles.filtersGrid}>
//                 {quickFilterOptions.map((filter) => (
//                     <Button
//                         key={filter.key}
//                         type={
//                             quickFilter === filter.key ? "primary" : "default"
//                         }
//                         size="small"
//                         icon={filter.icon}
//                         onClick={() => handleQuickFilter(filter.key)}
//                         className={`${styles.filterButton} ${
//                             quickFilter === filter.key ? styles.active : ""
//                         }`}
//                         style={{
//                             borderColor:
//                                 quickFilter === filter.key
//                                     ? filter.color
//                                     : undefined,
//                             color:
//                                 quickFilter === filter.key
//                                     ? "#fff"
//                                     : filter.color,
//                         }}
//                     >
//                         <Space>
//                             <span>{filter.label}</span>
//                             {filter.count !== undefined && (
//                                 <Badge
//                                     count={filter.count}
//                                     size="small"
//                                     style={{
//                                         backgroundColor:
//                                             quickFilter === filter.key
//                                                 ? "#fff"
//                                                 : filter.color,
//                                         color:
//                                             quickFilter === filter.key
//                                                 ? filter.color
//                                                 : "#fff",
//                                     }}
//                                 />
//                             )}
//                         </Space>
//                     </Button>
//                 ))}
//             </div>
//         </Card>
//     );
// }

// export default QuickFilters;
