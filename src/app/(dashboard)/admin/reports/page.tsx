"use client";

import React, { useEffect, useState } from "react";
import {
  Card,
  Row,
  Col,
  Statistic,
  Typography,
  Table,
  Tag,
  Button,
  Space,
  Divider,
} from "antd";
import {
  DollarOutlined,
  RiseOutlined,
  FallOutlined,
  ReloadOutlined,
  ExportOutlined,
  TransactionOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useRouter } from "next/navigation";
import RoleBasedRoute from "@/components/shared/RoleBasedRoute";
import { UserRole } from "@/hooks/useAuth";
import { adminApi, type FinancialReportDto } from "@/lib/admin/admin.api";
import styles from "./FinancialReports.module.scss";

const { Title, Text } = Typography;

const FinancialReportsPage: React.FC = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState<FinancialReportDto | null>(null);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getFinancialReport();
      console.log("Financial report data:", data); // Debug log
      setReport(data);
    } catch (error: any) {
      console.error("Failed to fetch financial report:", error);
      // Show error message to user
      if (error.response) {
        console.error("Error response:", error.response.data);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  const formatCurrency = (value: number) => {
    if (value === null || value === undefined || isNaN(value)) {
      return "0 ₫";
    }
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(value);
  };

  const exportReportPdf = () => {
    if (!report) return;

    const fmt = (n: number | undefined | null) =>
      new Intl.NumberFormat("vi-VN").format(Number(n || 0));

    const now = new Date();
    const ts =
      now.getFullYear().toString() +
      "-" +
      String(now.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(now.getDate()).padStart(2, "0") +
      " " +
      String(now.getHours()).padStart(2, "0") +
      ":" +
      String(now.getMinutes()).padStart(2, "0");

    const monthlyRows = (report.monthlyData || [])
      .map(
        (m) =>
          `<tr>
            <td>${m.monthName}</td>
            <td style="text-align:right">${fmt(m.revenue)}</td>
            <td style="text-align:right">${fmt(m.expenses)}</td>
            <td style="text-align:right">${fmt(m.commission)}</td>
            <td style="text-align:center">${m.transactionCount}</td>
          </tr>`
      )
      .join("");

    const html = `
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Báo cáo tài chính</title>
    <style>
      body { font-family: Arial, sans-serif; padding: 24px; color: #111; }
      h1 { margin: 0 0 4px 0; font-size: 22px; }
      .muted { color: #666; margin-bottom: 16px; }
      table { width: 100%; border-collapse: collapse; margin-top: 12px; }
      th, td { border: 1px solid #ddd; padding: 8px; font-size: 12px; }
      th { background: #f5f5f5; text-align: left; }
      .section { margin-top: 20px; }
      .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
      .card { border: 1px solid #eee; border-radius: 6px; padding: 12px; }
      .label { color: #666; font-size: 12px; }
      .value { font-weight: bold; font-size: 14px; margin-top: 4px; }
      @media print {
        .no-print { display: none; }
      }
    </style>
  </head>
  <body>
    <div class="no-print" style="text-align:right">
      <button onclick="window.print()">In / Lưu PDF</button>
    </div>
    <h1>Báo cáo tài chính</h1>
    <div class="muted">Thời gian xuất: ${ts}</div>

    <div class="grid">
      <div class="card">
        <div class="label">Tổng doanh thu</div>
        <div class="value">${fmt(report.totalRevenue)} ₫</div>
      </div>
      <div class="card">
        <div class="label">Tổng hoa hồng</div>
        <div class="value">${fmt(report.totalCommission)} ₫</div>
      </div>
      <div class="card">
        <div class="label">Tổng chi phí</div>
        <div class="value">${fmt(report.totalExpenses)} ₫</div>
      </div>
      <div class="card">
        <div class="label">Lợi nhuận ròng</div>
        <div class="value">${fmt(report.netProfit)} ₫</div>
      </div>
      <div class="card">
        <div class="label">Giá trị HĐ hoàn thành</div>
        <div class="value">${fmt(report.completedContractValue)} ₫</div>
      </div>
      <div class="card">
        <div class="label">Giá trị HĐ đang hoạt động</div>
        <div class="value">${fmt(report.activeContractValue)} ₫</div>
      </div>
      <div class="card">
        <div class="label">Giá trị thanh toán đang chờ</div>
        <div class="value">${fmt(report.pendingPaymentValue)} ₫</div>
      </div>
      <div class="card">
        <div class="label">Tổng giao dịch</div>
        <div class="value">${fmt(report.totalTransactions)}</div>
      </div>
    </div>

    <div class="section">
      <h3>Báo cáo theo tháng</h3>
      <table>
        <thead>
          <tr>
            <th>Tháng</th>
            <th>Doanh thu</th>
            <th>Chi phí</th>
            <th>Hoa hồng</th>
            <th>Số giao dịch</th>
          </tr>
        </thead>
        <tbody>
          ${monthlyRows}
        </tbody>
      </table>
    </div>
  </body>
</html>`;

    const win = window.open("", "_blank");
    if (!win) return;
    win.document.open();
    win.document.write(html);
    win.document.close();
    win.focus();
  };

  const monthlyColumns = [
    {
      title: "Tháng",
      dataIndex: "monthName",
      key: "monthName",
      width: 150,
    },
    {
      title: "Doanh thu",
      dataIndex: "revenue",
      key: "revenue",
      render: (value: number) => (
        <Text strong>{formatCurrency(Number(value) || 0)}</Text>
      ),
      width: 150,
    },
    {
      title: "Chi phí",
      dataIndex: "expenses",
      key: "expenses",
      render: (value: number) => (
        <Text type="secondary">{formatCurrency(Number(value) || 0)}</Text>
      ),
      width: 150,
    },
    {
      title: "Hoa hồng",
      dataIndex: "commission",
      key: "commission",
      render: (value: number) => (
        <Text style={{ color: "#722ed1" }}>{formatCurrency(Number(value) || 0)}</Text>
      ),
      width: 150,
    },
    {
      title: "Số giao dịch",
      dataIndex: "transactionCount",
      key: "transactionCount",
      width: 120,
    },
  ];

  return (
    <RoleBasedRoute allowedRoles={[UserRole.Admin]}>
      <div className={styles.financialReportsPage}>
        <Card>
          {/* Header */}
          <div style={{ marginBottom: 24 }}>
            <Title level={2} style={{ marginBottom: 8 }}>
              Báo cáo tài chính
            </Title>
            <Text type="secondary">
              Tổng quan về tình hình tài chính và doanh thu của nền tảng
            </Text>
          </div>

          {/* Actions */}
          <div style={{ marginBottom: 24, display: "flex", gap: 12 }}>
            <Button
              icon={<ReloadOutlined />}
              onClick={fetchReport}
              loading={loading}
            >
              Làm mới
            </Button>
            <Button type="default" icon={<ExportOutlined />} onClick={exportReportPdf} disabled={loading || !report}>
              Xuất PDF
            </Button>
          </div>

          {/* Summary Cards */}
          <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={12} lg={6}>
              <Card className={styles.statCard} loading={loading}>
                <Statistic
                  title="Tổng doanh thu"
                  value={report ? Number(report.totalRevenue) : 0}
                  precision={0}
                  valueStyle={{ color: "#3f8600" }}
                  prefix={<DollarOutlined />}
                  formatter={(value) => formatCurrency(Number(value))}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card className={styles.statCard} loading={loading}>
                <Statistic
                  title="Tổng hoa hồng"
                  value={report ? Number(report.totalCommission) : 0}
                  precision={0}
                  valueStyle={{ color: "#722ed1" }}
                  prefix={<RiseOutlined />}
                  formatter={(value) => formatCurrency(Number(value))}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card className={styles.statCard} loading={loading}>
                <Statistic
                  title="Tổng chi phí"
                  value={report ? Number(report.totalExpenses) : 0}
                  precision={0}
                  valueStyle={{ color: "#cf1322" }}
                  prefix={<FallOutlined />}
                  formatter={(value) => formatCurrency(Number(value))}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card className={styles.statCard} loading={loading}>
                <Statistic
                  title="Lợi nhuận ròng"
                  value={report ? Number(report.netProfit) : 0}
                  precision={0}
                  valueStyle={{
                    color: report && report.netProfit >= 0 ? "#3f8600" : "#cf1322",
                  }}
                  prefix={
                    report && report.netProfit >= 0 ? (
                      <RiseOutlined />
                    ) : (
                      <FallOutlined />
                    )
                  }
                  formatter={(value) => formatCurrency(Number(value))}
                />
              </Card>
            </Col>
          </Row>

          {/* Contract Values */}
          <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={12} lg={8}>
              <Card title="Giá trị hợp đồng hoàn thành" loading={loading}>
                <Statistic
                  value={report ? Number(report.completedContractValue) : 0}
                  precision={0}
                  valueStyle={{ color: "#1890ff", fontSize: 24 }}
                  prefix={<FileTextOutlined />}
                  formatter={(value) => formatCurrency(Number(value))}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={8}>
              <Card title="Giá trị hợp đồng đang hoạt động" loading={loading}>
                <Statistic
                  value={report ? Number(report.activeContractValue) : 0}
                  precision={0}
                  valueStyle={{ color: "#52c41a", fontSize: 24 }}
                  prefix={<FileTextOutlined />}
                  formatter={(value) => formatCurrency(Number(value))}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={8}>
              <Card title="Giá trị thanh toán đang chờ" loading={loading}>
                <Statistic
                  value={report ? Number(report.pendingPaymentValue) : 0}
                  precision={0}
                  valueStyle={{ color: "#faad14", fontSize: 24 }}
                  prefix={<ClockCircleOutlined />}
                  formatter={(value) => formatCurrency(Number(value))}
                />
              </Card>
            </Col>
          </Row>

          {/* Detailed Explanation removed as requested */}

          {/* Transaction Statistics */}
          <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
            <Col xs={24} lg={12}>
              <Card title="Thống kê giao dịch" loading={loading}>
                <Space direction="vertical" size="large" style={{ width: "100%" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <TransactionOutlined style={{ marginRight: 8 }} />
                      <Text>Tổng số giao dịch</Text>
                    </div>
                    <Tag color="blue" style={{ fontSize: 16, padding: "4px 12px" }}>
                      {report?.totalTransactions || 0}
                    </Tag>
                  </div>
                  <Divider style={{ margin: "8px 0" }} />
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <CheckCircleOutlined style={{ marginRight: 8, color: "#52c41a" }} />
                      <Text>Thành công</Text>
                    </div>
                    <Tag color="success" style={{ fontSize: 16, padding: "4px 12px" }}>
                      {report?.successfulTransactions || 0}
                    </Tag>
                  </div>
                  <Divider style={{ margin: "8px 0" }} />
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <ClockCircleOutlined style={{ marginRight: 8, color: "#faad14" }} />
                      <Text>Đang chờ</Text>
                    </div>
                    <Tag color="warning" style={{ fontSize: 16, padding: "4px 12px" }}>
                      {report?.pendingTransactions || 0}
                    </Tag>
                  </div>
                  <Divider style={{ margin: "8px 0" }} />
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <CloseCircleOutlined style={{ marginRight: 8, color: "#ff4d4f" }} />
                      <Text>Thất bại</Text>
                    </div>
                    <Tag color="error" style={{ fontSize: 16, padding: "4px 12px" }}>
                      {report?.failedTransactions || 0}
                    </Tag>
                  </div>
                </Space>
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card title="Tỷ lệ thành công" loading={loading}>
                <div style={{ textAlign: "center", padding: "40px 20px" }}>
                  {report && report.totalTransactions > 0 ? (
                    <>
                      <div style={{ fontSize: 48, fontWeight: "bold", color: "#52c41a", marginBottom: 8 }}>
                        {((report.successfulTransactions / report.totalTransactions) * 100).toFixed(1)}%
                      </div>
                      <Text type="secondary">
                        {report.successfulTransactions} / {report.totalTransactions} giao dịch thành công
                      </Text>
                    </>
                  ) : (
                    <Text type="secondary">Chưa có dữ liệu</Text>
                  )}
                </div>
              </Card>
            </Col>
          </Row>

          {/* Charts */}
          {report && report.monthlyData && report.monthlyData.length > 0 && (
            <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
              <Col xs={24} lg={12}>
                <Card title="Doanh thu theo tháng" loading={loading}>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={report.monthlyData}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#52c41a" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#52c41a" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="monthName" />
                      <YAxis />
                      <Tooltip
                        formatter={(value: number) => formatCurrency(value)}
                      />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke="#52c41a"
                        fillOpacity={1}
                        fill="url(#colorRevenue)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </Card>
              </Col>
              <Col xs={24} lg={12}>
                <Card title="Hoa hồng & Chi phí theo tháng" loading={loading}>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={report.monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="monthName" />
                      <YAxis />
                      <Tooltip
                        formatter={(value: number) => formatCurrency(value)}
                      />
                      <Legend />
                      <Bar dataKey="commission" fill="#722ed1" name="Hoa hồng" />
                      <Bar dataKey="expenses" fill="#ff4d4f" name="Chi phí" />
                    </BarChart>
                  </ResponsiveContainer>
                </Card>
              </Col>
            </Row>
          )}

          {/* Monthly Data Table */}
          <Card title="Báo cáo theo tháng (12 tháng gần nhất)" loading={loading}>
            <Table
              columns={monthlyColumns}
              dataSource={report?.monthlyData || []}
              rowKey="month"
              pagination={false}
              locale={{
                emptyText: "Chưa có dữ liệu",
              }}
            />
          </Card>
        </Card>
      </div>
    </RoleBasedRoute>
  );
};

export default FinancialReportsPage;

