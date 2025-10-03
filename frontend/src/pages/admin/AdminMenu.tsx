import React, { useState, useEffect } from "react";
import { Row, Col, Card, Input, Select, Modal, Spin, Typography, message, Button, Form, Upload, Space, List, Empty } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined } from "@ant-design/icons";
import AdminLayout from "../../layouts/AdminLayout";
import { menuApi } from "../../services/menu";
import { inventoryApi } from "../../services/inventory";
import type { Category, MenuItem, Recipe, Ingredient } from "../../types/restaurant";
import type { UploadFile } from "antd/es/upload/interface";
import "antd/dist/reset.css";

const { Title } = Typography;
const { Search } = Input;

const AdminMenu: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<MenuItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    available: 0
  });
  const [searchName, setSearchName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>();
  const [selectedStatus, setSelectedStatus] = useState<"available" | "unavailable" | undefined>();
  
  // CRUD modals state
  const [isMenuItemModalOpen, setIsMenuItemModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isRecipeModalOpen, setIsRecipeModalOpen] = useState(false);
  const [editingMenuItem, setEditingMenuItem] = useState<MenuItem | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);

  // Fetch menu data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  // Fetch ingredients
  const fetchIngredients = async () => {
    try {
      // TODO: Add inventoryApi to fetch ingredients
      const response = await inventoryApi.getIngredients();
      if (response.data.success) {
        setIngredients(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching ingredients:', error);
      message.error('Không thể tải danh sách nguyên liệu');
    }
  };

  // Watch recipe modal open state
  useEffect(() => {
    if (isRecipeModalOpen) {
      fetchIngredients();
    }
  }, [isRecipeModalOpen]);

  // Fetch categories and menu items
  const fetchData = async () => {
    setLoading(true);
    try {
      const [categoriesRes, itemsRes] = await Promise.all([
        menuApi.getCategories(),
        menuApi.getMenuItems()
      ]);

      if (categoriesRes.data.success && itemsRes.data.success) {
        const categoriesData = categoriesRes.data.data;
        setCategories(categoriesData);
        const menuItemsData = itemsRes.data.data;
        
        // Sort menu items by category
        const sortedItems = [...menuItemsData].sort((a, b) => {
          const catA = categoriesData.find(c => c.id === a.category_id)?.name || '';
          const catB = categoriesData.find(c => c.id === b.category_id)?.name || '';
          return catA.localeCompare(catB);
        });
        
        setMenuItems(sortedItems);
        setFilteredItems(sortedItems);
        
        // Calculate stats
        const availableCount = menuItemsData.filter(
          item => item.status === "available"
        ).length;
        setStats({
          total: menuItemsData.length,
          available: availableCount
        });
      } else {
        message.error(categoriesRes.data.message || itemsRes.data.message || "Failed to fetch data");
      }
    } catch (error) {
      console.error("Error fetching menu data:", error);
      message.error("Không thể tải dữ liệu. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const filtered = menuItems.filter((item: MenuItem) => {
      const matchesName = !searchName || item.name.toLowerCase().includes(searchName.toLowerCase());
      const matchesCategory = !selectedCategory || item.category_id === selectedCategory;
      const matchesStatus = !selectedStatus || item.status === selectedStatus;
      return matchesName && matchesCategory && matchesStatus;
    });
    setFilteredItems(filtered);
  }, [searchName, selectedCategory, selectedStatus, menuItems]);

  // CRUD handlers for menu items
  const handleCreateMenuItem = async (values: any) => {
    try {
      const formData = new FormData();
      Object.keys(values).forEach(key => {
        if (key === 'image' && values[key]?.[0]) {
          formData.append('image', values[key][0].originFileObj);
        } else {
          formData.append(key, values[key]);
        }
      });

      const response = await menuApi.createMenuItem(formData);
      if (response.data.success) {
        message.success('Thêm món ăn thành công');
        setIsMenuItemModalOpen(false);
        form.resetFields();
        fetchData();
      } else {
        message.error(response.data.message || 'Thêm món ăn thất bại');
      }
    } catch (error) {
      console.error('Error creating menu item:', error);
      message.error('Thêm món ăn thất bại');
    }
  };

  const handleUpdateMenuItem = async (values: any) => {
    if (!editingMenuItem) return;
    
    try {
      const formData = new FormData();
      Object.keys(values).forEach(key => {
        if (key === 'image' && values[key]?.[0]) {
          formData.append('image', values[key][0].originFileObj);
        } else {
          formData.append(key, values[key]);
        }
      });

      const response = await menuApi.updateMenuItem(editingMenuItem.id, formData);
      if (response.data.success) {
        message.success('Cập nhật món ăn thành công');
        setIsMenuItemModalOpen(false);
        setEditingMenuItem(null);
        form.resetFields();
        fetchData();
      } else {
        message.error(response.data.message || 'Cập nhật món ăn thất bại');
      }
    } catch (error) {
      console.error('Error updating menu item:', error);
      message.error('Cập nhật món ăn thất bại');
    }
  };

  const handleDeleteMenuItem = async (id: number) => {
    try {
      const response = await menuApi.deleteMenuItem(id);
      if (response.data.success) {
        message.success('Xóa món ăn thành công');
        setIsDeleteModalOpen(false);
        setSelectedItem(null);
        fetchData();
      } else {
        message.error(response.data.message || 'Xóa món ăn thất bại');
      }
    } catch (error) {
      console.error('Error deleting menu item:', error);
      message.error('Xóa món ăn thất bại');
    }
  };

  // CRUD handlers for categories
  const handleCreateCategory = async (values: any) => {
    try {
      const response = await menuApi.createCategory(values);
      if (response.data.success) {
        message.success('Thêm danh mục thành công');
        setIsCategoryModalOpen(false);
        form.resetFields();
        fetchData();
      } else {
        message.error(response.data.message || 'Thêm danh mục thất bại');
      }
    } catch (error) {
      console.error('Error creating category:', error);
      message.error('Thêm danh mục thất bại');
    }
  };

  const handleUpdateCategory = async (values: any) => {
    if (!editingCategory) return;

    try {
      const response = await menuApi.updateCategory(editingCategory.id, values);
      if (response.data.success) {
        message.success('Cập nhật danh mục thành công');
        setIsCategoryModalOpen(false);
        setEditingCategory(null);
        form.resetFields();
        fetchData();
      } else {
        message.error(response.data.message || 'Cập nhật danh mục thất bại');
      }
    } catch (error) {
      console.error('Error updating category:', error);
      message.error('Cập nhật danh mục thất bại');
    }
  };

  const handleDeleteCategory = async (id: number) => {
    try {
      const response = await menuApi.deleteCategory(id);
      if (response.data.success) {
        message.success('Xóa danh mục thành công');
        setIsDeleteModalOpen(false);
        setEditingCategory(null);
        fetchData();
      } else {
        message.error(response.data.message || 'Xóa danh mục thất bại');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      message.error('Xóa danh mục thất bại');
    }
  };

  // Recipe management handlers
  const handleAddRecipe = async (values: any) => {
    if (!selectedItem) return;
    
    try {
      const response = await menuApi.addIngredients(selectedItem.id, [{
        ingredient_id: values.ingredient,
        quantity_required: values.quantity_required
      }]);
      if (response.data.success) {
        message.success('Thêm nguyên liệu thành công');
        setIsRecipeModalOpen(false);
        // Refresh menu item details
        const menuItemResponse = await menuApi.getMenuItem(selectedItem.id);
        if (menuItemResponse.data.success) {
          setSelectedItem(menuItemResponse.data.data);
        }
      } else {
        message.error(response.data.message || 'Thêm nguyên liệu thất bại');
      }
    } catch (error) {
      console.error('Error adding recipe:', error);
      message.error('Thêm nguyên liệu thất bại');
    }
  };

  const handleUpdateRecipe = async (values: any) => {
    if (!editingRecipe) return;
    
    try {
      const response = await menuApi.updateIngredient(editingRecipe.id, values);
      if (response.data.success) {
        message.success('Cập nhật số lượng thành công');
        setIsRecipeModalOpen(false);
        setEditingRecipe(null);
        if (selectedItem) {
          const menuItemResponse = await menuApi.getMenuItem(selectedItem.id);
          if (menuItemResponse.data.success) {
            setSelectedItem(menuItemResponse.data.data);
          }
        }
      } else {
        message.error(response.data.message || 'Cập nhật số lượng thất bại');
      }
    } catch (error) {
      console.error('Error updating recipe:', error);
      message.error('Cập nhật số lượng thất bại');
    }
  };

  const handleDeleteRecipe = async (recipeId: number) => {
    try {
      const response = await menuApi.removeIngredient(recipeId);
      if (response.data.success) {
        message.success('Xóa nguyên liệu thành công');
        if (selectedItem) {
          const menuItemResponse = await menuApi.getMenuItem(selectedItem.id);
          if (menuItemResponse.data.success) {
            setSelectedItem(menuItemResponse.data.data);
          }
        }
      } else {
        message.error(response.data.message || 'Xóa nguyên liệu thất bại');
      }
    } catch (error) {
      console.error('Error deleting recipe:', error);
      message.error('Xóa nguyên liệu thất bại');
    }
  };

  return (
    <AdminLayout>
      <div style={{ padding: "24px", maxWidth: 1200, margin: "0 auto" }}>
        {/* Statistics */}
        <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
          <Col span={12}>
            <Card>
              <Spin spinning={loading}>
                <Title level={4}>Tổng số món</Title>
                <div style={{ fontSize: "24px" }}>{stats.total}</div>
              </Spin>
            </Card>
          </Col>
          <Col span={12}>
            <Card>
              <Spin spinning={loading}>
                <Title level={4}>Món khả dụng</Title>
                <div style={{ fontSize: "24px" }}>{stats.available}</div>
              </Spin>
            </Card>
          </Col>
        </Row>

        {/* Action Buttons */}
        {/* <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
          <Col span={24}>
            <Space>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  setEditingMenuItem(null);
                  setIsMenuItemModalOpen(true);
                }}
              >
                Thêm món ăn
              </Button>
              <Button
                icon={<PlusOutlined />}
                onClick={() => {
                  setEditingCategory(null);
                  setIsCategoryModalOpen(true);
                }}
              >
                Thêm danh mục
              </Button>
            </Space>
          </Col>
        </Row> */}

        {/* Filters */}
        {/* Action Buttons */}
      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
        <Col span={24}>
          <Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setEditingMenuItem(null);
                setIsMenuItemModalOpen(true);
              }}
            >
              Thêm món ăn
            </Button>
            <Button
              icon={<PlusOutlined />}
              onClick={() => {
                setEditingCategory(null);
                setIsCategoryModalOpen(true);
              }}
            >
              Thêm danh mục
            </Button>
          </Space>
        </Col>
      </Row>

      {/* Filters */}
      <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
          <Col span={8}>
            <Search
              placeholder="Tìm kiếm theo tên"
              onSearch={setSearchName}
              style={{ width: "100%" }}
            />
          </Col>
          <Col span={8}>
            <Select
              style={{ width: "100%" }}
              placeholder="Chọn danh mục"
              allowClear
              onChange={setSelectedCategory}
            >
              {categories.map(category => (
                <Select.Option key={category.id} value={category.id}>
                  {category.name}
                </Select.Option>
              ))}
            </Select>
          </Col>
          <Col span={8}>
            <Select
              style={{ width: "100%" }}
              placeholder="Trạng thái"
              allowClear
              onChange={setSelectedStatus}
            >
              <Select.Option value="available">Có sẵn</Select.Option>
              <Select.Option value="unavailable">Hết món</Select.Option>
            </Select>
          </Col>
        </Row>

        {/* Menu Items Grid */}
        <Row gutter={[16, 16]}>
          {loading ? (
            <Col span={24} style={{ textAlign: "center", padding: "40px" }}>
              <Spin size="large" />
            </Col>
          ) : filteredItems.length > 0 ? (
            filteredItems.map(item => (
              <Col key={item.id} xs={24} sm={12} md={8} lg={6}>
                <Card
                  hoverable
                  cover={
                    <img
                      alt={item.name}
                      src={item.image_url || "https://via.placeholder.com/300x200?text=No+Image"}
                      style={{ height: 200, objectFit: "cover", width: "100%" }}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "https://via.placeholder.com/300x200?text=No+Image";
                      }}
                    />
                  }
                  onClick={() => setSelectedItem(item)}
                >
                  <Card.Meta
                    title={item.name}
                    description={
                      <div>
                        <div>Giá: {item.price.toLocaleString("vi-VN")}đ</div>
                        <div>
                          Trạng thái:{" "}
                          <span
                            style={{
                              color:
                                item.status === "available" ? "#52c41a" : "#ff4d4f"
                            }}
                          >
                            {item.status === "available" ? "Có sẵn" : "Hết món"}
                          </span>
                        </div>
                      </div>
                    }
                  />
                </Card>
              </Col>
            ))
          ) : (
            <Col span={24}>
              <Card style={{ textAlign: "center", padding: "40px" }}>
                <Title level={4}>Không tìm thấy món ăn nào</Title>
                <p>Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
              </Card>
            </Col>
          )}
        </Row>

        {/* Menu Item Detail Modal */}
        <Modal
          title={selectedItem?.name}
          open={!!selectedItem}
          onCancel={() => setSelectedItem(null)}
          footer={null}
          width={700}
        >
          {selectedItem && (
            <div>
              <img
                src={selectedItem.image_url || "https://via.placeholder.com/800x400?text=No+Image"}
                alt={selectedItem.name}
                style={{ width: "100%", maxHeight: "400px", objectFit: "cover", marginBottom: "16px" }}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "https://via.placeholder.com/800x400?text=No+Image";
                }}
              />
              <div>
                <p><strong>Danh mục:</strong> {categories.find(c => c.id === selectedItem.category_id)?.name}</p>
                <p><strong>Giá:</strong> {selectedItem.price.toLocaleString("vi-VN")}đ</p>
                <p><strong>Trạng thái:</strong> {selectedItem.status === "available" ? "Có sẵn" : "Hết món"}</p>
                {selectedItem.description && (
                  <p><strong>Mô tả:</strong> {selectedItem.description}</p>
                )}

                {/* Recipe List */}
                <div style={{ marginTop: "16px" }}>
                  <Title level={5}>Công thức món ăn</Title>
                  {selectedItem.recipes && selectedItem.recipes.length > 0 ? (
                    <List
                      size="small"
                      bordered
                      dataSource={selectedItem.recipes}
                      renderItem={recipe => (
                        <List.Item
                          actions={[
                            <Button 
                              icon={<EditOutlined />}
                              onClick={() => {
                                setEditingRecipe(recipe);
                                setIsRecipeModalOpen(true);
                                form.setFieldsValue({
                                  ingredient: recipe.ingredient_id,
                                  quantity_required: recipe.quantity_required,
                                });
                              }}
                            />,
                            <Button 
                              danger
                              icon={<DeleteOutlined />}
                              onClick={() => handleDeleteRecipe(recipe.id)}
                            />
                          ]}
                        >
                          <div>
                            {recipe.ingredient?.name} - {recipe.quantity_required} {recipe.ingredient?.unit}
                          </div>
                        </List.Item>
                      )}
                    />
                  ) : (
                    <Empty description="Chưa có công thức" />
                  )}
                  <Button
                    type="dashed"
                    icon={<PlusOutlined />}
                    onClick={() => {
                      setEditingRecipe(null);
                      form.resetFields();
                      setIsRecipeModalOpen(true);
                    }}
                    style={{ marginTop: "8px" }}
                  >
                    Thêm nguyên liệu
                  </Button>
                </div>

                <div style={{ marginTop: "24px", borderTop: "1px solid #f0f0f0", paddingTop: "16px" }}>
                  <p><strong>Thời gian tạo:</strong> {new Date(selectedItem.created_at).toLocaleDateString("vi-VN")}</p>
                  <p><strong>Cập nhật lần cuối:</strong> {new Date(selectedItem.updated_at).toLocaleDateString("vi-VN")}</p>
                </div>
              </div>
              <div style={{ marginTop: "24px" }}>
                <Space>
                  <Button type="primary" icon={<EditOutlined />} onClick={() => {
                    setEditingMenuItem(selectedItem);
                    setSelectedItem(null);
                    setIsMenuItemModalOpen(true);
                  }}>
                    Sửa món ăn
                  </Button>
                  <Button type="primary" danger icon={<DeleteOutlined />} onClick={() => {
                    setIsDeleteModalOpen(true);
                  }}>
                    Xóa món ăn
                  </Button>
                </Space>
              </div>
            </div>
          )}
        </Modal>

        {/* Menu Item Form Modal */}
        <Modal
          title={editingMenuItem ? "Sửa món ăn" : "Thêm món ăn mới"}
          open={isMenuItemModalOpen}
          onCancel={() => {
            setIsMenuItemModalOpen(false);
            setEditingMenuItem(null);
            form.resetFields();
          }}
          footer={null}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={editingMenuItem ? handleUpdateMenuItem : handleCreateMenuItem}
            initialValues={editingMenuItem || {}}
          >
            <Form.Item name="name" label="Tên món" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="category_id" label="Danh mục" rules={[{ required: true }]}>
              <Select>
                {categories.map(category => (
                  <Select.Option key={category.id} value={category.id}>
                    {category.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item name="price" label="Giá tiền" rules={[{ required: true }]}>
              <Input type="number" />
            </Form.Item>
            <Form.Item name="description" label="Mô tả">
              <Input.TextArea />
            </Form.Item>
            <Form.Item name="status" label="Trạng thái" rules={[{ required: true }]}>
              <Select>
                <Select.Option value="available">Có sẵn</Select.Option>
                <Select.Option value="unavailable">Hết món</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item name="image" label="Hình ảnh" valuePropName="fileList" getValueFromEvent={(e) => {
              if (Array.isArray(e)) {
                return e;
              }
              return e?.fileList;
            }}>
              <Upload beforeUpload={() => false} maxCount={1} listType="picture-card">
                <Button icon={<UploadOutlined />}>Tải ảnh lên</Button>
              </Upload>
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">
                {editingMenuItem ? "Cập nhật" : "Thêm mới"}
              </Button>
            </Form.Item>
          </Form>
        </Modal>

        {/* Category Form Modal */}
        <Modal
          title={editingCategory ? "Sửa danh mục" : "Thêm danh mục mới"}
          open={isCategoryModalOpen}
          onCancel={() => {
            setIsCategoryModalOpen(false);
            setEditingCategory(null);
            form.resetFields();
          }}
          footer={null}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={editingCategory ? handleUpdateCategory : handleCreateCategory}
            initialValues={editingCategory || {}}
          >
            <Form.Item name="name" label="Tên danh mục" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="description" label="Mô tả">
              <Input.TextArea />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">
                {editingCategory ? "Cập nhật" : "Thêm mới"}
              </Button>
            </Form.Item>
          </Form>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          title="Xác nhận xóa"
          open={isDeleteModalOpen}
          onCancel={() => setIsDeleteModalOpen(false)}
          onOk={() => selectedItem && handleDeleteMenuItem(selectedItem.id)}
        >
          <p>Bạn có chắc chắn muốn xóa món ăn này?</p>
        </Modal>

        {/* Recipe Form Modal */}
        <Modal
          title={editingRecipe ? "Sửa nguyên liệu" : "Thêm nguyên liệu"}
          open={isRecipeModalOpen}
          onCancel={() => {
            setIsRecipeModalOpen(false);
            setEditingRecipe(null);
            form.resetFields();
          }}
          footer={null}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={editingRecipe ? handleUpdateRecipe : handleAddRecipe}
            initialValues={editingRecipe || {}}
          >
            <Form.Item name="ingredient" label="Nguyên liệu" rules={[{ required: true }]}>
              <Select>
                {ingredients.map(ingredient => (
                  <Select.Option key={ingredient.id} value={ingredient.id}>
                    {ingredient.name} ({ingredient.unit})
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item name="quantity_required" label="Số lượng" rules={[{ required: true }]}>
              <Input type="number" step="0.01" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">
                {editingRecipe ? "Cập nhật" : "Thêm"}
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </AdminLayout>
  );
};

export default AdminMenu;
