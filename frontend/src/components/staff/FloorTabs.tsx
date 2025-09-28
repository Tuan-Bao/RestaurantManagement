import React from "react";
import type { Table } from "./TableCard";

interface Floor {
  id: number;
  name: string;
  tables: Table[];
}

interface FloorTabsProps {
  floors: Floor[];
  activeFloor: number;
  onFloorChange: (floorId: number) => void;
}

const FloorTabs: React.FC<FloorTabsProps> = ({
  floors,
  activeFloor,
  onFloorChange,
}) => {
  const getFloorStats = (tables: Table[]) => {
    const available = tables.filter(t => t.status === "available").length;
    const occupied = tables.filter(t => t.status === "occupied").length;
    const reserved = tables.filter(t => t.status === "reserved").length;
    const cleaning = tables.filter(t => t.status === "cleaning").length;

    return { available, occupied, reserved, cleaning, total: tables.length };
  };

  return (
    <div className="mb-4">
      <ul className="nav nav-tabs">
        {floors.map(floor => {
          const stats = getFloorStats(floor.tables);
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
                        {stats.available} trống
                      </small>
                      <small className="badge bg-danger">
                        {stats.occupied} có khách
                      </small>
                      {stats.reserved > 0 && (
                        <small className="badge bg-warning">
                          {stats.reserved} đặt
                        </small>
                      )}
                      {stats.cleaning > 0 && (
                        <small className="badge bg-secondary">
                          {stats.cleaning} dọn
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

export default FloorTabs;
