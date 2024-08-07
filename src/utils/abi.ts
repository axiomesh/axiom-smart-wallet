export const ERC20_ABI = [
  // Read-Only Functions
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",

  // Authenticated Functions
  "function transfer(address to, uint amount) returns (bool)",
  "function approve(address spender, uint amount) returns (bool)",
  "function allowance(address _owner, address _spender) returns (uint256)",
  "function mint(address _to, uint256 _amount) returns (bool)",

  // Events
  "event Transfer(address indexed from, address indexed to, uint amount)",
];

export const FACTORY_ABI = [
  "function createAccount(address owner, uint256 salt, address guardian) returns (address)",
  "function getAddress(address owner,uint256 salt) view returns (address)",
];

export const AXIOM_ACCOUNT_ABI = [
  "function execute(address dest, uint256 value, bytes func)",
  "function executeBatch(address[] dest, bytes[] func)",
  "function setGuardian(address guardian)",
  "function resetOwner(address owner)",
  "function setSession(address addr, uint256 spendingLimit, uint64 validAfter, uint64 validUntil)",
  "function setPasskey(bytes key, uint8 algoType)",
];
