import { ethers } from 'ethers';
import fs from 'fs';

// Generate a new random wallet
const wallet = ethers.Wallet.createRandom();

console.log('Generated Test Wallet:');
console.log('Address:', wallet.address);
console.log('Private Key:', wallet.privateKey);
console.log('Mnemonic:', wallet.mnemonic?.phrase);

// Save to a file for reference
const walletInfo = {
  address: wallet.address,
  privateKey: wallet.privateKey,
  mnemonic: wallet.mnemonic?.phrase
};

fs.writeFileSync('test-wallet.json', JSON.stringify(walletInfo, null, 2));
console.log('\nWallet info saved to test-wallet.json'); 