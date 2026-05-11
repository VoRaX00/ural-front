import { ArrowLeftOutlined, EditOutlined } from "@ant-design/icons";
import { Button, Descriptions, Spin, Typography, message } from "antd";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import * as cargoApi from "../../api/cargo.api";
import { getCurrentUserUuid } from "../../auth/currentUser";
import { formatBodyTypes, formatLoadingTypes } from "../../config/cargoOptions";
import type { CargoDto } from "../../types/domain";
import { formatAddress, formatDateTime, formatDecimal } from "../../utils/format";

export const CargoDetailPage = () => {
  const { id: idParam } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [cargo, setCargo] = useState<CargoDto | null>(null);
  const [loading, setLoading] = useState(true);
  const currentUserUuid = getCurrentUserUuid();

  const id = useMemo(() => {
    if (!idParam) return NaN;
    const n = Number(idParam);
    return Number.isFinite(n) ? n : NaN;
  }, [idParam]);

  useEffect(() => {
    if (!Number.isFinite(id)) {
      message.error("Некорректный идентификатор груза");
      navigate("/cargo", { replace: true });
      return;
    }
    let alive = true;
    setLoading(true);
    cargoApi
      .getCargoById(id)
      .then((data) => {
        if (alive) setCargo(data);
      })
      .catch(() => {
        message.error("Не удалось загрузить груз");
        navigate("/cargo", { replace: true });
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
          <Link to="/cargo">К списку грузов</Link>
        </Typography.Link>
        {cargo && currentUserUuid && cargo.userUuid === currentUserUuid && (
          <Button icon={<EditOutlined />} onClick={() => navigate(`/cargo/${cargo.id}/edit`)}>
            Редактировать
          </Button>
        )}
      </div>

      <Spin spinning={loading}>
        {cargo && (
          <>
            <Typography.Title level={3} style={{ marginTop: 0 }}>
              {cargo.name}
            </Typography.Title>
            <Descriptions bordered column={{ xs: 1, sm: 1, md: 2 }} size="middle">
              <Descriptions.Item label="ID">{cargo.id}</Descriptions.Item>
              <Descriptions.Item label="Тип кузова">{formatBodyTypes(cargo.bodyTypes)}</Descriptions.Item>
              <Descriptions.Item label="Тип погрузки">
                {formatLoadingTypes(cargo.loadingTypes)}
              </Descriptions.Item>
              <Descriptions.Item label="Тип разгрузки">
                {formatLoadingTypes(cargo.unloadingTypes)}
              </Descriptions.Item>
              <Descriptions.Item label="Пользователь (UUID)">{cargo.userUuid}</Descriptions.Item>
              <Descriptions.Item label="Длина">{formatDecimal(cargo.length)}</Descriptions.Item>
              <Descriptions.Item label="Ширина">{formatDecimal(cargo.width)}</Descriptions.Item>
              <Descriptions.Item label="Высота">{formatDecimal(cargo.height)}</Descriptions.Item>
              <Descriptions.Item label="Объём">{formatDecimal(cargo.volume)}</Descriptions.Item>
              <Descriptions.Item label="Вес">{formatDecimal(cargo.weight)}</Descriptions.Item>
              <Descriptions.Item label="Цена">{formatDecimal(cargo.price)}</Descriptions.Item>
              <Descriptions.Item label="Погрузка" span={2}>
                {formatAddress(cargo.loadingPlace ?? {})}
              </Descriptions.Item>
              <Descriptions.Item label="Разгрузка" span={2}>
                {formatAddress(cargo.unloadingPlace ?? {})}
              </Descriptions.Item>
              <Descriptions.Item label="Комментарий" span={2}>
                {cargo.comment || "—"}
              </Descriptions.Item>
              <Descriptions.Item label="Создан">{formatDateTime(cargo.createdAt)}</Descriptions.Item>
              <Descriptions.Item label="Обновлён">{formatDateTime(cargo.updatedAt)}</Descriptions.Item>
            </Descriptions>
          </>
        )}
      </Spin>
    </div>
  );
};
