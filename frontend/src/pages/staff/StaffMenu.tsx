import React, { useState } from "react";
import MenuFilters from "../../components/staff/MenuFilters";
import MenuItemCard from "../../components/staff/MenuItemCard";
import RecipeModal from "../../components/staff/RecipeModal";
import StaffLayout from "../../layouts/StaffLayout";
import type { MenuItem, MenuData } from "../../types/menu";

const StaffMenu: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<number | "all">(
    "all"
  );
  const [filteredItems, setFilteredItems] = useState<MenuItem[]>([]);
  const [selectedRecipeItem, setSelectedRecipeItem] = useState<MenuItem | null>(
    null
  );

  // Mock data - In production, this would be fetched from API
  const mockMenuData: MenuData = {
    categories: [
      {
        id: 1,
        name: "Khai vị",
        description: "Món ăn khai vị",
        icon: "bi-cup-hot",
        isActive: true,
        displayOrder: 1,
      },
      {
        id: 2,
        name: "Món chính",
        description: "Các món ăn chính",
        icon: "bi-egg-fried",
        isActive: true,
        displayOrder: 2,
      },
      {
        id: 3,
        name: "Tráng miệng",
        description: "Món tráng miệng",
        icon: "bi-cake2",
        isActive: true,
        displayOrder: 3,
      },
      {
        id: 4,
        name: "Đồ uống",
        description: "Các loại đồ uống",
        icon: "bi-cup-straw",
        isActive: true,
        displayOrder: 4,
      },
    ],
    items: [
      // Appetizers
      {
        id: 1,
        categoryId: 1,
        categoryName: "Khai vị",
        name: "Chả cá Lã Vọng",
        description:
          "Chả cá truyền thống Hà Nội với thịt cá lăng, thì là và bánh tráng",
        price: 120000,
        preparationTime: 15,
        isAvailable: true,
        isPopular: true,
        image: "/images/cha-ca.jpg",
        ingredients: ["Cá lăng", "Thì là", "Hành lá", "Bánh tráng", "Mắm tôm"],
        allergens: ["Cá", "Tôm"],
        tags: ["Đặc sản", "Hà Nội", "Cay nhẹ"],
        nutritionInfo: {
          calories: 280,
          protein: 22,
          carbs: 18,
          fat: 12,
        },
        recipe: {
          difficulty: "medium",
          servingSize: 2,
          equipment: ["Chảo gang", "Bếp ga"],
          instructions: [
            "Cắt cá thành miếng vừa phải, ướp với nghệ, mắm ruốc 30 phút",
            "Làm nóng chảo gang, cho dầu ăn và cá vào nướng",
            "Khi cá chín vàng, thêm thì là và hành lá",
            "Trình bày kèm bánh tráng, bún và nước mắm chua ngọt",
          ],
          cookingTime: 15,
        },
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
      },
      {
        id: 2,
        categoryId: 1,
        categoryName: "Khai vị",
        name: "Gỏi cuốn tôm thịt",
        description: "Gỏi cuốn tươi với tôm, thịt heo và rau thơm",
        price: 80000,
        preparationTime: 10,
        isAvailable: true,
        isPopular: false,
        image: "/images/goi-cuon.jpg",
        ingredients: ["Tôm", "Thịt heo", "Bánh tráng", "Rau thơm", "Bún tươi"],
        allergens: ["Tôm", "Gluten"],
        tags: ["Tươi mát", "Ít calo", "Healthy"],
        nutritionInfo: {
          calories: 160,
          protein: 12,
          carbs: 20,
          fat: 4,
        },
        recipe: {
          difficulty: "easy",
          servingSize: 4,
          equipment: ["Nồi", "Thau"],
          instructions: [
            "Luộc tôm và thịt heo chín tới",
            "Trần bánh tráng qua nước ấm",
            "Đặt rau thơm, bún, tôm thịt lên bánh tráng và cuốn chặt",
            "Cắt đôi và trình bày kèm tương đậu phộng",
          ],
          cookingTime: 10,
        },
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
      },

      // Main Course
      {
        id: 3,
        categoryId: 2,
        categoryName: "Món chính",
        name: "Bún chả Hà Nội",
        description:
          "Bún chả truyền thống với thịt nướng than hoa và nước mắm chua ngọt",
        price: 150000,
        preparationTime: 25,
        isAvailable: true,
        isPopular: true,
        image: "/images/bun-cha.jpg",
        ingredients: ["Thịt heo", "Bún tươi", "Nước mắm", "Đường", "Rau thơm"],
        allergens: [],
        tags: ["Đặc sản", "Nướng than", "Truyền thống"],
        nutritionInfo: {
          calories: 420,
          protein: 28,
          carbs: 45,
          fat: 16,
        },
        recipe: {
          difficulty: "medium",
          servingSize: 1,
          equipment: ["Bếp than", "Vỉ nướng"],
          instructions: [
            "Ướp thịt với gia vị, để 2 giờ",
            "Nướng thịt trên than hoa đến chín vàng",
            "Pha nước mắm chua ngọt với tỏi ớt",
            "Trình bày thịt nướng, bún và rau thơm",
          ],
          cookingTime: 25,
        },
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
      },
      {
        id: 4,
        categoryId: 2,
        categoryName: "Món chính",
        name: "Phở bò đặc biệt",
        description: "Phở bò với nước dùng niêu 12 tiếng, thịt bò tái và chín",
        price: 180000,
        preparationTime: 20,
        isAvailable: false,
        isPopular: true,
        image: "/images/pho-bo.jpg",
        ingredients: [
          "Thịt bò",
          "Bánh phở",
          "Hành tây",
          "Ngò gai",
          "Gia vị phở",
        ],
        allergens: ["Gluten"],
        tags: ["Đặc sản", "Nước dùng đặc biệt", "Sáng"],
        nutritionInfo: {
          calories: 380,
          protein: 32,
          carbs: 38,
          fat: 12,
        },
        recipe: {
          difficulty: "hard",
          servingSize: 1,
          equipment: ["Nồi lớn", "Niêu đất"],
          instructions: [
            "Niêu xương bò với gia vị 12-24 tiếng",
            "Thái thịt bò tái mỏng, luộc thịt chín",
            "Trần bánh phở, cho vào tô",
            "Rót nước dùng nóng, thêm thịt và rau thơm",
          ],
          cookingTime: 20,
        },
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
      },

      // Desserts
      {
        id: 5,
        categoryId: 3,
        categoryName: "Tráng miệng",
        name: "Chè bưởi",
        description: "Chè bưởi với thạch dừa và nước cốt dừa thơm béo",
        price: 60000,
        preparationTime: 5,
        isAvailable: true,
        isPopular: false,
        image: "/images/che-buoi.jpg",
        ingredients: [
          "Bưởi",
          "Thạch dừa",
          "Nước cốt dừa",
          "Đường phèn",
          "Đá bào",
        ],
        allergens: [],
        tags: ["Tráng miệng", "Mát lạnh", "Truyền thống"],
        nutritionInfo: {
          calories: 180,
          protein: 2,
          carbs: 42,
          fat: 6,
        },
        recipe: {
          difficulty: "easy",
          servingSize: 2,
          equipment: ["Tô", "Thìa"],
          instructions: [
            "Tách múi bưởi, bỏ hạt",
            "Cắt thạch dừa thành miếng nhỏ",
            "Pha nước cốt dừa với đường phèn",
            "Cho tất cả vào tô, thêm đá bào",
          ],
          cookingTime: 0,
        },
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
      },

      // Beverages
      {
        id: 6,
        categoryId: 4,
        categoryName: "Đồ uống",
        name: "Cà phê sữa đá",
        description: "Cà phê phin truyền thống với sữa đặc và đá",
        price: 45000,
        preparationTime: 8,
        isAvailable: true,
        isPopular: true,
        image: "/images/ca-phe-sua-da.jpg",
        ingredients: ["Cà phê", "Sữa đặc", "Đá"],
        allergens: ["Sữa"],
        tags: ["Đồ uống", "Cà phê", "Truyền thống"],
        nutritionInfo: {
          calories: 150,
          protein: 4,
          carbs: 24,
          fat: 6,
        },
        recipe: {
          difficulty: "easy",
          servingSize: 1,
          equipment: ["Phin cà phê", "Ly thủy tinh"],
          instructions: [
            "Cho sữa đặc vào ly",
            "Đặt phin lên ly, cho cà phê vào",
            "Rót nước sôi vào phin, chờ cà phê chảy",
            "Khuấy đều và thêm đá",
          ],
          cookingTime: 8,
        },
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
      },
    ],
  };

  const currentItems =
    selectedCategory === "all"
      ? mockMenuData.items
      : mockMenuData.items.filter(item => item.categoryId === selectedCategory);

  const handleToggleAvailability = (itemId: number) => {
    // In production, this would call an API
    console.log(`Toggle availability for item ${itemId}`);
  };

  const handleViewRecipe = (item: MenuItem) => {
    setSelectedRecipeItem(item);
  };

  const handleCloseRecipe = () => {
    setSelectedRecipeItem(null);
  };

  return (
    <StaffLayout>
      {/* Page Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">
            <i className="bi bi-journal-text text-primary me-2"></i>
            Quản lý thực đơn
          </h2>
          <p className="text-muted mb-0">
            Xem và quản lý các món ăn, công thức nấu ăn
          </p>
        </div>

        <div className="d-flex gap-2">
          <button className="btn btn-outline-primary">
            <i className="bi bi-download me-1"></i>
            Xuất thực đơn
          </button>
          <button className="btn btn-primary">
            <i className="bi bi-plus-lg me-1"></i>
            Thêm món mới
          </button>
        </div>
      </div>

      {/* Menu Categories */}
      <div className="mb-4">
        <div className="d-flex flex-wrap gap-2">
          <button
            className={`btn ${
              selectedCategory === "all" ? "btn-primary" : "btn-outline-primary"
            }`}
            onClick={() => setSelectedCategory("all")}
          >
            <i className="bi bi-grid me-1"></i>
            Tất cả ({mockMenuData.items.length})
          </button>
          {mockMenuData.categories.map(category => (
            <button
              key={category.id}
              className={`btn ${
                selectedCategory === category.id
                  ? "btn-primary"
                  : "btn-outline-primary"
              }`}
              onClick={() => setSelectedCategory(category.id)}
            >
              <i className={`${category.icon} me-1`}></i>
              {category.name} (
              {
                mockMenuData.items.filter(i => i.categoryId === category.id)
                  .length
              }
              )
            </button>
          ))}
        </div>
      </div>

      {/* Filters */}
      <MenuFilters
        items={currentItems}
        onFilteredItemsChange={setFilteredItems}
      />

      {/* Menu Items Grid */}
      <div className="row">
        {filteredItems.length > 0 ? (
          filteredItems.map(item => (
            <div key={item.id} className="col-xl-4 col-lg-6 mb-4">
              <MenuItemCard
                item={item}
                onToggleAvailability={handleToggleAvailability}
                onViewDetails={handleViewRecipe}
              />
            </div>
          ))
        ) : currentItems.length === 0 ? (
          <div className="col-12">
            <div className="card text-center py-5">
              <div className="card-body">
                <i className="bi bi-journal-x text-muted display-1"></i>
                <h4 className="mt-3 text-muted">Không có món ăn nào</h4>
                <p className="text-muted">
                  {selectedCategory === "all"
                    ? "Chưa có món ăn nào trong thực đơn"
                    : "Danh mục này chưa có món ăn nào"}
                </p>
                <button className="btn btn-primary">
                  <i className="bi bi-plus-lg me-1"></i>
                  Thêm món đầu tiên
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="col-12">
            <div className="card text-center py-5">
              <div className="card-body">
                <i className="bi bi-search text-muted display-1"></i>
                <h4 className="mt-3 text-muted">Không tìm thấy món ăn nào</h4>
                <p className="text-muted">
                  Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
                </p>
                <button className="btn btn-outline-primary">
                  <i className="bi bi-arrow-clockwise me-1"></i>
                  Xóa bộ lọc
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Recipe Modal */}
      <RecipeModal
        item={selectedRecipeItem}
        isOpen={selectedRecipeItem !== null}
        onClose={handleCloseRecipe}
      />
    </StaffLayout>
  );
};

export default StaffMenu;
