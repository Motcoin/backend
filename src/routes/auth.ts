/* eslint-disable unicorn/prefer-module */
import { Router } from "express";
// import { genKeyPair } from '../wallets/gen-key'
// import { secret, authenticateJWT } from '../middleware/jwt'
// import jwt from 'jsonwebtoken'
const router = Router();

// router.post('/login',(request, response) => {
//   console.log(request.body);

//   const { username } = request.body

//   console.log('login called by', username);
//   loadKeys()
//   if(!keys[username]){
//     console.log('user not yet registered');
//     keys[username] = genKeyPair()
//     saveKeys()
//   }
//   response.json({
//     accessToken: jwt.sign(username,secret)
//   })
// })

// router.get('/test',authenticateJWT,(request,response) => {
//   response.send((request as any).username)
// })

export default router;
