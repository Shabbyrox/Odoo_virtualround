import { useState } from "react";
import { Tabs, Table, Button, Modal, Form, Input, Space, Popconfirm, Tag, Switch, Select, message } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, HomeOutlined } from "@ant-design/icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const { Option } = Select;

const Settings = () => {
  const [activeTab, setActiveTab] = useState("locations");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingLocation, setEditingLocation] = useState<any>(null);
  const queryClient = useQueryClient();

  // Fetch Locations
  const { data: locations = [], isLoading } = useQuery({
    queryKey: ["locations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("locations")
        .select("*")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  // Upsert Location Mutation
  const upsertLocationMutation = useMutation({
    mutationFn: async (values: any) => {
      const { error } = await supabase
        .from("locations")
        .upsert({
          id: editingLocation?.id,
          name: values.name,
          type: values.type,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["locations"] });
      message.success(editingLocation ? "Location updated" : "Location created");
      setIsModalVisible(false);
      form.resetFields();
      setEditingLocation(null);
    },
    onError: (error) => {
      message.error(`Error: ${error.message}`);
    },
  });

  // Delete Location Mutation
  const deleteLocationMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("locations").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["locations"] });
      message.success("Location deleted");
    },
    onError: (error) => {
      message.error(`Error deleting location: ${error.message}`);
    },
  });

  const locationColumns = [
    {
      title: "Location Name",
      dataIndex: "name",
      key: "name",
      render: (text: string) => (
        <div className="flex items-center gap-2">
          <HomeOutlined />
          <span className="font-medium">{text}</span>
        </div>
      ),
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      render: (type: string) => <Tag color="blue">{type}</Tag>,
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
            title="Delete Location"
            description="Are you sure you want to delete this location?"
            onConfirm={() => deleteLocationMutation.mutate(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              type="link"
              danger
              icon={<DeleteOutlined />}
            >
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const handleAdd = () => {
    setEditingLocation(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (location: any) => {
    setEditingLocation(location);
    form.setFieldsValue(location);
    setIsModalVisible(true);
  };

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      upsertLocationMutation.mutate(values);
    });
  };

  const items = [
    {
      key: "locations",
      label: "Locations",
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
              Add Location
            </Button>
          </div>
          <Table
            columns={locationColumns}
            dataSource={locations}
            rowKey="id"
            loading={isLoading}
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
        title={editingLocation ? "Edit Location" : "Add New Location"}
        open={isModalVisible}
        onOk={handleSubmit}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        okText={editingLocation ? "Update" : "Create"}
        width={600}
        confirmLoading={upsertLocationMutation.isPending}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Location Name"
            rules={[{ required: true, message: "Please enter location name" }]}
          >
            <Input placeholder="e.g., Main Warehouse" />
          </Form.Item>
          <Form.Item
            name="type"
            label="Type"
            rules={[{ required: true, message: "Please select type" }]}
          >
            <Select placeholder="Select type">
              <Option value="Warehouse">Warehouse</Option>
              <Option value="Distribution Center">Distribution Center</Option>
              <Option value="Store">Store</Option>
              <Option value="Other">Other</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Settings;
