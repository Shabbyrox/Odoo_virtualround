import { useState } from "react";
import { Form, Input, Button, Card, message } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export default function ForgotPassword() {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const onFinish = async (values: any) => {
        setLoading(true);
        const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
            redirectTo: `${window.location.origin}/reset-password`,
        });

        if (error) {
            message.error(error.message);
            setLoading(false);
        } else {
            message.success("Password reset link sent to your email.");
            navigate("/login");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <Card className="w-full max-w-md shadow-lg">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-900">Reset Password</h2>
                    <p className="mt-2 text-sm text-gray-600">Enter your email to receive a reset link</p>
                </div>

                <Form
                    name="forgot-password"
                    onFinish={onFinish}
                    layout="vertical"
                    size="large"
                >
                    <Form.Item
                        name="email"
                        rules={[
                            { required: true, message: "Please input your Email!" },
                            { type: "email", message: "Please enter a valid email!" },
                        ]}
                    >
                        <Input prefix={<UserOutlined />} placeholder="Email" />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" className="w-full" loading={loading}>
                            Send Reset Link
                        </Button>
                    </Form.Item>

                    <div className="text-center mt-4">
                        <Link to="/login" className="text-primary font-medium hover:underline">
                            Back to Login
                        </Link>
                    </div>
                </Form>
            </Card>
        </div>
    );
}
