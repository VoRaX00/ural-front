import { Card, Col, Empty, Pagination, Row, Spin, Typography, message } from "antd";
import { useEffect, useState } from "react";
import * as contractsApi from "../../api/contracts.api";
import type { ContractDto } from "../../types/domain";
import { formatDateTime, formatDecimal } from "../../utils/format";

const { Text, Title } = Typography;

export const ContractsListPage = () => {
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
                <Card className="entity-card">
                  <div className="entity-card-meta">
                    <Text type="secondary">ID</Text>
                    <Text>{c.id}</Text>
                  </div>
                  <div className="entity-card-meta">
                    <Text type="secondary">Транспорт</Text>
                    <Text>{c.carId}</Text>
                  </div>
                  <div className="entity-card-meta">
                    <Text type="secondary">Груз</Text>
                    <Text>{c.cargoId}</Text>
                  </div>
                  <div className="entity-card-meta">
                    <Text type="secondary">Стоимость</Text>
                    <Text>{formatDecimal(c.price)}</Text>
                  </div>
                  <div className="entity-card-meta">
                    <Text type="secondary">Создан</Text>
                    <Text>{formatDateTime(c.createdAt)}</Text>
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
