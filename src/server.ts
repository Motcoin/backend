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
  app.use(bodyParser.urlencoded({
      extended: true
  }));
  app.use('/auth',auth)

  app.get('/broadcast',(request,response) => {
      broadcastLatest()
      response.send(200)
  })
  app.get('/blocks', (request, response) => {
      response.send(getBlockchain());
  });
  app.post('/mineBlock', (request, response) => {
      mineBlock(request.body.data).then(() => {
        broadcastLatest()
        response.sendStatus(201)
      }).catch(() => {
        response.sendStatus(409)
      }).then(stopMining)
  });
  
  app.get('/peers', (request, response) => {
      response.send(getSockets().map(( s: any ) => s._socket.remoteAddress + ':' + s._socket.remotePort));
  });
  app.post('/addPeer', (request, response) => {
      connectToPeers(request.body.peer);
      response.send();
  });

  app.listen(myHttpPort, () => {
      console.log('Listening http on port: ' + myHttpPort);
  });
};

const checkPort = (port: number):Promise<number> => {
 // eslint-disable-next-line no-async-promise-executor
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
    // eslint-disable-next-line no-constant-condition
    while (true) {
     try {
      return await checkPort(port)
     } catch {
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