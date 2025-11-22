import { useState } from "react";
import { Layout, Menu, Input, Avatar, Dropdown } from "antd";
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

const { Header, Sider, Content } = Layout;

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const userMenuItems: MenuProps["items"] = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "My Profile",
      onClick: () => navigate("/profile"),
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Logout",
      danger: true,
    },
  ];

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
        className="!bg-sidebar !border-r !border-sidebar-border"
        width={250}
        trigger={null}
      >
        <div className="h-16 flex items-center justify-center border-b border-sidebar-border">
          <h1 className="text-sidebar-foreground font-bold text-xl">
            {collapsed ? "SM" : "StockMaster"}
          </h1>
        </div>
        <Menu
          mode="inline"
          selectedKeys={getSelectedKeys()}
          defaultOpenKeys={getOpenKeys()}
          items={menuItems}
          className="!bg-sidebar !border-0 !text-sidebar-foreground mt-2"
          theme="dark"
        />
      </Sider>
      <Layout>
        <Header className="!bg-card !px-6 !h-16 flex items-center justify-between border-b border-border shadow-sm">
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
              prefix={<SearchOutlined className="text-muted-foreground" />}
              className="max-w-md"
              size="middle"
            />
          </div>
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <Avatar
              icon={<UserOutlined />}
              className="cursor-pointer bg-primary hover:bg-primary-hover transition-colors"
            />
          </Dropdown>
        </Header>
        <Content className="m-6">
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
