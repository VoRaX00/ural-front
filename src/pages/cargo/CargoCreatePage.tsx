import { ArrowLeftOutlined, MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Card, Col, Form, Input, InputNumber, Row, Select, Typography, Upload, message } from "antd";
import type { RcFile } from "antd/es/upload";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import * as cargoApi from "../../api/cargo.api";
import * as filesApi from "../../api/files.api";
import {
  bodyTypeOptions,
  getBodyTypeLabel,
  getLoadingTypeLabel,
  loadingTypeOptions,
} from "../../config/cargoOptions";
import type { CreateCargoPayload } from "../../types/domain";
import { AddressFields } from "./AddressFields";
import { normalizeCargoPayload } from "./cargoForm";

export const CargoCreatePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<RcFile[]>([]);

  const onFinish = async (values: CreateCargoPayload) => {
    setLoading(true);
    try {
      if (files.length === 0) {
        message.error("Добавьте хотя бы одну фотографию груза");
        return;
      }

      const uploaded = await filesApi.uploadFiles({
        files,
        types: files.map(() => "IMAGE"),
      });
      const fileIds = uploaded.map((x) => x.id);

      const payload = normalizeCargoPayload(values);
      const created = await cargoApi.createCargo({
        ...payload,
        bodyTypes: (values.bodyTypes ?? []).map(getBodyTypeLabel),
        loadingTypes: (values.loadingTypes ?? []).map(getLoadingTypeLabel),
        unloadingTypes: (values.unloadingTypes ?? []).map(getLoadingTypeLabel),
        comment: values.comment?.trim() || undefined,
        fileIds,
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

      <Card className="form-card cargo-form-card">
        <Form<CreateCargoPayload>
          layout="vertical"
          onFinish={onFinish}
          autoComplete="off"
          initialValues={{ routePoints: [] }}
        >
          <Form.Item name="name" label="Название" rules={[{ required: true, message: "Укажите название" }]}>
            <Input />
          </Form.Item>
          <Form.Item
            name="bodyTypes"
            label="Тип кузова"
            rules={[{ type: "array", min: 1, required: true, message: "Выберите тип кузова" }]}
          >
            <Select
              mode="multiple"
              allowClear
              showSearch
              placeholder="Выберите типы кузова"
              options={bodyTypeOptions}
              optionFilterProp="label"
            />
          </Form.Item>
          <Form.Item
            name="loadingTypes"
            label="Тип погрузки"
            rules={[{ type: "array", min: 1, required: true, message: "Выберите тип погрузки" }]}
          >
            <Select
              mode="multiple"
              allowClear
              showSearch
              placeholder="Выберите типы погрузки"
              options={loadingTypeOptions}
              optionFilterProp="label"
            />
          </Form.Item>
          <Form.Item
            name="unloadingTypes"
            label="Тип разгрузки"
            rules={[{ type: "array", min: 1, required: true, message: "Выберите тип разгрузки" }]}
          >
            <Select
              mode="multiple"
              allowClear
              showSearch
              placeholder="Выберите типы разгрузки"
              options={loadingTypeOptions}
              optionFilterProp="label"
            />
          </Form.Item>

          <Typography.Title level={5}>Габариты и масса</Typography.Title>
          <Row gutter={16}>
            <Col xs={24} sm={12} lg={8}>
              <Form.Item name="length" label="Длина" rules={[{ required: true, message: "Укажите длину" }]}>
                <InputNumber min={0} step={0.01} addonAfter="м" style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} lg={8}>
              <Form.Item name="width" label="Ширина" rules={[{ required: true, message: "Укажите ширину" }]}>
                <InputNumber min={0} step={0.01} addonAfter="м" style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} lg={8}>
              <Form.Item name="height" label="Высота" rules={[{ required: true, message: "Укажите высоту" }]}>
                <InputNumber min={0} step={0.01} addonAfter="м" style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} lg={8}>
              <Form.Item name="volume" label="Объём" rules={[{ required: true, message: "Укажите объём" }]}>
                <InputNumber min={0} step={0.01} addonAfter="м³" style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} lg={8}>
              <Form.Item name="weight" label="Вес" rules={[{ required: true, message: "Укажите вес" }]}>
                <InputNumber min={0} step={0.01} addonAfter="кг" style={{ width: "100%" }} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} lg={8}>
              <Form.Item name="price" label="Цена" rules={[{ required: true, message: "Укажите цену" }]}>
                <InputNumber min={0} step={0.01} addonAfter="руб" style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>

          <Typography.Title level={5}>Адрес погрузки</Typography.Title>
          <AddressFields namePrefix={["loadingPlace"]} />

          <Form.List name="routePoints">
            {(fields, { add, remove }) => (
              <div className="route-points-section">
                <div className="route-points-header">
                  <Typography.Title level={5}>Промежуточные точки маршрута</Typography.Title>
                  <Button type="dashed" icon={<PlusOutlined />} onClick={() => add()}>
                    Добавить точку
                  </Button>
                </div>
                {fields.length === 0 && (
                  <Typography.Text type="secondary">Промежуточные точки не указаны</Typography.Text>
                )}
                {fields.map((field, index) => (
                  <div className="route-point-block" key={field.key}>
                    <div className="route-point-header">
                      <Typography.Text strong>Точка {index + 1}</Typography.Text>
                      <Button
                        type="text"
                        danger
                        icon={<MinusCircleOutlined />}
                        onClick={() => remove(field.name)}
                      >
                        Удалить
                      </Button>
                    </div>
                    <AddressFields namePrefix={[field.name]} />
                  </div>
                ))}
              </div>
            )}
          </Form.List>

          <Typography.Title level={5}>Адрес разгрузки</Typography.Title>
          <AddressFields namePrefix={["unloadingPlace"]} />

          <Form.Item name="comment" label="Комментарий">
            <Input.TextArea rows={3} />
          </Form.Item>

          <Form.Item
            label="Фотографии груза"
            required
            help={files.length === 0 ? "Нужно добавить хотя бы одну фотографию" : undefined}
            validateStatus={files.length === 0 ? "error" : undefined}
          >
            <Upload
              multiple
              listType="picture"
              beforeUpload={() => false}
              onChange={(info) => {
                const next = info.fileList.map((x) => x.originFileObj).filter(Boolean) as RcFile[];
                setFiles(next);
              }}
            >
              <Button>Выбрать файлы</Button>
            </Upload>
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
