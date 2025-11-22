import { useState } from "react";
import { Form, Input, Button, Card, message, Divider } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export default function Signup() {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const onFinish = async (values: any) => {
        setLoading(true);
        const { error } = await supabase.auth.signUp({
            email: values.email,
            password: values.password,
        });

        if (error) {
            message.error(error.message);
            setLoading(false);
        } else {
            message.success("Signup successful! Please check your email for confirmation.");
            navigate("/login");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <Card className="w-full max-w-md shadow-lg">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-900">StockMaster</h2>
                    <p className="mt-2 text-sm text-gray-600">Create a new account</p>
                </div>

                <Form
                    name="signup"
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
                        rules={[
                            { required: true, message: "Please input your Password!" },
                            { min: 6, message: "Password must be at least 6 characters!" },
                        ]}
                    >
                        <Input.Password prefix={<LockOutlined />} placeholder="Password" />
                    </Form.Item>

                    <Form.Item
                        name="confirm"
                        dependencies={['password']}
                        hasFeedback
                        rules={[
                            { required: true, message: 'Please confirm your password!' },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue('password') === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error('The two passwords that you entered do not match!'));
                                },
                            }),
                        ]}
                    >
                        <Input.Password prefix={<LockOutlined />} placeholder="Confirm Password" />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" className="w-full" loading={loading}>
                            Sign Up
                        </Button>
                    </Form.Item>

                    <div className="text-center mt-4">
                        <span className="text-gray-600">Already have an account? </span>
                        <Link to="/login" className="text-primary font-medium hover:underline">
                            Log in
                        </Link>
                    </div>
                </Form>
            </Card>
        </div>
    );
}
