import { useState, useEffect } from "react";
import { Card, Form, Select, InputNumber, Input, Button, Space, message } from "antd";
import { SaveOutlined, CheckOutlined } from "@ant-design/icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const { Option } = Select;
const { TextArea } = Input;

export default function Adjustments() {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [systemQuantity, setSystemQuantity] = useState<number>(0);

  // Fetch Products
  const { data: products = [] } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("id, name, sku");
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

  // Fetch Current Inventory when Product & Location selected
  useEffect(() => {
    const fetchInventory = async () => {
      if (selectedProduct && selectedLocation) {
        const { data, error } = await supabase
          .from("inventory")
          .select("quantity")
          .eq("product_id", selectedProduct)
          .eq("location_id", selectedLocation)
          .maybeSingle();

        if (error) {
          console.error("Error fetching inventory:", error);
          return;
        }

        const qty = data?.quantity || 0;
        setSystemQuantity(qty);
        form.setFieldsValue({ systemQuantity: qty });
        calculateDifference();
      }
    };

    fetchInventory();
  }, [selectedProduct, selectedLocation, form]);

  const calculateDifference = () => {
    const counted = form.getFieldValue("countedQuantity");
    if (counted !== undefined) {
      const diff = counted - systemQuantity;
      form.setFieldsValue({ difference: diff });
    }
  };

  const createAdjustmentMutation = useMutation({
    mutationFn: async (values: any) => {
      const difference = values.countedQuantity - values.systemQuantity;

      // 1. Create Adjustment Record
      const { error: adjError } = await supabase.from("adjustments").insert({
        product_id: values.product,
        location_id: values.location,
        system_quantity: values.systemQuantity,
        counted_quantity: values.countedQuantity,
        reason: values.reason,
        notes: values.notes,
      });
      if (adjError) throw adjError;

      // 2. Create Movement Record
      const { error: movError } = await supabase.from("movements").insert({
        product_id: values.product,
        type: "Adjustment",
        from_location_id: values.location, // or to_location depending on gain/loss, but simplified here
        to_location_id: values.location,
        quantity: difference,
        reason: values.reason,
        status: "completed",
      });
      if (movError) throw movError;

      // 3. Update Inventory
      const { error: invError } = await supabase
        .from("inventory")
        .upsert({
          product_id: values.product,
          location_id: values.location,
          quantity: values.countedQuantity,
        }, { onConflict: 'product_id,location_id' });

      if (invError) throw invError;
    },
    onSuccess: () => {
      message.success("Adjustment validated and inventory updated");
      form.resetFields();
      setSelectedProduct(null);
      setSelectedLocation(null);
      setSystemQuantity(0);
      queryClient.invalidateQueries({ queryKey: ["products"] }); // Update product stock views
    },
    onError: (error) => {
      message.error(`Error processing adjustment: ${error.message}`);
    },
  });

  const handleValidate = () => {
    form.validateFields().then((values) => {
      createAdjustmentMutation.mutate(values);
    });
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-kpi">
        <h2 className="text-2xl font-semibold text-foreground">Inventory Adjustment</h2>
        <p className="text-muted-foreground mt-1">
          Adjust inventory counts based on physical verification
        </p>
      </Card>

      <Card title="Adjustment Details" className="shadow-kpi">
        <Form form={form} layout="vertical" onValuesChange={(changedValues) => {
          if (changedValues.countedQuantity !== undefined) {
            calculateDifference();
          }
        }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              label="Product"
              name="product"
              rules={[{ required: true, message: "Please select product" }]}
            >
              <Select
                placeholder="Select product"
                showSearch
                optionFilterProp="children"
                onChange={(val) => setSelectedProduct(val)}
              >
                {products.map((p: any) => (
                  <Option key={p.id} value={p.id}>{p.sku} - {p.name}</Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              label="Location"
              name="location"
              rules={[{ required: true, message: "Please select location" }]}
            >
              <Select
                placeholder="Select location"
                onChange={(val) => setSelectedLocation(val)}
              >
                {locations.map((l: any) => (
                  <Option key={l.id} value={l.id}>{l.name}</Option>
                ))}
              </Select>
            </Form.Item>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Form.Item label="System Quantity" name="systemQuantity">
              <InputNumber
                style={{ width: "100%" }}
                disabled
                placeholder="Auto-filled"
              />
            </Form.Item>
            <Form.Item
              label="Counted Quantity"
              name="countedQuantity"
              rules={[{ required: true, message: "Please enter counted quantity" }]}
            >
              <InputNumber
                min={0}
                style={{ width: "100%" }}
                placeholder="Enter physical count"
              />
            </Form.Item>
            <Form.Item label="Difference" name="difference">
              <InputNumber
                style={{ width: "100%" }}
                disabled
                placeholder="Auto-calculated"
                className={
                  form.getFieldValue("difference") < 0 ? "text-red-500" :
                    form.getFieldValue("difference") > 0 ? "text-green-500" : ""
                }
              />
            </Form.Item>
          </div>

          <Form.Item
            label="Adjustment Reason"
            name="reason"
            rules={[{ required: true, message: "Please provide a reason" }]}
          >
            <Select placeholder="Select reason">
              <Option value="Physical Count Verification">Physical Count Verification</Option>
              <Option value="Damaged Goods">Damaged Goods</Option>
              <Option value="Expired Products">Expired Products</Option>
              <Option value="Theft/Loss">Theft/Loss</Option>
              <Option value="System Entry Error">System Entry Error</Option>
              <Option value="Other">Other</Option>
            </Select>
          </Form.Item>

          <Form.Item label="Notes" name="notes">
            <TextArea
              rows={4}
              placeholder="Enter additional notes about this adjustment..."
            />
          </Form.Item>
        </Form>
      </Card>

      <Card className="shadow-kpi">
        <Space size="middle">
          <Button
            type="primary"
            icon={<CheckOutlined />}
            size="large"
            onClick={handleValidate}
            loading={createAdjustmentMutation.isPending}
          >
            Validate Adjustment
          </Button>
        </Space>
      </Card>
    </div>
  );
}
