import * as jwt from "jsonwebtoken";

export const secret = "123467.SOMESECRET.12486";

export const decodeJWT = async (token: string) => {
  let result = "";
  await jwt.verify(token, secret, (error: any, user: any) => {
    if (error) {
      console.log(error);
    } else {
      result = user;
    }
  });
  return result;
};

export const authenticateJWT = (request: any, response: any, next: any) => {
  const authHeader = request.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(" ")[1];
    jwt.verify(token, secret, (error: any, username: any) => {
      if (error) {
        return response.sendStatus(403);
      }
      request.username = username;
      next();
    });
  } else {
    response.sendStatus(401);
  }
};
