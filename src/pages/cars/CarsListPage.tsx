import { PlusOutlined } from "@ant-design/icons";
import { Button, Card, Col, Empty, Pagination, Row, Spin, Typography, message } from "antd";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as carsApi from "../../api/cars.api";
import type { CarDto } from "../../types/domain";
import { formatDateTime } from "../../utils/format";

const { Text, Title } = Typography;

export const CarsListPage = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [items, setItems] = useState<CarDto[]>([]);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    carsApi
      .getCarsPage({ currentPageNumber: page, itemsOnPage: pageSize })
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
        message.error("Не удалось загрузить список транспорта");
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

  const handlePageChange = (p: number) => {
    setPage(p);
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
            onChange={handlePageChange}
            showSizeChanger={false}
            hideOnSinglePage
          />
        </div>
      )}
    </div>
  );
};
