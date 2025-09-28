import React, { useState, useEffect } from "react";
import StaffLayout from "../../layouts/StaffLayout";
import TableCard, { type Table } from "../../components/staff/TableCard";
import FloorTabs from "../../components/staff/FloorTabs";
import TableDetailsModal from "../../components/staff/TableDetailsModal";

interface Floor {
  id: number;
  name: string;
  tables: Table[];
}

const StaffTables: React.FC = () => {
  const [activeFloor, setActiveFloor] = useState<number>(1);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [floors, setFloors] = useState<Floor[]>([]);

  // Mock data - Thay thế bằng API call thực tế
  useEffect(() => {
    const mockFloors: Floor[] = [
      {
        id: 1,
        name: "Tầng 1",
        tables: [
          { id: 1, name: "Bàn 1", capacity: 4, status: "available" },
          {
            id: 2,
            name: "Bàn 2",
            capacity: 6,
            status: "occupied",
            currentGuests: 4,
            estimatedDuration: 45,
          },
          {
            id: 3,
            name: "Bàn 3",
            capacity: 2,
            status: "reserved",
            reservedAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
          },
          { id: 4, name: "Bàn 4", capacity: 4, status: "cleaning" },
          { id: 5, name: "Bàn 5", capacity: 8, status: "available" },
          {
            id: 6,
            name: "Bàn 6",
            capacity: 4,
            status: "occupied",
            currentGuests: 3,
            estimatedDuration: 20,
          },
          { id: 7, name: "Bàn 7", capacity: 2, status: "available" },
          { id: 8, name: "Bàn 8", capacity: 6, status: "available" },
        ],
      },
      {
        id: 2,
        name: "Tầng 2",
        tables: [
          {
            id: 9,
            name: "Bàn 9",
            capacity: 10,
            status: "occupied",
            currentGuests: 8,
            estimatedDuration: 60,
          },
          { id: 10, name: "Bàn 10", capacity: 6, status: "available" },
          {
            id: 11,
            name: "Bàn 11",
            capacity: 4,
            status: "reserved",
            reservedAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
          },
          { id: 12, name: "Bàn 12", capacity: 8, status: "available" },
          { id: 13, name: "Bàn 13", capacity: 4, status: "cleaning" },
          { id: 14, name: "Bàn 14", capacity: 6, status: "available" },
        ],
      },
      {
        id: 3,
        name: "Tầng 3",
        tables: [
          { id: 15, name: "Bàn VIP 1", capacity: 12, status: "available" },
          {
            id: 16,
            name: "Bàn VIP 2",
            capacity: 8,
            status: "occupied",
            currentGuests: 6,
            estimatedDuration: 90,
          },
          {
            id: 17,
            name: "Bàn VIP 3",
            capacity: 10,
            status: "reserved",
            reservedAt: new Date(Date.now() + 120 * 60 * 1000).toISOString(),
          },
          { id: 18, name: "Bàn VIP 4", capacity: 6, status: "available" },
        ],
      },
    ];
    setFloors(mockFloors);
  }, []);

  const getCurrentFloorTables = () => {
    return floors.find(floor => floor.id === activeFloor)?.tables || [];
  };

  const handleTableSelect = (table: Table) => {
    setSelectedTable(table);
    setIsModalOpen(true);
  };

  const handleTableAction = (
    action: "occupy" | "reserve" | "clean" | "free"
  ) => {
    if (!selectedTable) return;

    // Update table status based on action
    const updatedFloors = floors.map(floor => ({
      ...floor,
      tables: floor.tables.map(table => {
        if (table.id === selectedTable.id) {
          switch (action) {
            case "occupy":
              return {
                ...table,
                status: "occupied" as const,
                currentGuests: 1,
              };
            case "reserve":
              return {
                ...table,
                status: "reserved" as const,
                reservedAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
              };
            case "clean":
              return { ...table, status: "cleaning" as const };
            case "free":
              return {
                ...table,
                status: "available" as const,
                currentGuests: 0,
                reservedAt: undefined,
                estimatedDuration: undefined,
              };
            default:
              return table;
          }
        }
        return table;
      }),
    }));

    setFloors(updatedFloors);

    // Show success message (có thể thay bằng toast notification)
    const actionMessages = {
      occupy: "Đã nhận bàn thành công",
      reserve: "Đã đặt bàn thành công",
      clean: "Đã chuyển trạng thái dọn bàn",
      free: "Đã trả bàn thành công",
    };
    alert(actionMessages[action]);
  };

  const getOverallStats = () => {
    const allTables = floors.flatMap(floor => floor.tables);
    return {
      total: allTables.length,
      available: allTables.filter(t => t.status === "available").length,
      occupied: allTables.filter(t => t.status === "occupied").length,
      reserved: allTables.filter(t => t.status === "reserved").length,
      cleaning: allTables.filter(t => t.status === "cleaning").length,
    };
  };

  const stats = getOverallStats();
  const currentTables = getCurrentFloorTables();

  return (
    <StaffLayout>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">
            <i className="bi bi-grid-3x3 me-2"></i>
            Quản lý bàn
          </h2>
          <p className="text-muted mb-0">
            Theo dõi và quản lý trạng thái các bàn trong nhà hàng
          </p>
        </div>

        <div className="d-flex gap-2">
          <button className="btn btn-outline-primary">
            <i className="bi bi-arrow-clockwise me-1"></i>
            Làm mới
          </button>
          <button className="btn btn-primary">
            <i className="bi bi-plus me-1"></i>
            Đặt bàn mới
          </button>
        </div>
      </div>

      {/* Overall Statistics */}
      <div className="row mb-4">
        <div className="col-md-3 mb-3">
          <div className="card border-0 shadow-sm bg-primary text-white">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <i className="bi bi-grid-3x3 fs-1 me-3"></i>
                <div>
                  <h4 className="mb-0">{stats.total}</h4>
                  <small>Tổng số bàn</small>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3 mb-3">
          <div className="card border-0 shadow-sm bg-success text-white">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <i className="bi bi-check-circle fs-1 me-3"></i>
                <div>
                  <h4 className="mb-0">{stats.available}</h4>
                  <small>Bàn trống</small>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3 mb-3">
          <div className="card border-0 shadow-sm bg-danger text-white">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <i className="bi bi-person-fill fs-1 me-3"></i>
                <div>
                  <h4 className="mb-0">{stats.occupied}</h4>
                  <small>Đang có khách</small>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3 mb-3">
          <div className="card border-0 shadow-sm bg-warning text-white">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <i className="bi bi-clock fs-1 me-3"></i>
                <div>
                  <h4 className="mb-0">{stats.reserved}</h4>
                  <small>Đã đặt</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floor Navigation */}
      <FloorTabs
        floors={floors}
        activeFloor={activeFloor}
        onFloorChange={setActiveFloor}
      />

      {/* Tables Grid */}
      <div className="row">
        {currentTables.length > 0 ? (
          currentTables.map(table => (
            <div key={table.id} className="col-lg-3 col-md-4 col-sm-6 mb-4">
              <TableCard table={table} onSelect={handleTableSelect} />
            </div>
          ))
        ) : (
          <div className="col-12">
            <div className="text-center py-5">
              <i className="bi bi-grid-3x3 fs-1 text-muted mb-3"></i>
              <h5 className="text-muted">Không có bàn nào trong tầng này</h5>
              <p className="text-muted">
                Vui lòng chọn tầng khác hoặc liên hệ quản trị viên để thêm bàn
                mới.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Table Details Modal */}
      <TableDetailsModal
        table={selectedTable}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedTable(null);
        }}
        onAction={handleTableAction}
      />
    </StaffLayout>
  );
};

export default StaffTables;
