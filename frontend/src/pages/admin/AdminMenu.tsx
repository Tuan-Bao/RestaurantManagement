import React, { useState } from "react";
import MenuFilters from "../../components/staff/MenuFilters";
import AdminMenuItemCard from "../../components/admin/AdminMenuItemCard";
import RecipeModal from "../../components/staff/RecipeModal";
import AdminLayout from "../../layouts/AdminLayout";
import type { MenuItem, MenuData } from "../../types/menu";

const AdminMenu: React.FC = () => {
    const [selectedCategory, setSelectedCategory] = useState<number | "all">(
        "all"
    );
    const [filteredItems, setFilteredItems] = useState<MenuItem[]>([]);
    const [selectedRecipeItem, setSelectedRecipeItem] = useState<MenuItem | null>(
        null
    );

    // Mock data - In production, this would be fetched from API
    const [menuData, setMenuData] = useState<MenuData>({
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
                name: "Nem rán Hà Nội",
                description: "Nem rán giòn tan với nhân thịt heo và miến",
                price: 80000,
                preparationTime: 20,
                isAvailable: true,
                isPopular: false,
                image: "/images/nem-ran.jpg",
                ingredients: ["Thịt heo", "Miến", "Bánh tráng", "Hành tây", "Nấm mèo"],
                allergens: [],
                tags: ["Giòn tan", "Truyền thống"],
                nutritionInfo: {
                    calories: 320,
                    protein: 18,
                    carbs: 25,
                    fat: 20,
                },
                recipe: {
                    difficulty: "medium",
                    servingSize: 4,
                    equipment: ["Chảo chiên", "Bếp ga"],
                    instructions: [
                        "Trộn đều nhân thịt heo băm với miến, nấm mèo",
                        "Gói nem bằng bánh tráng, cuộn chặt",
                        "Chiên trong dầu nóng đến khi vàng đều",
                        "Vớt ra để ráo dầu, ăn kèm rau sống và nước chấm",
                    ],
                    cookingTime: 20,
                },
                createdAt: "2024-01-01T00:00:00Z",
                updatedAt: "2024-01-01T00:00:00Z",
            },
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
                ingredients: [
                    "Thịt heo nướng",
                    "Bún tươi",
                    "Rau sống",
                    "Nước mắm",
                    "Đường",
                    "Chanh",
                ],
                allergens: [],
                tags: ["Đặc sản", "Hà Nội", "Nướng than"],
                nutritionInfo: {
                    calories: 420,
                    protein: 28,
                    carbs: 45,
                    fat: 15,
                },
                recipe: {
                    difficulty: "hard",
                    servingSize: 2,
                    equipment: ["Bếp than", "Vỉ nướng"],
                    instructions: [
                        "Ướp thịt heo với nước mắm, đường, tiêu 2 tiếng",
                        "Nướng thịt trên than hoa đến khi chín vàng",
                        "Pha nước chấm với nước mắm, đường, chanh, ớt",
                        "Trình bày với bún tươi và rau sống",
                    ],
                    cookingTime: 30,
                },
                createdAt: "2024-01-01T00:00:00Z",
                updatedAt: "2024-01-01T00:00:00Z",
            },
            {
                id: 4,
                categoryId: 2,
                categoryName: "Món chính",
                name: "Phở bò Hà Nội",
                description: "Phở bò truyền thống với nước dùng trong vắt và thịt bò tái",
                price: 120000,
                preparationTime: 15,
                isAvailable: false,
                isPopular: true,
                image: "/images/pho-bo.jpg",
                ingredients: [
                    "Bánh phở",
                    "Thịt bò",
                    "Xương bò",
                    "Hành tây",
                    "Gừng",
                    "Quế",
                    "Hoa hồi",
                ],
                allergens: [],
                tags: ["Truyền thống", "Nước dùng", "Hà Nội"],
                nutritionInfo: {
                    calories: 380,
                    protein: 25,
                    carbs: 50,
                    fat: 8,
                },
                recipe: {
                    difficulty: "hard",
                    servingSize: 1,
                    equipment: ["Nồi lớn", "Bếp ga"],
                    instructions: [
                        "Ninh xương bò với hành, gừng trong 6-8 tiếng",
                        "Lọc nước dùng, nêm nếm với muối, đường",
                        "Luộc bánh phở, cho vào t그릇",
                        "Thái thịt bò mỏng, xếp lên bánh phở, chan nước dùng nóng",
                    ],
                    cookingTime: 480,
                },
                createdAt: "2024-01-01T00:00:00Z",
                updatedAt: "2024-01-01T00:00:00Z",
            },
            {
                id: 5,
                categoryId: 3,
                categoryName: "Tráng miệng",
                name: "Chè đậu đỏ",
                description: "Chè đậu đỏ nóng với nước cốt dừa thơm béo",
                price: 60000,
                preparationTime: 10,
                isAvailable: true,
                isPopular: false,
                image: "/images/che-dau-do.jpg",
                ingredients: ["Đậu đỏ", "Nước cốt dừa", "Đường", "Muối", "Lá dứa"],
                allergens: [],
                tags: ["Ngọt", "Nóng", "Truyền thống"],
                nutritionInfo: {
                    calories: 180,
                    protein: 8,
                    carbs: 32,
                    fat: 5,
                },
                recipe: {
                    difficulty: "easy",
                    servingSize: 2,
                    equipment: ["Nồi", "Bếp ga"],
                    instructions: [
                        "Vo sạch đậu đỏ, ngâm 2 tiếng",
                        "Nấu đậu với nước đến khi mềm",
                        "Thêm đường, muối, lá dứa",
                        "Chan nước cốt dừa khi ăn",
                    ],
                    cookingTime: 45,
                },
                createdAt: "2024-01-01T00:00:00Z",
                updatedAt: "2024-01-01T00:00:00Z",
            },
            {
                id: 6,
                categoryId: 4,
                categoryName: "Đồ uống",
                name: "Cà phê sữa đá",
                description: "Cà phê phin truyền thống với sữa đặc và đá",
                price: 45000,
                preparationTime: 5,
                isAvailable: true,
                isPopular: true,
                image: "/images/ca-phe-sua-da.jpg",
                ingredients: ["Cà phê", "Sữa đặc", "Đá", "Đường"],
                allergens: ["Sữa"],
                tags: ["Mạnh", "Ngọt", "Đá"],
                nutritionInfo: {
                    calories: 150,
                    protein: 4,
                    carbs: 20,
                    fat: 6,
                },
                recipe: {
                    difficulty: "easy",
                    servingSize: 1,
                    equipment: ["Phin cà phê", "Ly thủy tinh"],
                    instructions: [
                        "Cho sữa đặc vào đáy ly",
                        "Pha cà phê bằng phin",
                        "Đổ cà phê vào ly có sữa",
                        "Thêm đá và khuấy đều",
                    ],
                    cookingTime: 5,
                },
                createdAt: "2024-01-01T00:00:00Z",
                updatedAt: "2024-01-01T00:00:00Z",
            },
        ],
    });

    const currentItems =
        selectedCategory === "all"
            ? menuData.items
            : menuData.items.filter(item => item.categoryId === selectedCategory);

    const handleToggleAvailability = (itemId: number) => {
        setMenuData(prevData => ({
            ...prevData,
            items: prevData.items.map(item =>
                item.id === itemId
                    ? { ...item, isAvailable: !item.isAvailable }
                    : item
            ),
        }));

        // Hiển thị thông báo
        const item = menuData.items.find(item => item.id === itemId);
        if (item) {
            console.log(
                `${item.name} đã được ${item.isAvailable ? "tắt" : "bật"} khả dụng`
            );
        }
    };

    const handleViewRecipe = (item: MenuItem) => {
        setSelectedRecipeItem(item);
    };

    const handleEdit = (item: MenuItem) => {
        console.log("Edit item:", item.name);
        // TODO: Implement edit functionality
    };

    const handleDelete = (itemId: number) => {
        if (confirm("Bạn có chắc chắn muốn xóa món ăn này?")) {
            setMenuData(prevData => ({
                ...prevData,
                items: prevData.items.filter(item => item.id !== itemId),
            }));
            console.log("Deleted item:", itemId);
        }
    };

    const handleCloseRecipe = () => {
        setSelectedRecipeItem(null);
    };

    return (
        <AdminLayout>
            {/* Page Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="mb-1">
                        <i className="bi bi-journal-text text-primary me-2"></i>
                        Quản lý thực đơn
                    </h2>
                    <p className="text-muted mb-0">
                        Quản lý món ăn, danh mục và công thức nấu ăn
                    </p>
                </div>

                <div className="d-flex gap-2">
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
                        className={`btn ${selectedCategory === "all" ? "btn-primary" : "btn-outline-primary"
                            }`}
                        onClick={() => setSelectedCategory("all")}
                    >
                        <i className="bi bi-grid me-1"></i>
                        Tất cả ({menuData.items.length})
                    </button>
                    {menuData.categories.map(category => (
                        <button
                            key={category.id}
                            className={`btn ${selectedCategory === category.id
                                ? "btn-primary"
                                : "btn-outline-primary"
                                }`}
                            onClick={() => setSelectedCategory(category.id)}
                        >
                            <i className={`${category.icon} me-1`}></i>
                            {category.name} (
                            {
                                menuData.items.filter(i => i.categoryId === category.id)
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
                            <AdminMenuItemCard
                                item={item}
                                onToggleAvailability={handleToggleAvailability}
                                onViewDetails={handleViewRecipe}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
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
        </AdminLayout>
    );
};

export default AdminMenu;