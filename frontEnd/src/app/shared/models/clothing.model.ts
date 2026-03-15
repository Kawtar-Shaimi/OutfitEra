export interface Clothing {
  id: number;
  name: string;
  description?: string;
  category: string;
  price: number;
  availableSizes: string[];
  stock: number;
  imageUrl: string;
  createdAt?: string;
}

export interface TryOnResult {
  id: number;
  user?: any;
  clothing?: Clothing;
  userImageUrl: string;
  resultImageUrl: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  isPublic: boolean;
  createdAt: string;
}
