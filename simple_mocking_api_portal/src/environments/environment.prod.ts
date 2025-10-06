export const environment = {
  production: true,
  apiUrl: process.env['API_BASE_URL'] || 'http://simple-mocking-api:8080',  // Default for Docker containers
  apiVersion: 'v1',
  features: {
    enableToast: true,
    enablePagination: true,
    defaultPageSize: 10
  }
};
