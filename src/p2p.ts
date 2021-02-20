import WebSocket from 'ws';
import { Server } from 'ws';
import { addBlockToChain, getBlockchain, replaceChain, getLatestBlock, getIsMining } from '../src/controller/blockchain';
import Block, { isValidBlockStructure } from '../src/models/block'
import portscanner from 'portscanner'
import { p2pPort } from './server'

const sockets: WebSocket[] = [];

enum MessageType {
    QUERY_LATEST = 0,
    QUERY_ALL = 1,
    RESPONSE_BLOCKCHAIN = 2,
}

interface Message {
   type: MessageType,
   data: any
}

const lookForPeers = async() => {
  const startPort = 11_111
  const endPort = 12_000
  const result: number[] = []
  for(let port = startPort; port < endPort; port++){
    const status = await portscanner.checkPortStatus(port)
    if(status === 'open' && port !== p2pPort){
      result.push(port)
    }
  }
  console.log('found peers',result);
  return result
}

const initP2PServer = async(p2pPort: number) => {
    const server: Server = new WebSocket.Server({ port: p2pPort });
    server.on('connection', (ws: WebSocket) => {
        initConnection(ws);
    });
    //automated peer discovery
    const peers = await lookForPeers()
    peers.forEach((peer) => {
      connectToPeers(`ws://localhost:${peer}`)
    })
    console.log('listening websocket p2p port on: ' + p2pPort);
};

const getSockets = () => sockets;

export const getSocketsLength = () => sockets.length

const initConnection = (ws: WebSocket) => {
    sockets.push(ws);
    initMessageHandler(ws);
    initErrorHandler(ws);
    write(ws, queryChainLengthMsg());
};

const JSONToObject = <T>(data: string): T | null => {
    try {
        return JSON.parse(data);
    } catch (e) {
        console.log(e);
        return null
    }
};

const initMessageHandler = (ws: WebSocket) => {
    ws.on('message', (data: string) => {
        const message: Message | null = JSONToObject<Message>(data);
        if (message === null) {
            console.log('could not parse received JSON message: ' + data);
            return;
        }
        console.log('Received message' + JSON.stringify(message.type));
        switch (message.type) {
            case MessageType.QUERY_LATEST:
                write(ws, responseLatestMsg());
                break;
            case MessageType.QUERY_ALL:
                write(ws, responseChainMsg());
                break;
            case MessageType.RESPONSE_BLOCKCHAIN:
                const receivedBlocks: Block[]|null = JSONToObject<Block[]>(message.data);
                if (receivedBlocks === null) {
                    console.log('invalid blocks received:');
                    console.log(message.data)
                    break;
                }
                handleBlockchainResponse(receivedBlocks);
                break;
        }
    });
};

const write = (ws: WebSocket, message: Message): void => ws.send(JSON.stringify(message));
const broadcast = (message: Message): void => sockets.forEach((socket) => write(socket, message));

const queryChainLengthMsg = (): Message => ({type: MessageType.QUERY_LATEST, data: null});

const queryAllMsg = (): Message => ({type: MessageType.QUERY_ALL, data: null});

const responseChainMsg = (): Message => ({
    type: MessageType.RESPONSE_BLOCKCHAIN, data: JSON.stringify(getBlockchain())
});

const responseLatestMsg = (): Message => ({
    type: MessageType.RESPONSE_BLOCKCHAIN,
    data: JSON.stringify([getLatestBlock()])
});

const initErrorHandler = (ws: WebSocket) => {
    const closeConnection = (myWs: WebSocket) => {
        console.log('connection failed to peer: ' + myWs.url);
        sockets.splice(sockets.indexOf(myWs), 1);
    };
    ws.on('close', () => closeConnection(ws));
    ws.on('error', () => closeConnection(ws));
};


let otherNodeFoundHash = false
export const getOtherNodeFoundHash = () => otherNodeFoundHash
export const setOtherNodeFoundHash = (newValue:boolean) => otherNodeFoundHash = newValue

const stopMining = () => {
    if(getIsMining()){
        setOtherNodeFoundHash(true);
    }
}

const handleBlockchainResponse = (receivedBlocks: Block[]) => {
    const latestBlock = getLatestBlock()
    const latestReceivedBlock = receivedBlocks[receivedBlocks.length - 1]
    if(!receivedBlocks.length){
        console.log('received empty blockchain');
        return
    }
    if(latestBlock.index >= latestReceivedBlock.index){
        console.log('received smaller or same blockchain, do nothing');
        return
    }
    if(latestReceivedBlock.index === latestBlock.index + 1 && addBlockToChain(latestReceivedBlock)){
        console.log('new received block can be added to blockchain, so stop mining.');
        stopMining()
        broadcast(responseLatestMsg())
        return
    }
    if(receivedBlocks.length === 1){
        queryAllMsg()
        return
    }
    replaceChain(receivedBlocks)
};

const broadcastLatest = (): void => {
    broadcast(responseLatestMsg());
};

const connectToPeers = (newPeer: string): void => {
  console.log(newPeer);
    const ws: WebSocket = new WebSocket(newPeer);
    ws.on('open', () => {
        initConnection(ws);
    });
    ws.on('error', () => {
        console.log('connection failed');
    });
};

export { connectToPeers, broadcastLatest, initP2PServer, getSockets };