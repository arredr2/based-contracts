// scripts/generate-env.js
const fs = require("fs");
const path = require("path");

function generateEnvFile(network) {
  console.log(`Generating environment variables for ${network}...`);
  
  const deploymentPath = path.join(__dirname, '..', 'deployments', `${network}.json`);
  
  // Check if deployment exists
  if (!fs.existsSync(deploymentPath)) {
    throw new Error(`No deployment found for network: ${network}`);
  }

  const deployment = JSON.parse(fs.readFileSync(deploymentPath, "utf8"));
  console.log(`Found deployment at: ${deployment.contractAddress}`);

  // Read existing .env.local if it exists
  let existingEnv = {};
  const envPath = path.join(__dirname, '..', '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    existingEnv = envContent.split('\n').reduce((acc, line) => {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        acc[key.trim()] = valueParts.join('=').trim();
      }
      return acc;
    }, {});
  }

  // Combine existing env vars with new contract address
  const envVars = {
    ...existingEnv,
    NEXT_PUBLIC_CONTRACT_ADDRESS: deployment.contractAddress,
    NEXT_PUBLIC_NETWORK: network,
    // Update timestamp for tracking
    NEXT_PUBLIC_LAST_DEPLOY: new Date().toISOString()
  };

  // Generate .env.production content
  const envContent = Object.entries(envVars)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');

  // Write to both .env.production and .env.local
  const prodEnvPath = path.join(__dirname, '..', '.env.production');
  fs.writeFileSync(prodEnvPath, envContent);
  console.log('Generated .env.production file');
  
  // Update .env.local as well
  fs.writeFileSync(envPath, envContent);
  console.log('Updated .env.local file');

  // Create a deployment record
  const deploymentRecord = {
    timestamp: new Date().toISOString(),
    network: network,
    contractAddress: deployment.contractAddress,
    envVars: Object.keys(envVars)
  };

  const deploymentsPath = path.join(__dirname, '..', 'deployments', 'history.json');
  let history = [];
  if (fs.existsSync(deploymentsPath)) {
    history = JSON.parse(fs.readFileSync(deploymentsPath, 'utf8'));
  }
  history.push(deploymentRecord);
  fs.writeFileSync(deploymentsPath, JSON.stringify(history, null, 2));
  console.log('Updated deployment history');

  console.log('Environment setup completed successfully!');
  console.log(`Contract Address: ${deployment.contractAddress}`);
  console.log(`Network: ${network}`);
}

// Get network from command line argument
const network = process.argv[2];
if (!network) {
  console.error("Please specify network: node scripts/generate-env.js <network>");
  process.exit(1);
}

try {
  generateEnvFile(network);
} catch (error) {
  console.error('Error generating environment files:', error);
  process.exit(1);
}
