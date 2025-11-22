import { useState } from "react";
import { Table, Button, Space, Tag, Modal, Form, Input, Select, InputNumber, Card } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";

const { Option } = Select;

interface ProductType {
  key: string;
  sku: string;
  name: string;
  category: string;
  unit: string;
  totalStock: number;
  locations: { location: string; quantity: number }[];
}

// Mock product data
const mockProducts: ProductType[] = [
  {
    key: "1",
    sku: "PROD-001",
    name: "Wireless Mouse",
    category: "Electronics",
    unit: "Unit",
    totalStock: 150,
    locations: [
      { location: "Main Warehouse - A1", quantity: 100 },
      { location: "Main Warehouse - B2", quantity: 50 },
    ],
  },
  {
    key: "2",
    sku: "PROD-002",
    name: "Office Chair",
    category: "Furniture",
    unit: "Unit",
    totalStock: 45,
    locations: [
      { location: "Main Warehouse - C3", quantity: 30 },
      { location: "Distribution Center A - D1", quantity: 15 },
    ],
  },
  {
    key: "3",
    sku: "PROD-003",
    name: "Notebook A4",
    category: "Office Supplies",
    unit: "Pack",
    totalStock: 500,
    locations: [
      { location: "Main Warehouse - E5", quantity: 300 },
      { location: "Distribution Center B - F2", quantity: 200 },
    ],
  },
];

export default function Products() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductType | null>(null);
  const [form] = Form.useForm();

  const columns: ColumnsType<ProductType> = [
    {
      title: "SKU",
      dataIndex: "sku",
      key: "sku",
      render: (text) => <span className="font-mono font-medium">{text}</span>,
    },
    {
      title: "Product Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      render: (category) => <Tag color="blue">{category}</Tag>,
    },
    {
      title: "Unit",
      dataIndex: "unit",
      key: "unit",
    },
    {
      title: "Total Stock",
      dataIndex: "totalStock",
      key: "totalStock",
      render: (stock) => (
        <span className={stock < 50 ? "text-warning font-semibold" : "font-semibold"}>
          {stock}
        </span>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => {
              setSelectedProduct(record);
              setIsDetailModalOpen(true);
            }}
          >
            View
          </Button>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => {
              form.setFieldsValue(record);
              setIsModalOpen(true);
            }}
          >
            Edit
          </Button>
          <Button type="link" danger icon={<DeleteOutlined />}>
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  const locationColumns = [
    {
      title: "Location",
      dataIndex: "location",
      key: "location",
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
      render: (qty: number) => <span className="font-semibold">{qty}</span>,
    },
  ];

  const handleCreateProduct = () => {
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleModalOk = () => {
    form.validateFields().then((values) => {
      console.log("Product values:", values);
      setIsModalOpen(false);
      form.resetFields();
    });
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-kpi">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold text-foreground">Product Management</h2>
          <Space>
            <Button onClick={() => console.log("Manage categories")}>
              Manage Categories
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreateProduct}
            >
              Add New Product
            </Button>
          </Space>
        </div>
      </Card>

      <Card className="shadow-kpi">
        <Table
          columns={columns}
          dataSource={mockProducts}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 1000 }}
        />
      </Card>

      {/* Create/Edit Product Modal */}
      <Modal
        title="Product Details"
        open={isModalOpen}
        onOk={handleModalOk}
        onCancel={() => setIsModalOpen(false)}
        width={600}
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Form.Item
            label="Product Name"
            name="name"
            rules={[{ required: true, message: "Please enter product name" }]}
          >
            <Input placeholder="Enter product name" />
          </Form.Item>
          <Form.Item
            label="SKU"
            name="sku"
            rules={[{ required: true, message: "Please enter SKU" }]}
          >
            <Input placeholder="Enter SKU" />
          </Form.Item>
          <Form.Item
            label="Category"
            name="category"
            rules={[{ required: true, message: "Please select category" }]}
          >
            <Select placeholder="Select category">
              <Option value="Electronics">Electronics</Option>
              <Option value="Furniture">Furniture</Option>
              <Option value="Office Supplies">Office Supplies</Option>
            </Select>
          </Form.Item>
          <Form.Item
            label="Unit of Measure"
            name="unit"
            rules={[{ required: true, message: "Please select unit" }]}
          >
            <Select placeholder="Select unit">
              <Option value="Unit">Unit</Option>
              <Option value="Pack">Pack</Option>
              <Option value="Box">Box</Option>
              <Option value="Kg">Kilogram</Option>
            </Select>
          </Form.Item>
          <Form.Item
            label="Initial Stock"
            name="totalStock"
            rules={[{ required: true, message: "Please enter initial stock" }]}
          >
            <InputNumber
              min={0}
              placeholder="Enter quantity"
              style={{ width: "100%" }}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Product Detail Modal */}
      <Modal
        title={`Product Details - ${selectedProduct?.name}`}
        open={isDetailModalOpen}
        onCancel={() => setIsDetailModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setIsDetailModalOpen(false)}>
            Close
          </Button>,
        ]}
        width={700}
      >
        {selectedProduct && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-muted-foreground">SKU:</span>
                <p className="font-mono font-semibold">{selectedProduct.sku}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Category:</span>
                <p className="font-semibold">{selectedProduct.category}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Unit:</span>
                <p className="font-semibold">{selectedProduct.unit}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Total Stock:</span>
                <p className="font-semibold text-lg">{selectedProduct.totalStock}</p>
              </div>
            </div>
            <div className="mt-6">
              <h3 className="font-semibold mb-3">Stock by Location</h3>
              <Table
                columns={locationColumns}
                dataSource={selectedProduct.locations}
                pagination={false}
                size="small"
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
