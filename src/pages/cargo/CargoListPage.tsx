import { PlusOutlined } from "@ant-design/icons";
import { Button, Card, Col, Empty, Pagination, Row, Spin, Typography, message } from "antd";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as cargoApi from "../../api/cargo.api";
import type { CargoDto } from "../../types/domain";
import { formatAddress, formatDateTime, formatDecimal } from "../../utils/format";

const { Text, Title } = Typography;

export const CargoListPage = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [items, setItems] = useState<CargoDto[]>([]);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    cargoApi
      .getCargoPage({ currentPageNumber: page, itemsOnPage: pageSize })
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
        message.error("Не удалось загрузить список грузов");
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
                <Card
                  className="entity-card"
                  hoverable
                  onClick={() => navigate(`/cargo/${c.id}`)}
                  title={<span className="entity-card-title">{c.name}</span>}
                >
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
