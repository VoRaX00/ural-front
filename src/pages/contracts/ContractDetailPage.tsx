import { ArrowLeftOutlined } from "@ant-design/icons";
import { Button, Popconfirm, Space, Spin, Tag, Typography, message } from "antd";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import * as contractsApi from "../../api/contracts.api";
import * as filesApi from "../../api/files.api";
import {
  formatCarType,
  formatPhotoAnalysisStatus,
  getPhotoAnalysisStatusColor,
} from "../../config/carOptions";
import { formatBodyTypes, formatLoadingTypes } from "../../config/cargoOptions";
import type { ContractDto } from "../../types/domain";
import {
  formatAddress,
  formatDateTime,
  formatDecimal,
  formatKgAndTonnes,
  formatRoute,
  formatTonnesFromKg,
} from "../../utils/format";
import {
  getContractCarTitle,
  getContractCargoTitle,
  getContractStatusText,
} from "./contractView";

type DetailFieldProps = {
  label: string;
  value: ReactNode;
  wide?: boolean;
};

const DetailField = ({ label, value, wide }: DetailFieldProps) => (
  <div
    className={
      wide ? "contract-detail-field contract-detail-field-wide" : "contract-detail-field"
    }
  >
    <Typography.Text type="secondary">{label}</Typography.Text>
    <div className="contract-detail-field-value">{value}</div>
  </div>
);

export const ContractDetailPage = () => {
  const { id: idParam } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [contract, setContract] = useState<ContractDto | null>(null);
  const [fileUrlById, setFileUrlById] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const id = useMemo(() => {
    if (!idParam) return NaN;
    const n = Number(idParam);
    return Number.isFinite(n) ? n : NaN;
  }, [idParam]);

  useEffect(() => {
    if (!Number.isFinite(id)) {
      message.error("Некорректный идентификатор контракта");
      navigate("/contracts", { replace: true });
      return;
    }

    let alive = true;
    setLoading(true);
    contractsApi
      .getContractById(id)
      .then(async (data) => {
        if (!alive) return;
        setContract(data);

        const firstCargoFileId = data.cargo?.fileIds?.[0];
        const firstCarFileId = data.car?.fileIds?.[0];
        const fileIds = [firstCargoFileId, firstCarFileId].filter(
          (fileId): fileId is number => typeof fileId === "number"
        );

        if (fileIds.length === 0) {
          setFileUrlById({});
          return;
        }

        try {
          const files = await filesApi.getFiles(fileIds);
          if (!alive) return;
          setFileUrlById(
            files.reduce<Record<number, string>>((acc, file) => {
              acc[file.id] = file.url;
              return acc;
            }, {})
          );
        } catch {
          if (alive) setFileUrlById({});
        }
      })
      .catch(() => {
        message.error("Не удалось загрузить контракт");
        navigate("/contracts", { replace: true });
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [id, navigate]);

  const firstCargoFileId = contract?.cargo?.fileIds?.[0];
  const firstCarFileId = contract?.car?.fileIds?.[0];
  const cargoImageUrl =
    typeof firstCargoFileId === "number" ? fileUrlById[firstCargoFileId] : undefined;
  const carImageUrl = typeof firstCarFileId === "number" ? fileUrlById[firstCarFileId] : undefined;

  const updateContractStatus = async (isClose?: boolean) => {
    if (!contract) return;

    setUpdatingStatus(true);
    try {
      const updated = await contractsApi.updateContractStatus(contract.id, { isClose });
      setContract(updated);
      message.success(isClose ? "Сделка отклонена" : "Статус контракта обновлён");
    } catch {
      message.error(isClose ? "Не удалось отклонить сделку" : "Не удалось обновить статус");
    } finally {
      setUpdatingStatus(false);
    }
  };

  return (
    <div className="detail-page">
      <div className="detail-page-toolbar">
        <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>
          Назад
        </Button>
        <Typography.Link>
          <Link to="/contracts">К списку контрактов</Link>
        </Typography.Link>
      </div>

      <Spin spinning={loading}>
        {contract && (
          <>
            <div className="contract-detail-header">
              <div>
                <Typography.Title level={3} style={{ marginTop: 0, marginBottom: 6 }}>
                  {getContractCargoTitle(contract)}
                </Typography.Title>
                <Typography.Text type="secondary">
                  {getContractCarTitle(contract)}
                </Typography.Text>
              </div>
              <div className="contract-detail-actions">
                <Tag color="blue">{getContractStatusText(contract.status)}</Tag>
                <Space wrap size={[8, 8]}>
                  <Button
                    type="primary"
                    loading={updatingStatus}
                    onClick={() => void updateContractStatus()}
                  >
                    Следующий статус
                  </Button>
                  <Popconfirm
                    title="Отклонить сделку?"
                    okText="Отклонить"
                    cancelText="Отмена"
                    okButtonProps={{ danger: true }}
                    onConfirm={() => void updateContractStatus(true)}
                  >
                    <Button danger loading={updatingStatus}>
                      Отклонить
                    </Button>
                  </Popconfirm>
                </Space>
              </div>
            </div>

            <section className="contract-detail-panel">
              <Typography.Title level={4}>Контракт</Typography.Title>
              <div className="contract-detail-grid">
                <DetailField label="ID" value={contract.id} />
                <DetailField label="Стоимость" value={formatDecimal(contract.price)} />
                <DetailField label="Создан" value={formatDateTime(contract.createdAt)} />
                <DetailField label="Обновлён" value={formatDateTime(contract.updatedAt)} />
              </div>
            </section>

            <section className="contract-detail-panel">
              <Typography.Title level={4}>Груз</Typography.Title>
              <div className="contract-detail-media-layout">
                {cargoImageUrl && (
                  <img
                    className="contract-detail-image"
                    alt={getContractCargoTitle(contract)}
                    src={cargoImageUrl}
                  />
                )}
                <div className="contract-detail-grid">
                  <DetailField label="ID" value={contract.cargo?.id ?? contract.cargoId ?? "—"} />
                  <DetailField label="Название" value={getContractCargoTitle(contract)} />
                  <DetailField label="Тип кузова" value={formatBodyTypes(contract.cargo?.bodyTypes)} />
                  <DetailField
                    label="Тип погрузки"
                    value={formatLoadingTypes(contract.cargo?.loadingTypes)}
                  />
                  <DetailField
                    label="Тип разгрузки"
                    value={formatLoadingTypes(contract.cargo?.unloadingTypes)}
                  />
                  <DetailField label="Цена" value={formatDecimal(contract.cargo?.price)} />
                  <DetailField label="Длина" value={formatDecimal(contract.cargo?.length)} />
                  <DetailField label="Ширина" value={formatDecimal(contract.cargo?.width)} />
                  <DetailField label="Высота" value={formatDecimal(contract.cargo?.height)} />
                  <DetailField label="Объём" value={formatDecimal(contract.cargo?.volume)} />
                  <DetailField label="Вес" value={formatKgAndTonnes(contract.cargo?.weight)} />
                  <DetailField
                    wide
                    label="Погрузка"
                    value={formatAddress(contract.cargo?.loadingPlace ?? {})}
                  />
                  <DetailField
                    wide
                    label="Промежуточные точки"
                    value={
                      contract.cargo?.routePoints?.length
                        ? contract.cargo.routePoints.map((point, index) => (
                            <div key={`${point.city ?? "point"}-${index}`}>{formatAddress(point)}</div>
                          ))
                        : "—"
                    }
                  />
                  <DetailField
                    wide
                    label="Разгрузка"
                    value={formatAddress(contract.cargo?.unloadingPlace ?? {})}
                  />
                  <DetailField
                    wide
                    label="Маршрут"
                    value={formatRoute(
                      contract.cargo?.loadingPlace,
                      contract.cargo?.routePoints,
                      contract.cargo?.unloadingPlace
                    )}
                  />
                  <DetailField wide label="Комментарий" value={contract.cargo?.comment || "—"} />
                </div>
              </div>
            </section>

            <section className="contract-detail-panel">
              <Typography.Title level={4}>Транспорт</Typography.Title>
              <div className="contract-detail-media-layout">
                {carImageUrl && (
                  <img
                    className="contract-detail-image"
                    alt={getContractCarTitle(contract)}
                    src={carImageUrl}
                  />
                )}
                <div className="contract-detail-grid">
                  <DetailField label="ID" value={contract.car?.id ?? contract.carId ?? "—"} />
                  <DetailField label="Авто" value={getContractCarTitle(contract)} />
                  <DetailField label="Тип" value={formatCarType(contract.car?.carType)} />
                  <DetailField label="Тип кузова" value={formatBodyTypes(contract.car?.bodyType)} />
                  <DetailField
                    label="Тип загрузки"
                    value={formatLoadingTypes(contract.car?.loadingType)}
                  />
                  <DetailField
                    label="Грузоподъёмность"
                    value={formatTonnesFromKg(contract.car?.loadCapacity)}
                  />
                  <DetailField label="Год выпуска" value={contract.car?.yearProduction ?? "—"} />
                  <DetailField label="VIN" value={contract.car?.vinNumber || "—"} />
                  <DetailField
                    label="Состояние по фото"
                    value={
                      <Tag color={getPhotoAnalysisStatusColor(contract.car?.photoAnalysisStatus)}>
                        {formatPhotoAnalysisStatus(contract.car?.photoAnalysisStatus)}
                      </Tag>
                    }
                  />
                  <DetailField
                    wide
                    label="Выжимка нейросети"
                    value={contract.car?.photoAnalysisSummary || "—"}
                  />
                  <DetailField label="Создан" value={formatDateTime(contract.car?.createdAt)} />
                  <DetailField label="Обновлён" value={formatDateTime(contract.car?.updatedAt)} />
                </div>
              </div>
            </section>
          </>
        )}
      </Spin>
    </div>
  );
};
