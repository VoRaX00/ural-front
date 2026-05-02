import {
  CarOutlined,
  FileTextOutlined,
  InboxOutlined,
  LogoutOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Avatar, Dropdown, Layout, Menu, theme } from "antd";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import { getAccessToken } from "../api/client";
import * as filesApi from "../api/files.api";
import * as usersApi from "../api/users.api";
import { useAuth } from "../auth/AuthProvider";
import { getCurrentUserUuid } from "../auth/currentUser";

const { Header, Content } = Layout;

export const PrivateLayout = () => {
  const { logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  const selectedKey = useMemo(() => {
    if (location.pathname.startsWith("/cars")) return "cars";
    if (location.pathname.startsWith("/cargo")) return "cargo";
    if (location.pathname.startsWith("/contracts")) return "contracts";
    return "";
  }, [location.pathname]);

  const loadAvatar = useCallback(async () => {
    const uuid = getCurrentUserUuid();
    if (!uuid) {
      setAvatarUrl(null);
      return;
    }

    try {
      const user = await usersApi.getUserByUuid(uuid);
      const avatarFileId = user.avatar?.photoThumbnailId ?? user.avatar?.photoId;
      if (!avatarFileId) {
        setAvatarUrl(null);
        return;
      }

      const files = await filesApi.getFiles([avatarFileId]);
      setAvatarUrl(files[0]?.url ?? null);
    } catch {
      setAvatarUrl(null);
    }
  }, []);

  useEffect(() => {
    void loadAvatar();
    window.addEventListener("profile-updated", loadAvatar);
    return () => window.removeEventListener("profile-updated", loadAvatar);
  }, [loadAvatar]);

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
        <Dropdown
          trigger={["click"]}
          placement="bottomRight"
          menu={{
            items: [
              {
                key: "profile",
                icon: <UserOutlined />,
                label: "Настроить профиль",
              },
              {
                key: "logout",
                icon: <LogoutOutlined />,
                label: "Выйти",
              },
            ],
            onClick: ({ key }) => {
              if (key === "profile") {
                navigate("/profile");
                return;
              }
              if (key === "logout") {
                void logout();
              }
            },
          }}
        >
          <button className="app-header-profile-btn" type="button" aria-label="Профиль">
            <Avatar size={40} src={avatarUrl ?? undefined} icon={<UserOutlined />} />
          </button>
        </Dropdown>
      </Header>
      <Content className="app-content" style={{ background: colorBgContainer }}>
        <div className="app-content-inner">
          <Outlet />
        </div>
      </Content>
    </Layout>
  );
};
