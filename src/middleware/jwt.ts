import * as jwt from 'jsonwebtoken'

export const secret = '123467.SOMESECRET.12486'

export const decodeJWT = async(token:string) => {
  let result = '';
  await jwt.verify(token, secret, (err: any, user: any) => {
    if(err){
      console.log(err)
    } else {
      result = user
    }
  })
  return result
}

export const authenticateJWT = (req:any, res:any, next:any) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
      const token = authHeader.split(' ')[1];
      jwt.verify(token, secret, (err: any, username: any) => {
          if (err) {
            return res.sendStatus(403);
          }
          req.username = username;
          next();
      });
  } else {
      res.sendStatus(401);
  }
};