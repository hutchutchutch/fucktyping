// Helper function to generate the LangGraph file content
type QuestionType = {
  id: string | number;
  text: string;
  type: string;
  required: boolean;
  order: number;
  options: string[] | null;
  context?: string;
};
export const generateGraphFileContent = (
  formName: string,
  formDescription: string,
  variables: string[],
  questions: QuestionType[],
  voiceType: string,
  openingMessage:string,
  closingMessage:string,
) => {

  return `// Auto-generated LangGraph for ${formName}
import * as fs from 'fs';
import {
  StateGraph,
  Annotation,
  Command,
  START,
  END
} from "@langchain/langgraph";
import { ChatOpenAI } from "@langchain/openai";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";
import * as readline from "readline";
import 'dotenv/config'

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  
  function getUserInput(prompt: string): Promise<string> {
    return new Promise((resolve) => {
      rl.question(prompt + "\\n> ", (answer) => {
        resolve(answer.trim());
      });
    });
  }

  
  type StateType = {
    questions: Record<string, string>;
    messages: any[];
  };
  
  function createOpenAIChat({
    modelName,
    openaiApiKey = process.env.OPENAI_API_KEY,
    ...kwargs
  }: any) {
    if (!openaiApiKey) {
      throw new Error("API key is required");
    }
  
    return new ChatOpenAI({
      modelName,
      openAIApiKey: openaiApiKey,
    });
  }
  
  const llm = createOpenAIChat({ modelName: "gpt-4o-mini-2024-07-18" });
const State = Annotation.Root({
  questions: Annotation<Record<string, string>>({
    reducer: (prev = {}, update = {}) => ({ ...prev, ...update }),
    default: () => ({}),
  }),
  messages: Annotation<any[]>({
    reducer: (x = [], y = []) => x.concat(y),
    default: () => [],
  }),
});

const pushMessage = (state: StateType, role: string, content: string,questionText: string) => {
  console.log(\`\${questionText} \${content}\`);
  const newMessage = { role, content };
  return { messages: state.messages.concat([newMessage]) };
};

const startNode = async (state:StateType) => {
  return new Command({
    update: pushMessage(state, "assistant", "${openingMessage}",'openActivity:'),
    goto: "question1_subgraph",
  });
};

const createQuestionNodes = (id: string, prompt: string) => {
  const questioner = async (state: StateType) => {
    const messages = [
      new SystemMessage("You are helping guide a user through a form. Use the context to naturally lead into the question."),
      new HumanMessage(prompt),
    ];
    const response = await llm.invoke(messages);
    const content = response?.content.toString() || "";
    return new Command({
      update: pushMessage(state, "assistant", content,\`question \${id} :\`),
      goto: \`validator\${id}\`,
    });
  };

  const validator = async (state: StateType) => {
    const lastMsg = state.messages.slice().reverse().find((m) => m.role === "assistant")?.content || "";
    const userInput = await getUserInput('');

    const messages = [
      new SystemMessage("You are a form assistant validating user responses. If the input is vague, off-topic, or empty, respond 'no'. Otherwise, respond 'yes'. Reply with only 'yes' or 'no'."),
      new HumanMessage(\`Question: \${lastMsg}\\nAnswer: \${userInput}\`),
    ];

    const validationResponse = await llm.invoke(messages);
    const isValid = validationResponse?.content.toString()?.toLowerCase().includes("yes");
    if (!isValid) {
      pushMessage(state, "assistant", "Your answer seems invalid. Please provide a more clear or relevant response.", \`question \${id} :\`);
    }    
    return new Command({
      update: {
        messages: state.messages.concat([{ role: "user", content: userInput }]),
        questions: isValid ? { [\`question\${id}\`]: userInput } : {},
      },
      goto: isValid ? Command.PARENT : \`rephraser\${id}\`,
      graph: isValid ? Command.PARENT : undefined,
    });
  };

  const rephraser = async (state: StateType) => {
    const messages = [
      new SystemMessage("The user gave an invalid answer. Rephrase the question in a helpful and clear way using the context."),
      new HumanMessage(prompt),
    ];
    const response = await llm.invoke(messages);
    const content = response?.content.toString() || "";
    return new Command({
      update: pushMessage(state, "assistant", content, \`question \${id} :\`),
      goto: \`validator\${id}\`,
    });
  };

  return new StateGraph(State)
    .addNode(\`questioner\${id}\`, questioner)
    .addNode(\`validator\${id}\`, validator, { ends: [\`rephraser\${id}\`] })
    .addNode(\`rephraser\${id}\`, rephraser)
    .addEdge(START, \`questioner\${id}\`)
    .addEdge(\`questioner\${id}\`, \`validator\${id}\`)
    .addEdge(\`validator\${id}\`, \`rephraser\${id}\`)
    .addEdge(\`rephraser\${id}\`, \`validator\${id}\`)
    .compile();
};

${questions?.map((question, index) => {
  return `const question${index + 1}_Subgraph = createQuestionNodes("${index + 1}", \`${question?.context?.replace(/`/g, '\\`')}\\n${question?.text?.replace(/`/g, '\\`')}\`);`;
}).join('\n')}



const closer = async (state:StateType) => {
const questionTexts = [${questions.map(q => `\`${q.text ? q.text.replace(/`/g, '\\`') : ''}\``).join(", ")}];
  const responsesArray = Object.entries(state.questions).map(([key, answer]) => {
    const idx = parseInt(key.replace("question", ""), 10) - 1;
    const question = questionTexts[idx] || "Unknown Question";

    return { question, answer };
  });

  const compiledResponses = {
    responses: responsesArray,
    timestamp: new Date().toISOString(),
  };

  const fileName = '${formName.replace(/\s+/g, '_').toLowerCase()}_responses.json';
  fs.writeFileSync(fileName, JSON.stringify(compiledResponses, null, 2));

  rl.close();

  return new Command({
    update: pushMessage(state, "assistant", "${closingMessage}",'closeActivity: '),
  });
};

const builder = new StateGraph(State)
  .addNode("start", startNode, { ends: ["question1_Subgraph"] })
  ${questions.map((_, idx) => {
    const curr = `question${idx + 1}_Subgraph`;
    const next = idx < questions.length - 1 ? `question${idx + 2}_Subgraph` : 'closer';
    return `.addNode("${curr}", ${curr}, { ends: ["${next}"] })`;
  }).join('\n  ')}
  .addNode("closer", closer)
  .addEdge(START, "start")
  .addEdge("start", "question1_Subgraph")
  ${questions.map((_, idx) => {
    const curr = `question${idx + 1}_Subgraph`;
    const next = idx < questions.length - 1 ? `question${idx + 2}_Subgraph` : 'closer';
    return `.addEdge("${curr}", "${next}")`;
  }).join('\n  ')}
  .addEdge("closer", END);


export const graph = builder.compile();

async function runGraph() {
  let state = { questions: {}, messages: [] };
  await graph.invoke(state);
}
runGraph().catch(console.error);
`;
};



// Example function to trigger download of the file
export const downloadGraphFile = (
  formName: string,
  formDescription: string,
  variables: string[],
  questions: QuestionType[],
  voiceType: string,
  openingMessage:string,
  closingMessage:string,
) => {
  const fileContent = generateGraphFileContent(
    formName,
    formDescription,
    variables,
    questions,
    voiceType,
    openingMessage,
    closingMessage,
  );
  const blob = new Blob([fileContent], { type: "text/javascript" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  // Ensure formName is defined in this scope
  link.download = `${formName.replace(/\s+/g, "_").toLowerCase()}_graph.ts`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  // Clean up the object URL
  URL.revokeObjectURL(url);
};