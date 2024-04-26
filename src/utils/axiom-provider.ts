import { BlockTag, TransactionRequest } from "@ethersproject/abstract-provider";
import {
  BigNumber,
  BigNumberish,
  BytesLike,
  Transaction,
  ethers,
  version,
} from "ethers";
import {
  Logger,
  arrayify,
  getStatic,
  hexConcat,
  hexDataLength,
  hexDataSlice,
  hexZeroPad,
  hexlify,
  isHexString,
  resolveProperties,
  toUtf8String,
} from "ethers/lib/utils";

export type Deferrable<T> = {
  [K in keyof T]: T[K] | Promise<T[K]>;
};

export interface IStateOverride {
  nonce?: BigNumberish;
  code?: BytesLike;
  balance?: BigNumberish;
  state?: Record<string, BytesLike>;
  stateDiff?: Record<string, BytesLike>;
}

export interface IBlockOverride {
  number?: BigNumberish;
  difficulty?: BigNumberish;
  time?: number;
  gasLimit?: BigNumberish;
  coinbase?: string;
  random?: BytesLike;
  baseFee?: BigNumberish;
  blobBaseFee?: BigNumberish;
}

const logger = new Logger(version);

const errorGas = ["call", "estimateGas"];

const MAX_CCIP_REDIRECTS = 10;

export class AxiomRpcProvider extends ethers.providers.JsonRpcProvider {
  constructor(url: string) {
      super(url); 
  } 
  async callWithBlockOverride(
    transaction: Deferrable<TransactionRequest>,
    blockTag?: BlockTag | Promise<BlockTag>,
    stateOverrides?: IStateOverride,
    blockOverrides?: IBlockOverride
  ): Promise<string> {
    await this.getNetwork();
    const resolved = await resolveProperties({
      transaction: this._getTransactionRequest(transaction),
      blockTag: this._getBlockTag(blockTag),
      stateOverrides: stateOverrides,
      blockOverrides: blockOverrides,
      ccipReadEnabled: Promise.resolve(transaction.ccipReadEnabled),
    });
    return this._callWithBlockOverride(
      resolved.transaction,
      resolved.blockTag,
      resolved.ccipReadEnabled ? 0 : -1,
      resolved.stateOverrides,
      resolved.blockOverrides
    );
  }

  async _callWithBlockOverride(
    transaction: TransactionRequest,
    blockTag: BlockTag,
    attempt: number,
    stateOverrides?: IStateOverride,
    blockOverrides?: IBlockOverride
  ): Promise<string> {
    if (attempt >= MAX_CCIP_REDIRECTS) {
      logger.throwError(
        "CCIP read exceeded maximum redirections",
        Logger.errors.SERVER_ERROR,
        {
          redirects: attempt,
          transaction,
        }
      );
    }

    const txSender = transaction.to;

    const result = await this.perform("call", {
      transaction,
      blockTag,
      stateOverrides,
      blockOverrides,
    });

    // CCIP Read request via OffchainLookup(address,string[],bytes,bytes4,bytes)
    if (
      attempt >= 0 &&
      blockTag === "latest" &&
      txSender != null &&
      result.substring(0, 10) === "0x556f1830" &&
      hexDataLength(result) % 32 === 4
    ) {
      try {
        const data = hexDataSlice(result, 4);

        // Check the sender of the OffchainLookup matches the transaction
        const sender = hexDataSlice(data, 0, 32);
        if (!BigNumber.from(sender).eq(txSender)) {
          logger.throwError(
            "CCIP Read sender did not match",
            Logger.errors.CALL_EXCEPTION,
            {
              name: "OffchainLookup",
              signature: "OffchainLookup(address,string[],bytes,bytes4,bytes)",
              transaction,
              data: result,
            }
          );
        }

        // Read the URLs from the response
        const urls: Array<string> = [];
        const urlsOffset = BigNumber.from(
          hexDataSlice(data, 32, 64)
        ).toNumber();
        const urlsLength = BigNumber.from(
          hexDataSlice(data, urlsOffset, urlsOffset + 32)
        ).toNumber();
        const urlsData = hexDataSlice(data, urlsOffset + 32);
        for (let u = 0; u < urlsLength; u++) {
          const url = _parseString(urlsData, u * 32);
          if (url == null) {
            logger.throwError(
              "CCIP Read contained corrupt URL string",
              Logger.errors.CALL_EXCEPTION,
              {
                name: "OffchainLookup",
                signature:
                  "OffchainLookup(address,string[],bytes,bytes4,bytes)",
                transaction,
                data: result,
              }
            );
          }
          urls.push(url);
        }

        // Get the CCIP calldata to forward
        const calldata = _parseBytes(data, 64);

        // Get the callbackSelector (bytes4)
        if (!BigNumber.from(hexDataSlice(data, 100, 128)).isZero()) {
          logger.throwError(
            "CCIP Read callback selector included junk",
            Logger.errors.CALL_EXCEPTION,
            {
              name: "OffchainLookup",
              signature: "OffchainLookup(address,string[],bytes,bytes4,bytes)",
              transaction,
              data: result,
            }
          );
        }
        const callbackSelector = hexDataSlice(data, 96, 100);

        // Get the extra data to send back to the contract as context
        const extraData = _parseBytes(data, 128);

        const ccipResult = await this.ccipReadFetch(
          <Transaction>transaction,
          calldata,
          urls
        );
        if (ccipResult == null) {
          logger.throwError(
            "CCIP Read disabled or provided no URLs",
            Logger.errors.CALL_EXCEPTION,
            {
              name: "OffchainLookup",
              signature: "OffchainLookup(address,string[],bytes,bytes4,bytes)",
              transaction,
              data: result,
            }
          );
        }

        const tx = {
          to: txSender,
          data: hexConcat([
            callbackSelector,
            encodeBytes([ccipResult, extraData]),
          ]),
        };

        return this._call(tx, blockTag, attempt + 1);
      } catch (error) {
        if (error.code === Logger.errors.SERVER_ERROR) {
          throw error;
        }
      }
    }

    try {
      return hexlify(result);
    } catch (error) {
      return logger.throwError(
        "bad result from backend",
        Logger.errors.SERVER_ERROR,
        {
          method: "call",
          params: { transaction, blockTag },
          result,
          error,
        }
      );
    }
  }

  prepareRequest(method: string, params: any): [string, Array<any>] {
    switch (method) {
      case "getBlockNumber":
        return ["eth_blockNumber", []];

      case "getGasPrice":
        return ["eth_gasPrice", []];

      case "getBalance":
        return [
          "eth_getBalance",
          [getLowerCase(params.address), params.blockTag],
        ];

      case "getTransactionCount":
        return [
          "eth_getTransactionCount",
          [getLowerCase(params.address), params.blockTag],
        ];

      case "getCode":
        return ["eth_getCode", [getLowerCase(params.address), params.blockTag]];

      case "getStorageAt":
        return [
          "eth_getStorageAt",
          [
            getLowerCase(params.address),
            hexZeroPad(params.position, 32),
            params.blockTag,
          ],
        ];

      case "sendTransaction":
        return ["eth_sendRawTransaction", [params.signedTransaction]];

      case "getBlock":
        if (params.blockTag) {
          return [
            "eth_getBlockByNumber",
            [params.blockTag, !!params.includeTransactions],
          ];
        } else if (params.blockHash) {
          return [
            "eth_getBlockByHash",
            [params.blockHash, !!params.includeTransactions],
          ];
        }
        return null;

      case "getTransaction":
        return ["eth_getTransactionByHash", [params.transactionHash]];

      case "getTransactionReceipt":
        return ["eth_getTransactionReceipt", [params.transactionHash]];

      case "call": {
        const hexlifyTransaction = getStatic<
          (
            t: TransactionRequest,
            a?: { [key: string]: boolean }
          ) => { [key: string]: string }
        >(this.constructor, "hexlifyTransaction");
        return [
          "eth_call",
          [
            hexlifyTransaction(params.transaction, { from: true }),
            params.blockTag,
            {},
          ],
        ];
      }

      case "estimateGas": {
        const hexlifyTransaction = getStatic<
          (
            t: TransactionRequest,
            a?: { [key: string]: boolean }
          ) => { [key: string]: string }
        >(this.constructor, "hexlifyTransaction");
        return [
          "eth_estimateGas",
          [hexlifyTransaction(params.transaction, { from: true })],
        ];
      }

      case "getLogs":
        if (params.filter && params.filter.address != null) {
          params.filter.address = getLowerCase(params.filter.address);
        }
        return ["eth_getLogs", [params.filter]];

      default:
        break;
    }

    return null;
  }

  async perform(method: string, params: any): Promise<any> {
    // Legacy networks do not like the type field being passed along (which
    // is fair), so we delete type if it is 0 and a non-EIP-1559 network
    if (method === "call" || method === "estimateGas") {
      const tx = params.transaction;
      if (tx && tx.type != null && BigNumber.from(tx.type).isZero()) {
        // If there are no EIP-1559 properties, it might be non-EIP-1559
        if (tx.maxFeePerGas == null && tx.maxPriorityFeePerGas == null) {
          const feeData = await this.getFeeData();
          if (
            feeData.maxFeePerGas == null &&
            feeData.maxPriorityFeePerGas == null
          ) {
            // Network doesn't know about EIP-1559 (and hence type)
            params = shallowCopy(params);
            params.transaction = shallowCopy(tx);
            delete params.transaction.type;
          }
        }
      }
    }

    const args = this.prepareRequest(method, params);

    if (args == null) {
      logger.throwError(
        method + " not implemented",
        Logger.errors.NOT_IMPLEMENTED,
        { operation: method }
      );
    }
    try {
      return await this.send(args[0], args[1]);
    } catch (error) {
      return checkError(method, error, params);
    }
  }
}

function shallowCopy<T>(object: T): T {
  const result: any = {};
  for (const key in object) {
    result[key] = object[key];
  }
  return result;
}

function getLowerCase(value: string): string {
  if (value) {
    return value.toLowerCase();
  }
  return value;
}

function spelunk(
  value: any,
  requireData: boolean
): null | { message: string; data: null | string } {
  if (value == null) {
    return null;
  }

  // These *are* the droids we're looking for.
  if (typeof value.message === "string" && value.message.match("reverted")) {
    const data = isHexString(value.data) ? value.data : null;
    if (!requireData || data) {
      return { message: value.message, data };
    }
  }

  // Spelunk further...
  if (typeof value === "object") {
    for (const key in value) {
      const result = spelunk(value[key], requireData);
      if (result) {
        return result;
      }
    }
    return null;
  }

  // Might be a JSON string we can further descend...
  if (typeof value === "string") {
    try {
      return spelunk(JSON.parse(value), requireData);
    } catch (error) {}
  }

  return null;
}

function _parseString(result: string, start: number): null | string {
  try {
    return toUtf8String(_parseBytes(result, start));
  } catch (error) {}
  return null;
}

function _parseBytes(result: string, start: number): null | string {
  if (result === "0x") {
    return null;
  }

  const offset = BigNumber.from(
    hexDataSlice(result, start, start + 32)
  ).toNumber();
  const length = BigNumber.from(
    hexDataSlice(result, offset, offset + 32)
  ).toNumber();

  return hexDataSlice(result, offset + 32, offset + 32 + length);
}

function encodeBytes(datas: Array<BytesLike>) {
  const result: Array<Uint8Array> = [];

  let byteCount = 0;

  // Add place-holders for pointers as we add items
  for (let i = 0; i < datas.length; i++) {
    result.push(null);
    byteCount += 32;
  }

  for (let i = 0; i < datas.length; i++) {
    const data = arrayify(datas[i]);

    // Update the bytes offset
    result[i] = numPad(byteCount);

    // The length and padded value of data
    result.push(numPad(data.length));
    result.push(bytesPad(data));
    byteCount += 32 + Math.ceil(data.length / 32) * 32;
  }

  return hexConcat(result);
}

function numPad(value: number): Uint8Array {
  const result = arrayify(value);
  if (result.length > 32) {
    throw new Error("internal; should not happen");
  }

  const padded = new Uint8Array(32);
  padded.set(result, 32 - result.length);
  return padded;
}

function bytesPad(value: Uint8Array): Uint8Array {
  if (value.length % 32 === 0) {
    return value;
  }

  const result = new Uint8Array(Math.ceil(value.length / 32) * 32);
  result.set(value);
  return result;
}

function checkError(method: string, error: any, params: any): any {
  const transaction = params.transaction || params.signedTransaction;

  // Undo the "convenience" some nodes are attempting to prevent backwards
  // incompatibility; maybe for v6 consider forwarding reverts as errors
  if (method === "call") {
    const result = spelunk(error, true);
    if (result) {
      return result.data;
    }

    // Nothing descriptive..
    logger.throwError(
      "missing revert data in call exception; Transaction reverted without a reason string",
      Logger.errors.CALL_EXCEPTION,
      {
        data: "0x",
        transaction,
        error,
      }
    );
  }

  if (method === "estimateGas") {
    // Try to find something, with a preference on SERVER_ERROR body
    let result = spelunk(error.body, false);
    if (result == null) {
      result = spelunk(error, false);
    }

    // Found "reverted", this is a CALL_EXCEPTION
    if (result) {
      logger.throwError(
        "cannot estimate gas; transaction may fail or may require manual gas limit",
        Logger.errors.UNPREDICTABLE_GAS_LIMIT,
        {
          reason: result.message,
          method,
          transaction,
          error,
        }
      );
    }
  }

  // @TODO: Should we spelunk for message too?

  let message = error.message;
  if (
    error.code === Logger.errors.SERVER_ERROR &&
    error.error &&
    typeof error.error.message === "string"
  ) {
    message = error.error.message;
  } else if (typeof error.body === "string") {
    message = error.body;
  } else if (typeof error.responseText === "string") {
    message = error.responseText;
  }
  message = (message || "").toLowerCase();

  // "insufficient funds for gas * price + value + cost(data)"
  if (
    message.match(
      /insufficient funds|base fee exceeds gas limit|InsufficientFunds/i
    )
  ) {
    logger.throwError(
      "insufficient funds for intrinsic transaction cost",
      Logger.errors.INSUFFICIENT_FUNDS,
      {
        error,
        method,
        transaction,
      }
    );
  }

  // "nonce too low"
  if (message.match(/nonce (is )?too low/i)) {
    logger.throwError(
      "nonce has already been used",
      Logger.errors.NONCE_EXPIRED,
      {
        error,
        method,
        transaction,
      }
    );
  }

  // "replacement transaction underpriced"
  if (
    message.match(
      /replacement transaction underpriced|transaction gas price.*too low/i
    )
  ) {
    logger.throwError(
      "replacement fee too low",
      Logger.errors.REPLACEMENT_UNDERPRICED,
      {
        error,
        method,
        transaction,
      }
    );
  }

  // "replacement transaction underpriced"
  if (message.match(/only replay-protected/i)) {
    logger.throwError(
      "legacy pre-eip-155 transactions not supported",
      Logger.errors.UNSUPPORTED_OPERATION,
      {
        error,
        method,
        transaction,
      }
    );
  }

  if (
    errorGas.indexOf(method) >= 0 &&
    message.match(
      /gas required exceeds allowance|always failing transaction|execution reverted|revert/
    )
  ) {
    logger.throwError(
      "cannot estimate gas; transaction may fail or may require manual gas limit",
      Logger.errors.UNPREDICTABLE_GAS_LIMIT,
      {
        error,
        method,
        transaction,
      }
    );
  }

  throw error;
}
