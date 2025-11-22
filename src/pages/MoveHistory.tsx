import { useState } from "react";
import { Table, Select, DatePicker, Space, Tag, Button } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

const { RangePicker } = DatePicker;

const MoveHistory = () => {
  const [filters, setFilters] = useState({
    product: "all",
    type: "all",
    location: "all",
  });

  // Mock data
  const moveHistory = [
    {
      id: 1,
      date: "2024-01-15 10:30",
      product: "Laptop - Dell XPS 15",
      sku: "LAP-001",
      type: "Transfer",
      fromLocation: "Warehouse A",
      toLocation: "Warehouse B",
      quantity: 5,
      reason: "Stock rebalancing",
      performedBy: "John Doe",
      status: "completed",
    },
    {
      id: 2,
      date: "2024-01-15 14:20",
      product: "Office Chair - Ergonomic",
      sku: "FUR-023",
      type: "Receipt",
      fromLocation: "Supplier",
      toLocation: "Warehouse A",
      quantity: 20,
      reason: "New stock arrival",
      performedBy: "Jane Smith",
      status: "completed",
    },
    {
      id: 3,
      date: "2024-01-16 09:15",
      product: "Wireless Mouse",
      sku: "ELC-045",
      type: "Delivery",
      fromLocation: "Warehouse B",
      toLocation: "Customer",
      quantity: 10,
      reason: "Sales order fulfillment",
      performedBy: "Mike Johnson",
      status: "completed",
    },
    {
      id: 4,
      date: "2024-01-16 11:45",
      product: "Notebook A4",
      sku: "STA-012",
      type: "Adjustment",
      fromLocation: "Warehouse A",
      toLocation: "Warehouse A",
      quantity: -3,
      reason: "Damaged items",
      performedBy: "Sarah Williams",
      status: "completed",
    },
    {
      id: 5,
      date: "2024-01-17 08:30",
      product: "Monitor 27inch",
      sku: "ELC-098",
      type: "Transfer",
      fromLocation: "Warehouse B",
      toLocation: "Warehouse C",
      quantity: 8,
      reason: "Distribution optimization",
      performedBy: "Tom Brown",
      status: "pending",
    },
  ];

  const columns = [
    {
      title: "Date & Time",
      dataIndex: "date",
      key: "date",
      sorter: (a: any, b: any) => dayjs(a.date).unix() - dayjs(b.date).unix(),
    },
    {
      title: "Product",
      key: "product",
      render: (_: any, record: any) => (
        <div>
          <div className="font-medium">{record.product}</div>
          <div className="text-xs text-muted-foreground">{record.sku}</div>
        </div>
      ),
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      render: (type: string) => {
        const colorMap: Record<string, string> = {
          Transfer: "blue",
          Receipt: "green",
          Delivery: "orange",
          Adjustment: "purple",
        };
        return <Tag color={colorMap[type]}>{type}</Tag>;
      },
    },
    {
      title: "From",
      dataIndex: "fromLocation",
      key: "fromLocation",
    },
    {
      title: "To",
      dataIndex: "toLocation",
      key: "toLocation",
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
      align: "center" as const,
      render: (qty: number) => (
        <span className={qty < 0 ? "text-red-500" : "text-green-600"}>
          {qty > 0 ? `+${qty}` : qty}
        </span>
      ),
    },
    {
      title: "Reason",
      dataIndex: "reason",
      key: "reason",
    },
    {
      title: "Performed By",
      dataIndex: "performedBy",
      key: "performedBy",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={status === "completed" ? "green" : "gold"}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-foreground">Move History</h1>
        <Button icon={<ReloadOutlined />}>Refresh</Button>
      </div>

      <div className="mb-6 p-4 bg-card rounded-lg border">
        <Space wrap size="middle">
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Date Range</label>
            <RangePicker />
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Product</label>
            <Select
              style={{ width: 200 }}
              value={filters.product}
              onChange={(value) => setFilters({ ...filters, product: value })}
            >
              <Select.Option value="all">All Products</Select.Option>
              <Select.Option value="LAP-001">Laptop - Dell XPS 15</Select.Option>
              <Select.Option value="FUR-023">Office Chair</Select.Option>
              <Select.Option value="ELC-045">Wireless Mouse</Select.Option>
            </Select>
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Move Type</label>
            <Select
              style={{ width: 180 }}
              value={filters.type}
              onChange={(value) => setFilters({ ...filters, type: value })}
            >
              <Select.Option value="all">All Types</Select.Option>
              <Select.Option value="transfer">Transfer</Select.Option>
              <Select.Option value="receipt">Receipt</Select.Option>
              <Select.Option value="delivery">Delivery</Select.Option>
              <Select.Option value="adjustment">Adjustment</Select.Option>
            </Select>
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Location</label>
            <Select
              style={{ width: 180 }}
              value={filters.location}
              onChange={(value) => setFilters({ ...filters, location: value })}
            >
              <Select.Option value="all">All Locations</Select.Option>
              <Select.Option value="warehouse-a">Warehouse A</Select.Option>
              <Select.Option value="warehouse-b">Warehouse B</Select.Option>
              <Select.Option value="warehouse-c">Warehouse C</Select.Option>
            </Select>
          </div>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={moveHistory}
        rowKey="id"
        pagination={{ pageSize: 10 }}
        scroll={{ x: 1200 }}
      />
    </div>
  );
};

export default MoveHistory;
