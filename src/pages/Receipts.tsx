import { useState } from "react";
import { Card, Form, Input, Select, DatePicker, Button, Table, Space, InputNumber, message } from "antd";
import { PlusOutlined, DeleteOutlined, CheckOutlined } from "@ant-design/icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import dayjs from "dayjs";

const { Option } = Select;

interface ProductLine {
  key: string;
  productId: string;
  quantity: number;
}

export default function Receipts() {
  const [form] = Form.useForm();
  const [productLines, setProductLines] = useState<ProductLine[]>([]);
  const queryClient = useQueryClient();

  // Fetch Suppliers
  const { data: suppliers = [] } = useQuery({
    queryKey: ["suppliers"],
    queryFn: async () => {
      const { data, error } = await supabase.from("suppliers").select("id, name");
      if (error) throw error;
      return data;
    },
  });

  // Fetch Locations
  const { data: locations = [] } = useQuery({
    queryKey: ["locations"],
    queryFn: async () => {
      const { data, error } = await supabase.from("locations").select("id, name");
      if (error) throw error;
      return data;
    },
  });

  // Fetch Products
  const { data: products = [] } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("id, name, sku");
      if (error) throw error;
      return data;
    },
  });

  const createReceiptMutation = useMutation({
    mutationFn: async (values: any) => {
      // 1. Create Receipt
      const { data: receipt, error: receiptError } = await supabase
        .from("receipts")
        .insert({
          supplier_id: values.supplier,
          location_id: values.location,
          date: values.date.toISOString(),
          reference: values.reference,
          status: "completed",
        })
        .select()
        .single();

      if (receiptError) throw receiptError;

      // 2. Create Receipt Items & Update Inventory & Log Movements
      for (const line of productLines) {
        // Add Item
        const { error: itemError } = await supabase.from("receipt_items").insert({
          receipt_id: receipt.id,
          product_id: line.productId,
          quantity: line.quantity,
        });
        if (itemError) throw itemError;

        // Log Movement
        const { error: moveError } = await supabase.from("movements").insert({
          product_id: line.productId,
          type: "Receipt",
          to_location_id: values.location,
          quantity: line.quantity,
          reason: `Receipt #${receipt.id.slice(0, 8)}`,
          status: "completed",
        });
        if (moveError) throw moveError;

        // Update Inventory (Get current first)
        const { data: currentInv } = await supabase
          .from("inventory")
          .select("quantity")
          .eq("product_id", line.productId)
          .eq("location_id", values.location)
          .maybeSingle();

        const newQty = (currentInv?.quantity || 0) + line.quantity;

        const { error: invError } = await supabase
          .from("inventory")
          .upsert({
            product_id: line.productId,
            location_id: values.location,
            quantity: newQty,
          }, { onConflict: 'product_id,location_id' });

        if (invError) throw invError;
      }
    },
    onSuccess: () => {
      message.success("Receipt validated and inventory updated");
      form.resetFields();
      setProductLines([]);
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (error) => {
      message.error(`Error creating receipt: ${error.message}`);
    },
  });

  const addProductLine = () => {
    const newLine: ProductLine = {
      key: Date.now().toString(),
      productId: "",
      quantity: 1,
    };
    setProductLines([...productLines, newLine]);
  };

  const removeProductLine = (key: string) => {
    setProductLines(productLines.filter((line) => line.key !== key));
  };

  const handleProductChange = (key: string, field: string, value: any) => {
    setProductLines(
      productLines.map((line) =>
        line.key === key ? { ...line, [field]: value } : line
      )
    );
  };

  const productColumns = [
    {
      title: "Product",
      dataIndex: "productId",
      key: "productId",
      width: "40%",
      render: (_: any, record: ProductLine) => (
        <Select
          placeholder="Select product"
          style={{ width: "100%" }}
          value={record.productId || undefined}
          onChange={(value) => handleProductChange(record.key, "productId", value)}
          showSearch
          optionFilterProp="children"
        >
          {products.map((p: any) => (
            <Option key={p.id} value={p.id}>{p.sku} - {p.name}</Option>
          ))}
        </Select>
      ),
    },
    {
      title: "Quantity Received",
      dataIndex: "quantity",
      key: "quantity",
      width: "30%",
      render: (_: any, record: ProductLine) => (
        <InputNumber
          min={1}
          value={record.quantity}
          onChange={(value) => handleProductChange(record.key, "quantity", value || 0)}
          style={{ width: "100%" }}
        />
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: "30%",
      render: (_: any, record: ProductLine) => (
        <Button
          type="link"
          danger
          icon={<DeleteOutlined />}
          onClick={() => removeProductLine(record.key)}
        >
          Remove
        </Button>
      ),
    },
  ];

  const handleValidate = () => {
    form.validateFields().then((values) => {
      if (productLines.length === 0) {
        message.error("Please add at least one product");
        return;
      }
      if (productLines.some(l => !l.productId || l.quantity <= 0)) {
        message.error("Please complete all product lines");
        return;
      }
      createReceiptMutation.mutate(values);
    });
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-kpi">
        <h2 className="text-2xl font-semibold text-foreground">Create Receipt</h2>
        <p className="text-muted-foreground mt-1">
          Record incoming stock from suppliers
        </p>
      </Card>

      <Card title="Receipt Details" className="shadow-kpi">
        <Form form={form} layout="vertical">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Form.Item
              label="Receipt Date"
              name="date"
              rules={[{ required: true, message: "Please select date" }]}
            >
              <DatePicker style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item
              label="Supplier"
              name="supplier"
              rules={[{ required: true, message: "Please select supplier" }]}
            >
              <Select placeholder="Select supplier">
                {suppliers.map((s: any) => (
                  <Option key={s.id} value={s.id}>{s.name}</Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              label="Target Location"
              name="location"
              rules={[{ required: true, message: "Please select location" }]}
            >
              <Select placeholder="Select location">
                {locations.map((l: any) => (
                  <Option key={l.id} value={l.id}>{l.name}</Option>
                ))}
              </Select>
            </Form.Item>
          </div>
          <Form.Item label="Reference/PO Number" name="reference">
            <Input placeholder="Enter purchase order or reference number" />
          </Form.Item>
        </Form>
      </Card>

      <Card
        title="Product Lines"
        className="shadow-kpi"
        extra={
          <Button type="dashed" icon={<PlusOutlined />} onClick={addProductLine}>
            Add Product
          </Button>
        }
      >
        <Table
          columns={productColumns}
          dataSource={productLines}
          pagination={false}
          locale={{ emptyText: "No products added. Click 'Add Product' to begin." }}
        />
      </Card>

      <Card className="shadow-kpi">
        <Space size="middle">
          <Button
            type="primary"
            icon={<CheckOutlined />}
            size="large"
            onClick={handleValidate}
            loading={createReceiptMutation.isPending}
          >
            Validate Receipt
          </Button>
        </Space>
      </Card>
    </div>
  );
}
