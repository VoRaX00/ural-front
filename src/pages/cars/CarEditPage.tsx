import { ArrowLeftOutlined } from "@ant-design/icons";
import { Button, Card, Col, Form, Input, InputNumber, Row, Select, Spin, Typography, Upload, message } from "antd";
import type { RcFile } from "antd/es/upload";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import * as carsApi from "../../api/cars.api";
import * as filesApi from "../../api/files.api";
import { getCurrentUserUuid } from "../../auth/currentUser";
import { carTypeOptions, getCarTypeLabel, getCarTypeValue } from "../../config/carOptions";
import {
  bodyTypeOptions,
  getBodyTypeLabel,
  getBodyTypeValue,
  getLoadingTypeLabel,
  getLoadingTypeValue,
  loadingTypeOptions,
} from "../../config/cargoOptions";
import type { CarDto, CreateCarPayload } from "../../types/domain";

export const CarEditPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form] = Form.useForm<CreateCarPayload>();
  const [car, setCar] = useState<CarDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [files, setFiles] = useState<RcFile[]>([]);

  useEffect(() => {
    if (!id) {
      message.error("Не указан транспорт");
      navigate("/cars", { replace: true });
      return;
    }

    let alive = true;
    setLoading(true);
    carsApi
      .getCarById(id)
      .then((data) => {
        if (!alive) return;
        const currentUserUuid = getCurrentUserUuid();
        if (!currentUserUuid || data.userUuid !== currentUserUuid) {
          message.error("Редактировать можно только собственный транспорт");
          navigate(`/cars/${data.id}`, { replace: true });
          return;
        }

        setCar(data);
        form.setFieldsValue({
          carType: getCarTypeValue(data.carType),
          carName: data.carName,
          carModel: data.carModel,
          bodyType: (data.bodyType ?? []).map(getBodyTypeValue),
          loadingType: (data.loadingType ?? []).map(getLoadingTypeValue),
          loadCapacity: data.loadCapacity ?? undefined,
          yearProduction: data.yearProduction,
          vinNumber: data.vinNumber,
        });
      })
      .catch(() => {
        message.error("Не удалось загрузить транспорт");
        navigate("/cars", { replace: true });
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [form, id, navigate]);

  const onFinish = async (values: CreateCarPayload) => {
    if (!car || !id) return;
    setSaving(true);
    try {
      let newFileIds: number[] = [];
      if (files.length > 0) {
        const uploaded = await filesApi.uploadFiles({
          files,
          types: files.map(() => "IMAGE"),
        });
        newFileIds = uploaded.map((x) => x.id);
      }

      const updated = await carsApi.updateCar(id, {
        ...values,
        carType: getCarTypeLabel(values.carType),
        bodyType: (values.bodyType ?? []).map(getBodyTypeLabel),
        loadingType: (values.loadingType ?? []).map(getLoadingTypeLabel),
        fileIds: [...(car.fileIds ?? []), ...newFileIds],
      });
      message.success("Транспорт обновлён");
      navigate(`/cars/${updated.id || id}`, { replace: true });
    } catch {
      message.error("Не удалось обновить транспорт");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="detail-page">
      <div className="detail-page-toolbar">
        <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
          Назад
        </Button>
        <Typography.Link>
          <Link to={car ? `/cars/${car.id}` : "/cars"}>К транспорту</Link>
        </Typography.Link>
      </div>

      <Typography.Title level={3}>Редактирование транспорта</Typography.Title>

      <Spin spinning={loading}>
        <Card className="form-card car-form-card">
          <Form<CreateCarPayload> form={form} layout="vertical" onFinish={onFinish} autoComplete="off">
            <Row gutter={16}>
              <Col xs={24} md={8}>
                <Form.Item name="carType" label="Тип" rules={[{ required: true, message: "Укажите тип" }]}>
                  <Select allowClear placeholder="Выберите тип транспорта" options={carTypeOptions} />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item name="carName" label="Название" rules={[{ required: true, message: "Укажите название" }]}>
                  <Input />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item name="carModel" label="Модель" rules={[{ required: true, message: "Укажите модель" }]}>
                  <Input />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="bodyType"
                  label="Тип кузова"
                  rules={[{ type: "array", min: 1, required: true, message: "Выберите тип кузова" }]}
                >
                  <Select mode="multiple" allowClear showSearch placeholder="Выберите типы кузова" options={bodyTypeOptions} optionFilterProp="label" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  name="loadingType"
                  label="Тип загрузки"
                  rules={[{ type: "array", min: 1, required: true, message: "Выберите тип загрузки" }]}
                >
                  <Select mode="multiple" allowClear showSearch placeholder="Выберите типы загрузки" options={loadingTypeOptions} optionFilterProp="label" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Form.Item name="loadCapacity" label="Грузоподъёмность" rules={[{ required: true, message: "Укажите грузоподъёмность" }]}>
                  <InputNumber min={0} step={0.01} addonAfter="кг" style={{ width: "100%" }} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Form.Item name="yearProduction" label="Год выпуска" rules={[{ required: true, message: "Укажите год" }]}>
                  <InputNumber min={1900} max={2100} style={{ width: "100%" }} />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item name="vinNumber" label="VIN" rules={[{ required: true, message: "Укажите VIN" }]}>
                  <Input maxLength={32} />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item label="Добавить фотографии">
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
              <Button type="primary" htmlType="submit" loading={saving}>
                Сохранить
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </Spin>
    </div>
  );
};
