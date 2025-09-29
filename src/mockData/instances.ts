// Initial mock data for instances
export const mockInstances: Instance[] = [
  {
    _id: 'inst-1',
    _id_version: 'v1',
    _id_model: 'model-demo-1',
    executor: 'user-john',
    model: 'Customer Onboarding',
    status: 'completed',
    input: { customerId: 'CUST-001' },
    data: {
      duration: 3600_000,
      activity: ['StartEvent_1', 'Task_1', 'Task_2', 'Task_3', 'EndEvent_1'],
      flow: ['flow1', 'flow2', 'flow3', 'flow4'],
      wait: [],
      executed: ['Task_1', 'Task_2', 'Task_3'],
      globalData: { approved: true },
    },
    logs: [],
    end_time: Date.now(),
    created_at: '2024-01-20T00:00:00.000Z',
    updated_at: '2024-01-22T00:00:00.000Z',
    workflow: '<xml />',
  },
];


