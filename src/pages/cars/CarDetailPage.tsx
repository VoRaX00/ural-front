import { ArrowLeftOutlined, BulbOutlined, EditOutlined } from "@ant-design/icons";
import { Button, Descriptions, Empty, Image, Spin, Tag, Typography, message } from "antd";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import * as carsApi from "../../api/cars.api";
import * as filesApi from "../../api/files.api";
import { getCurrentUserUuid } from "../../auth/currentUser";
import {
  formatCarType,
  formatPhotoAnalysisStatus,
  getPhotoAnalysisStatusColor,
} from "../../config/carOptions";
import { formatBodyTypes, formatLoadingTypes } from "../../config/cargoOptions";
import type { CarDto } from "../../types/domain";
import { formatDateTime, formatTonnesFromKg } from "../../utils/format";

export const CarDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [car, setCar] = useState<CarDto | null>(null);
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const currentUserUuid = getCurrentUserUuid();

  useEffect(() => {
    if (!id) {
      message.error("Не указан транспорт");
      navigate("/cars", { replace: true });
      return;
    }
    let alive = true;
    setLoading(true);
    setPhotoUrls([]);
    carsApi
      .getCarById(id)
      .then(async (data) => {
        if (!alive) return;
        setCar(data);

        try {
          const files = await filesApi.getFiles(data.fileIds ?? []);
          if (alive) setPhotoUrls(files.map((file) => file.url));
        } catch {
          if (alive) setPhotoUrls([]);
        }
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
        {car && currentUserUuid && car.userUuid === currentUserUuid && (
          <Button icon={<EditOutlined />} onClick={() => navigate(`/cars/${car.id}/edit`)}>
            Редактировать
          </Button>
        )}
      </div>

      <Spin spinning={loading}>
        {car && (
          <>
            <Typography.Title level={3} style={{ marginTop: 0 }}>
              {car.carName} {car.carModel}
            </Typography.Title>

            <div className="detail-overview-layout">
              <section className="detail-media-column">
                {photoUrls.length === 0 ? (
                  <div className="detail-media-empty">
                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Фотографии не прикреплены" />
                  </div>
                ) : (
                  <Image.PreviewGroup>
                    <div className="detail-media-gallery">
                      <Image
                        className="detail-main-photo"
                        src={photoUrls[0]}
                        alt={`${car.carName} ${car.carModel}, главное фото`}
                      />
                      {photoUrls.length > 1 && (
                        <div className="detail-thumbnail-row">
                          {photoUrls.slice(1).map((url, index) => (
                            <Image
                              key={`${url}-${index}`}
                              className="detail-thumbnail-photo"
                              src={url}
                              alt={`${car.carName} ${car.carModel}, фото ${index + 2}`}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </Image.PreviewGroup>
                )}
              </section>

              <Descriptions
                bordered
                className="detail-side-descriptions"
                column={1}
                size="middle"
              >
                <Descriptions.Item label="ID">{car.id}</Descriptions.Item>
                <Descriptions.Item label="Тип">{formatCarType(car.carType)}</Descriptions.Item>
                <Descriptions.Item label="Название">{car.carName}</Descriptions.Item>
                <Descriptions.Item label="Модель">{car.carModel}</Descriptions.Item>
                <Descriptions.Item label="Тип кузова">{formatBodyTypes(car.bodyType)}</Descriptions.Item>
                <Descriptions.Item label="Тип загрузки">
                  {formatLoadingTypes(car.loadingType)}
                </Descriptions.Item>
                <Descriptions.Item label="Грузоподъёмность">
                  {formatTonnesFromKg(car.loadCapacity)}
                </Descriptions.Item>
                <Descriptions.Item label="Год выпуска">{car.yearProduction}</Descriptions.Item>
                <Descriptions.Item label="VIN">{car.vinNumber}</Descriptions.Item>
                <Descriptions.Item label="Пользователь (UUID)">{car.userUuid}</Descriptions.Item>
                <Descriptions.Item label="Создан">{formatDateTime(car.createdAt)}</Descriptions.Item>
                <Descriptions.Item label="Обновлён">{formatDateTime(car.updatedAt)}</Descriptions.Item>
              </Descriptions>
            </div>

            <section className="detail-section ai-analysis-panel">
              <div className="ai-analysis-heading">
                <div className="ai-analysis-title">
                  <BulbOutlined />
                  <div>
                    <Typography.Title level={4}>Анализ состояния от ИИ</Typography.Title>
                    <Typography.Text type="secondary">
                      Результат автоматической оценки прикреплённых фотографий автомобиля
                    </Typography.Text>
                  </div>
                </div>
                <Tag color={getPhotoAnalysisStatusColor(car.photoAnalysisStatus)}>
                  {formatPhotoAnalysisStatus(car.photoAnalysisStatus)}
                </Tag>
              </div>
              <Typography.Paragraph className="ai-analysis-summary">
                {car.photoAnalysisSummary || "Анализ пока не сформирован."}
              </Typography.Paragraph>
            </section>
          </>
        )}
      </Spin>
    </div>
  );
};
