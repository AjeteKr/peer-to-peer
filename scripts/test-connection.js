const sql = require('mssql/msnodesqlv8');

const config = {
  server: 'localhost',
  database: 'peer-to-peer',
  driver: 'msnodesqlv8',
  options: {
    trustedConnection: true
  }
};

console.log('Testing connection with msnodesqlv8...');
console.log('Config:', JSON.stringify(config, null, 2));

sql.connect(config, function(err) {
  if (err) {
    console.error('Connection failed:', err);
    process.exit(1);
  }
  
  console.log('✅ Connected successfully!');
  
  const request = new sql.Request();
  request.query('SELECT DB_NAME() as database_name, @@VERSION as version', function(err, result) {
    if (err) {
      console.error('Query failed:', err);
      process.exit(1);
    }
    
    console.log('\n📊 Query Result:');
    console.log(result.recordset);
    
    sql.close();
    console.log('\n✅ Connection test completed successfully!');
    process.exit(0);
  });
});
