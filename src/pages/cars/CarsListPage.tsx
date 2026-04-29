import { PlusOutlined } from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  Empty,
  InputNumber,
  Modal,
  Pagination,
  Row,
  Select,
  Spin,
  Typography,
  message,
} from "antd";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as carsApi from "../../api/cars.api";
import * as cargoApi from "../../api/cargo.api";
import * as contractsApi from "../../api/contracts.api";
import * as filesApi from "../../api/files.api";
import type { CarDto, CargoDto } from "../../types/domain";
import { formatDateTime } from "../../utils/format";

const { Text, Title } = Typography;

export const CarsListPage = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [items, setItems] = useState<CarDto[]>([]);
  const [fileUrlById, setFileUrlById] = useState<Record<number, string>>({});
  const [respondingCar, setRespondingCar] = useState<CarDto | null>(null);
  const [cargo, setCargo] = useState<CargoDto[]>([]);
  const [cargoLoading, setCargoLoading] = useState(false);
  const [selectedCargoId, setSelectedCargoId] = useState<number | undefined>(undefined);
  const [contractPrice, setContractPrice] = useState<number | undefined>(undefined);
  const [creatingContract, setCreatingContract] = useState(false);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    carsApi
      .getCarsPage({ currentPageNumber: page, itemsOnPage: pageSize })
      .then(async (data) => {
        if (!alive) return;
        const nextItems = data.items ?? [];
        setItems(nextItems);
        setTotal(data.totalResultCount ?? 0);
        const nextSize = data.itemsOnPage || pageSize;
        setPageSize(nextSize);
        if (data.currentPageNumber) {
          setPage(data.currentPageNumber);
        }

        const allFileIds = Array.from(new Set(nextItems.flatMap((item) => item.fileIds ?? [])));
        if (allFileIds.length === 0) {
          setFileUrlById({});
          return;
        }

        try {
          const files = await filesApi.getFiles(allFileIds);
          if (!alive) return;
          setFileUrlById(
            files.reduce<Record<number, string>>((acc, file) => {
              acc[file.id] = file.url;
              return acc;
            }, {})
          );
        } catch {
          if (!alive) return;
          setFileUrlById({});
        }
      })
      .catch(() => {
        if (!alive) return;
        message.error("Не удалось загрузить список транспорта");
        setItems([]);
        setTotal(0);
        setFileUrlById({});
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [page, pageSize]);

  const handlePageChange = (p: number) => {
    setPage(p);
  };

  const openRespondModal = async (car: CarDto) => {
    setRespondingCar(car);
    setSelectedCargoId(undefined);
    setContractPrice(undefined);
    setCargoLoading(true);
    try {
      const data = await cargoApi.getCargoPage({ currentPageNumber: 1, itemsOnPage: 100 });
      setCargo(data.items ?? []);
    } catch {
      message.error("Не удалось загрузить грузы для отклика");
      setCargo([]);
    } finally {
      setCargoLoading(false);
    }
  };

  const submitContract = async () => {
    if (!respondingCar) return;
    if (!selectedCargoId) {
      message.error("Выберите груз");
      return;
    }
    if (!contractPrice || contractPrice <= 0) {
      message.error("Укажите стоимость больше 0");
      return;
    }

    setCreatingContract(true);
    try {
      await contractsApi.createContract({
        carId: Number(respondingCar.id),
        cargoId: selectedCargoId,
        price: contractPrice,
      });
      message.success("Отклик отправлен");
      setRespondingCar(null);
    } catch {
      message.error("Не удалось отправить отклик");
    } finally {
      setCreatingContract(false);
    }
  };

  return (
    <div className="list-page">
      <div className="list-page-toolbar">
        <Title level={3} style={{ margin: 0 }}>
          Транспорт
        </Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate("/cars/new")}>
          Новый транспорт
        </Button>
      </div>

      <Spin spinning={loading}>
        {!loading && items.length === 0 ? (
          <Empty description="Нет транспорта" />
        ) : (
          <Row gutter={[16, 16]}>
            {items.map((car) => (
              <Col span={24} key={car.id}>
                {(() => {
                  const firstFileId = car.fileIds?.[0];
                  const coverUrl =
                    typeof firstFileId === "number" ? fileUrlById[firstFileId] : undefined;
                  return (
                <Card
                  className="entity-card"
                  hoverable
                  onClick={() => navigate(`/cars/${car.id}`)}
                  title={
                    <span className="entity-card-title">
                      {car.carName} {car.carModel}
                    </span>
                  }
                >
                  <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                    {coverUrl && (
                      <img
                        alt={`${car.carName} ${car.carModel}`}
                        src={coverUrl}
                        style={{
                          width: 180,
                          minWidth: 180,
                          height: 120,
                          objectFit: "cover",
                          borderRadius: 8,
                        }}
                      />
                    )}
                    <div style={{ flex: 1 }}>
                      <div className="entity-card-meta">
                        <Text type="secondary">Тип</Text>
                        <Text>{car.carType || "—"}</Text>
                      </div>
                      <div className="entity-card-meta">
                        <Text type="secondary">Год</Text>
                        <Text>{car.yearProduction ?? "—"}</Text>
                      </div>
                      <div className="entity-card-meta">
                        <Text type="secondary">VIN</Text>
                        <Text code>{car.vinNumber || "—"}</Text>
                      </div>
                      <div className="entity-card-meta">
                        <Text type="secondary">Обновлён</Text>
                        <Text>{formatDateTime(car.updatedAt)}</Text>
                      </div>
                      <Button
                        type="primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          void openRespondModal(car);
                        }}
                      >
                        Откликнуться
                      </Button>
                    </div>
                  </div>
                </Card>
                  );
                })()}
              </Col>
            ))}
          </Row>
        )}
      </Spin>

      {total > 0 && (
        <div className="list-page-pagination">
          <Pagination
            current={page}
            total={total}
            pageSize={pageSize}
            onChange={handlePageChange}
            showSizeChanger={false}
            hideOnSinglePage
          />
        </div>
      )}

      <Modal
        title={
          respondingCar
            ? `Отклик на транспорт "${respondingCar.carName} ${respondingCar.carModel}"`
            : "Отклик"
        }
        open={Boolean(respondingCar)}
        onCancel={() => setRespondingCar(null)}
        onOk={() => void submitContract()}
        confirmLoading={creatingContract}
        okText="Отправить"
        cancelText="Отмена"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Select<number>
            showSearch
            placeholder="Выберите груз"
            loading={cargoLoading}
            value={selectedCargoId}
            onChange={setSelectedCargoId}
            options={cargo.map((c) => ({
              value: c.id,
              label: `${c.name} (${c.status})`,
            }))}
            optionFilterProp="label"
          />
          <InputNumber
            style={{ width: "100%" }}
            min={0}
            step={0.01}
            placeholder="Стоимость"
            value={contractPrice}
            onChange={(v) => setContractPrice(v === null ? undefined : v)}
          />
        </div>
      </Modal>
    </div>
  );
};
