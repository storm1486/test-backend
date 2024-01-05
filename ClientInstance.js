import { ComposeClient } from "@composedb/client";
import QuestionFormComposite from "./runtime-composite.json" assert { type: "json" };
import { CeramicClient } from "@ceramicnetwork/http-client";
import { DID } from "dids";
import { Ed25519Provider } from "key-did-provider-ed25519";
import { getResolver } from "key-did-resolver";
import crypto from "crypto";

function generateSeed(length = 32) {
  return crypto.randomBytes(length);
}

const seed = generateSeed(); // This will be a 32-byte (256-bit) secure random seed
console.log("seed:", seed);

async function authenticateCeramic(seed) {
  const ceramic = new CeramicClient("http://localhost:7007");

  const provider = new Ed25519Provider(seed);
  const did = new DID({ provider, resolver: getResolver() });
  await did.authenticate();

  ceramic.did = did;

  return ceramic;
}

const modelDefinition = QuestionFormComposite;
let compose;

async function createQuestionForm(inputData, ceramic) {
  compose = new ComposeClient({
    ceramic: ceramic,
    definition: modelDefinition,
  });

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
    console.log("response:", response.data);
  } catch (error) {
    console.error("Error executing mutation:", error);
  }
}

async function getInfo() {
  if (!compose) {
    console.error("ComposeClient not initialized");
    return;
  }
  const info = await compose.executeQuery(`
    query {
      questionFormIndex(last:1){
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
  console.log("info:", info.data.questionFormIndex.edges);
}
getInfo();

authenticateCeramic(seed).then((ceramic) => {
  const exampleInput = {
    type: "Other Type",
    question: "Who is that?",
    user_answer: "Give me an answer",
  };

  createQuestionForm(exampleInput, ceramic).then(() => {
    getInfo();
  });
});
