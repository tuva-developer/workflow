// Initial mock data for schedules
export const mockSchedules: Schedule[] = [
  {
    _id: 'sch-daily-kyc',
    modelId: 'model-demo-1',
    name: 'Daily KYC Sync',
    description: 'Sync KYC data daily',
    cron: '0 0 * * *',
    once: false,
    active: true,
    creator: 'admin',
    input: {},
    created_at: '2024-02-01T00:00:00.000Z',
    updated_at: '2024-02-10T00:00:00.000Z',
  },
];


