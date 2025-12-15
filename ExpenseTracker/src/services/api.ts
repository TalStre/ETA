export interface Expense {
  id: number;
  userId: number;
  title: string;
  amount: number;
  category: string;
  date: string;
  createdAt: string;
  updatedAt?: string;
}

const API_URL = 'http://10.0.2.2:3000/api'; // Use 10.0.2.2 for Android emulator

// Helper function to get headers with token
const getHeaders = (token: string) => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`,
});

// Fetch all expenses for a user
export const fetchExpenses = async (userId: number, token: string): Promise<Expense[]> => {
  const response = await fetch(`${API_URL}/expenses/${userId}`, {
    method: 'GET',
    headers: getHeaders(token),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch expenses');
  }

  return response.json();
};

// Upload receipt image (base64)
export const uploadReceipt = async (
  expenseId: number,
  imageBase64: string,
  token: string
): Promise<{ receiptUrl: string }> => {
  const response = await fetch(`${API_URL}/expenses/${expenseId}/receipt`, {
    method: 'POST',
    headers: getHeaders(token),
    body: JSON.stringify({ image: imageBase64 }),
  });

  if (!response.ok) {
    throw new Error('Failed to upload receipt');
  }

  return response.json();
};

// Create new expense
export const createExpense = async (
  expenseData: {
    userId: number;
    title: string;
    amount: number;
    category: string;
    date: string;
  },
  token: string
): Promise<Expense> => {
  const response = await fetch(`${API_URL}/expenses`, {
    method: 'POST',
    headers: getHeaders(token),
    body: JSON.stringify(expenseData),
  });

  if (!response.ok) {
    throw new Error('Failed to create expense');
  }

  const data = await response.json();
  return data.expense;
};

// Update expense
export const updateExpenseAPI = async (
  id: number,
  expenseData: {
    title: string;
    amount: number;
    category: string;
    date: string;
  },
  token: string
): Promise<Expense> => {
  const response = await fetch(`${API_URL}/expenses/${id}`, {
    method: 'PUT',
    headers: getHeaders(token),
    body: JSON.stringify(expenseData),
  });

  if (!response.ok) {
    throw new Error('Failed to update expense');
  }

  const data = await response.json();
  return data.expense;
};

// Delete expense
export const deleteExpenseAPI = async (id: number, token: string): Promise<void> => {
  const response = await fetch(`${API_URL}/expenses/${id}`, {
    method: 'DELETE',
    headers: getHeaders(token),
  });

  if (!response.ok) {
    throw new Error('Failed to delete expense');
  }
};

