import React, { useState, useEffect } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import Loading from "../../components/shared/Loading";
import ConfirmDialog from "../../components/shared/ConfirmDialog";
import { menuApi } from "../../services/menu";
import { inventoryApi } from "../../services/inventory";
import type { Category, MenuItem, Recipe } from "../../types/restaurant";
import type { Ingredient } from "../../types/inventory";

const AdminMenu: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Data states
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [currentRecipes, setCurrentRecipes] = useState<Recipe[]>([]);

  // Filter states
  const [searchName, setSearchName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");

  // Modal states
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showMenuItemModal, setShowMenuItemModal] = useState(false);
  const [showRecipeModal, setShowRecipeModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Editing states
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingMenuItem, setEditingMenuItem] = useState<MenuItem | null>(null);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [selectedItemForRecipe, setSelectedItemForRecipe] =
    useState<MenuItem | null>(null);

  // Form states
  const [categoryForm, setCategoryForm] = useState({
    name: "",
    description: "",
  });

  const [menuItemForm, setMenuItemForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    status: "available",
    image: null as File | null,
  });

  const [recipeItems, setRecipeItems] = useState<
    {
      ingredient_id: number;
      quantity_required: string;
    }[]
  >([]);

  // Statistics
  const [stats, setStats] = useState({
    total: 0,
    available: 0,
    unavailable: 0,
    categories: 0,
  });

  // Load data on component mount
  useEffect(() => {
    loadData();
    loadIngredients();
  }, []);

  // Filter effect
  useEffect(() => {
    filterItems();
  }, [searchName, selectedCategory, selectedStatus, menuItems]);

  // Load all data
  const loadData = async (showLoadingSpinner: boolean = true) => {
    try {
      if (showLoadingSpinner) {
        setLoading(true);
      }

      const [categoriesRes, itemsRes] = await Promise.all([
        menuApi.getCategories(),
        menuApi.getMenuItems(),
      ]);

      if (categoriesRes.data.success && itemsRes.data.success) {
        const categoriesData = categoriesRes.data.data;
        const menuItemsData = itemsRes.data.data;

        setCategories(categoriesData);
        setMenuItems(menuItemsData);
        setFilteredItems(menuItemsData);

        // Calculate statistics
        const availableCount = menuItemsData.filter(
          item => item.status === "available"
        ).length;
        const unavailableCount = menuItemsData.filter(
          item => item.status === "unavailable"
        ).length;

        setStats({
          total: menuItemsData.length,
          available: availableCount,
          unavailable: unavailableCount,
          categories: categoriesData.length,
        });
      } else {
        setError("Không thể tải dữ liệu menu");
      }
    } catch (err: any) {
      setError("Không thể tải dữ liệu menu");
    } finally {
      if (showLoadingSpinner) {
        setLoading(false);
      }
    }
  };

  // Load ingredients from warehouse
  const loadIngredients = async () => {
    try {
      const response = await inventoryApi.getWarehouse();
      if (response.success) {
        setIngredients(response.data);
      }
    } catch (err: any) {
      console.error("Failed to load ingredients:", err);
    }
  };

  // Load recipes for a menu item
  const loadRecipeForItem = async (menuItemId: number) => {
    try {
      const response = await menuApi.getRecipes(menuItemId);
      if (response.data.success) {
        setCurrentRecipes(response.data.data);
        // Convert recipes to form format
        const formRecipes = response.data.data.map(recipe => ({
          ingredient_id: recipe.ingredient,
          quantity_required: recipe.quantity_required?.toString() || "",
        }));
        setRecipeItems(formRecipes);
      }
    } catch (err: any) {
      console.error("Failed to load recipes:", err);
      setCurrentRecipes([]);
      setRecipeItems([]);
    }
  }; // Filter items
  const filterItems = () => {
    const filtered = menuItems.filter((item: MenuItem) => {
      const matchesName =
        !searchName ||
        item.name?.toLowerCase().includes(searchName.toLowerCase());
      const matchesCategory =
        !selectedCategory || item.category === Number(selectedCategory);
      const matchesStatus = !selectedStatus || item.status === selectedStatus;
      return matchesName && matchesCategory && matchesStatus;
    });
    setFilteredItems(filtered);
  };

  // Category handlers
  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setError(null);

    try {
      if (editingCategory) {
        const response = await menuApi.updateCategory(
          editingCategory.id,
          categoryForm
        );
        if (response.data.success) {
          setSuccessMessage("Cập nhật danh mục thành công");
        } else {
          setError(response.data.message || "Cập nhật danh mục thất bại");
        }
      } else {
        const response = await menuApi.createCategory(categoryForm);
        if (response.data.success) {
          setSuccessMessage("Thêm danh mục thành công");
        } else {
          setError(response.data.message || "Thêm danh mục thất bại");
        }
      }

      await loadData(false);
      resetCategoryForm();
      setShowCategoryModal(false);
    } catch (err: any) {
      setError(err.response?.data?.message || "Đã xảy ra lỗi");
    } finally {
      setActionLoading(false);
    }
  };

  // Menu item handlers
  const handleMenuItemSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      Object.entries(menuItemForm).forEach(([key, value]) => {
        if (key === "image" && value) {
          formData.append("image", value);
        } else if (value !== null) {
          formData.append(key, value.toString());
        }
      });

      if (editingMenuItem) {
        const response = await menuApi.updateMenuItem(
          editingMenuItem.id,
          formData
        );
        if (response.data.success) {
          setSuccessMessage("Cập nhật món ăn thành công");
        } else {
          setError(response.data.message || "Cập nhật món ăn thất bại");
        }
      } else {
        const response = await menuApi.createMenuItem(formData);
        if (response.data.success) {
          setSuccessMessage("Thêm món ăn thành công");
        } else {
          setError(response.data.message || "Thêm món ăn thất bại");
        }
      }

      await loadData(false);
      resetMenuItemForm();
      setShowMenuItemModal(false);
    } catch (err: any) {
      setError(err.response?.data?.message || "Đã xảy ra lỗi");
    } finally {
      setActionLoading(false);
    }
  };

  // Recipe handlers
  const handleRecipeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemForRecipe) return;

    setActionLoading(true);
    setError(null);

    try {
      // Filter out empty recipes
      const validRecipes = recipeItems.filter(
        item =>
          item.ingredient_id &&
          item.quantity_required &&
          parseFloat(item.quantity_required) > 0
      );

      if (validRecipes.length === 0) {
        setError("Vui lòng thêm ít nhất một nguyên liệu");
        return;
      }

      let response;

      // Check if there are existing recipes
      if (currentRecipes.length === 0) {
        // No existing recipes - use addIngredients API
        const apiData = validRecipes.map(item => ({
          ingredient: item.ingredient_id,
          quantity_required: parseFloat(item.quantity_required),
        }));

        response = await menuApi.addIngredients(
          selectedItemForRecipe.id,
          apiData
        );
      } else {
        // Has existing recipes - use updateIngredientsInBulk API
        const apiData = validRecipes.map(item => ({
          ingredient: item.ingredient_id,
          quantity_required: parseFloat(item.quantity_required),
        }));

        response = await menuApi.updateIngredientsInBulk(
          selectedItemForRecipe.id,
          apiData
        );
      }

      if (response.data.success) {
        setSuccessMessage("Cập nhật công thức thành công");
        setShowRecipeModal(false);
        setSelectedItemForRecipe(null);
        setRecipeItems([]);
      } else {
        setError(response.data.message || "Cập nhật công thức thất bại");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Đã xảy ra lỗi");
    } finally {
      setActionLoading(false);
    }
  };

  const addRecipeItem = () => {
    setRecipeItems([
      ...recipeItems,
      { ingredient_id: 0, quantity_required: "" },
    ]);
  };

  const removeRecipeItem = (index: number) => {
    setRecipeItems(recipeItems.filter((_, i) => i !== index));
  };

  const updateRecipeItem = (
    index: number,
    field: string,
    value: string | number
  ) => {
    const updated = [...recipeItems];
    updated[index] = { ...updated[index], [field]: value };
    setRecipeItems(updated);
  };

  // Delete handlers
  const handleDeleteConfirm = async () => {
    if (!selectedItem) return;

    setActionLoading(true);
    try {
      const response = await menuApi.deleteMenuItem(selectedItem.id);

      // Handle both 200 and 204 responses
      if (response.status === 200 || response.status === 204) {
        const data = response.data;
        if (!data || data.success !== false) {
          setSuccessMessage("Xóa món ăn thành công");
          await loadData(false);
          setShowDeleteModal(false);
          setSelectedItem(null);
        } else {
          setError(data.message || "Xóa món ăn thất bại");
        }
      } else {
        setError("Xóa món ăn thất bại");
      }
    } catch (err: any) {
      console.error("Delete error:", err);
      setError(err.response?.data?.message || "Xóa món ăn thất bại");
    } finally {
      setActionLoading(false);
    }
  };

  // Form reset functions
  const resetCategoryForm = () => {
    setCategoryForm({ name: "", description: "" });
    setEditingCategory(null);
  };

  const resetMenuItemForm = () => {
    setMenuItemForm({
      name: "",
      description: "",
      price: "",
      category: "",
      status: "available",
      image: null,
    });
    setEditingMenuItem(null);
  };

  // Modal handlers
  const openCategoryModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setCategoryForm({
        name: category.name || "",
        description: category.description || "",
      });
    } else {
      resetCategoryForm();
    }
    setShowCategoryModal(true);
  };

  const openMenuItemModal = (item?: MenuItem) => {
    if (item) {
      setEditingMenuItem(item);
      setMenuItemForm({
        name: item.name || "",
        description: item.description || "",
        price: item.price?.toString() || "",
        category: item.category?.toString() || "",
        status: item.status || "available",
        image: null,
      });
    } else {
      resetMenuItemForm();
    }
    setShowMenuItemModal(true);
  };

  const openDeleteModal = (item: MenuItem) => {
    setSelectedItem(item);
    setShowDeleteModal(true);
  };

  const openRecipeModal = async (item: MenuItem) => {
    setSelectedItemForRecipe(item);
    setRecipeItems([]);
    setShowRecipeModal(true);
    // Load existing recipes
    await loadRecipeForItem(item.id);
  };

  // Get category name
  const getCategoryName = (categoryId: number) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.name || "Không có danh mục";
  };

  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  return (
    <AdminLayout>
      {loading ? (
        <Loading />
      ) : (
        <>
          {/* Header */}
          <div className="row">
            <div className="col-12">
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4">
                <h2 className="mb-2 mb-md-0">
                  <i className="bi bi-journal-text me-2"></i>
                  Quản lý menu
                </h2>
                <div className="d-flex gap-2">
                  <button
                    className="btn btn-outline-primary"
                    onClick={() => openCategoryModal()}
                  >
                    <i className="bi bi-plus me-2"></i>
                    Thêm danh mục
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={() => openMenuItemModal()}
                  >
                    <i className="bi bi-plus me-2"></i>
                    Thêm món ăn
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Success/Error Messages */}
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

          {successMessage && (
            <div className="alert alert-success alert-dismissible">
              <i className="bi bi-check-circle me-2"></i>
              {successMessage}
              <button
                type="button"
                className="btn-close"
                onClick={() => setSuccessMessage(null)}
              ></button>
            </div>
          )}

          {/* Statistics Cards */}
          <div className="row g-4 mb-4">
            <div className="col-md-3">
              <div className="card bg-primary text-white">
                <div className="card-body">
                  <div className="d-flex justify-content-between">
                    <div>
                      <h6 className="card-title">Tổng món ăn</h6>
                      <h3 className="mb-0">{stats.total}</h3>
                    </div>
                    <div className="fs-1 opacity-75">
                      <i className="bi bi-journal-text"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-3">
              <div className="card bg-success text-white">
                <div className="card-body">
                  <div className="d-flex justify-content-between">
                    <div>
                      <h6 className="card-title">Có sẵn</h6>
                      <h3 className="mb-0">{stats.available}</h3>
                    </div>
                    <div className="fs-1 opacity-75">
                      <i className="bi bi-check-circle"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-3">
              <div className="card bg-warning text-dark">
                <div className="card-body">
                  <div className="d-flex justify-content-between">
                    <div>
                      <h6 className="card-title">Không có sẵn</h6>
                      <h3 className="mb-0">{stats.unavailable}</h3>
                    </div>
                    <div className="fs-1 opacity-75">
                      <i className="bi bi-x-circle"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-3">
              <div className="card bg-info text-white">
                <div className="card-body">
                  <div className="d-flex justify-content-between">
                    <div>
                      <h6 className="card-title">Danh mục</h6>
                      <h3 className="mb-0">{stats.categories}</h3>
                    </div>
                    <div className="fs-1 opacity-75">
                      <i className="bi bi-list"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="card mb-4">
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-4">
                  <label className="form-label">Tìm kiếm món ăn</label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="bi bi-search"></i>
                    </span>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Nhập tên món ăn..."
                      value={searchName}
                      onChange={e => setSearchName(e.target.value)}
                    />
                  </div>
                </div>

                <div className="col-md-4">
                  <label className="form-label">Danh mục</label>
                  <select
                    className="form-select"
                    value={selectedCategory}
                    onChange={e => setSelectedCategory(e.target.value)}
                  >
                    <option value="">Tất cả danh mục</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-md-4">
                  <label className="form-label">Trạng thái</label>
                  <select
                    className="form-select"
                    value={selectedStatus}
                    onChange={e => setSelectedStatus(e.target.value)}
                  >
                    <option value="">Tất cả trạng thái</option>
                    <option value="available">Có sẵn</option>
                    <option value="unavailable">Không có sẵn</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Menu Items Grid */}
          <div className="row">
            {filteredItems.length === 0 ? (
              <div className="col-12">
                <div className="card">
                  <div className="card-body text-center py-5">
                    <i
                      className="bi bi-journal-text text-muted"
                      style={{ fontSize: "3rem" }}
                    ></i>
                    <h5 className="mt-3 text-muted">Không có món ăn nào</h5>
                    <p className="text-muted">
                      Hãy thêm món ăn đầu tiên cho menu của bạn
                    </p>
                    <button
                      className="btn btn-primary"
                      onClick={() => openMenuItemModal()}
                    >
                      <i className="bi bi-plus me-2"></i>
                      Thêm món ăn
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              filteredItems.map(item => (
                <div key={item.id} className="col-lg-4 col-md-6 mb-4">
                  <div className="card h-100 shadow-sm">
                    {item.image_url && (
                      <img
                        src={item.image_url}
                        className="card-img-top"
                        alt={item.name}
                        style={{ height: "200px", objectFit: "cover" }}
                      />
                    )}
                    <div className="card-body d-flex flex-column">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <h5 className="card-title mb-0">{item.name}</h5>
                        <span
                          className={`badge ${
                            item.status === "available"
                              ? "bg-success"
                              : "bg-warning"
                          }`}
                        >
                          {item.status === "available" ? "Có sẵn" : "Hết món"}
                        </span>
                      </div>

                      <p className="text-muted small mb-2">
                        <i className="bi bi-list me-1"></i>
                        {item.category_name || getCategoryName(item.category)}
                      </p>

                      {item.description && (
                        <p className="card-text text-muted small flex-grow-1">
                          {item.description}
                        </p>
                      )}

                      <div className="d-flex justify-content-between align-items-center mt-auto">
                        <div className="h5 text-primary mb-0">
                          {formatPrice(item.price || 0)}
                        </div>
                        <div className="btn-group" role="group">
                          <button
                            className="btn btn-outline-info btn-sm"
                            onClick={() => openRecipeModal(item)}
                            title="Quản lý công thức"
                          >
                            <i className="bi bi-list-check"></i>
                          </button>
                          <button
                            className="btn btn-outline-primary btn-sm"
                            onClick={() => openMenuItemModal(item)}
                            title="Chỉnh sửa"
                          >
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => openDeleteModal(item)}
                            title="Xóa"
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Category Modal */}
          {showCategoryModal && (
            <div className="modal show d-block" tabIndex={-1}>
              <div className="modal-dialog modal-lg">
                <div className="modal-content">
                  <form onSubmit={handleCategorySubmit}>
                    <div className="modal-header">
                      <h5 className="modal-title">
                        <i className="bi bi-list me-2"></i>
                        {editingCategory ? "Sửa danh mục" : "Thêm danh mục"}
                      </h5>
                      <button
                        type="button"
                        className="btn-close"
                        onClick={() => setShowCategoryModal(false)}
                      ></button>
                    </div>
                    <div className="modal-body">
                      <div className="row">
                        <div className="col-12">
                          <div className="mb-3">
                            <label className="form-label">Tên danh mục *</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Nhập tên danh mục (ví dụ: Món chính, Tráng miệng, Đồ uống...)"
                              value={categoryForm.name}
                              onChange={e =>
                                setCategoryForm({
                                  ...categoryForm,
                                  name: e.target.value,
                                })
                              }
                              required
                            />
                          </div>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-12">
                          <div className="mb-3">
                            <label className="form-label">Mô tả</label>
                            <textarea
                              className="form-control"
                              rows={4}
                              placeholder="Mô tả chi tiết về danh mục này..."
                              value={categoryForm.description}
                              onChange={e =>
                                setCategoryForm({
                                  ...categoryForm,
                                  description: e.target.value,
                                })
                              }
                            ></textarea>
                            <div className="form-text">
                              Mô tả sẽ giúp khách hàng hiểu rõ hơn về loại món
                              ăn trong danh mục này
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="modal-footer">
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => setShowCategoryModal(false)}
                      >
                        <i className="bi bi-x me-1"></i>
                        Hủy
                      </button>
                      <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={actionLoading}
                      >
                        {actionLoading && (
                          <span className="spinner-border spinner-border-sm me-2"></span>
                        )}
                        <i className="bi bi-check me-1"></i>
                        {editingCategory ? "Cập nhật" : "Thêm danh mục"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
              <div className="modal-backdrop show"></div>
            </div>
          )}

          {/* Menu Item Modal */}
          {showMenuItemModal && (
            <div className="modal show d-block" tabIndex={-1}>
              <div className="modal-dialog modal-lg">
                <div className="modal-content">
                  <form onSubmit={handleMenuItemSubmit}>
                    <div className="modal-header">
                      <h5 className="modal-title">
                        {editingMenuItem ? "Sửa món ăn" : "Thêm món ăn"}
                      </h5>
                      <button
                        type="button"
                        className="btn-close"
                        onClick={() => setShowMenuItemModal(false)}
                      ></button>
                    </div>
                    <div className="modal-body">
                      <div className="row">
                        <div className="col-md-6">
                          <div className="mb-3">
                            <label className="form-label">Tên món ăn *</label>
                            <input
                              type="text"
                              className="form-control"
                              value={menuItemForm.name}
                              onChange={e =>
                                setMenuItemForm({
                                  ...menuItemForm,
                                  name: e.target.value,
                                })
                              }
                              required
                            />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="mb-3">
                            <label className="form-label">Giá *</label>
                            <input
                              type="number"
                              className="form-control"
                              value={menuItemForm.price}
                              onChange={e =>
                                setMenuItemForm({
                                  ...menuItemForm,
                                  price: e.target.value,
                                })
                              }
                              required
                              min="0"
                              step="1000"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="row">
                        <div className="col-md-6">
                          <div className="mb-3">
                            <label className="form-label">Danh mục *</label>
                            <select
                              className="form-select"
                              value={menuItemForm.category}
                              onChange={e =>
                                setMenuItemForm({
                                  ...menuItemForm,
                                  category: e.target.value,
                                })
                              }
                              required
                            >
                              <option value="">Chọn danh mục</option>
                              {categories.map(category => (
                                <option key={category.id} value={category.id}>
                                  {category.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="mb-3">
                            <label className="form-label">Trạng thái</label>
                            <select
                              className="form-select"
                              value={menuItemForm.status}
                              onChange={e =>
                                setMenuItemForm({
                                  ...menuItemForm,
                                  status: e.target.value,
                                })
                              }
                            >
                              <option value="available">Có sẵn</option>
                              <option value="unavailable">Không có sẵn</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <div className="mb-3">
                        <label className="form-label">Mô tả</label>
                        <textarea
                          className="form-control"
                          rows={3}
                          value={menuItemForm.description}
                          onChange={e =>
                            setMenuItemForm({
                              ...menuItemForm,
                              description: e.target.value,
                            })
                          }
                        ></textarea>
                      </div>

                      <div className="mb-3">
                        <label className="form-label">Hình ảnh</label>
                        <input
                          type="file"
                          className="form-control"
                          accept="image/*"
                          onChange={e =>
                            setMenuItemForm({
                              ...menuItemForm,
                              image: e.target.files?.[0] || null,
                            })
                          }
                        />
                      </div>
                    </div>
                    <div className="modal-footer">
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => setShowMenuItemModal(false)}
                      >
                        Hủy
                      </button>
                      <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={actionLoading}
                      >
                        {actionLoading && (
                          <span className="spinner-border spinner-border-sm me-2"></span>
                        )}
                        {editingMenuItem ? "Cập nhật" : "Thêm"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
              <div className="modal-backdrop show"></div>
            </div>
          )}

          {/* Recipe Modal */}
          {showRecipeModal && selectedItemForRecipe && (
            <div className="modal show d-block" tabIndex={-1}>
              <div className="modal-dialog modal-lg">
                <div className="modal-content">
                  <form onSubmit={handleRecipeSubmit}>
                    <div className="modal-header">
                      <h5 className="modal-title">
                        <i className="bi bi-list-check me-2"></i>
                        Công thức món: {selectedItemForRecipe.name}
                      </h5>
                      <button
                        type="button"
                        className="btn-close"
                        onClick={() => setShowRecipeModal(false)}
                      ></button>
                    </div>
                    <div className="modal-body">
                      {/* Current recipes */}
                      {currentRecipes.length > 0 && (
                        <div className="mb-4">
                          <h6 className="text-primary">
                            <i className="bi bi-list-ul me-2"></i>
                            Công thức hiện tại
                          </h6>
                          <div className="table-responsive">
                            <table className="table table-sm">
                              <thead>
                                <tr>
                                  <th>Nguyên liệu</th>
                                  <th>Số lượng</th>
                                  <th>Đơn vị</th>
                                </tr>
                              </thead>
                              <tbody>
                                {currentRecipes.map(recipe => (
                                  <tr key={recipe.id}>
                                    <td>{recipe.ingredient_name}</td>
                                    <td>{recipe.quantity_required}</td>
                                    <td>{recipe.ingredient_unit}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                          <hr />
                        </div>
                      )}

                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <h6>Cập nhật công thức</h6>
                        <button
                          type="button"
                          className="btn btn-outline-primary btn-sm mx-2"
                          onClick={addRecipeItem}
                        >
                          <i className="bi bi-plus me-1"></i>
                          Thêm nguyên liệu
                        </button>
                      </div>

                      {recipeItems.length === 0 ? (
                        <div className="text-center py-4">
                          <i
                            className="bi bi-list-check text-muted"
                            style={{ fontSize: "2rem" }}
                          ></i>
                          <p className="text-muted mt-2">
                            Chưa có nguyên liệu nào
                          </p>
                          {/* <button
                            type="button"
                            className="btn btn-primary btn-sm"
                            onClick={addRecipeItem}
                          >
                            Thêm nguyên liệu đầu tiên
                          </button> */}
                        </div>
                      ) : (
                        <div className="recipe-items">
                          {recipeItems.map((item, index) => (
                            <div
                              key={index}
                              className="row g-2 mb-2 align-items-center"
                            >
                              <div className="col-6">
                                <select
                                  className="form-select"
                                  value={item.ingredient_id}
                                  onChange={e =>
                                    updateRecipeItem(
                                      index,
                                      "ingredient_id",
                                      Number(e.target.value)
                                    )
                                  }
                                  required
                                >
                                  <option value={0}>Chọn nguyên liệu</option>
                                  {ingredients.map(ingredient => (
                                    <option
                                      key={ingredient.id}
                                      value={ingredient.id}
                                    >
                                      {ingredient.name} ({ingredient.unit})
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <div className="col-4">
                                <input
                                  type="number"
                                  className="form-control"
                                  placeholder="Số lượng"
                                  value={item.quantity_required}
                                  onChange={e =>
                                    updateRecipeItem(
                                      index,
                                      "quantity_required",
                                      e.target.value
                                    )
                                  }
                                  required
                                  min="0"
                                  step="0.1"
                                />
                              </div>
                              <div className="col-2">
                                <button
                                  type="button"
                                  className="btn btn-outline-danger btn-sm"
                                  onClick={() => removeRecipeItem(index)}
                                >
                                  <i className="bi bi-trash"></i>
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="modal-footer">
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => setShowRecipeModal(false)}
                      >
                        Hủy
                      </button>
                      <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={actionLoading || recipeItems.length === 0}
                      >
                        {actionLoading && (
                          <span className="spinner-border spinner-border-sm me-2"></span>
                        )}
                        Lưu công thức
                      </button>
                    </div>
                  </form>
                </div>
              </div>
              <div className="modal-backdrop show"></div>
            </div>
          )}

          {/* Delete Confirmation Modal */}
          {showDeleteModal && selectedItem && (
            <ConfirmDialog
              isOpen={showDeleteModal}
              title="Xác nhận xóa"
              message={`Bạn có chắc muốn xóa món ăn "${selectedItem.name}"? Hành động này không thể hoàn tác.`}
              onConfirm={handleDeleteConfirm}
              onCancel={() => {
                setShowDeleteModal(false);
                setSelectedItem(null);
              }}
              type="danger"
            />
          )}
        </>
      )}
    </AdminLayout>
  );
};

export default AdminMenu;
