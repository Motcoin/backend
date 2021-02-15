import Blockchain from "./models/blockchain"
import Block, { genesisBlock } from "./models/block"
import express from "express"
import * as bodyParser  from "body-parser"

const blockchain = new Blockchain(genesisBlock)

const initHttpServer = ( myHttpPort: number ) => {
  const app = express();
  app.use(bodyParser.json());

  app.get('/blocks', (req, res) => {
      res.send(blockchain.getBlockchain());
  });
  app.post('/mineBlock', (req, res) => {
      const newBlock: Block = blockchain.mineNewBlock(req.body.data)
      res.send(newBlock);
  });
  
  // app.get('/peers', (req, res) => {
  //     res.send(getSockets().map(( s: any ) => s._socket.remoteAddress + ':' + s._socket.remotePort));
  // });
  // app.post('/addPeer', (req, res) => {
  //     connectToPeers(req.body.peer);
  //     res.send();
  // });

  app.listen(myHttpPort, () => {
      console.log('Listening http on port: ' + myHttpPort);
  });
};
