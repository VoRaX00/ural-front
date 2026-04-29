import { CarOutlined, FileTextOutlined, InboxOutlined, LogoutOutlined } from "@ant-design/icons";
import { Button, Layout, Menu, theme } from "antd";
import { useMemo } from "react";
import { Link, Navigate, Outlet, useLocation } from "react-router-dom";
import { getAccessToken } from "../api/client";
import { useAuth } from "../auth/AuthProvider";

const { Header, Content } = Layout;

export const PrivateLayout = () => {
  const { logout } = useAuth();
  const location = useLocation();
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  const selectedKey = useMemo(() => {
    if (location.pathname.startsWith("/cars")) return "cars";
    if (location.pathname.startsWith("/cargo")) return "cargo";
    if (location.pathname.startsWith("/contracts")) return "contracts";
    return "";
  }, [location.pathname]);

  if (!getAccessToken()) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return (
    <Layout className="app-shell">
      <Header className="app-header">
        <div className="app-header-brand">CarGo</div>
        <Menu
          theme="dark"
          mode="horizontal"
          selectedKeys={selectedKey ? [selectedKey] : []}
          items={[
            {
              key: "cars",
              icon: <CarOutlined />,
              label: <Link to="/cars">Транспорт</Link>,
            },
            {
              key: "cargo",
              icon: <InboxOutlined />,
              label: <Link to="/cargo">Грузы</Link>,
            },
            {
              key: "contracts",
              icon: <FileTextOutlined />,
              label: <Link to="/contracts">Контракты</Link>,
            },
          ]}
          className="app-header-menu"
        />
        <Button
          type="text"
          icon={<LogoutOutlined />}
          className="app-header-logout"
          onClick={() => void logout()}
        >
          Выйти
        </Button>
      </Header>
      <Content className="app-content" style={{ background: colorBgContainer }}>
        <div className="app-content-inner">
          <Outlet />
        </div>
      </Content>
    </Layout>
  );
};
