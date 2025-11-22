import { useState } from "react";
import { Card, Form, Input, Select, DatePicker, Button, Table, Space, InputNumber, Steps, message } from "antd";
import { PlusOutlined, DeleteOutlined, CheckOutlined } from "@ant-design/icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const { Option } = Select;

interface ProductLine {
  key: string;
  productId: string;
  quantity: number;
  picked: boolean;
  packed: boolean;
}

export default function Deliveries() {
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [productLines, setProductLines] = useState<ProductLine[]>([]);
  const queryClient = useQueryClient();

  // Fetch Customers
  const { data: customers = [] } = useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      const { data, error } = await supabase.from("customers").select("id, name");
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

  const createDeliveryMutation = useMutation({
    mutationFn: async (values: any) => {
      // 1. Create Delivery
      const { data: delivery, error: deliveryError } = await supabase
        .from("deliveries")
        .insert({
          customer_id: values.customer,
          location_id: values.location,
          date: values.date?.toISOString(),
          address: values.address,
          status: "completed",
        } as any)
        .select()
        .single();

      if (deliveryError) throw deliveryError;
      if (!delivery) throw new Error("Failed to create delivery record");

      // 2. Create Delivery Items & Update Inventory & Log Movements
      for (const line of productLines) {
        // Add Item
        const { error: itemError } = await supabase.from("delivery_items").insert({
          delivery_id: (delivery as any).id,
          product_id: line.productId,
          quantity: line.quantity,
          picked: true,
          packed: true,
        } as any);
        if (itemError) throw itemError;

        // Log Movement
        const { error: moveError } = await supabase.from("movements").insert({
          product_id: line.productId,
          type: "Delivery",
          from_location_id: values.location,
          quantity: line.quantity,
          reason: `Delivery #${(delivery as any).id.slice(0, 8)}`,
          status: "completed",
        } as any);
        if (moveError) throw moveError;

        // Update Inventory (Get current first)
        const { data: currentInv } = await supabase
          .from("inventory")
          .select("quantity")
          .eq("product_id", line.productId)
          .eq("location_id", values.location)
          .maybeSingle();

        const currentQty = currentInv?.quantity || 0;
        if (currentQty < line.quantity) {
          throw new Error(`Insufficient stock for product ID ${line.productId}`);
        }

        const newQty = currentQty - line.quantity;

        const { error: invError } = await supabase
          .from("inventory")
          .upsert({
            product_id: line.productId,
            location_id: values.location,
            quantity: newQty,
          } as any, { onConflict: 'product_id,location_id' });

        if (invError) throw invError;
      }
    },
    onSuccess: () => {
      message.success("Delivery validated and inventory updated");
      form.resetFields();
      setProductLines([]);
      setCurrentStep(0);
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (error) => {
      message.error(`Error creating delivery: ${error.message}`);
    },
  });

  const addProductLine = () => {
    const newLine: ProductLine = {
      key: Date.now().toString(),
      productId: "",
      quantity: 1,
      picked: false,
      packed: false,
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

  const getProductColumns = () => {
    const baseColumns = [
      {
        title: "Product",
        dataIndex: "productId",
        key: "productId",
        width: "35%",
        render: (_: any, record: ProductLine) => (
          <Select
            placeholder="Select product"
            style={{ width: "100%" }}
            value={record.productId || undefined}
            onChange={(value) => handleProductChange(record.key, "productId", value)}
            disabled={currentStep > 0}
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
        title: "Quantity",
        dataIndex: "quantity",
        key: "quantity",
        width: "25%",
        render: (_: any, record: ProductLine) => (
          <InputNumber
            min={1}
            value={record.quantity}
            onChange={(value) => handleProductChange(record.key, "quantity", value || 0)}
            style={{ width: "100%" }}
            disabled={currentStep > 0}
          />
        ),
      },
    ];

    if (currentStep >= 1) {
      baseColumns.push({
        title: "Picked",
        dataIndex: "picked",
        key: "picked",
        width: "15%",
        render: (_: any, record: ProductLine) => (
          <Button
            type={record.picked ? "primary" : "default"}
            onClick={() => handleProductChange(record.key, "picked", !record.picked)}
          >
            {record.picked ? "✓ Picked" : "Pick"}
          </Button>
        ),
      } as any);
    }

    if (currentStep >= 2) {
      baseColumns.push({
        title: "Packed",
        dataIndex: "packed",
        key: "packed",
        width: "15%",
        render: (_: any, record: ProductLine) => (
          <Button
            type={record.packed ? "primary" : "default"}
            onClick={() => handleProductChange(record.key, "packed", !record.packed)}
            disabled={!record.picked}
          >
            {record.packed ? "✓ Packed" : "Pack"}
          </Button>
        ),
      } as any);
    }

    if (currentStep === 0) {
      baseColumns.push({
        title: "Actions",
        key: "actions",
        width: "10%",
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
      } as any);
    }

    return baseColumns;
  };

  const handleNextStep = () => {
    if (currentStep === 0) {
      form.validateFields().then(() => {
        if (productLines.length === 0) {
          message.error("Please add at least one product");
          return;
        }
        if (productLines.some(l => !l.productId || l.quantity <= 0)) {
          message.error("Please complete all product lines");
          return;
        }
        setCurrentStep(1);
      });
    } else if (currentStep === 1) {
      const allPicked = productLines.every((line) => line.picked);
      if (!allPicked) {
        message.error("Please pick all items before proceeding");
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      const allPacked = productLines.every((line) => line.packed);
      if (!allPacked) {
        message.error("Please pack all items before validating");
        return;
      }
      handleValidate();
    }
  };

  const handleValidate = () => {
    createDeliveryMutation.mutate(form.getFieldsValue());
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-kpi">
        <h2 className="text-2xl font-semibold text-foreground">Create Delivery Order</h2>
        <p className="text-muted-foreground mt-1">
          Process outgoing stock for customers
        </p>
      </Card>

      <Card className="shadow-kpi">
        <Steps
          current={currentStep}
          className="mb-6"
          items={[
            {
              title: "Create Order",
              description: "Add products",
            },
            {
              title: "Pick Items",
              description: "Pick from stock",
            },
            {
              title: "Pack & Validate",
              description: "Pack and ship",
            },
          ]}
        />
      </Card>

      <Card
        title="Delivery Details"
        className="shadow-kpi"
        style={{ display: currentStep === 0 ? 'block' : 'none' }}
      >
        <Form form={form} layout="vertical">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Form.Item
              label="Delivery Date"
              name="date"
              rules={[{ required: true, message: "Please select date" }]}
            >
              <DatePicker style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item
              label="Customer"
              name="customer"
              rules={[{ required: true, message: "Please select customer" }]}
            >
              <Select placeholder="Select customer">
                {customers.map((c: any) => (
                  <Option key={c.id} value={c.id}>{c.name}</Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              label="Source Location"
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
          <Form.Item label="Shipping Address" name="address">
            <Input.TextArea rows={3} placeholder="Enter shipping address" />
          </Form.Item>
        </Form>
      </Card>

      <Card
        title={`Product Lines - ${currentStep === 0 ? "Order Entry" : currentStep === 1 ? "Picking" : "Packing"
          }`}
        className="shadow-kpi"
        extra={
          currentStep === 0 && (
            <Button type="dashed" icon={<PlusOutlined />} onClick={addProductLine}>
              Add Product
            </Button>
          )
        }
      >
        <Table
          columns={getProductColumns()}
          dataSource={productLines}
          pagination={false}
          locale={{ emptyText: "No products added. Click 'Add Product' to begin." }}
        />
      </Card>

      <Card className="shadow-kpi">
        <Space size="middle">
          {currentStep > 0 && (
            <Button size="large" onClick={() => setCurrentStep(currentStep - 1)}>
              Previous
            </Button>
          )}
          <Button
            type="primary"
            icon={<CheckOutlined />}
            size="large"
            onClick={handleNextStep}
            loading={createDeliveryMutation.isPending}
          >
            {currentStep === 2 ? "Validate Delivery" : "Next Step"}
          </Button>
        </Space>
      </Card>
    </div>
  );
}
