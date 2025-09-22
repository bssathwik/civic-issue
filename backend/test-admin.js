// Test admin middleware
console.log('Testing admin middleware...');
try {
  const admin = require('./src/middleware/admin');
  console.log('Admin type:', typeof admin);
  console.log('Admin is function:', typeof admin === 'function');
  
  if (typeof admin === 'function') {
    console.log('✅ Admin middleware loaded correctly');
  } else {
    console.log('❌ Admin middleware is not a function');
    console.log('Admin value:', admin);
  }
} catch (error) {
  console.error('Error loading admin middleware:', error.message);
}