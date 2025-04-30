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
let dynamicReplacementValues = ["user", "user@test.com"];
let variables:string[] = ${JSON.stringify(variables, null, 2)};
let questionsData = ${JSON.stringify(questions, null, 2)};
let openingMessage = "${openingMessage}"
let closingMessage = "${closingMessage}"

function replaceStringsInData(data: any, variables: string[], replacementValues: string[]): any {
  if (Array.isArray(data)) {
    return data.map(item => 
      (typeof item === 'string' ? replaceStringInText(item, variables, replacementValues) : replaceStringsInData(item, variables, replacementValues))
    );
  } else if (typeof data === 'object' && data !== null) {
    const updatedData: Record<string, any> = {};
    for (const key in data) {
      updatedData[key] = replaceStringsInData(data[key], variables, replacementValues);
    }
    return updatedData;
  } else if (typeof data === 'string') {
    return replaceStringInText(data, variables, replacementValues);
  }
  return data;
}

function replaceStringInText(text: string, variables: string[], replacementValues: string[]): string {
  let updatedText = text;
  variables.forEach((variable, index) => {
    const regex = new RegExp(\`\\\\\${variable}\`, "g");
    if (regex.test(updatedText)) {
      updatedText = updatedText.replace(regex, replacementValues[index]);
    }
  });
  return updatedText;
}

questionsData = replaceStringsInData(questionsData, variables, dynamicReplacementValues);
openingMessage = replaceStringsInData(openingMessage, variables, dynamicReplacementValues);
closingMessage = replaceStringsInData(closingMessage, variables, dynamicReplacementValues);


type QuestionType = {
  id: string | number;
  text: string;
  type: string;
  required: boolean;
  order: number;
  options: string[] | null;
  context?: string;
  validation?: {
    min: number;
    max: number;
  };
};

  function generateValidationPrompt(question: QuestionType): string {
    let validationPrompt = '';
  
    switch (question.type) {
      case "multiple_choice":
        if (question.options?.length) {
          validationPrompt += \`This is a multiple choice question. The user may select one or more of the following options: \${question.options.join(", ")}\n\`;
        }
        break;
  
      case "dropdown":
        if (question.options?.length) {
          validationPrompt += \`This is a dropdown question. The user may select one option from: \${question.options.join(", ")}\n\`;
        }
        break;
  
      case "yes_no":
        validationPrompt += \`Please note, this is a yes or no question.\n\`;
        break;
  
      case "text":
        validationPrompt += \`This is a text-based question. Please provide a text answer.\n\`;
        break;
  
      case "rating":
        validationPrompt += \`This is a rating question. Please provide a rating between \${question?.validation?.min} and \${question?.validation?.max}.\n\`;
        break;
  
      case "date":
        validationPrompt += \`This is a date-based question. Please ensure the response is a valid date in the format YYYY-MM-DD (for example, 2025-04-05).\n\`;
        validationPrompt += \`If the response is not a valid date or not in the correct format, ask the user to provide the date again using the YYYY-MM-DD format.\n\`;
        validationPrompt += \`Only accept answers that clearly represent a valid calendar date.\n\`;
        break;
  
      default:
        validationPrompt += \`This is a text-based question. Please provide a text answer.\n\`;
        break;
    }
  
    return validationPrompt;
  }

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
    history: Record<string, Array<{ answer: string, isCorrect: boolean, question: string }>>;
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
  history: Annotation<Record<string, Array<{ answer: string, isCorrect: boolean, question: string }>>>({
    reducer: (prev = {}, update = {}) => ({ ...prev, ...update }),
    default: () => ({}),
  }),
  messages: Annotation<any[]>({
    reducer: (x = [], y = []) => {
      return Array.isArray(x) && Array.isArray(y) ? x.concat(y) : x;
    },
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
    update: pushMessage(state, "assistant", openingMessage,'openActivity:'),
    goto: "question1_subgraph",
  });
};

const createQuestionNodes = (id: string, question: QuestionType) => {
  const questioner = async (state: StateType) => {
    let validationPrompt = "You are validating a user's answer to a form question";
    validationPrompt += generateValidationPrompt(question);
    validationPrompt += \`Context: \${question.context || "N/A"}\n\`;
    validationPrompt += \`Question: \${question.text}\n\`;
    const messages = [
      new SystemMessage("You are helping guide a user through a form. Use the context to naturally lead into the question."),
      new HumanMessage(validationPrompt),
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
    let validationPrompt = \`You are validating a user's answer to a form question.\n\`;
    validationPrompt += \`\${lastMsg}\n\`;
    validationPrompt += \`Answer: \${userInput}\n\`;
    validationPrompt += \`\nIs this a valid response? Respond ONLY with "yes" or "no".\`;

    const messages = [
      new SystemMessage("You are a form assistant validating user responses. If the input is vague, off-topic, or empty, respond 'no'. Otherwise, respond 'yes'. Reply with only 'yes' or 'no'."),
      new HumanMessage(validationPrompt),
    ];

    const validationResponse = await llm.invoke(messages);
    const isValid = validationResponse?.content.toString()?.toLowerCase().includes("yes");

    const questionKey = \`question\${id}\`;
    const newHistory = (state.history[questionKey] || []).concat([
      { answer: userInput, isCorrect: isValid, question: lastMsg },
    ]);

    const updates: Partial<StateType> = {
      messages: state.messages.concat([{ role: "user", content: userInput }]),
      history: { [questionKey]: newHistory },
    };
    if (isValid) {
      updates.questions = { [\`question\${id}\`]: userInput };
    } else {
      console.log(
        \`question \${id} : Your answer seems invalid. Please provide a more clear or relevant response.\`
      );
      updates.messages = updates?.messages?.concat([
        {
          role: "assistant",
          content:
            "Your answer seems invalid. Please provide a more clear or relevant response.",
        },
      ]);
    }
    return new Command({
      update: updates,
      goto: isValid ? Command.PARENT : \`rephraser\${id}\`,
      graph: isValid ? Command.PARENT : undefined,
    });
  };

  const rephraser = async (state: StateType) => {
    let rephrasePrompt = \`The user gave an invalid answer.\n\`;
    rephrasePrompt += \`Rephrase the question to make it clearer.\n\`;
    rephrasePrompt += generateValidationPrompt(question);
         rephrasePrompt += \`Context: \${question.context || "N/A"}\n\`;
    rephrasePrompt += \`Original Question: \${question.text}\`;

    const messages = [
      new SystemMessage("The user gave an invalid answer. Rephrase the question in a helpful and clear way using the context."),
      new HumanMessage(rephrasePrompt),
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
  return `const question${index + 1}_Subgraph = createQuestionNodes("${index + 1}",questionsData[${index}]);`;
}).join('\n')}

const closer = async (state:StateType) => {
  const responsesArray = Object.entries(state.questions).map(([key, answer]) => {
    const idx = parseInt(key.replace("question", ""), 10) - 1;
    let questionData = questionsData[idx]
    const question = questionData.text || "Unknown Question";
    const context = questionData.context || "Context";
    const type = questionData.type || "text";
    let options = {};
    if (
      ["multiple_choice", "dropdown"].includes(questionData.type) &&
      questionData.options?.length
    ) {
      options = questionData.options;
    }
    const history = state.history[key] || [];
    return { question, context, type, answer, options, history };  });

  const compiledResponses = {
    responses: responsesArray,
    timestamp: new Date().toISOString(),
  };

  const fileName = '${formName.replace(/\s+/g, '_').toLowerCase()}_responses.json';
  fs.writeFileSync(fileName, JSON.stringify(compiledResponses, null, 2));

  rl.close();

  return new Command({
    update: pushMessage(state, "assistant", closingMessage,'closeActivity: '),
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
  let state = { questions: {},history: {}, messages: [] };
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