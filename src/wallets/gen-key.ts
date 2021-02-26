import { ec as EC } from 'elliptic'
const ec = new EC('ed25519')

export const genKeyPair = (): { priv: string, pub: string} => {
  const keyPair = ec.genKeyPair();
  const priv = keyPair.getPrivate().toString(16)
  const pub = keyPair.getPublic().encode('hex',false)
  return { priv, pub }
};