import React from 'react';

interface TableStatsProps {
  totalTables: number;
  availableTables: number;
  occupiedTables: number;
}

const TableStats: React.FC<TableStatsProps> = ({
  totalTables,
  availableTables,
  occupiedTables,
}) => {
  return (
    <div className="row mb-4">
      <div className="col-4 col-md-4 mb-3">
        <div className="card border-0 shadow-sm bg-primary text-white">
          <div className="card-body py-3">
            <div className="d-flex align-items-center">
              <i className="bi bi-grid-3x3 fs-2 me-3 d-none d-md-block"></i>
              <div className="text-center text-md-start w-100">
                <h4 className="mb-0">{totalTables}</h4>
                <small>Tổng số bàn</small>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="col-4 col-md-4 mb-3">
        <div className="card border-0 shadow-sm bg-success text-white">
          <div className="card-body py-3">
            <div className="d-flex align-items-center">
              <i className="bi bi-check-circle fs-2 me-3 d-none d-md-block"></i>
              <div className="text-center text-md-start w-100">
                <h4 className="mb-0">{availableTables}</h4>
                <small>Bàn trống</small>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="col-4 col-md-4 mb-3">
        <div className="card border-0 shadow-sm bg-danger text-white">
          <div className="card-body py-3">
            <div className="d-flex align-items-center">
              <i className="bi bi-person-fill fs-2 me-3 d-none d-md-block"></i>
              <div className="text-center text-md-start w-100">
                <h4 className="mb-0">{occupiedTables}</h4>
                <small>Đang phục vụ</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TableStats;