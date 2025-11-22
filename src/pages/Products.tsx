import { useState } from "react";
import { Table, Button, Space, Tag, Modal, Form, Input, Select, InputNumber, Card, message } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const { Option } = Select;

interface ProductType {
  id: string;
  sku: string;
  name: string;
  category: { name: string } | null;
  unit: string;
  min_stock_level: number;
  inventory: { quantity: number; location: { name: string } | null }[];
}

export default function Products() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductType | null>(null);
  const [editingProduct, setEditingProduct] = useState<ProductType | null>(null);
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  // Fetch Products
  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select(`
          *,
          category:categories(name, id),
          inventory(quantity, location:locations(name))
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as unknown as ProductType[];
    },
  });

  // Fetch Categories
  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("status", "active");
      if (error) throw error;
      return data;
    },
  });

  // Fetch Locations (for initial stock assignment)
  const { data: locations = [] } = useQuery({
    queryKey: ["locations"],
    queryFn: async () => {
      const { data, error } = await supabase.from("locations").select("*");
      if (error) throw error;
      return data;
    },
  });

  // Update Product Mutation
  const updateProductMutation = useMutation({
    mutationFn: async (values: any) => {
      if (!editingProduct) return;

      const { error } = await supabase
        .from("products")
        .update({
          name: values.name,
          sku: values.sku,
          category_id: values.category_id,
          unit: values.unit,
          min_stock_level: values.min_stock_level,
        } as unknown as never)
        .eq("id", editingProduct.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      message.success("Product updated successfully");
      setIsModalOpen(false);
      setEditingProduct(null);
      form.resetFields();
    },
    onError: (error) => {
      message.error(`Error updating product: ${error.message}`);
    },
  });

  // Create Product Mutation
  const createProductMutation = useMutation({
    mutationFn: async (values: any) => {
      // 1. Create Product
      const { data: product, error: productError } = await supabase
        .from("products")
        .insert({
          name: values.name,
          sku: values.sku,
          category_id: values.category_id,
          unit: values.unit,
          min_stock_level: values.min_stock_level || 0,
        } as unknown as never)
        .select()
        .single();

      if (productError) throw productError;

      // 2. Add Initial Stock (if any)
      // Note: locations is fetched via useQuery, so it should be available in the closure.
      // If it's not, we might need to refetch or pass it.
      // Assuming locations is available from the component scope.
      if (values.initial_stock > 0 && locations.length > 0) {
        // Default to first location for now
        const defaultLocation = locations[0];
        const { error: inventoryError } = await supabase
          .from("inventory")
          .insert({
            product_id: (product as any).id,
            location_id: defaultLocation.id,
            quantity: values.initial_stock,
          } as unknown as never);

        if (inventoryError) throw inventoryError;

        // Log movement
        await supabase.from("movements").insert({
          product_id: (product as any).id,
          type: "Receipt",
          to_location_id: defaultLocation.id,
          quantity: values.initial_stock,
          reason: "Initial Stock",
          status: "completed"
        } as unknown as never);
      }

      return product;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      message.success("Product created successfully");
      setIsModalOpen(false);
      form.resetFields();
    },
    onError: (error) => {
      message.error(`Error creating product: ${error.message}`);
    },
  });

  // Delete Product Mutation
  const deleteProductMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      message.success("Product deleted successfully");
    },
    onError: (error) => {
      message.error(`Error deleting product: ${error.message}`);
    },
  });

  const locationColumns = [
    {
      title: "Location",
      dataIndex: ["location", "name"],
      key: "location",
      render: (text: string) => text || "Unknown Location",
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
      render: (qty: number) => <span className="font-semibold">{qty}</span>,
    },
  ];

  const columns: ColumnsType<ProductType> = [
    {
      title: "Product Name",
      dataIndex: "name",
      key: "name",
      render: (text) => <span className="font-medium">{text}</span>,
    },
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      render: (text) => <span className="text-xs text-gray-500" title={text}>{text.slice(0, 8)}...</span>,
    },
    {
      title: "Quantity",
      key: "quantity",
      render: (_, record) => {
        const totalStock = record.inventory?.reduce((sum, item) => sum + item.quantity, 0) || 0;
        return (
          <Tag color={totalStock <= record.min_stock_level ? "red" : "green"}>
            {totalStock} {record.unit}
          </Tag>
        );
      },
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
            onClick={() => handleEditProduct(record)}
          >
            Edit
          </Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => {
              Modal.confirm({
                title: "Delete Product",
                content: "Are you sure you want to delete this product?",
                onOk: () => deleteProductMutation.mutate(record.id),
              });
            }}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  // ... (keep locationColumns)

  const handleCreateProduct = () => {
    setEditingProduct(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEditProduct = (product: ProductType) => {
    setEditingProduct(product);
    form.setFieldsValue({
      name: product.name,
      sku: product.sku,
      category_id: (product.category as any)?.id, // Note: category object structure might need adjustment based on query
      unit: product.unit,
      min_stock_level: product.min_stock_level,
    });
    // We need to fetch the category_id correctly. The current query returns category: { name }. 
    // We might need to adjust the query or find the category ID from the list if not present.
    // Actually, the query is: category:categories(name). It doesn't return ID.
    // Let's update the query to return ID as well.
    setIsModalOpen(true);
  };

  const handleModalOk = () => {
    form.validateFields().then((values) => {
      if (editingProduct) {
        updateProductMutation.mutate(values);
      } else {
        createProductMutation.mutate(values);
      }
    });
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-kpi">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold text-foreground">Product Management</h2>
          <Space>
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
          dataSource={products}
          rowKey="id"
          loading={isLoading}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 1000 }}
        />
      </Card>

      {/* Create/Edit Product Modal */}
      <Modal
        title={editingProduct ? "Edit Product" : "Add New Product"}
        open={isModalOpen}
        onOk={handleModalOk}
        onCancel={() => {
          setIsModalOpen(false);
          setEditingProduct(null);
          form.resetFields();
        }}
        width={600}
        confirmLoading={createProductMutation.isPending || updateProductMutation.isPending}
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
            name="category_id"
            rules={[{ required: true, message: "Please select category" }]}
          >
            <Select placeholder="Select category">
              {categories.map((cat: any) => (
                <Option key={cat.id} value={cat.id}>
                  {cat.name}
                </Option>
              ))}
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

          {!editingProduct && (
            <Form.Item
              label="Initial Stock"
              name="initial_stock"
              initialValue={0}
              help="Initial stock can only be set when creating a product. Use Adjustments to change stock later."
            >
              <InputNumber
                min={0}
                placeholder="Enter quantity"
                style={{ width: "100%" }}
              />
            </Form.Item>
          )}

          <Form.Item
            label="Min Stock Level"
            name="min_stock_level"
            initialValue={0}
          >
            <InputNumber
              min={0}
              placeholder="Enter minimum stock alert level"
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
                <p className="font-semibold">{selectedProduct.category?.name || "N/A"}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Unit:</span>
                <p className="font-semibold">{selectedProduct.unit}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Total Stock:</span>
                <p className="font-semibold text-lg">
                  {selectedProduct.inventory?.reduce((sum, item) => sum + item.quantity, 0) || 0}
                </p>
              </div>
            </div>
            <div className="mt-6">
              <h3 className="font-semibold mb-3">Stock by Location</h3>
              <Table
                columns={locationColumns}
                dataSource={selectedProduct.inventory}
                pagination={false}
                size="small"
                rowKey={(record) => record.location?.name || Math.random()}
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
