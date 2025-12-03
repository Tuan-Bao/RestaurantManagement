import React, { useState, useEffect, useCallback } from "react";
import {
  Row,
  Col,
  Card,
  Input,
  Select,
  Modal,
  Spin,
  Typography,
  message,
  Button,
  Statistic,
  Tag,
  Descriptions
} from "antd";
import {
  SearchOutlined,
  AppstoreOutlined,
  CheckCircleOutlined}  
from "@ant-design/icons";
import StaffLayout from "../../layouts/StaffLayout";
import { menuApi } from "../../services/menu";
import type { Category, MenuItem } from "../../types/restaurant";
// import "antd/dist/antd.css";

const { Title } = Typography;
const { Search } = Input;

const StaffMenu: React.FC = () => {
  // State management
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<MenuItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [stats, setStats] = useState({ total: 0, available: 0 });

  // Filter state
  const [filters, setFilters] = useState({
    name: "",
    category: undefined as number | undefined,
    status: undefined as "available" | "unavailable" | undefined
  });
  // ...existing code...

  // Fetch menu data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  // Fetch categories and menu items
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [categoriesRes, itemsRes] = await Promise.all([
        menuApi.getCategories(),
        menuApi.getMenuItems()
      ]);

      if (categoriesRes.data.success && itemsRes.data.success) {
        setCategories(categoriesRes.data.data);
        const menuItemsData = itemsRes.data.data;
        setMenuItems(menuItemsData);
        setFilteredItems(menuItemsData);

        const availableCount = menuItemsData.filter(
          item => item.status === "available"
        ).length;
        setStats({ total: menuItemsData.length, available: availableCount });
      } else {
        const errorMessage =
          categoriesRes.data.message ||
          itemsRes.data.message ||
          "Lỗi khi tải dữ liệu";
        setError(errorMessage);
        message.error(errorMessage);
      }
    } catch (error) {
      console.error("Error fetching menu data:", error);
      setError("Không thể tải dữ liệu. Vui lòng thử lại sau.");
      message.error("Không thể tải dữ liệu. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  // Apply filters and update filtered items
  const applyFilters = useCallback(() => {
    let filtered = [...menuItems];

    if (filters.name) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(filters.name.toLowerCase())
      );
    }

    if (filters.category !== undefined) {
      filtered = filtered.filter(item => item.category_id === filters.category);
    }

    if (filters.status !== undefined) {
      filtered = filtered.filter(item => item.status === filters.status);
    }

    setFilteredItems(filtered);
  }, [filters, menuItems]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const handleSearch = (value: string) => {
    setFilters(prev => ({ ...prev, name: value }));
  };

  const handleCategoryChange = (value: number | undefined) => {
    setFilters(prev => ({ ...prev, category: value }));
  };

  const handleStatusChange = (value: "available" | "unavailable" | undefined) => {
    setFilters(prev => ({ ...prev, status: value }));
  };

  return (
    <StaffLayout>
      {error ? (
        <div style={{ padding: 24, maxWidth: 1200, margin: "0 auto" }}>
          <Card>
            <div style={{ textAlign: "center", padding: 24 }}>
              <Typography.Title level={4} type="danger">
                {error}
              </Typography.Title>
              <Button type="primary" onClick={fetchData}>
                Thử lại
              </Button>
            </div>
          </Card>
        </div>
      ) : (
        <div style={{ padding: 24, maxWidth: 1200, margin: "0 auto" }}>
          {/* Statistics */}
          <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col span={12}>
              <Card>
                <Statistic
                  title="Tổng số món"
                  value={stats.total}
                  prefix={<AppstoreOutlined />}
                  loading={loading}
                />
              </Card>
            </Col>
            <Col span={12}>
              <Card>
                <Statistic
                  title="Món khả dụng"
                  value={stats.available}
                  prefix={<CheckCircleOutlined style={{ color: "#52c41a" }} />}
                  loading={loading}
                />
              </Card>
            </Col>
          </Row>

          {/* Filters */}
          <Card style={{ marginBottom: 24 }}>
            <Row gutter={16}>
              <Col span={8}>
                <Search
                  placeholder="Tìm kiếm theo tên"
                  onSearch={handleSearch}
                  allowClear
                  enterButton={<SearchOutlined />}
                />
              </Col>
              <Col span={8}>
                <Select
                  style={{ width: "100%" }}
                  placeholder="Chọn danh mục"
                  allowClear
                  onChange={handleCategoryChange}
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
                  onChange={handleStatusChange}
                >
                  <Select.Option value="available">Có sẵn</Select.Option>
                  <Select.Option value="unavailable">Hết món</Select.Option>
                </Select>
              </Col>
            </Row>
          </Card>

          {/* Menu Items */}
          <Row gutter={[16, 16]}>
            {loading ? (
              <Col span={24} style={{ textAlign: "center", padding: 40 }}>
                <Spin size="large" />
              </Col>
            ) : filteredItems.length > 0 ? (
              filteredItems.map(item => (
                <Col key={item.id} xs={24} sm={12} md={8} lg={6}>
                  <Card
                    hoverable
                    style={{ borderRadius: 8 }}
                    cover={
                      <img
                        alt={item.name}
                        src={
                          item.image_url ||
                          "https://via.placeholder.com/300x200?text=No+Image"
                        }
                        style={{
                          height: 200,
                          objectFit: "cover",
                          borderTopLeftRadius: 8,
                          borderTopRightRadius: 8,
                          transition: "transform 0.3s"
                        }}
                        onError={e => {
                          (e.target as HTMLImageElement).src =
                            "https://via.placeholder.com/300x200?text=No+Image";
                        }}
                      />
                    }
                    onClick={() => setSelectedItem(item)}
                  >
                    <Title level={5} ellipsis>
                      {item.name}
                    </Title>
                    <div style={{ marginBottom: 8, color: "#1890ff", fontWeight: 500 }}>
                      {item.price.toLocaleString("vi-VN")}đ
                    </div>
                    <Tag color={item.status === "available" ? "green" : "red"}>
                      {item.status === "available" ? "Có sẵn" : "Hết món"}
                    </Tag>
                  </Card>
                </Col>
              ))
            ) : (
              <Col span={24}>
                <Card style={{ textAlign: "center", padding: 40 }}>
                  <Title level={4}>Không tìm thấy món ăn nào</Title>
                  <p>Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
                </Card>
              </Col>
            )}
          </Row>

          {/* Detail Modal */}
          <Modal
            title={selectedItem?.name}
            open={!!selectedItem}
            onCancel={() => setSelectedItem(null)}
            footer={null}
            width={700}
          >
            {selectedItem && (
              <>
                <img
                  src={
                    selectedItem.image_url ||
                    "https://via.placeholder.com/800x400?text=No+Image"
                  }
                  alt={selectedItem.name}
                  style={{
                    width: "100%",
                    maxHeight: 400,
                    objectFit: "cover",
                    borderRadius: 8,
                    marginBottom: 16
                  }}
                  onError={e => {
                    (e.target as HTMLImageElement).src =
                      "https://via.placeholder.com/800x400?text=No+Image";
                  }}
                />
                <Descriptions bordered column={1}>
                  <Descriptions.Item label="Danh mục">
                    {categories.find(c => c.id === selectedItem.category_id)?.name}
                  </Descriptions.Item>
                  <Descriptions.Item label="Giá">
                    {selectedItem.price.toLocaleString("vi-VN")}đ
                  </Descriptions.Item>
                  <Descriptions.Item label="Trạng thái">
                    <Tag color={selectedItem.status === "available" ? "green" : "red"}>
                      {selectedItem.status === "available" ? "Có sẵn" : "Hết món"}
                    </Tag>
                  </Descriptions.Item>
                  {selectedItem.description && (
                    <Descriptions.Item label="Mô tả">
                      {selectedItem.description}
                    </Descriptions.Item>
                  )}
                  <Descriptions.Item label="Thời gian tạo">
                    {new Date(selectedItem.created_at).toLocaleDateString("vi-VN")}
                  </Descriptions.Item>
                  <Descriptions.Item label="Cập nhật lần cuối">
                    {new Date(selectedItem.updated_at).toLocaleDateString("vi-VN")}
                  </Descriptions.Item>
                </Descriptions>
              </>
            )}
          </Modal>
        </div>
      )}
    </StaffLayout>
  );
};

export default StaffMenu;

