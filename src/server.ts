import { mineBlock, getBlockchain } from "./controller/blockchain";
import express from "express";
import cors from "cors";
import * as bodyParser from "body-parser";
import {
  getSockets,
  connectToPeers,
  initP2PServer,
  broadcastLatest,
  MessageType,
  broadcast,
} from "./p2p";
import portscanner from "portscanner";
import { stopMining } from "./pow";
import auth from "./routes/auth";
import nodeInfo from "./routes/node-info";
import { getKeyForPort } from "./wallets/gen-key";
import { addToEther, getEther } from "./models/ether";
import { unspentTransactionOut } from "./models/transaction";

const initHttpServer = (myHttpPort: number) => {
  const app = express();
  app.use(cors());
  app.use(bodyParser.json());
  app.use(
    bodyParser.urlencoded({
      extended: true,
    })
  );
  app.use("/auth", auth);
  app.use("/node", nodeInfo);

  app.get("/broadcast", (request, response) => {
    broadcastLatest();
    response.send(200);
  });
  app.get("/blocks", (request, response) => {
    response.send(getBlockchain());
  });
  app.post("/mineBlock", (request, response) => {
    mineBlock()
      .then(() => {
        broadcastLatest();
        response.sendStatus(201);
      })
      .catch(() => {
        response.sendStatus(409);
      })
      .then(stopMining);
  });

  app.get("/transaction", (request, response) => {
    response.send(getEther());
  });

  app.get("/unspent", (request, response) => {
    response.send(unspentTransactionOut);
  });

  app.get("/peers", (request, response) => {
    response.send(
      getSockets().map(
        (s: any) => s._socket.remoteAddress + ":" + s._socket.remotePort
      )
    );
  });
  app.post("/addPeer", (request, response) => {
    connectToPeers(request.body.peer);
    response.send();
  });

  app.post("/transaction", (request, response) => {
    addToEther(request.body);

    const message = {
      type: MessageType.ETHER,
      data: request.body,
    };

    broadcast(message);
  });

  app.listen(myHttpPort, () => {
    console.log("Listening http on port: " + myHttpPort);
  });
};

const checkPort = (port: number): Promise<number> => {
  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async (resolve, reject) => {
    await portscanner.checkPortStatus(port, (_, status: string) => {
      if (status === "closed") {
        resolve(port);
      } else {
        reject();
      }
    });
  });
};

const findFreePort = async (startPort: number): Promise<number> => {
  let port = startPort;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      return await checkPort(port);
    } catch {
      port++;
    }
  }
};

export let apiPort = 8000;

findFreePort(apiPort).then((port: number) => {
  apiPort = port;
  getKeyForPort(port.toString());
  initHttpServer(port);
});

export let p2pPort = 11_111;

findFreePort(p2pPort).then((port: number) => {
  p2pPort = port;
  initP2PServer(p2pPort);
});
