// Simple script to help find your IP address
// Run this in Node.js to find your machine's network interfaces

const os = require('os');

console.log('🌐 Network Interface Information:');
console.log('==================================');

const networkInterfaces = os.networkInterfaces();

Object.keys(networkInterfaces).forEach((interfaceName) => {
  const networkInterface = networkInterfaces[interfaceName];
  
  console.log(`\n📡 Interface: ${interfaceName}`);
  
  networkInterface.forEach((details) => {
    if (details.family === 'IPv4' && !details.internal) {
      console.log(`  ✅ IPv4: ${details.address}`);
      console.log(`     🔗 For mobile app: http://${details.address}:3001/api`);
    }
  });
});

console.log('\n📱 Copy one of the "For mobile app" URLs above and update your mobile app configuration!');
console.log('\n🔧 To update: Edit mobile/src/services/api.ts and replace one of the FALLBACK_URLS');
