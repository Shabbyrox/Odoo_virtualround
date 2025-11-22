import { useState } from "react";
import { Card, Form, Input, Select, DatePicker, Button, Table, Space, InputNumber, Steps } from "antd";
import { PlusOutlined, DeleteOutlined, CheckOutlined } from "@ant-design/icons";

const { Option } = Select;

interface ProductLine {
  key: string;
  productId: string;
  productName: string;
  quantity: number;
  picked: boolean;
  packed: boolean;
}

export default function Deliveries() {
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [productLines, setProductLines] = useState<ProductLine[]>([]);

  const addProductLine = () => {
    const newLine: ProductLine = {
      key: Date.now().toString(),
      productId: "",
      productName: "",
      quantity: 0,
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
            value={record.productId}
            onChange={(value) => handleProductChange(record.key, "productId", value)}
            disabled={currentStep > 0}
          >
            <Option value="PROD-001">PROD-001 - Wireless Mouse</Option>
            <Option value="PROD-002">PROD-002 - Office Chair</Option>
            <Option value="PROD-003">PROD-003 - Notebook A4</Option>
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
          alert("Please add at least one product");
          return;
        }
        setCurrentStep(1);
      });
    } else if (currentStep === 1) {
      const allPicked = productLines.every((line) => line.picked);
      if (!allPicked) {
        alert("Please pick all items before proceeding");
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      const allPacked = productLines.every((line) => line.packed);
      if (!allPacked) {
        alert("Please pack all items before validating");
        return;
      }
      handleValidate();
    }
  };

  const handleValidate = () => {
    console.log("Delivery validated:", { form: form.getFieldsValue(), products: productLines });
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

      {currentStep === 0 && (
        <Card title="Delivery Details" className="shadow-kpi">
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
                  <Option value="customer-1">ABC Corporation</Option>
                  <Option value="customer-2">XYZ Retail</Option>
                  <Option value="customer-3">Global Trading Co.</Option>
                </Select>
              </Form.Item>
              <Form.Item
                label="Source Location"
                name="location"
                rules={[{ required: true, message: "Please select location" }]}
              >
                <Select placeholder="Select location">
                  <Option value="main-a1">Main Warehouse - A1</Option>
                  <Option value="main-b2">Main Warehouse - B2</Option>
                  <Option value="dc-a-d1">Distribution Center A - D1</Option>
                </Select>
              </Form.Item>
            </div>
            <Form.Item label="Shipping Address" name="address">
              <Input.TextArea rows={3} placeholder="Enter shipping address" />
            </Form.Item>
          </Form>
        </Card>
      )}

      <Card
        title={`Product Lines - ${
          currentStep === 0 ? "Order Entry" : currentStep === 1 ? "Picking" : "Packing"
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
          <Button type="primary" icon={<CheckOutlined />} size="large" onClick={handleNextStep}>
            {currentStep === 2 ? "Validate Delivery" : "Next Step"}
          </Button>
        </Space>
      </Card>
    </div>
  );
}
