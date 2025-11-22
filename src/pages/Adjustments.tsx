import { Card, Form, Select, InputNumber, Input, Button, Space } from "antd";
import { SaveOutlined, CheckOutlined } from "@ant-design/icons";

const { Option } = Select;
const { TextArea } = Input;

export default function Adjustments() {
  const [form] = Form.useForm();

  const handleSaveDraft = () => {
    console.log("Saving adjustment as draft...");
  };

  const handleValidate = () => {
    form.validateFields().then((values) => {
      console.log("Adjustment validated:", values);
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
        <Form form={form} layout="vertical">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              label="Product"
              name="product"
              rules={[{ required: true, message: "Please select product" }]}
            >
              <Select placeholder="Select product" showSearch>
                <Option value="PROD-001">PROD-001 - Wireless Mouse</Option>
                <Option value="PROD-002">PROD-002 - Office Chair</Option>
                <Option value="PROD-003">PROD-003 - Notebook A4</Option>
              </Select>
            </Form.Item>
            <Form.Item
              label="Location"
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
              />
            </Form.Item>
          </div>

          <Form.Item
            label="Adjustment Reason"
            name="reason"
            rules={[{ required: true, message: "Please provide a reason" }]}
          >
            <Select placeholder="Select reason">
              <Option value="physical-count">Physical Count Verification</Option>
              <Option value="damaged">Damaged Goods</Option>
              <Option value="expired">Expired Products</Option>
              <Option value="theft">Theft/Loss</Option>
              <Option value="error">System Entry Error</Option>
              <Option value="other">Other</Option>
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
            Validate Adjustment
          </Button>
        </Space>
      </Card>
    </div>
  );
}
