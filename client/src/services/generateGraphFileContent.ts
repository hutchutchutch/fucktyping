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

  const questionSubgraphs = formattedQuestions.map((question, idx) => {
    return `
    const questioner${idx + 1} = async (state) => {
      return new Command({
        update: pushMessage(state, "assistant", "${question}"),
        goto: "validator${idx + 1}",
      });
    };

    const validator${idx + 1} = async (state) => {
      const lastUserMessage = state.messages.findLast((m) => m.role === "user")?.content || "";
      const valid = lastUserMessage.length > 0;
      return new Command({
        update: {
          question${idx + 1}Response: lastUserMessage,
        },
        goto: valid ? Command.PARENT : "rephraser${idx + 1}",
        graph: valid ? Command.PARENT : undefined,
      });
    };

    const rephraser${idx + 1} = async (state) => {
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

const llm = new ChatOpenAI({ temperature: 0.7 });

const State = Annotation.Root({
  ${formattedQuestions.map((_, idx) => `question${idx + 1}Response: Annotation.String(),`).join("\n  ")}
  messages: Annotation<any[]>({
    reducer: (x = [], y = []) => x.concat(y),
    default: () => [],
  }),
});

const pushMessage = (state, role, content) => ({
  messages: state.messages.concat([{ role, content }]),
});

const startNode = async (state) => {
  return new Command({
    update: pushMessage(state, "assistant", "${formDescription}"),
    goto: "question1_subgraph",
  });
};

${questionSubgraphs}

const closer = async (state) => {
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
  link.download = `${formName.replace(/\s+/g, "_").toLowerCase()}_graph.js`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  // Clean up the object URL
  URL.revokeObjectURL(url);
};