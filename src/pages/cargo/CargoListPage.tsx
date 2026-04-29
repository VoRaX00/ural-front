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
import { formatAddress, formatDateTime, formatDecimal } from "../../utils/format";

const { Text, Title } = Typography;

export const CargoListPage = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [items, setItems] = useState<CargoDto[]>([]);
  const [fileUrlById, setFileUrlById] = useState<Record<number, string>>({});
  const [respondingCargo, setRespondingCargo] = useState<CargoDto | null>(null);
  const [cars, setCars] = useState<CarDto[]>([]);
  const [carsLoading, setCarsLoading] = useState(false);
  const [selectedCarId, setSelectedCarId] = useState<number | undefined>(undefined);
  const [contractPrice, setContractPrice] = useState<number | undefined>(undefined);
  const [creatingContract, setCreatingContract] = useState(false);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    cargoApi
      .getCargoPage({ currentPageNumber: page, itemsOnPage: pageSize })
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

        const allFileIds = Array.from(
          new Set(
            nextItems.flatMap((item) => item.fileIds ?? [])
          )
        );

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
        message.error("Не удалось загрузить список грузов");
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

  const openRespondModal = async (cargo: CargoDto) => {
    setRespondingCargo(cargo);
    setSelectedCarId(undefined);
    setContractPrice(undefined);
    setCarsLoading(true);
    try {
      const data = await carsApi.getCarsPage({ currentPageNumber: 1, itemsOnPage: 100 });
      setCars(data.items ?? []);
    } catch {
      message.error("Не удалось загрузить транспорт для отклика");
      setCars([]);
    } finally {
      setCarsLoading(false);
    }
  };

  const submitContract = async () => {
    if (!respondingCargo) return;
    if (!selectedCarId) {
      message.error("Выберите транспорт");
      return;
    }
    if (!contractPrice || contractPrice <= 0) {
      message.error("Укажите стоимость больше 0");
      return;
    }

    setCreatingContract(true);
    try {
      await contractsApi.createContract({
        carId: selectedCarId,
        cargoId: respondingCargo.id,
        price: contractPrice,
      });
      message.success("Отклик отправлен");
      setRespondingCargo(null);
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
          Грузы
        </Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate("/cargo/new")}>
          Новый груз
        </Button>
      </div>

      <Spin spinning={loading}>
        {!loading && items.length === 0 ? (
          <Empty description="Нет грузов" />
        ) : (
          <Row gutter={[16, 16]}>
            {items.map((c) => (
              <Col span={24} key={c.id}>
                {(() => {
                  const firstFileId = c.fileIds?.[0];
                  const coverUrl =
                    typeof firstFileId === "number" ? fileUrlById[firstFileId] : undefined;

                  return (
                <Card
                  className="entity-card"
                  hoverable
                  onClick={() => navigate(`/cargo/${c.id}`)}
                  title={<span className="entity-card-title">{c.name}</span>}
                >
                  <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                    {coverUrl && (
                      <img
                        alt={c.name}
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
                        <Text>{c.status || "—"}</Text>
                      </div>
                      <div className="entity-card-meta">
                        <Text type="secondary">Вес</Text>
                        <Text>{formatDecimal(c.weight)}</Text>
                      </div>
                      <div className="entity-card-meta">
                        <Text type="secondary">Объём</Text>
                        <Text>{formatDecimal(c.volume)}</Text>
                      </div>
                      <div className="entity-card-meta">
                        <Text type="secondary">Цена</Text>
                        <Text>{formatDecimal(c.price)}</Text>
                      </div>
                      <div className="entity-card-meta">
                        <Text type="secondary">Откуда</Text>
                        <Text ellipsis={{ tooltip: formatAddress(c.loadingPlace ?? {}) }}>
                          {formatAddress(c.loadingPlace ?? {})}
                        </Text>
                      </div>
                      <div className="entity-card-meta">
                        <Text type="secondary">Куда</Text>
                        <Text ellipsis={{ tooltip: formatAddress(c.unloadingPlace ?? {}) }}>
                          {formatAddress(c.unloadingPlace ?? {})}
                        </Text>
                      </div>
                      <div className="entity-card-meta">
                        <Text type="secondary">Обновлён</Text>
                        <Text>{formatDateTime(c.updatedAt)}</Text>
                      </div>
                      <Button
                        type="primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          void openRespondModal(c);
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
            onChange={(p) => setPage(p)}
            showSizeChanger={false}
            hideOnSinglePage
          />
        </div>
      )}

      <Modal
        title={respondingCargo ? `Отклик на груз "${respondingCargo.name}"` : "Отклик"}
        open={Boolean(respondingCargo)}
        onCancel={() => setRespondingCargo(null)}
        onOk={() => void submitContract()}
        confirmLoading={creatingContract}
        okText="Отправить"
        cancelText="Отмена"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Select<number>
            showSearch
            placeholder="Выберите транспорт"
            loading={carsLoading}
            value={selectedCarId}
            onChange={setSelectedCarId}
            options={cars.map((car) => ({
              value: Number(car.id),
              label: `${car.carName} ${car.carModel} (${car.vinNumber})`,
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
