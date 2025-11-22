import { useState, useEffect } from "react";
import { Layout, Menu, Input, Avatar, Button, message } from "antd";
import {
  DashboardOutlined,
  AppstoreOutlined,
  SwapOutlined,
  HistoryOutlined,
  SettingOutlined,
  UserOutlined,
  LogoutOutlined,
  SearchOutlined,
  InboxOutlined,
  ShoppingCartOutlined,
  ToolOutlined,
  HomeOutlined,
  TagsOutlined,
  ReloadOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import type { MenuProps } from "antd";
import { supabase } from "@/integrations/supabase/client";

const { Header, Sider, Content } = Layout;

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUserEmail(session.user.email || "User");
      } else {
        // Redirect to login if no session (basic protection)
        navigate("/login");
      }
    };
    getUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUserEmail(session.user.email || "User");
      } else {
        navigate("/login");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    message.success("Logged out successfully");
    navigate("/login");
  };

  const menuItems: MenuProps["items"] = [
    {
      key: "/",
      icon: <DashboardOutlined />,
      label: "Dashboard",
      onClick: () => navigate("/"),
    },
    {
      key: "products",
      icon: <AppstoreOutlined />,
      label: "Products",
      children: [
        {
          key: "/products",
          icon: <TagsOutlined />,
          label: "Create/Update",
          onClick: () => navigate("/products"),
        },
        {
          key: "/categories",
          icon: <TagsOutlined />,
          label: "Categories",
          onClick: () => navigate("/categories"),
        },
        {
          key: "/reordering",
          icon: <ReloadOutlined />,
          label: "Reordering Rules",
          onClick: () => navigate("/reordering"),
        },
      ],
    },
    {
      key: "operations",
      icon: <SwapOutlined />,
      label: "Operations",
      children: [
        {
          key: "/receipts",
          icon: <InboxOutlined />,
          label: "Receipts",
          onClick: () => navigate("/receipts"),
        },
        {
          key: "/deliveries",
          icon: <ShoppingCartOutlined />,
          label: "Delivery Orders",
          onClick: () => navigate("/deliveries"),
        },
        {
          key: "/adjustments",
          icon: <ToolOutlined />,
          label: "Inventory Adjustment",
          onClick: () => navigate("/adjustments"),
        },
      ],
    },
    {
      key: "/move-history",
      icon: <HistoryOutlined />,
      label: "Move History",
      onClick: () => navigate("/move-history"),
    },
    {
      key: "settings",
      icon: <SettingOutlined />,
      label: "Settings",
      children: [
        {
          key: "/warehouses",
          icon: <HomeOutlined />,
          label: "Warehouse",
          onClick: () => navigate("/warehouses"),
        },
      ],
    },
  ];

  // Get default selected and open keys based on current path
  const getSelectedKeys = () => {
    return [location.pathname];
  };

  const getOpenKeys = () => {
    if (location.pathname.includes("/products") || location.pathname.includes("/categories") || location.pathname.includes("/reordering")) {
      return ["products"];
    }
    if (location.pathname.includes("/receipts") || location.pathname.includes("/deliveries") || location.pathname.includes("/adjustments")) {
      return ["operations"];
    }
    if (location.pathname.includes("/warehouses")) {
      return ["settings"];
    }
    return [];
  };

  return (
    <Layout className="min-h-screen">
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        className="!bg-sidebar !border-r !border-sidebar-border flex flex-col h-screen sticky top-0"
        width={250}
        trigger={null}
        theme="dark"
      >
        <div className="h-16 flex items-center justify-center border-b border-gray-700">
          <h1 className="text-white font-bold text-xl truncate px-4">
            {collapsed ? "SM" : "StockMaster"}
          </h1>
        </div>

        <div className="flex-1 overflow-y-auto py-4">
          <Menu
            mode="inline"
            selectedKeys={getSelectedKeys()}
            defaultOpenKeys={getOpenKeys()}
            items={menuItems}
            className="!bg-transparent !border-0"
            theme="dark"
          />
        </div>

        <div className="border-t border-gray-700 p-4">
          <div className={`flex items-center gap-3 ${collapsed ? "justify-center" : ""}`}>
            <Avatar icon={<UserOutlined />} className="bg-primary shrink-0" />
            {!collapsed && (
              <div className="flex-1 overflow-hidden">
                <div className="text-sm font-medium text-white truncate" title={userEmail || "User"}>
                  {userEmail || "User"}
                </div>
                <div
                  className="text-xs text-gray-400 cursor-pointer hover:text-white flex items-center gap-1 mt-1"
                  onClick={handleLogout}
                >
                  <LogoutOutlined /> Logout
                </div>
              </div>
            )}
          </div>
        </div>
      </Sider>
      <Layout>
        <Header className="!bg-white !px-6 !h-16 flex items-center justify-between border-b border-gray-200 shadow-sm">
          <div className="flex items-center gap-4 flex-1">
            {collapsed ? (
              <MenuUnfoldOutlined
                className="text-xl cursor-pointer hover:text-primary transition-colors"
                onClick={() => setCollapsed(false)}
              />
            ) : (
              <MenuFoldOutlined
                className="text-xl cursor-pointer hover:text-primary transition-colors"
                onClick={() => setCollapsed(true)}
              />
            )}
            <Input
              placeholder="Search SKU or Product..."
              prefix={<SearchOutlined className="text-gray-400" />}
              className="max-w-md"
              size="middle"
            />
          </div>
        </Header>
        <Content className="m-6">
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
