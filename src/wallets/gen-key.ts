/* eslint-disable unicorn/prefer-module */
import { ec as EC } from "elliptic";
const ec = new EC("ed25519");
import fs from "node:fs";
import path from "node:path";

interface KeyPair {
  priv: string;
  pub: string;
}

export let nodeKeyPair: KeyPair;

const loadKeyPair = (name: string): KeyPair | undefined => {
  try {
    const pub = fs.readFileSync(
      path.join(__dirname, `./keys/${name}.pub`),
      "utf8"
    );
    const priv = fs.readFileSync(
      path.join(__dirname, `./keys/${name}`),
      "utf8"
    );

    return {
      pub,
      priv,
    };
  } catch {
    return undefined;
  }
};

const saveKeyPair = (name: string, keyPair: KeyPair) => {
  fs.writeFileSync(path.join(__dirname, `./keys/${name}.pub`), keyPair.pub);
  fs.writeFileSync(path.join(__dirname, `./keys/${name}`), keyPair.priv);
};

export const genKeyPair = (): { priv: string; pub: string } => {
  const keyPair = ec.genKeyPair();
  const priv = keyPair.getPrivate().toString(16);
  const pub = keyPair.getPublic().encode("hex", false);
  return { priv, pub };
};

export const getKeyForPort = (name: string) => {
  let keyPair = loadKeyPair(name);
  if (!keyPair) {
    keyPair = genKeyPair();
  }
  saveKeyPair(name, keyPair);

  nodeKeyPair = keyPair;

  return keyPair;
};
