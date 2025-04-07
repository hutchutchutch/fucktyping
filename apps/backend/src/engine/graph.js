// graph.js
import { StateGraph, START, END } from "@langchain/langgraph";
import { ChatGroq } from "@langchain/groq";
import { 
  createOpenActivityNode,
  createQuestionNode,
  createValidateResponseNode,
  createRephraseNode,
  createClosingActivityNode,
  createProcessUserInputNode
} from './nodes.js';
import { StateSchema, initializeState } from './state.js';

// Create the LLM instance
function createLLM() {
  return new ChatGroq({
    modelName: "llama3-70b-8192",
    apiKey: process.env.GROQ_API_KEY,
  });
}

// Main function to generate a LangGraph workflow from a form configuration
export function generateVoiceFormGraph(formConfig) {
  // Create an instance of the LLM
  const llm = createLLM();
  
  // Create a new StateGraph with our state schema
  const workflow = new StateGraph({
    stateSchema: StateSchema,
  });
  
  // Create nodes
  workflow.addNode("opening_activity", createOpenActivityNode(formConfig));
  workflow.addNode("question", createQuestionNode(formConfig));
  workflow.addNode("validate_response", createValidateResponseNode(formConfig, llm));
  workflow.addNode("rephrase_question", createRephraseNode(formConfig));
  workflow.addNode("closing_activity", createClosingActivityNode(formConfig));
  workflow.addNode("process_user_input", createProcessUserInputNode());
  
  // Define edges
  workflow.addEdge(START, "opening_activity");
  workflow.addEdge("opening_activity", "question");
  workflow.addEdge("question", "validate_response");
  workflow.addEdge("validate_response", "question");
  workflow.addEdge("validate_response", "rephrase_question");
  workflow.addEdge("validate_response", "closing_activity");
  workflow.addEdge("rephrase_question", "validate_response");
  workflow.addEdge("closing_activity", END);
  
  // Add conditional routing based on the current node ID
  workflow.addConditionalEdges(
    "process_user_input",
    (state) => state.currentNodeId,
    {
      "validate_response": "validate_response",
      "end": END
    }
  );
  
  // Compile the graph
  return workflow.compile();
}

// Function to run the voice form with user input
export async function runVoiceForm(formConfig, userInput = null) {
  // Generate the graph
  const graph = generateVoiceFormGraph(formConfig);
  
  // Initialize state
  const initialState = initializeState(formConfig);
  
  // Create the input for the graph
  const input = userInput ? { userInput } : {};
  
  // Run the graph
  return await graph.invoke({ state: initialState, ...input });
}

// Function to continue a conversation with additional user input
export async function continueConversation(formConfig, state, userInput) {
  // Generate the graph
  const graph = generateVoiceFormGraph(formConfig);
  
  // Process the user input first
  const processedState = await graph.getNode("process_user_input").invoke(state, { userInput });
  
  // Continue execution from the current state
  return await graph.invoke(processedState);
}