import { Row, Col, Card, Table, Tag, Button, Select, Space } from "antd";
import {
  AppstoreOutlined,
  WarningOutlined,
  InboxOutlined,
  ShoppingCartOutlined,
  SwapOutlined,
  EyeOutlined,
  CheckOutlined,
} from "@ant-design/icons";
import KPICard from "@/components/dashboard/KPICard";

const { Option } = Select;

// Mock data for actionable operations
const actionableData = [
  {
    key: "1",
    type: "Receipt",
    id: "REC-2024-001",
    status: "pending",
    warehouse: "Main Warehouse",
    date: "2024-01-15",
  },
  {
    key: "2",
    type: "Delivery",
    id: "DEL-2024-045",
    status: "pending",
    warehouse: "Distribution Center A",
    date: "2024-01-15",
  },
  {
    key: "3",
    type: "Receipt",
    id: "REC-2024-002",
    status: "draft",
    warehouse: "Main Warehouse",
    date: "2024-01-14",
  },
  {
    key: "4",
    type: "Delivery",
    id: "DEL-2024-046",
    status: "picking",
    warehouse: "Distribution Center B",
    date: "2024-01-14",
  },
];

const columns = [
  {
    title: "Type",
    dataIndex: "type",
    key: "type",
    render: (type: string) => (
      <Tag color={type === "Receipt" ? "blue" : "green"}>
        {type === "Receipt" ? <InboxOutlined /> : <ShoppingCartOutlined />}{" "}
        {type}
      </Tag>
    ),
  },
  {
    title: "Document ID",
    dataIndex: "id",
    key: "id",
    render: (text: string) => <span className="font-mono text-sm">{text}</span>,
  },
  {
    title: "Status",
    dataIndex: "status",
    key: "status",
    render: (status: string) => {
      const statusConfig = {
        pending: { color: "warning", label: "Pending" },
        draft: { color: "default", label: "Draft" },
        picking: { color: "processing", label: "Picking" },
      };
      const config = statusConfig[status as keyof typeof statusConfig];
      return <Tag color={config.color}>{config.label}</Tag>;
    },
  },
  {
    title: "Warehouse/Location",
    dataIndex: "warehouse",
    key: "warehouse",
  },
  {
    title: "Date",
    dataIndex: "date",
    key: "date",
  },
  {
    title: "Action",
    key: "action",
    render: () => (
      <Space>
        <Button type="link" icon={<EyeOutlined />} size="small">
          View
        </Button>
        <Button type="primary" icon={<CheckOutlined />} size="small">
          Validate
        </Button>
      </Space>
    ),
  },
];

export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={8} xl={4.8}>
          <KPICard
            title="Total Products"
            value={1248}
            prefix={<AppstoreOutlined />}
            color="primary"
            trend={{ value: 12, isPositive: true }}
          />
        </Col>
        <Col xs={24} sm={12} lg={8} xl={4.8}>
          <KPICard
            title="Low Stock Items"
            value={23}
            prefix={<WarningOutlined />}
            color="warning"
            trend={{ value: 5, isPositive: false }}
          />
        </Col>
        <Col xs={24} sm={12} lg={8} xl={4.8}>
          <KPICard
            title="Pending Receipts"
            value={8}
            prefix={<InboxOutlined />}
            color="info"
          />
        </Col>
        <Col xs={24} sm={12} lg={8} xl={4.8}>
          <KPICard
            title="Pending Deliveries"
            value={15}
            prefix={<ShoppingCartOutlined />}
            color="accent"
          />
        </Col>
        <Col xs={24} sm={12} lg={8} xl={4.8}>
          <KPICard
            title="Internal Transfers"
            value={5}
            prefix={<SwapOutlined />}
            color="primary"
          />
        </Col>
      </Row>

      {/* Filters */}
      <Card className="shadow-kpi">
        <Space wrap size="middle">
          <Select placeholder="Document Type" style={{ minWidth: 150 }}>
            <Option value="all">All Types</Option>
            <Option value="receipt">Receipts</Option>
            <Option value="delivery">Deliveries</Option>
            <Option value="adjustment">Adjustments</Option>
          </Select>
          <Select placeholder="Status" style={{ minWidth: 150 }}>
            <Option value="all">All Status</Option>
            <Option value="pending">Pending</Option>
            <Option value="draft">Draft</Option>
            <Option value="picking">Picking</Option>
            <Option value="validated">Validated</Option>
          </Select>
          <Select placeholder="Warehouse/Location" style={{ minWidth: 200 }}>
            <Option value="all">All Warehouses</Option>
            <Option value="main">Main Warehouse</Option>
            <Option value="dc-a">Distribution Center A</Option>
            <Option value="dc-b">Distribution Center B</Option>
          </Select>
          <Select placeholder="Product Category" style={{ minWidth: 180 }}>
            <Option value="all">All Categories</Option>
            <Option value="electronics">Electronics</Option>
            <Option value="furniture">Furniture</Option>
            <Option value="office">Office Supplies</Option>
          </Select>
        </Space>
      </Card>

      {/* Actionable Operations Table */}
      <Card
        title={<span className="text-lg font-semibold">Actionable Pending Operations</span>}
        className="shadow-kpi"
      >
        <Table
          columns={columns}
          dataSource={actionableData}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 800 }}
        />
      </Card>
    </div>
  );
}
