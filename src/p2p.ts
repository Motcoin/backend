import WebSocket from "ws";
import { Server } from "ws";
import {
  addBlockToChain,
  getBlockchain,
  replaceChain,
  getLatestBlock,
} from "../src/controller/blockchain";
import { stopMining } from "./pow";
import Block from "../src/models/block";
import portscanner from "portscanner";
import { p2pPort } from "./server";
import { addToEther, ether } from "./models/ether";

const peers: WebSocket[] = [];

export enum MessageType {
  QUERY_LATEST = 0,
  QUERY_ALL = 1,
  RESPONSE_BLOCKCHAIN = 2,
  ETHER = 3,
}

interface Message {
  type: MessageType;
  data: any;
}

const lookForPeers = async () => {
  const startPort = 11_111;
  const endPort = 12_000;
  const result: number[] = [];
  for (let port = startPort; port < endPort; port++) {
    const status = await portscanner.checkPortStatus(port);
    if (status === "open" && port !== p2pPort) {
      result.push(port);
    }
  }
  console.log("found peers", result);
  return result;
};

const initP2PServer = async (p2pPort: number) => {
  const server: Server = new WebSocket.Server({ port: p2pPort });
  server.on("connection", (ws: WebSocket) => {
    initConnection(ws);
  });
  //automated peer discovery
  const peers = await lookForPeers();
  for (const peer of peers) {
    connectToPeers(`ws://localhost:${peer}`);
  }
  console.log("listening websocket p2p port on: " + p2pPort);
};

const getPeers = () => peers;

export const getPeerisCount = () => peers.length;

const initConnection = (ws: WebSocket) => {
  peers.push(ws);
  initMessageHandler(ws);
  initErrorHandler(ws);
  write(ws, queryChainLengthMessage());
};

const JSONToObject = <T>(data: string): T | undefined => {
  try {
    return JSON.parse(data);
  } catch (error) {
    console.log(error);
    return undefined;
  }
};

//TODO: refactor this switch case
const initMessageHandler = (ws: WebSocket) => {
  ws.on("message", (data: string) => {
    const message: Message | undefined = JSONToObject<Message>(data);
    if (!message) {
      console.log("could not parse received JSON message: " + data);
      return;
    }

    console.log("Received message" + JSON.stringify(message.type));

    switch (message.type) {
      case MessageType.QUERY_LATEST:
        write(ws, responseLatestMessage());
        break;
      case MessageType.QUERY_ALL:
        write(ws, responseChainMessage());
        break;
      case MessageType.RESPONSE_BLOCKCHAIN: {
        const receivedBlocks: Block[] | undefined = JSONToObject<Block[]>(
          message.data
        );
        if (!receivedBlocks) {
          console.log("invalid blocks received:");
          console.log(message.data);
          break;
        }
        handleBlockchainResponse(receivedBlocks);
        break;
      }
      case MessageType.ETHER: {
        addToEther(message.data);
      }
    }
  });
};

const write = (ws: WebSocket, message: Message): void =>
  ws.send(JSON.stringify(message));

export const broadcast = (message: Message): void => {
  for (const socket of peers) {
    write(socket, message);
  }
};

const queryChainLengthMessage = (): Message => ({
  type: MessageType.QUERY_LATEST,
  data: undefined,
});

const queryAllMessage = (): Message => ({
  type: MessageType.QUERY_ALL,
  data: undefined,
});

const responseChainMessage = (): Message => ({
  type: MessageType.RESPONSE_BLOCKCHAIN,
  data: JSON.stringify(getBlockchain()),
});

const responseLatestMessage = (): Message => ({
  type: MessageType.RESPONSE_BLOCKCHAIN,
  data: JSON.stringify([getLatestBlock()]),
});

const initErrorHandler = (ws: WebSocket) => {
  const closeConnection = (myWs: WebSocket) => {
    console.log("connection failed to peer: " + myWs.url);
    peers.splice(peers.indexOf(myWs), 1);
  };
  ws.on("close", () => closeConnection(ws));
  ws.on("error", () => closeConnection(ws));
};

const handleBlockchainResponse = (receivedBlocks: Block[]) => {
  const latestBlock = getLatestBlock();
  const latestReceivedBlock = receivedBlocks[receivedBlocks.length - 1];
  if (receivedBlocks.length === 0) {
    console.log("received empty blockchain");
    return;
  }
  if (latestBlock.index >= latestReceivedBlock.index) {
    console.log("received smaller or same blockchain, do nothing");
    return;
  }
  if (
    latestReceivedBlock.index === latestBlock.index + 1 &&
    addBlockToChain(latestReceivedBlock)
  ) {
    console.clear();
    console.log(
      "new received block can be added to blockchain, so stop mining.!!!!!!!!!!!!!!!!"
    );
    stopMining();
    broadcast(responseLatestMessage());
    return;
  }
  if (receivedBlocks.length === 1) {
    queryAllMessage();
    return;
  }
  replaceChain(receivedBlocks);
};

const broadcastLatest = (): void => {
  broadcast(responseLatestMessage());
};

const connectToPeers = (newPeer: string): void => {
  console.log(newPeer);
  const ws: WebSocket = new WebSocket(newPeer);
  ws.on("open", () => {
    initConnection(ws);
  });
  ws.on("error", () => {
    console.log("connection failed");
  });
};

export {
  connectToPeers,
  broadcastLatest,
  initP2PServer,
  getPeers as getSockets,
};
