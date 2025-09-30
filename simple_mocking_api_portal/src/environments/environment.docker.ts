export const environment = {
  production: true,
  apiUrl: process.env['API_URL'] || 'http://simple-mocking-api:8080',
  apiVersion: 'v1',
  features: {
    enableToast: true,
    enablePagination: true,
    defaultPageSize: 10
  }
};

