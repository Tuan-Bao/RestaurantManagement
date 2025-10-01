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

  const getAllStats = () => {
    const allTables = floors.flatMap(floor => floor.tables);
    return getFloorStats(allTables);
  };

  const allStats = getAllStats();

  return (
    <div className="mb-4">
      <div className="card">
        <div className="card-body p-3">
          {/* Container với scroll ngang để tránh ảnh hưởng layout */}
          <div 
            className="d-flex align-items-center"
            style={{ 
              gap: '0.75rem',
              overflowX: 'auto',
              overflowY: 'hidden',
              paddingBottom: '4px', // Tránh cắt shadow của button
              marginBottom: '-4px'
            }}
          >
            {/* Tab Tất cả tầng */}
            <div style={{ flexShrink: 0, minWidth: '120px' }}>
              <button
                className={`btn btn-sm w-100 ${
                  activeFloor === null ? 'btn-primary' : 'btn-outline-primary'
                }`}
                onClick={() => onFloorChange(null)}
                style={{ 
                  height: '48px',
                  fontSize: '0.8rem',
                  whiteSpace: 'nowrap'
                }}
              >
                <div className="d-flex align-items-center justify-content-center">
                  <i className="bi bi-list-ul me-2"></i>
                  <div className="text-center">
                    <div className="fw-bold small">Tất cả</div>
                    <div className="d-flex gap-1 justify-content-center">
                      <small className="badge bg-success text-white" style={{ fontSize: '0.65rem' }}>
                        {allStats.available}
                      </small>
                      <small className="badge bg-danger text-white" style={{ fontSize: '0.65rem' }}>
                        {allStats.occupied}
                      </small>
                    </div>
                  </div>
                </div>
              </button>
            </div>

            {/* Tabs cho từng tầng */}
            {floors.map(floor => {
              const stats = getFloorStats(floor.tables);
              return (
                <div key={floor.id} style={{ flexShrink: 0, minWidth: '120px' }}>
                  <button
                    className={`btn btn-sm w-100 ${
                      activeFloor === floor.id
                        ? 'btn-primary'
                        : 'btn-outline-primary'
                    }`}
                    onClick={() => onFloorChange(floor.id)}
                    style={{ 
                      height: '48px',
                      fontSize: '0.8rem',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    <div className="d-flex align-items-center justify-content-center">
                      <i className="bi bi-building me-2"></i>
                      <div className="text-center">
                        <div className="fw-bold small">{floor.name}</div>
                        <div className="d-flex gap-1 justify-content-center">
                          <small className="badge bg-success text-white" style={{ fontSize: '0.65rem' }}>
                            {stats.available}
                          </small>
                          <small className="badge bg-danger text-white" style={{ fontSize: '0.65rem' }}>
                            {stats.occupied}
                          </small>
                        </div>
                      </div>
                    </div>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FloorTabs;