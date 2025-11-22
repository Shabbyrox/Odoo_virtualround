import { useState } from "react";
import { Form, Input, Button, Card, message, Divider } from "antd";
import { UserOutlined, LockOutlined, GoogleOutlined } from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export default function Login() {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const onFinish = async (values: any) => {
        setLoading(true);
        const { error } = await supabase.auth.signInWithPassword({
            email: values.email,
            password: values.password,
        });

        if (error) {
            message.error(error.message);
            setLoading(false);
        } else {
            message.success("Logged in successfully");
            navigate("/");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <Card className="w-full max-w-md shadow-lg">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-900">StockMaster</h2>
                    <p className="mt-2 text-sm text-gray-600">Sign in to your account</p>
                </div>

                <Form
                    name="login"
                    initialValues={{ remember: true }}
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

                    <Form.Item
                        name="password"
                        rules={[{ required: true, message: "Please input your Password!" }]}
                    >
                        <Input.Password prefix={<LockOutlined />} placeholder="Password" />
                    </Form.Item>

                    <div className="flex justify-end mb-4">
                        <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                            Forgot password?
                        </Link>
                    </div>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" className="w-full" loading={loading}>
                            Log in
                        </Button>
                    </Form.Item>

                    <Divider plain>Or</Divider>

                    <div className="text-center mt-4">
                        <span className="text-gray-600">Don't have an account? </span>
                        <Link to="/signup" className="text-primary font-medium hover:underline">
                            Sign up
                        </Link>
                    </div>
                </Form>
            </Card>
        </div>
    );
}
