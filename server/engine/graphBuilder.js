import { StateGraph } from "@langchain/langgraph";
import { END, START } from "@langchain/langgraph";

// Import nodes
import openActivity from "./nodes/openActivity";
import questioner from "./nodes/questioner";
import validator from "./nodes/validator";
import rephrase from "./nodes/rephrase";
import closeActivity from "./nodes/closeActivity";
import followUp from "./nodes/followUp";

// Import conditionals
import shouldRephrase from "./conditionals/shouldRephrase";
import shouldContinue from "./conditionals/shouldContinue";
import needsFollowUp from "./conditionals/needsFollowUp";

// Import state schema
import { stateSchema } from "./stateSchema";

/**
 * Builds a conversation flow graph for form completion
 * @param {Object} initialState - Initial state for the graph
 * @returns {StateGraph} The constructed graph
 */
function buildGraph(initialState = {}) {
  // Create a new graph
  const builder = new StateGraph({
    channels: stateSchema,
    initialState
  });

  // Add nodes
  builder.addNode("openActivity", openActivity);
  builder.addNode("questioner", questioner);
  builder.addNode("validator", validator);
  builder.addNode("rephrase", rephrase);
  builder.addNode("followUp", followUp);
  builder.addNode("closeActivity", closeActivity);

  // Define the edges
  builder.addEdge(START, "openActivity");
  builder.addEdge("openActivity", "questioner");
  
  // Add conditional edges
  builder.addConditionalEdges(
    "questioner",
    shouldRephrase,
    {
      true: "rephrase",
      false: "validator"
    }
  );
  
  builder.addEdge("rephrase", "questioner");
  
  builder.addConditionalEdges(
    "validator",
    needsFollowUp,
    {
      true: "followUp",
      false: shouldContinue
    }
  );
  
  builder.addEdge("followUp", "questioner");
  
  builder.addConditionalEdges(
    shouldContinue,
    {
      true: "closeActivity",
      false: "questioner"
    }
  );
  
  builder.addEdge("closeActivity", END);

  // Compile the graph
  return builder.compile();
}

export default {
  buildGraph
};
