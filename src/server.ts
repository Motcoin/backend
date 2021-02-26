import { mineBlock, getBlockchain } from "./controller/blockchain"
import express from "express"
import cors from "cors"
import * as bodyParser  from "body-parser"
import { getSockets, connectToPeers, initP2PServer, broadcastLatest } from './p2p'
import portscanner from 'portscanner'
import { stopMining } from "./pow"
import auth from './routes/auth'

const initHttpServer = ( myHttpPort: number ) => {
  const app = express();
  app.use(cors());
  app.use(bodyParser.json());
  app.use('/auth',auth)

  app.get('/broadcast',(req,res) => {
      broadcastLatest()
      res.send(200)
  })
  app.get('/blocks', (req, res) => {
      res.send(getBlockchain());
  });
  app.post('/mineBlock', (req, res) => {
      mineBlock(req.body.data).then(() => {
        broadcastLatest()
        res.sendStatus(201)
      }).catch(() => {
        res.sendStatus(409)
      }).then(stopMining)
  });
  
  app.get('/peers', (req, res) => {
      res.send(getSockets().map(( s: any ) => s._socket.remoteAddress + ':' + s._socket.remotePort));
  });
  app.post('/addPeer', (req, res) => {
      connectToPeers(req.body.peer);
      res.send();
  });

  app.listen(myHttpPort, () => {
      console.log('Listening http on port: ' + myHttpPort);
  });
};


const checkPort = (port: number):Promise<number> => {
 return new Promise(async (resolve,reject) => {
     await portscanner.checkPortStatus(port,(_,status: string) => {
         if(status === 'closed'){
             resolve(port)
         } else {
             reject()
         }
     })
 })
}

const findFreePort = async (startPort:number):Promise<number> => {
    let port = startPort
    while (true) {
     try {
      return await checkPort(port)
     } catch (e) {
        port++
     }
    }
}

findFreePort(8000).then((port:number) => {
    initHttpServer(port)
})

export let p2pPort = 11_111

findFreePort(11_111).then((port:number) => {
    p2pPort = port
    initP2PServer(p2pPort)
})