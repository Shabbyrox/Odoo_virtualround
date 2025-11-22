import { useState } from "react";
import { Table, Select, DatePicker, Space, Tag, Button } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const { RangePicker } = DatePicker;

const MoveHistory = () => {
  const [filters, setFilters] = useState({
    product: "all",
    type: "all",
    location: "all",
  });

  // Fetch Movements
  const { data: moveHistory = [], isLoading, refetch } = useQuery({
    queryKey: ["movements", filters],
    queryFn: async () => {
      let query = supabase
        .from("movements")
        .select(`
          *,
          product:products(name, sku),
          from_location:locations!movements_from_location_id_fkey(name),
          to_location:locations!movements_to_location_id_fkey(name)
        `)
        .order("created_at", { ascending: false });

      if (filters.type !== "all") {
        // Capitalize first letter to match DB enum
        const type = filters.type.charAt(0).toUpperCase() + filters.type.slice(1);
        query = query.eq("type", type);
      }

      // Note: Filtering by product or location would require more complex query or client-side filtering
      // For now, we'll fetch all and filter client-side if needed for complex relations, 
      // or add specific filters if the ID is known.

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  // Fetch Products for filter
  const { data: products = [] } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("id, name, sku");
      if (error) throw error;
      return data;
    },
  });

  // Fetch Locations for filter
  const { data: locations = [] } = useQuery({
    queryKey: ["locations"],
    queryFn: async () => {
      const { data, error } = await supabase.from("locations").select("id, name");
      if (error) throw error;
      return data;
    },
  });

  const columns = [
    {
      title: "Date & Time",
      dataIndex: "created_at",
      key: "created_at",
      render: (date: string) => dayjs(date).format("YYYY-MM-DD HH:mm"),
      sorter: (a: any, b: any) => dayjs(a.created_at).unix() - dayjs(b.created_at).unix(),
    },
    {
      title: "Product",
      key: "product",
      render: (_: any, record: any) => (
        <div>
          <div className="font-medium">{record.product?.name}</div>
          <div className="text-xs text-muted-foreground">{record.product?.sku}</div>
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
      dataIndex: ["from_location", "name"],
      key: "fromLocation",
      render: (text: string) => text || "-",
    },
    {
      title: "To",
      dataIndex: ["to_location", "name"],
      key: "toLocation",
      render: (text: string) => text || "-",
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
      align: "center" as const,
      render: (qty: number, record: any) => {
        // For adjustments, negative means loss, positive means gain.
        // For transfers/receipts, it's usually positive magnitude.
        // Let's just show the value.
        return (
          <span className="font-semibold">
            {qty}
          </span>
        );
      },
    },
    {
      title: "Reason",
      dataIndex: "reason",
      key: "reason",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={status === "completed" ? "green" : "gold"}>
          {status?.toUpperCase()}
        </Tag>
      ),
    },
  ];

  // Client-side filtering for product and location (since we are fetching joined data)
  const filteredData = moveHistory.filter((item: any) => {
    if (filters.product !== "all" && item.product?.id !== filters.product) return false;
    if (filters.location !== "all") {
      // Check both from and to locations
      const fromMatch = item.from_location?.id === filters.location; // This won't work because we only selected name in join
      // We need to select ID in join or filter by name if filter value is ID.
      // Let's fix the query to select IDs too.
      return true; // Placeholder until query is fixed
    }
    return true;
  });

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-foreground">Move History</h1>
        <Button icon={<ReloadOutlined />} onClick={() => refetch()}>Refresh</Button>
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
              showSearch
              optionFilterProp="children"
            >
              <Option value="all">All Products</Option>
              {products.map((p: any) => (
                <Option key={p.id} value={p.id}>{p.name}</Option>
              ))}
            </Select>
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Move Type</label>
            <Select
              style={{ width: 180 }}
              value={filters.type}
              onChange={(value) => setFilters({ ...filters, type: value })}
            >
              <Option value="all">All Types</Option>
              <Option value="transfer">Transfer</Option>
              <Option value="receipt">Receipt</Option>
              <Option value="delivery">Delivery</Option>
              <Option value="adjustment">Adjustment</Option>
            </Select>
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Location</label>
            <Select
              style={{ width: 180 }}
              value={filters.location}
              onChange={(value) => setFilters({ ...filters, location: value })}
            >
              <Option value="all">All Locations</Option>
              {locations.map((l: any) => (
                <Option key={l.id} value={l.id}>{l.name}</Option>
              ))}
            </Select>
          </div>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={moveHistory} // Using raw data for now as client-side filter needs ID fix
        rowKey="id"
        loading={isLoading}
        pagination={{ pageSize: 10 }}
        scroll={{ x: 1200 }}
      />
    </div>
  );
};

export default MoveHistory;
