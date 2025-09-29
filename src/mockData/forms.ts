// Initial mock data for forms
export const mockForms: FormConfig[] = [
  {
    _id: 'form-kyc',
    name: 'KYC Form',
    description: 'Know Your Customer form',
    config: JSON.stringify({
      components: [
        { type: 'textfield', key: 'fullName', label: 'Full Name', validate: { required: true } },
        { type: 'email', key: 'email', label: 'Email' },
        { type: 'number', key: 'age', label: 'Age' },
      ],
    }),
  },
];


