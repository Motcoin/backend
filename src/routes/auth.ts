import { Router } from 'express'
import { genKeyPair } from '../wallets/gen-key'
import { secret, authenticateJWT } from '../middleware/jwt'
import jwt from 'jsonwebtoken'
import fs from 'fs'
import path from 'path'
const router = Router()

interface Keys {
  [key:string]: {
    priv: string,
    pub: string
  }
}

let keys: Keys = {}

const loadKeys = () => {
  keys = JSON.parse(fs.readFileSync(path.join(__dirname,'../wallets/keys.json'),'utf8')) as any
}

const saveKeys = () => {
  fs.writeFileSync(path.join(__dirname,'../wallets/keys.json'),JSON.stringify(keys))
}


router.post('/login',(req, res) => {
  console.log(req.body);
  
  const { username } = req.body
  console.log('login called by', username);
  loadKeys()
  if(!keys[username]){
    console.log('user not yet registered');
    keys[username] = genKeyPair()
    saveKeys()
  }
  res.json({
    accessToken: jwt.sign(username,secret)
  })
})

router.get('/test',authenticateJWT,(req,res) => {
  res.send((req as any).username)
})

export default router