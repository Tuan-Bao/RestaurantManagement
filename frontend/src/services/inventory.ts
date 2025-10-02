import type { 
  Ingredient, 
  StockIn, 
  StockOut,
  WarehouseResponse,
  StockInResponse,
  StockOutResponse,
  StockInCreateData,
  StockOutCreateData,
  IngredientUpdateData,
  WarehouseFilters,
  StockHistoryFilters
} from '../types/inventory';

const API_BASE_URL = 'http://localhost:8000/api';

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('access_token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };
};

// Helper function to build query string
const buildQueryString = (params: Record<string, any>) => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, value.toString());
    }
  });
  return searchParams.toString();
};

export const inventoryApi = {
  // ===== WAREHOUSE ENDPOINTS =====
  
  // Get warehouse ingredients list
  getWarehouse: async (filters?: WarehouseFilters): Promise<WarehouseResponse> => {
    const queryString = filters ? buildQueryString(filters) : '';
    const url = `${API_BASE_URL}/inventory/warehouse/${queryString ? `?${queryString}` : ''}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch warehouse data: ${response.statusText}`);
    }

    return response.json();
  },

  // Update ingredient info (name, unit)
  updateIngredient: async (id: number, data: IngredientUpdateData): Promise<{ success: boolean; data: Ingredient }> => {
    const response = await fetch(`${API_BASE_URL}/inventory/warehouse/${id}/`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Failed to update ingredient: ${response.statusText}`);
    }

    return response.json();
  },

  // ===== STOCK-IN ENDPOINTS =====
  
  // Get stock-in history
  getStockInHistory: async (filters?: StockHistoryFilters): Promise<StockInResponse> => {
    const queryString = filters ? buildQueryString(filters) : '';
    const url = `${API_BASE_URL}/inventory/stock-in/${queryString ? `?${queryString}` : ''}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch stock-in history: ${response.statusText}`);
    }

    return response.json();
  },

  // Create stock-in (nhập kho)
  createStockIn: async (data: StockInCreateData): Promise<{ 
    success: boolean; 
    message: string; 
    data: StockIn;
    ingredient_update: {
      ingredient_name: string;
      previous_quantity: number;
      incoming_quantity: number;
      new_quantity: number;
      is_new_ingredient: boolean;
    }
  }> => {
    const response = await fetch(`${API_BASE_URL}/inventory/stock-in/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(responseData.message || `Failed to create stock-in: ${response.statusText}`);
    }

    return responseData;
  },

  // Get stock-in detail
  getStockInDetail: async (id: number): Promise<{ success: boolean; data: StockIn }> => {
    const response = await fetch(`${API_BASE_URL}/inventory/stock-in/${id}/`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch stock-in detail: ${response.statusText}`);
    }

    return response.json();
  },

  // ===== STOCK-OUT ENDPOINTS =====
  
  // Get stock-out history
  getStockOutHistory: async (filters?: StockHistoryFilters): Promise<StockOutResponse> => {
    const queryString = filters ? buildQueryString(filters) : '';
    const url = `${API_BASE_URL}/inventory/stock-out/${queryString ? `?${queryString}` : ''}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch stock-out history: ${response.statusText}`);
    }

    return response.json();
  },

  // Create stock-out (xuất kho thủ công)
  createStockOut: async (data: StockOutCreateData): Promise<{ 
    success: boolean; 
    message: string; 
    data: StockOut;
    ingredient_update: {
      ingredient_name: string;
      previous_quantity: number;
      outgoing_quantity: number;
      new_quantity: number;
      status_changed: boolean;
    }
  }> => {
    const response = await fetch(`${API_BASE_URL}/inventory/stock-out/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(responseData.message || `Failed to create stock-out: ${response.statusText}`);
    }

    return responseData;
  },

  // Get stock-out detail
  getStockOutDetail: async (id: number): Promise<{ success: boolean; data: StockOut }> => {
    const response = await fetch(`${API_BASE_URL}/inventory/stock-out/${id}/`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch stock-out detail: ${response.statusText}`);
    }

    return response.json();
  },
};