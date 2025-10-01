import React, { useState, useEffect } from "react";
import { Row, Col, Card, Input, Select, Modal, Spin, Typography, message } from "antd";
import AdminLayout from "../../layouts/AdminLayout";
import { menuApi } from "../../services/menu";
import type { Category, MenuItem } from "../../types/restaurant";
import "antd/dist/reset.css";

const { Title } = Typography;
const { Search } = Input;

const AdminMenu: React.FC = () => {
  const [loading, setLoading] = useState(true);
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

  // Fetch menu data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  // Fetch categories and menu items
  const fetchData = async () => {
    setLoading(true);
    try {
      const [categoriesRes, itemsRes] = await Promise.all([
        menuApi.getCategories(),
        menuApi.getMenuItems()
      ]);

      if (categoriesRes.data.success && itemsRes.data.success) {
        setCategories(categoriesRes.data.data);
        const menuItemsData = itemsRes.data.data;
        // Don't need to set menuItems anymore as we only use filteredItems
        setFilteredItems(menuItemsData);
        
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
    const filtered = filteredItems.filter((item: MenuItem) => {
      const matchesName = !searchName || item.name.toLowerCase().includes(searchName.toLowerCase());
      const matchesCategory = !selectedCategory || item.category_id === selectedCategory;
      const matchesStatus = !selectedStatus || item.status === selectedStatus;
      return matchesName && matchesCategory && matchesStatus;
    });
    setFilteredItems(filtered);
  }, [searchName, selectedCategory, selectedStatus, filteredItems]);

  // Add any additional handlers here

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
              <p><strong>Danh mục:</strong> {categories.find(c => c.id === selectedItem.category_id)?.name}</p>
              <p><strong>Giá:</strong> {selectedItem.price.toLocaleString("vi-VN")}đ</p>
              <p><strong>Trạng thái:</strong> {selectedItem.status === "available" ? "Có sẵn" : "Hết món"}</p>
              {selectedItem.description && (
                <p><strong>Mô tả:</strong> {selectedItem.description}</p>
              )}
              <p><strong>Thời gian tạo:</strong> {new Date(selectedItem.created_at).toLocaleDateString("vi-VN")}</p>
              <p><strong>Cập nhật lần cuối:</strong> {new Date(selectedItem.updated_at).toLocaleDateString("vi-VN")}</p>
            </div>
          )}
        </Modal>
      </div>
    </AdminLayout>
  );
};

export default AdminMenu;
