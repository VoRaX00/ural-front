import { Card, Col, Empty, Pagination, Row, Spin, Tag, Typography, message } from "antd";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as contractsApi from "../../api/contracts.api";
import { formatCarType } from "../../config/carOptions";
import { formatBodyTypes, formatLoadingTypes } from "../../config/cargoOptions";
import type { ContractDto } from "../../types/domain";
import {
  formatAddress,
  formatDateTime,
  formatDecimal,
  formatKgAndTonnes,
  formatTonnesFromKg,
} from "../../utils/format";
import {
  getContractCarTitle,
  getContractCargoTitle,
  getContractStatusText,
} from "./contractView";

const { Text, Title } = Typography;

export const ContractsListPage = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [items, setItems] = useState<ContractDto[]>([]);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    contractsApi
      .getContractsPage({ currentPageNumber: page, itemsOnPage: pageSize })
      .then((data) => {
        if (!alive) return;
        setItems(data.items ?? []);
        setTotal(data.totalResultCount ?? 0);
        const nextSize = data.itemsOnPage || pageSize;
        setPageSize(nextSize);
        if (data.currentPageNumber) {
          setPage(data.currentPageNumber);
        }
      })
      .catch(() => {
        if (!alive) return;
        message.error("Не удалось загрузить список контрактов");
        setItems([]);
        setTotal(0);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [page, pageSize]);

  return (
    <div className="list-page">
      <div className="list-page-toolbar">
        <Title level={3} style={{ margin: 0 }}>
          Контракты
        </Title>
      </div>

      <Spin spinning={loading}>
        {!loading && items.length === 0 ? (
          <Empty description="Нет контрактов" />
        ) : (
          <Row gutter={[16, 16]}>
            {items.map((c) => (
              <Col span={24} key={c.id}>
                <Card
                  className="entity-card contract-card"
                  hoverable
                  onClick={() => navigate(`/contracts/${c.id}`)}
                  title={
                    <div className="contract-card-title">
                      <span className="entity-card-title">{getContractCargoTitle(c)}</span>
                      <Tag color="blue">{getContractStatusText(c.status)}</Tag>
                    </div>
                  }
                  extra={<Text strong>{formatDecimal(c.price)}</Text>}
                >
                  <div className="contract-card-grid">
                    <section className="contract-card-section">
                      <Text className="contract-card-section-title" type="secondary">
                        Маршрут
                      </Text>
                      <div className="entity-card-meta">
                        <Text type="secondary">Откуда</Text>
                        <Text ellipsis={{ tooltip: formatAddress(c.cargo?.loadingPlace ?? {}) }}>
                          {formatAddress(c.cargo?.loadingPlace ?? {})}
                        </Text>
                      </div>
                      <div className="entity-card-meta">
                        <Text type="secondary">Куда</Text>
                        <Text ellipsis={{ tooltip: formatAddress(c.cargo?.unloadingPlace ?? {}) }}>
                          {formatAddress(c.cargo?.unloadingPlace ?? {})}
                        </Text>
                      </div>
                      <div className="entity-card-meta">
                        <Text type="secondary">Комментарий</Text>
                        <Text ellipsis={{ tooltip: c.cargo?.comment || "—" }}>
                          {c.cargo?.comment || "—"}
                        </Text>
                      </div>
                    </section>

                    <section className="contract-card-section">
                      <Text className="contract-card-section-title" type="secondary">
                        Груз
                      </Text>
                      <div className="entity-card-meta">
                        <Text type="secondary">Тип кузова</Text>
                        <Text ellipsis={{ tooltip: formatBodyTypes(c.cargo?.bodyTypes) }}>
                          {formatBodyTypes(c.cargo?.bodyTypes)}
                        </Text>
                      </div>
                      <div className="entity-card-meta">
                        <Text type="secondary">Габариты</Text>
                        <Text>
                          {[c.cargo?.length, c.cargo?.width, c.cargo?.height]
                            .map(formatDecimal)
                            .join(" × ")}
                        </Text>
                      </div>
                      <div className="entity-card-meta">
                        <Text type="secondary">Вес / объём</Text>
                        <Text>
                          {formatKgAndTonnes(c.cargo?.weight)} / {formatDecimal(c.cargo?.volume)}
                        </Text>
                      </div>
                      <div className="entity-card-meta">
                        <Text type="secondary">Цена груза</Text>
                        <Text>{formatDecimal(c.cargo?.price)}</Text>
                      </div>
                    </section>

                    <section className="contract-card-section">
                      <Text className="contract-card-section-title" type="secondary">
                        Транспорт
                      </Text>
                      <div className="entity-card-meta">
                        <Text type="secondary">Авто</Text>
                        <Text>{getContractCarTitle(c)}</Text>
                      </div>
                      <div className="entity-card-meta">
                        <Text type="secondary">Тип</Text>
                        <Text>{formatCarType(c.car?.carType)}</Text>
                      </div>
                      <div className="entity-card-meta">
                        <Text type="secondary">Кузов</Text>
                        <Text ellipsis={{ tooltip: formatBodyTypes(c.car?.bodyType) }}>
                          {formatBodyTypes(c.car?.bodyType)}
                        </Text>
                      </div>
                      <div className="entity-card-meta">
                        <Text type="secondary">Загрузка</Text>
                        <Text ellipsis={{ tooltip: formatLoadingTypes(c.car?.loadingType) }}>
                          {formatLoadingTypes(c.car?.loadingType)}
                        </Text>
                      </div>
                      <div className="entity-card-meta">
                        <Text type="secondary">Грузоподъёмность</Text>
                        <Text>{formatTonnesFromKg(c.car?.loadCapacity)}</Text>
                      </div>
                      <div className="entity-card-meta">
                        <Text type="secondary">Год</Text>
                        <Text>{c.car?.yearProduction ?? "—"}</Text>
                      </div>
                      <div className="entity-card-meta">
                        <Text type="secondary">VIN</Text>
                        <Text code>{c.car?.vinNumber || "—"}</Text>
                      </div>
                    </section>

                    <section className="contract-card-section">
                      <Text className="contract-card-section-title" type="secondary">
                        Контракт
                      </Text>
                      <div className="entity-card-meta">
                        <Text type="secondary">ID</Text>
                        <Text>{c.id}</Text>
                      </div>
                      <div className="entity-card-meta">
                        <Text type="secondary">Создан</Text>
                        <Text>{formatDateTime(c.createdAt)}</Text>
                      </div>
                      <div className="entity-card-meta">
                        <Text type="secondary">Обновлён</Text>
                        <Text>{formatDateTime(c.updatedAt)}</Text>
                      </div>
                    </section>
                  </div>
                </Card>
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
    </div>
  );
};
