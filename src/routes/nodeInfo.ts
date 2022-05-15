/* eslint-disable unicorn/prefer-module */
import { Router } from 'express'
const router = Router()

import { apiPort, p2pPort } from '../server'
import { nodeKeyPair } from '../wallets/gen-key'

interface NodeInfo {
    ports: {
        api: number,
        ws: number
    },
    publicKey: string
}

router.get('/info',(request, response) => {
    const nodeInfo: NodeInfo = {
        ports: {
            api: apiPort,
            ws: p2pPort
        },
        publicKey: nodeKeyPair.pub
    }

    response.send(nodeInfo)
})

export default router