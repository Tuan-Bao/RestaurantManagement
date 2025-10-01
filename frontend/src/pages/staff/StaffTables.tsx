import React, { useState, useEffect } from 'react';
import StaffLayout from '../../layouts/StaffLayout';
import TableCard from '../../components/shared/TableCard';
import FloorTabs from '../../components/shared/FloorTabs';
import TableStats from '../../components/shared/TableStats';
import TableOrderModal from '../../components/shared/TableOrderModal';
import MenuSelection from '../../components/shared/MenuSelection';
import PaymentModal from '../../components/shared/PaymentModal';
import ConfirmDialog from '../../components/shared/ConfirmDialog';
import { tablesApi } from '../../services/tables';
import { ordersApi } from '../../services/orders';
import type { Table, Order } from '../../types/restaurant';

interface Floor {
  id: number;
  name: string;
  tables: Table[];
}

const StaffTables: React.FC = () => {
  const [activeFloor, setActiveFloor] = useState<number | null>(null);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [floors, setFloors] = useState<Floor[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showMenuSelection, setShowMenuSelection] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  
  const [confirmAction, setConfirmAction] = useState<{
    title: string;
    message: string;
    action: () => void;
  } | null>(null);

  // Load tables data
  useEffect(() => {
    loadTables();
  }, []);

  const loadTables = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await tablesApi.getTables();
      if (response.data.success) {
        setTables(response.data.data);
        groupTablesByFloor(response.data.data);
      } else {
        setError('Không thể tải danh sách bàn');
      }
    } catch (err) {
      console.error('Error loading tables:', err);
      setError('Có lỗi xảy ra khi tải danh sách bàn');
    } finally {
      setLoading(false);
    }
  };

  const groupTablesByFloor = (tablesList: Table[]) => {
    // Group tables by floor
    const floorGroups = tablesList.reduce((acc, table) => {
      const floorKey = table.floor || 1;
      if (!acc[floorKey]) {
        acc[floorKey] = [];
      }
      acc[floorKey].push(table);
      return acc;
    }, {} as Record<number, Table[]>);

    // Convert to Floor array
    const floorsArray: Floor[] = Object.entries(floorGroups)
      .map(([floorId, floorTables]) => ({
        id: Number(floorId),
        name: `Tầng ${floorId}`,
        tables: floorTables.sort((a, b) => a.name.localeCompare(b.name))
      }))
      .sort((a, b) => a.id - b.id);

    setFloors(floorsArray);
  };

  const getCurrentTables = (): Table[] => {
    if (activeFloor === null) {
      return tables;
    }
    const floor = floors.find(f => f.id === activeFloor);
    return floor?.tables || [];
  };

  const getOverallStats = () => {
    const available = tables.filter(t => t.status === 'available').length;
    const occupied = tables.filter(t => t.status === 'unavailable').length;
    
    return {
      total: tables.length,
      available,
      occupied,
    };
  };

  const handleTableSelect = (table: Table) => {
    setSelectedTable(table);
    
    if (table.status === 'available') {
      // Show confirm dialog for opening table
      setConfirmAction({
        title: 'Mở bàn',
        message: `Bạn có muốn mở ${table.name} không?`,
        action: () => handleOpenTable(table)
      });
      setShowConfirmDialog(true);
    } else {
      // Show order details modal
      setShowOrderModal(true);
    }
  };

  const handleOpenTable = async (table: Table) => {
    try {
      const response = await tablesApi.updateTableStatus(table.id, 'unavailable');
      if (response.data.success) {
        // Reload tables to get updated status
        await loadTables();
        setShowConfirmDialog(false);
      } else {
        alert('Không thể mở bàn. Vui lòng thử lại.');
      }
    } catch (error) {
      console.error('Error opening table:', error);
      alert('Có lỗi xảy ra khi mở bàn');
    }
  };

  const handleAddOrder = () => {
    setShowOrderModal(false);
    if (selectedTable) {
      setShowMenuSelection(true);
    }
  };

  const handlePayment = async () => {
    if (!selectedTable) return;

    try {
      // Get current order for this table
      const response = await ordersApi.getOrderByTable(selectedTable.id);
      if (response.data.success && response.data.data) {
        const order = response.data.data;
        const totalAmount = order.order_items?.reduce((sum, item) => 
          sum + (item.quantity * item.price_each), 0) || 0;
        
        setCurrentOrder({
          ...order,
          total_amount: totalAmount,
          tableName: selectedTable.name
        });
        setShowOrderModal(false);
        setShowPaymentModal(true);
      } else {
        alert('Không tìm thấy đơn hàng cho bàn này');
      }
    } catch (error) {
      console.error('Error loading order for payment:', error);
      alert('Có lỗi xảy ra khi tải thông tin đơn hàng');
    }
  };

  const handleCloseTable = () => {
    if (!selectedTable) return;

    setConfirmAction({
      title: 'Đóng bàn',
      message: `Bạn có muốn đóng ${selectedTable.name} không?`,
      action: () => handleCloseTableConfirm()
    });
    setShowOrderModal(false);
    setShowConfirmDialog(true);
  };

  const handleCloseTableConfirm = async () => {
    if (!selectedTable) return;

    try {
      const response = await tablesApi.updateTableStatus(selectedTable.id, 'available');
      if (response.data.success) {
        await loadTables();
        setShowConfirmDialog(false);
      } else {
        alert('Không thể đóng bàn. Vui lòng thử lại.');
      }
    } catch (error) {
      console.error('Error closing table:', error);
      alert('Có lỗi xảy ra khi đóng bàn');
    }
  };

  const handleOrderCreated = () => {
    // Reload tables and close menu selection
    loadTables();
    setShowMenuSelection(false);
  };

  const handlePaymentSuccess = () => {
    // Reload tables and close modals
    loadTables();
    setShowPaymentModal(false);
    setCurrentOrder(null);
  };

  const handleRefresh = () => {
    loadTables();
  };

  if (loading) {
    return (
      <StaffLayout>
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Đang tải...</span>
          </div>
        </div>
      </StaffLayout>
    );
  }

  const stats = getOverallStats();
  const currentTables = getCurrentTables();

  return (
    <StaffLayout>
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
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
          <button 
            className="btn btn-outline-primary"
            onClick={handleRefresh}
            disabled={loading}
          >
            <i className="bi bi-arrow-clockwise me-1"></i>
            Làm mới
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="alert alert-danger alert-dismissible">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
          <button
            type="button"
            className="btn-close"
            onClick={() => setError(null)}
          ></button>
        </div>
      )}

      {/* Statistics */}
      <TableStats
        totalTables={stats.total}
        availableTables={stats.available}
        occupiedTables={stats.occupied}
      />

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
            <div key={table.id} className="col-6 col-md-4 col-lg-3 mb-3">
              <TableCard 
                table={table} 
                onSelect={handleTableSelect} 
              />
            </div>
          ))
        ) : (
          <div className="col-12">
            <div className="text-center py-5">
              <i className="bi bi-grid-3x3 fs-1 text-muted mb-3"></i>
              <h5 className="text-muted">
                {activeFloor === null 
                  ? 'Không có bàn nào trong hệ thống'
                  : `Không có bàn nào trong ${floors.find(f => f.id === activeFloor)?.name}`
                }
              </h5>
              <p className="text-muted">
                {activeFloor === null 
                  ? 'Vui lòng liên hệ quản trị viên để thêm bàn mới.'
                  : 'Vui lòng chọn tầng khác hoặc liên hệ quản trị viên.'
                }
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Table Order Modal */}
      {showOrderModal && selectedTable && (
        <TableOrderModal
          table={selectedTable}
          isOpen={showOrderModal}
          onClose={() => setShowOrderModal(false)}
          onAddOrder={handleAddOrder}
          onPayment={handlePayment}
          onCloseTable={handleCloseTable}
          onTableChanged={() => {
            // Reload tables data khi có thay đổi bàn
            loadTables();
          }}
        />
      )}

      {/* Menu Selection Modal */}
      <MenuSelection
        isOpen={showMenuSelection}
        tableId={selectedTable?.id || 0}
        tableName={selectedTable?.name || ''}
        onClose={() => setShowMenuSelection(false)}
        onOrderCreated={handleOrderCreated}
      />

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        order={currentOrder}
        onClose={() => {
          setShowPaymentModal(false);
          setCurrentOrder(null);
        }}
        onPaymentSuccess={handlePaymentSuccess}
      />

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={showConfirmDialog}
        title={confirmAction?.title || ''}
        message={confirmAction?.message || ''}
        confirmText="Xác nhận"
        cancelText="Hủy"
        onConfirm={() => {
          confirmAction?.action();
        }}
        onCancel={() => {
          setShowConfirmDialog(false);
          setConfirmAction(null);
          setSelectedTable(null);
        }}
      />
    </StaffLayout>
  );
};

export default StaffTables;