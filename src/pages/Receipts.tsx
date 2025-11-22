import { useState } from "react";
import { Card, Form, Input, Select, DatePicker, Button, Table, Space, InputNumber, Divider } from "antd";
import { PlusOutlined, DeleteOutlined, SaveOutlined, CheckOutlined } from "@ant-design/icons";

const { Option } = Select;

interface ProductLine {
  key: string;
  productId: string;
  productName: string;
  quantity: number;
}

export default function Receipts() {
  const [form] = Form.useForm();
  const [productLines, setProductLines] = useState<ProductLine[]>([]);

  const addProductLine = () => {
    const newLine: ProductLine = {
      key: Date.now().toString(),
      productId: "",
      productName: "",
      quantity: 0,
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
          value={record.productId}
          onChange={(value) => handleProductChange(record.key, "productId", value)}
        >
          <Option value="PROD-001">PROD-001 - Wireless Mouse</Option>
          <Option value="PROD-002">PROD-002 - Office Chair</Option>
          <Option value="PROD-003">PROD-003 - Notebook A4</Option>
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

  const handleSaveDraft = () => {
    console.log("Saving as draft...");
  };

  const handleValidate = () => {
    form.validateFields().then((values) => {
      console.log("Receipt validated:", { ...values, products: productLines });
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
                <Option value="supplier-1">TechPro Distributors</Option>
                <Option value="supplier-2">Office Furniture Inc.</Option>
                <Option value="supplier-3">Stationery Wholesale Co.</Option>
              </Select>
            </Form.Item>
            <Form.Item
              label="Target Location"
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
            type="default"
            icon={<SaveOutlined />}
            size="large"
            onClick={handleSaveDraft}
          >
            Save as Draft
          </Button>
          <Button
            type="primary"
            icon={<CheckOutlined />}
            size="large"
            onClick={handleValidate}
          >
            Validate Receipt
          </Button>
        </Space>
      </Card>
    </div>
  );
}
