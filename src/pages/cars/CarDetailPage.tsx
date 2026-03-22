import { ArrowLeftOutlined } from "@ant-design/icons";
import { Button, Descriptions, Spin, Typography, message } from "antd";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import * as carsApi from "../../api/cars.api";
import type { CarDto } from "../../types/domain";
import { formatDateTime } from "../../utils/format";

export const CarDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [car, setCar] = useState<CarDto | null>(null);
  const [loading, setLoading] = useState(true);

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
        if (alive) setCar(data);
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
  }, [id, navigate]);

  return (
    <div className="detail-page">
      <div className="detail-page-toolbar">
        <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
          Назад
        </Button>
        <Typography.Link>
          <Link to="/cars">К списку транспорта</Link>
        </Typography.Link>
      </div>

      <Spin spinning={loading}>
        {car && (
          <>
            <Typography.Title level={3} style={{ marginTop: 0 }}>
              {car.carName} {car.carModel}
            </Typography.Title>
            <Descriptions bordered column={{ xs: 1, sm: 1, md: 2 }} size="middle">
              <Descriptions.Item label="ID">{car.id}</Descriptions.Item>
              <Descriptions.Item label="Тип">{car.carType}</Descriptions.Item>
              <Descriptions.Item label="Название">{car.carName}</Descriptions.Item>
              <Descriptions.Item label="Модель">{car.carModel}</Descriptions.Item>
              <Descriptions.Item label="Год выпуска">{car.yearProduction}</Descriptions.Item>
              <Descriptions.Item label="VIN">{car.vinNumber}</Descriptions.Item>
              <Descriptions.Item label="Пользователь (UUID)">{car.userUuid}</Descriptions.Item>
              <Descriptions.Item label="Создан">{formatDateTime(car.createdAt)}</Descriptions.Item>
              <Descriptions.Item label="Обновлён">{formatDateTime(car.updatedAt)}</Descriptions.Item>
            </Descriptions>
          </>
        )}
      </Spin>
    </div>
  );
};
