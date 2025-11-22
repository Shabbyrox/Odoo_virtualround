import { useState } from "react";
import { Table, Button, Modal, Form, Input, Space, Popconfirm, Tag } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";

const Categories = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingCategory, setEditingCategory] = useState<any>(null);

  // Mock data
  const [categories, setCategories] = useState([
    { id: 1, name: "Electronics", description: "Electronic devices and components", productCount: 45, status: "active" },
    { id: 2, name: "Furniture", description: "Office and home furniture", productCount: 23, status: "active" },
    { id: 3, name: "Stationery", description: "Office supplies and stationery", productCount: 67, status: "active" },
    { id: 4, name: "Food & Beverages", description: "Perishable and non-perishable items", productCount: 34, status: "active" },
  ]);

  const columns = [
    {
      title: "Category Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Product Count",
      dataIndex: "productCount",
      key: "productCount",
      align: "center" as const,
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
            title="Delete Category"
            description="Are you sure you want to delete this category?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const handleAdd = () => {
    setEditingCategory(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (category: any) => {
    setEditingCategory(category);
    form.setFieldsValue(category);
    setIsModalVisible(true);
  };

  const handleDelete = (id: number) => {
    setCategories(categories.filter(cat => cat.id !== id));
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingCategory) {
        setCategories(categories.map(cat => 
          cat.id === editingCategory.id ? { ...cat, ...values } : cat
        ));
      } else {
        const newCategory = {
          id: categories.length + 1,
          ...values,
          productCount: 0,
          status: "active",
        };
        setCategories([...categories, newCategory]);
      }
      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error("Validation failed:", error);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-foreground">Product Categories</h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAdd}
        >
          Add Category
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={categories}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editingCategory ? "Edit Category" : "Add New Category"}
        open={isModalVisible}
        onOk={handleSubmit}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        okText={editingCategory ? "Update" : "Create"}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Category Name"
            rules={[{ required: true, message: "Please enter category name" }]}
          >
            <Input placeholder="Enter category name" />
          </Form.Item>
          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: "Please enter description" }]}
          >
            <Input.TextArea
              rows={3}
              placeholder="Enter category description"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Categories;
