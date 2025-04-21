import { StateGraph, MessagesAnnotation, START, END } from "@langchain/langgraph";
import { ChatOpenAI } from "@langchain/openai";
import {
  BaseMessage,
  SystemMessage,
  HumanMessage,
  AIMessage,
} from "@langchain/core/messages";
import { clippyPrompt } from "@shared/prompt";

/** ----------------------------------------------------------------
 *  State definition
 * ----------------------------------------------------------------*/
const State = MessagesAnnotation;

/** ----------------------------------------------------------------
 *  LLM instance (gpt‑4o with light creativity)
 * ----------------------------------------------------------------*/
const llm = new ChatOpenAI({
  modelName: "gpt-4o",
  temperature: 0.2,
});

/** ----------------------------------------------------------------
 *  Graph node: generates / continues the Clippy response.
 *  ‑ Accepts previous messages from state (if any)
 *  ‑ Falls back to a single SystemMessage with the clippyPrompt
 *  ‑ Invokes the LLM and returns the updated message array
 * ----------------------------------------------------------------*/
const clippyNode = async (
  state: { messages: BaseMessage[] }
): Promise<{ messages: BaseMessage[] }> => {
  const messages: BaseMessage[] = state.messages.length
    ? state.messages
    : [new SystemMessage(clippyPrompt)];

  const response = await llm.invoke(messages);

  return {
    messages: [...messages, response],
  };
};

/** ----------------------------------------------------------------
 *  Compile the LangGraph
 * ----------------------------------------------------------------*/
export const clippyGraph = new StateGraph(State)
  .addNode("clippy", clippyNode)  // register node
  .addEdge(START, "clippy")       // START → clippy
  .addEdge("clippy", END)         // clippy → END
  .compile();
