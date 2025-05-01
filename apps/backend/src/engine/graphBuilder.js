// graphBuilder.js
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
import { StateSchema } from './state.js';

/**
 * Builds a conversation flow graph for form completion
 * @param {Object} formConfig - The form configuration
 * @param {Object} initialState - Initial state for the graph
 * @returns {StateGraph} The constructed graph
 */
const buildGraph = function(formConfig) {
  // Create an instance of the LLM
  const llm = new ChatGroq({
    modelName: "llama3-70b-8192",
    apiKey: process.env.GROQ_API_KEY,
  });
  
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

// Export as default for module compatibility
export default { buildGraph };