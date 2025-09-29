import React from 'react';
import type { Table } from '../../types/restaurant';

interface Floor {
  id: number;
  name: string;
  tables: Table[];
}

interface FloorTabsProps {
  floors: Floor[];
  activeFloor: number | null;
  onFloorChange: (floorId: number | null) => void;
}

const FloorTabs: React.FC<FloorTabsProps> = ({
  floors,
  activeFloor,
  onFloorChange,
}) => {
  const getFloorStats = (tables: Table[]) => {
    const available = tables.filter(t => t.status === 'available').length;
    const occupied = tables.filter(t => t.status === 'unavailable').length;

    return { available, occupied, total: tables.length };
  };

  // Tính tổng stats cho tất cả tầng
  const getAllStats = () => {
    const allTables = floors.flatMap(floor => floor.tables);
    return getFloorStats(allTables);
  };

  const allStats = getAllStats();

  return (
    <div className="mb-4">
      <div className="card">
        <div className="card-body p-3">
          <div className="d-flex flex-wrap gap-2">
            {/* Tab Tất cả tầng */}
            <button
              className={`btn btn-sm ${
                activeFloor === null ? 'btn-primary' : 'btn-outline-primary'
              }`}
              onClick={() => onFloorChange(null)}
            >
              <div className="d-flex align-items-center">
                <i className="bi bi-list-ul me-2"></i>
                <div className="text-start">
                  <div className="fw-bold">Tất cả</div>
                  <div className="d-flex gap-1">
                    <small className="badge bg-success text-white">
                      {allStats.available}
                    </small>
                    <small className="badge bg-danger text-white">
                      {allStats.occupied}
                    </small>
                  </div>
                </div>
              </div>
            </button>

            {/* Tabs cho từng tầng */}
            {floors.map(floor => {
              const stats = getFloorStats(floor.tables);
              return (
                <button
                  key={floor.id}
                  className={`btn btn-sm ${
                    activeFloor === floor.id
                      ? 'btn-primary'
                      : 'btn-outline-primary'
                  }`}
                  onClick={() => onFloorChange(floor.id)}
                >
                  <div className="d-flex align-items-center">
                    <i className="bi bi-building me-2"></i>
                    <div className="text-start">
                      <div className="fw-bold">{floor.name}</div>
                      <div className="d-flex gap-1">
                        <small className="badge bg-success text-white">
                          {stats.available}
                        </small>
                        <small className="badge bg-danger text-white">
                          {stats.occupied}
                        </small>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FloorTabs;