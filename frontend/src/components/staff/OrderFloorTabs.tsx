import React from "react";
import type { Floor } from "../../types/order";

interface OrderFloorTabsProps {
  floors: Floor[];
  activeFloor: number;
  onFloorChange: (floorId: number) => void;
}

const OrderFloorTabs: React.FC<OrderFloorTabsProps> = ({
  floors,
  activeFloor,
  onFloorChange,
}) => {
  const getFloorStats = (orders: Floor["orders"]) => {
    const active = orders.filter(o => o.status === "active").length;
    const completed = orders.filter(o => o.status === "completed").length;
    const cancelled = orders.filter(o => o.status === "cancelled").length;

    // Count total items by status
    const allItems = orders.flatMap(o => o.items);
    const pendingItems = allItems.filter(i => i.status === "pending").length;
    const preparingItems = allItems.filter(
      i => i.status === "preparing"
    ).length;
    const readyItems = allItems.filter(i => i.status === "ready").length;

    return {
      active,
      completed,
      cancelled,
      total: orders.length,
      pendingItems,
      preparingItems,
      readyItems,
    };
  };

  return (
    <div className="mb-4">
      <ul className="nav nav-tabs">
        <li className="nav-item">
          <button
            className={`nav-link ${activeFloor === 0 ? "active" : ""}`}
            onClick={() => onFloorChange(0)}
          >
            <div className="d-flex align-items-center">
              <i className="bi bi-list-ul me-2"></i>
              <div>
                <div className="fw-bold">Tất cả tầng</div>
                <div className="d-flex gap-2 mt-1">
                  <small className="badge bg-success">
                    {floors.reduce(
                      (sum, f) => sum + getFloorStats(f.orders).active,
                      0
                    )}{" "}
                    hoạt động
                  </small>
                  <small className="badge bg-warning">
                    {floors.reduce(
                      (sum, f) => sum + getFloorStats(f.orders).preparingItems,
                      0
                    )}{" "}
                    đang làm
                  </small>
                  <small className="badge bg-info">
                    {floors.reduce(
                      (sum, f) => sum + getFloorStats(f.orders).readyItems,
                      0
                    )}{" "}
                    sẵn sàng
                  </small>
                </div>
              </div>
            </div>
          </button>
        </li>

        {floors.map(floor => {
          const stats = getFloorStats(floor.orders);
          return (
            <li key={floor.id} className="nav-item">
              <button
                className={`nav-link ${
                  activeFloor === floor.id ? "active" : ""
                }`}
                onClick={() => onFloorChange(floor.id)}
              >
                <div className="d-flex align-items-center">
                  <i className="bi bi-building me-2"></i>
                  <div>
                    <div className="fw-bold">{floor.name}</div>
                    <div className="d-flex gap-2 mt-1">
                      <small className="badge bg-success">
                        {stats.active} đơn
                      </small>
                      {stats.preparingItems > 0 && (
                        <small className="badge bg-warning">
                          {stats.preparingItems} làm
                        </small>
                      )}
                      {stats.readyItems > 0 && (
                        <small className="badge bg-info">
                          {stats.readyItems} sẵn sàng
                        </small>
                      )}
                      {stats.pendingItems > 0 && (
                        <small className="badge bg-secondary">
                          {stats.pendingItems} chờ
                        </small>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default OrderFloorTabs;
