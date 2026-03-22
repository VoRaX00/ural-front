import { ArrowLeftOutlined } from "@ant-design/icons";
import { Button, Card, Form, Input, InputNumber, Typography, message } from "antd";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import * as carsApi from "../../api/cars.api";
import type { CreateCarPayload } from "../../types/domain";

export const CarCreatePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: CreateCarPayload) => {
    setLoading(true);
    try {
      const created = await carsApi.createCar(values);
      message.success("Транспорт создан");
      navigate(`/cars/${created.id}`, { replace: true });
    } catch {
      message.error("Не удалось создать транспорт");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="detail-page">
      <div className="detail-page-toolbar">
        <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
          Назад
        </Button>
        <Typography.Link>
          <Link to="/cars">К списку</Link>
        </Typography.Link>
      </div>

      <Typography.Title level={3}>Новый транспорт</Typography.Title>

      <Card className="form-card">
        <Form<CreateCarPayload>
          layout="vertical"
          onFinish={onFinish}
          autoComplete="off"
        >
          <Form.Item
            name="carType"
            label="Тип"
            rules={[{ required: true, message: "Укажите тип" }]}
          >
            <Input placeholder="Например, грузовой" />
          </Form.Item>
          <Form.Item
            name="carName"
            label="Название"
            rules={[{ required: true, message: "Укажите название" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="carModel"
            label="Модель"
            rules={[{ required: true, message: "Укажите модель" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="yearProduction"
            label="Год выпуска"
            rules={[{ required: true, message: "Укажите год" }]}
          >
            <InputNumber min={1900} max={2100} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item
            name="vinNumber"
            label="VIN"
            rules={[{ required: true, message: "Укажите VIN" }]}
          >
            <Input maxLength={32} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              Создать
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};
