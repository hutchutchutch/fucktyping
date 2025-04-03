// Helper function to generate the LangGraph file content
type QuestionType = {
  id: string | number;
  text: string;
  type: string;
  required: boolean;
  order: number;
  options: string[] | null;
};
export const generateGraphFileContent = (
  formName: string,
  formDescription: string,
  variables: string[],
  questions: QuestionType[],
  voiceType: string
) => {
  const formattedQuestions = questions.length
    ? questions.map((q, idx) => q.text || `Please answer question ${idx + 1}:`)
    : ["Please answer the first question:"];
    const getValidatorCode = (q: QuestionType, idx: number) => {
      const key = `question${idx + 1}`;
      const base = `lastUserMessage`; // using this as a reference for the last user message
      const questionKey = key;
  
      switch (q.type) {
        case "number":
          return `
            const isValid = !isNaN(Number(${base}));
            return new Command({
              update: { questionResponses: { ${questionKey}: ${base} } },
              goto: isValid ? Command.PARENT : "rephraser${idx + 1}",
              graph: isValid ? Command.PARENT : undefined,
            });
          `;
        case "choice":
          const optionsList:any = JSON.stringify(q.options ?? []);
          const validOptions = optionsList.map((o:string) => o.toLowerCase());
          return `
            const isValid = ${validOptions}.includes(${base.toLowerCase()});
            return new Command({
              update: { questionResponses: { ${questionKey}: ${base} } },
              goto: isValid ? Command.PARENT : "rephraser${idx + 1}",
              graph: isValid ? Command.PARENT : undefined,
            });
          `;
        case "text":
        default:
          return `
            const isValid = ${base}.trim().length > 0;
            return new Command({
              update: { questionResponses: { ${questionKey}: ${base} } },
              goto: isValid ? Command.PARENT : "rephraser${idx + 1}",
              graph: isValid ? Command.PARENT : undefined,
            });
          `;
      }
    };
  
  const questionSubgraphs = formattedQuestions.map((question, idx: number) => {
    return `
    const questioner${idx + 1} = async (state:StateType) => {
      return new Command({
        update: pushMessage(state, "assistant", "${question}"),
        goto: "validator${idx + 1}",
      });
    };
    const validator${idx + 1} = async (state:StateType) => { 
      const lastUserMessage = state.messages
      .slice()
      .reverse()
      .find((m: { role: string }) => m.role === "user")?.content || ""; 
      ${getValidatorCode(questions[idx], idx)} };;

    const rephraser${idx + 1} = async (state:StateType) => {
      return new Command({
        update: pushMessage(state, "assistant", "I didn't understand that. Could you please rephrase your answer to question ${idx + 1}?"),
        goto: "validator${idx + 1}",
      });
    };

    const question${idx + 1}Subgraph = new StateGraph(State)
      .addNode("questioner${idx + 1}", questioner${idx + 1})
      .addNode("validator${idx + 1}", validator${idx + 1}, { ends: ["rephraser${idx + 1}"] })
      .addNode("rephraser${idx + 1}", rephraser${idx + 1})
      .addEdge(START, "questioner${idx + 1}")
      .addEdge("questioner${idx + 1}", "validator${idx + 1}")
      .addEdge("validator${idx + 1}", "rephraser${idx + 1}")
      .addEdge("rephraser${idx + 1}", "validator${idx + 1}")
      .compile();
    `;
  }).join("\n");

  return `// Auto-generated LangGraph for ${formDescription}
import {
  StateGraph,
  Annotation,
  Command,
  START,
  END
} from "@langchain/langgraph";
import { ChatOpenAI } from "@langchain/openai";

type QuestionType = {
  id: string | number;
  text: string;
  type: string;
  required: boolean;
  order: number;
  options: string[] | null;
};

type StateType = {
  questionResponses: Record<string, string>;
  messages: any[];
};


const llm = new ChatOpenAI({ temperature: 0.7 });
const State = Annotation.Root({
  questionResponses: Annotation<Record<string, string>>({
    reducer: (prev = {}, update = {}) => ({ ...prev, ...update }),
    default: () => ({}),
  }),
  messages: Annotation<any[]>({
    reducer: (x = [], y = []) => x.concat(y),
    default: () => [],
  }),
});


const pushMessage = (state:StateType, role: string, content: string) => ({
  messages: state.messages.concat([{ role, content }]),
});

const startNode = async (state:StateType) => {
  return new Command({
    update: pushMessage(state, "assistant", "${formDescription}"),
    goto: "question1_subgraph",
  });
};

${questionSubgraphs}

const closer = async (state:StateType) => {
  return new Command({
    update: pushMessage(state, "assistant", "Thank you for completing the form. We will process your responses shortly."),
  });
};

const builder = new StateGraph(State)
  .addNode("start", startNode, { ends: ["question1_subgraph"] })
  ${formattedQuestions.map((_, idx) => `.addNode("question${idx + 1}_subgraph", question${idx + 1}Subgraph, { ends: ["${idx + 2 <= formattedQuestions.length ? `question${idx + 2}_subgraph` : "closer"}"] })`).join("\n  ")}
  .addNode("closer", closer)
  .addEdge(START, "start")
  ${formattedQuestions.map((_, idx) => `.addEdge("question${idx + 1}_subgraph", "${idx + 2 <= formattedQuestions.length ? `question${idx + 2}_subgraph` : "closer"}")`).join("\n  ")}
  .addEdge("closer", END);

export const graph = builder.compile();`;
};



// Example function to trigger download of the file
export const downloadGraphFile = (
  formName: string,
  formDescription: string,
  variables: string[],
  questions: QuestionType[],
  voiceType: string,
) => {
  const fileContent = generateGraphFileContent(
    formName,
    formDescription,
    variables,
    questions,
    voiceType,
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