import { useState } from "react";
import { Tabs, Table, Button, Modal, Form, Input, Space, Popconfirm, Tag, Switch } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, HomeOutlined } from "@ant-design/icons";

const Settings = () => {
  const [activeTab, setActiveTab] = useState("warehouses");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingWarehouse, setEditingWarehouse] = useState<any>(null);

  // Mock data
  const [warehouses, setWarehouses] = useState([
    {
      id: 1,
      name: "Warehouse A",
      code: "WH-A",
      address: "123 Industrial Park, City Center",
      manager: "John Doe",
      capacity: "10000 sq ft",
      status: "active",
      isDefault: true,
    },
    {
      id: 2,
      name: "Warehouse B",
      code: "WH-B",
      address: "456 Distribution Ave, North District",
      manager: "Jane Smith",
      capacity: "8000 sq ft",
      status: "active",
      isDefault: false,
    },
    {
      id: 3,
      name: "Warehouse C",
      code: "WH-C",
      address: "789 Storage Road, South Zone",
      manager: "Mike Johnson",
      capacity: "12000 sq ft",
      status: "active",
      isDefault: false,
    },
  ]);

  const warehouseColumns = [
    {
      title: "Code",
      dataIndex: "code",
      key: "code",
      render: (code: string, record: any) => (
        <div className="flex items-center gap-2">
          <HomeOutlined />
          <span className="font-medium">{code}</span>
          {record.isDefault && <Tag color="blue">Default</Tag>}
        </div>
      ),
    },
    {
      title: "Warehouse Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Address",
      dataIndex: "address",
      key: "address",
    },
    {
      title: "Manager",
      dataIndex: "manager",
      key: "manager",
    },
    {
      title: "Capacity",
      dataIndex: "capacity",
      key: "capacity",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={status === "active" ? "green" : "red"}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: any) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Delete Warehouse"
            description="Are you sure you want to delete this warehouse?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
            disabled={record.isDefault}
          >
            <Button
              type="link"
              danger
              icon={<DeleteOutlined />}
              disabled={record.isDefault}
            >
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const handleAdd = () => {
    setEditingWarehouse(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (warehouse: any) => {
    setEditingWarehouse(warehouse);
    form.setFieldsValue(warehouse);
    setIsModalVisible(true);
  };

  const handleDelete = (id: number) => {
    setWarehouses(warehouses.filter(wh => wh.id !== id));
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingWarehouse) {
        setWarehouses(warehouses.map(wh =>
          wh.id === editingWarehouse.id ? { ...wh, ...values } : wh
        ));
      } else {
        const newWarehouse = {
          id: warehouses.length + 1,
          ...values,
          status: "active",
          isDefault: false,
        };
        setWarehouses([...warehouses, newWarehouse]);
      }
      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error("Validation failed:", error);
    }
  };

  const items = [
    {
      key: "warehouses",
      label: "Warehouses & Locations",
      children: (
        <div>
          <div className="flex justify-between items-center mb-4">
            <p className="text-muted-foreground">
              Manage your warehouse locations and storage facilities
            </p>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAdd}
            >
              Add Warehouse
            </Button>
          </div>
          <Table
            columns={warehouseColumns}
            dataSource={warehouses}
            rowKey="id"
            pagination={{ pageSize: 10 }}
          />
        </div>
      ),
    },
    {
      key: "general",
      label: "General Settings",
      children: (
        <div className="space-y-6">
          <div className="p-4 bg-card rounded-lg border">
            <h3 className="text-lg font-semibold mb-4">System Preferences</h3>
            <Space direction="vertical" size="large" className="w-full">
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-medium">Auto-confirm receipts</div>
                  <div className="text-sm text-muted-foreground">
                    Automatically validate receipts when all items are scanned
                  </div>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-medium">Low stock notifications</div>
                  <div className="text-sm text-muted-foreground">
                    Send alerts when products reach reorder level
                  </div>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-medium">Email notifications</div>
                  <div className="text-sm text-muted-foreground">
                    Receive email updates for important events
                  </div>
                </div>
                <Switch />
              </div>
            </Space>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-foreground">Settings</h1>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={items}
      />

      <Modal
        title={editingWarehouse ? "Edit Warehouse" : "Add New Warehouse"}
        open={isModalVisible}
        onOk={handleSubmit}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        okText={editingWarehouse ? "Update" : "Create"}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="code"
            label="Warehouse Code"
            rules={[{ required: true, message: "Please enter warehouse code" }]}
          >
            <Input placeholder="e.g., WH-A" />
          </Form.Item>
          <Form.Item
            name="name"
            label="Warehouse Name"
            rules={[{ required: true, message: "Please enter warehouse name" }]}
          >
            <Input placeholder="Enter warehouse name" />
          </Form.Item>
          <Form.Item
            name="address"
            label="Address"
            rules={[{ required: true, message: "Please enter address" }]}
          >
            <Input.TextArea
              rows={2}
              placeholder="Enter full address"
            />
          </Form.Item>
          <Form.Item
            name="manager"
            label="Manager"
            rules={[{ required: true, message: "Please enter manager name" }]}
          >
            <Input placeholder="Enter manager name" />
          </Form.Item>
          <Form.Item
            name="capacity"
            label="Capacity"
            rules={[{ required: true, message: "Please enter capacity" }]}
          >
            <Input placeholder="e.g., 10000 sq ft" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Settings;
