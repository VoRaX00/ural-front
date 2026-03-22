import { ArrowLeftOutlined } from "@ant-design/icons";
import { Button, Card, Form, Input, InputNumber, Typography, message } from "antd";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import * as cargoApi from "../../api/cargo.api";
import type { CreateCargoPayload } from "../../types/domain";

const addressRules = [{ required: true, message: "Заполните поле" }];

export const CargoCreatePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: CreateCargoPayload) => {
    setLoading(true);
    try {
      const created = await cargoApi.createCargo({
        ...values,
        comment: values.comment?.trim() || undefined,
      });
      message.success("Груз создан");
      navigate(`/cargo/${created.id}`, { replace: true });
    } catch {
      message.error("Не удалось создать груз");
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
          <Link to="/cargo">К списку</Link>
        </Typography.Link>
      </div>

      <Typography.Title level={3}>Новый груз</Typography.Title>

      <Card className="form-card">
        <Form<CreateCargoPayload>
          layout="vertical"
          onFinish={onFinish}
          autoComplete="off"
        >
          <Form.Item name="name" label="Название" rules={[{ required: true, message: "Укажите название" }]}>
            <Input />
          </Form.Item>
          <Form.Item name="type" label="Тип груза" rules={[{ required: true, message: "Укажите тип" }]}>
            <Input />
          </Form.Item>

          <Typography.Title level={5}>Габариты и масса</Typography.Title>
          <Form.Item name="length" label="Длина" rules={[{ required: true, message: "Укажите длину" }]}>
            <InputNumber min={0} step={0.01} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="width" label="Ширина" rules={[{ required: true, message: "Укажите ширину" }]}>
            <InputNumber min={0} step={0.01} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="height" label="Высота" rules={[{ required: true, message: "Укажите высоту" }]}>
            <InputNumber min={0} step={0.01} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="volume" label="Объём" rules={[{ required: true, message: "Укажите объём" }]}>
            <InputNumber min={0} step={0.01} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="weight" label="Вес" rules={[{ required: true, message: "Укажите вес" }]}>
            <InputNumber min={0} step={0.01} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="price" label="Цена" rules={[{ required: true, message: "Укажите цену" }]}>
            <InputNumber min={0} step={0.01} style={{ width: "100%" }} />
          </Form.Item>

          <Typography.Title level={5}>Адрес погрузки</Typography.Title>
          <Form.Item name={["loadingPlace", "country"]} label="Страна" rules={addressRules}>
            <Input />
          </Form.Item>
          <Form.Item name={["loadingPlace", "region"]} label="Регион">
            <Input />
          </Form.Item>
          <Form.Item name={["loadingPlace", "city"]} label="Город" rules={addressRules}>
            <Input />
          </Form.Item>
          <Form.Item name={["loadingPlace", "street"]} label="Улица" rules={addressRules}>
            <Input />
          </Form.Item>
          <Form.Item name={["loadingPlace", "building"]} label="Дом">
            <Input />
          </Form.Item>
          <Form.Item name={["loadingPlace", "apartment"]} label="Квартира / офис">
            <Input />
          </Form.Item>
          <Form.Item name={["loadingPlace", "postalCode"]} label="Индекс">
            <Input />
          </Form.Item>

          <Typography.Title level={5}>Адрес разгрузки</Typography.Title>
          <Form.Item name={["unloadingPlace", "country"]} label="Страна" rules={addressRules}>
            <Input />
          </Form.Item>
          <Form.Item name={["unloadingPlace", "region"]} label="Регион">
            <Input />
          </Form.Item>
          <Form.Item name={["unloadingPlace", "city"]} label="Город" rules={addressRules}>
            <Input />
          </Form.Item>
          <Form.Item name={["unloadingPlace", "street"]} label="Улица" rules={addressRules}>
            <Input />
          </Form.Item>
          <Form.Item name={["unloadingPlace", "building"]} label="Дом">
            <Input />
          </Form.Item>
          <Form.Item name={["unloadingPlace", "apartment"]} label="Квартира / офис">
            <Input />
          </Form.Item>
          <Form.Item name={["unloadingPlace", "postalCode"]} label="Индекс">
            <Input />
          </Form.Item>

          <Form.Item name="comment" label="Комментарий">
            <Input.TextArea rows={3} />
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
