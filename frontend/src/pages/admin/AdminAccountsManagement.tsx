import React, { useState, useEffect } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import ConfirmDialog from "../../components/shared/ConfirmDialog";
import Loading from "../../components/shared/Loading";
import { userService, type CreateUserData, type UpdateUserData } from "../../services/user";
import type { User } from "../../types/user";

const AccountsManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalError, setModalError] = useState<string | null>(null); 
  const [searchTerm, setSearchTerm] = useState("");
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  // Form data
  const [formData, setFormData] = useState<CreateUserData>({
    username: "",
    name: "",
    role: "staff",
    password: "",
  });

  // Load users
  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await userService.getUsers();
      setUsers(response.data);
    } catch (err: any) {
      setError("Không thể tải danh sách tài khoản");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // Filter users based on search
  const filteredUsers = users.filter(
    user =>
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setModalError(null); // Clear modal error

    try {
      if (showCreateModal) {
        await userService.createUser(formData);
      } else if (showEditModal && selectedUser) {
        const updateData: UpdateUserData = { ...formData };
        if (!updateData.password) delete updateData.password;
        await userService.updateUser(selectedUser.id, updateData);
      }
      
      await loadUsers();
      resetForm();
      setShowCreateModal(false);
      setShowEditModal(false);
    } catch (err: any) {
      setModalError(err.response?.data?.message || "Đã xảy ra lỗi");
    } finally {
      setActionLoading(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!selectedUser) return;

    setActionLoading(true);
    try {
      await userService.deleteUser(selectedUser.id);
      await loadUsers();
      setShowConfirmDelete(false);
      setSelectedUser(null);
    } catch (err: any) {
      setError(err.response?.data?.message || "Không thể xóa tài khoản");
    } finally {
      setActionLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      username: "",
      name: "",
      role: "staff",
      password: "",
    });
    setSelectedUser(null);
    setModalError(null); // Clear modal error
  };

  // Open view modal
  const openViewModal = (user: User) => {
    setSelectedUser(user);
    setShowViewModal(true);
  };

  // Open edit modal
  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setFormData({
      username: user.username,
      name: user.name || "",
      role: user.role,
      password: "",
    });
    setModalError(null); // Clear modal error
    setShowEditModal(true);
  };

  // Open create modal
  const openCreateModal = () => {
    resetForm();
    setShowCreateModal(true);
  };

  // Open delete confirmation
  const openDeleteConfirm = (user: User) => {
    setSelectedUser(user);
    setShowConfirmDelete(true);
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <AdminLayout>
      <div className="row">
        <div className="col-12">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4">
            <h2 className="mb-2 mb-md-0">
              <i className="bi bi-people me-2"></i>
              Quản lý tài khoản
            </h2>
            <button
              className="btn btn-primary"
              onClick={openCreateModal}
            >
              <i className="bi bi-person-plus me-2"></i>
              Thêm tài khoản
            </button>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="row mb-4">
        <div className="col-md-6">
          <div className="input-group">
            <span className="input-group-text">
              <i className="bi bi-search"></i>
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Tìm kiếm theo tên hoặc username..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="col-md-6">
          <div className="d-flex justify-content-md-end mt-2 mt-md-0">
            <span className="badge bg-primary fs-6">
              Tổng: {filteredUsers.length} tài khoản
            </span>
          </div>
        </div>
      </div>

      {/* Error Alert (Only for page-level errors) */}
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

      {/* Users Table */}
      <div className="card">
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-hover">
              <thead className="table-light">
                <tr>
                  <th>ID</th>
                  <th>Tên hiển thị</th>
                  <th>Username</th>
                  <th>Vai trò</th>
                  <th className="d-none d-md-table-cell">Ngày tạo</th>
                  <th className="text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center text-muted py-4">
                      <i className="bi bi-inbox display-4 d-block mb-3"></i>
                      {searchTerm ? "Không tìm thấy tài khoản nào" : "Chưa có tài khoản nào"}
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id}>
                      <td>#{user.id}</td>
                      <td>
                        <div className="d-flex align-items-center">
                          <i className="bi bi-person-circle fs-4 me-2 text-muted"></i>
                          <span className="fw-bold">{user.name || "N/A"}</span>
                        </div>
                      </td>
                      <td>
                        <code className="text-primary">{user.username}</code>
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            user.role === "admin" ? "bg-danger" : "bg-info"
                          }`}
                        >
                          <i
                            className={`bi ${
                              user.role === "admin" ? "bi-shield-check" : "bi-person"
                            } me-1`}
                          ></i>
                          {user.role === "admin" ? "Quản trị viên" : "Nhân viên"}
                        </span>
                      </td>
                      <td className="d-none d-md-table-cell">
                        <small className="text-muted">
                          {new Date(user.created_at).toLocaleDateString("vi-VN")}
                        </small>
                      </td>
                      <td>
                        <div className="d-flex justify-content-center gap-1">
                          <button
                            className="btn btn-sm btn-outline-info"
                            onClick={() => openViewModal(user)}
                            title="Xem chi tiết"
                          >
                            <i className="bi bi-eye"></i>
                          </button>
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => openEditModal(user)}
                            title="Chỉnh sửa"
                          >
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => openDeleteConfirm(user)}
                            title="Xóa"
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* View Modal */}
      {showViewModal && selectedUser && (
        <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="bi bi-person-circle me-2"></i>
                  Chi tiết tài khoản
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowViewModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row g-3">
                  <div className="col-12">
                    <div className="text-center mb-3">
                      <i className="bi bi-person-circle display-1 text-muted"></i>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold">ID:</label>
                    <p>#{selectedUser.id}</p>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold">Username:</label>
                    <p><code>{selectedUser.username}</code></p>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold">Tên hiển thị:</label>
                    <p>{selectedUser.name || "Chưa cập nhật"}</p>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold">Vai trò:</label>
                    <p>
                      <span
                        className={`badge ${
                          selectedUser.role === "admin" ? "bg-danger" : "bg-info"
                        }`}
                      >
                        <i
                          className={`bi ${
                            selectedUser.role === "admin" ? "bi-shield-check" : "bi-person"
                          } me-1`}
                        ></i>
                        {selectedUser.role === "admin" ? "Quản trị viên" : "Nhân viên"}
                      </span>
                    </p>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold">Ngày tạo:</label>
                    <p>{new Date(selectedUser.created_at).toLocaleDateString("vi-VN")}</p>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold">Cập nhật lần cuối:</label>
                    <p>{new Date(selectedUser.updated_at).toLocaleDateString("vi-VN")}</p>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    setShowViewModal(false);
                    openEditModal(selectedUser);
                  }}
                >
                  <i className="bi bi-pencil me-2"></i>
                  Chỉnh sửa
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowViewModal(false)}
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {(showCreateModal || showEditModal) && (
        <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="bi bi-person-plus me-2"></i>
                  {showCreateModal ? "Thêm tài khoản mới" : "Chỉnh sửa tài khoản"}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setShowCreateModal(false);
                    setShowEditModal(false);
                    resetForm();
                  }}
                ></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  {/* Error Alert inside Modal */}
                  {modalError && (
                    <div className="alert alert-danger alert-dismissible mb-3">
                      <i className="bi bi-exclamation-triangle me-2"></i>
                      {modalError}
                      <button
                        type="button"
                        className="btn-close"
                        onClick={() => setModalError(null)}
                      ></button>
                    </div>
                  )}

                  <div className="mb-3">
                    <label className="form-label">
                      <i className="bi bi-person me-1"></i>
                      Username *
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.username}
                      onChange={(e) => setFormData({...formData, username: e.target.value})}
                      required
                      disabled={showEditModal}
                    />
                    {showEditModal && (
                      <small className="text-muted">Username không thể thay đổi</small>
                    )}
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label">
                      <i className="bi bi-card-text me-1"></i>
                      Tên hiển thị
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">
                      <i className="bi bi-shield-check me-1"></i>
                      Vai trò *
                    </label>
                    <select
                      className="form-select"
                      value={formData.role}
                      onChange={(e) => setFormData({...formData, role: e.target.value as "admin" | "staff"})}
                      required
                    >
                      <option value="staff">Nhân viên</option>
                      <option value="admin">Quản trị viên</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">
                      <i className="bi bi-lock me-1"></i>
                      Mật khẩu {showEditModal && "(để trống nếu không đổi)"}
                    </label>
                    <input
                      type="password"
                      className="form-control"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      required={showCreateModal}
                      minLength={6}
                    />
                    <small className="text-muted">
                      Mật khẩu phải có ít nhất 6 ký tự
                    </small>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowCreateModal(false);
                      setShowEditModal(false);
                      resetForm();
                    }}
                    disabled={actionLoading}
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={actionLoading}
                  >
                    {actionLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Đang xử lý...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check-lg me-2"></i>
                        {showCreateModal ? "Tạo tài khoản" : "Cập nhật"}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={showConfirmDelete}
        title="Xác nhận xóa tài khoản"
        message={`Bạn có chắc chắn muốn xóa tài khoản "${selectedUser?.name || selectedUser?.username}"? Thao tác này không thể hoàn tác.`}
        confirmText="Xóa tài khoản"
        cancelText="Hủy"
        onConfirm={handleDelete}
        onCancel={() => {
          setShowConfirmDelete(false);
          setSelectedUser(null);
        }}
        type="danger"
      />
    </AdminLayout>
  );
};

export default AccountsManagement;