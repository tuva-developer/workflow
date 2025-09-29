// Initial mock data for models
export const mockModels: Model[] = [
  {
    _id: 'model-demo-1',
    _id_version: 'v1',
    name: 'Customer Onboarding',
    description: 'Onboarding flow with KYC verification',
    status: 'active',
    config: '',
    read_only: false,
    categoryId: 'cat-kyc',
    typeId: 'type-process',
    owner: 'admin',
    created_at: '2024-01-15T10:00:00.000Z',
    updated_at: '2024-01-20T15:30:00.000Z',
  },
  {
    _id: 'model-demo-2',
    _id_version: 'v3',
    name: 'Order Processing',
    description: 'E-commerce order processing and fulfillment',
    status: 'active',
    config: '',
    read_only: false,
    categoryId: 'cat-commerce',
    typeId: 'type-process',
    owner: 'admin',
    created_at: '2024-02-01T08:00:00.000Z',
    updated_at: '2024-02-03T09:45:00.000Z',
  },
];


