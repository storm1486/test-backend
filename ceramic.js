import { ComposeClient } from "@composedb/client";
import Composite from "./runtime-composite.json";
import { CeramicClient } from "@ceramicnetwork/http-client";
import { DID } from "dids";
import { Ed25519Provider } from "key-did-provider-ed25519";
import { getResolver } from "key-did-resolver";
import CryptoJS from "crypto-js";

export function generateSeed(length = 32) {
  // crypto-js might return the seed in hexadecimal format which you need to convert
  const seedHex = CryptoJS.lib.WordArray.random(length).toString();
  // Convert hex to Uint8Array
  const seed = new Uint8Array(
    seedHex.match(/.{1,2}/g).map((byte) => parseInt(byte, 16))
  );
  return seed;
}
export async function authenticateCeramic(seed) {
  const ceramic = new CeramicClient("http://localhost:7007");

  const provider = new Ed25519Provider(seed);
  const did = new DID({ provider, resolver: getResolver() });
  await did.authenticate();

  ceramic.did = did;
  compose = new ComposeClient({
    ceramic: ceramic,
    definition: Composite,
  });
  
  compose.setDID(ceramic.did);
  return ceramic;
}

let compose;

export async function createQuestionForm(inputData) {
  const mutation = `
  mutation {
    createQuestionForm(input: {
      content: {
        type: "${inputData.type}"
        question: "${inputData.question}"
        user_answer: "${inputData.user_answer}"
      }
    })
    {
      document{
        id
        type
        question
        user_answer
      }
    }
  }
  `;

  try {
    const response = await compose.executeQuery(mutation);
    return response;
  } catch (error) {
    console.error("Error executing mutation:", error);
  }
}

export async function getInfo() {
  const info = await compose.executeQuery(`
    query {
      questionFormIndex(last:3){
        edges{
          node{
            id
            type
            question
            user_answer
          }
        }
      }
    }
    `);
  return info;
}

export async function updateInfo(selectedId, inputData) {
  const update = await compose.executeQuery(`
  mutation {
    updateQuestionForm(input:{
      id: "${selectedId}"
      content: {
        type: "${inputData.type}"
        question: "${inputData.question}"
        user_answer: "${inputData.user_answer}"
      }
    })
    {
      document {
        id
        type
        question
        user_answer
      }
    }
  }
  `);
  return update;
}
