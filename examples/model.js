import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage } from "@langchain/core/messages";
import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { RecipeSchema } from "../../schema/schema";
import { getRecipeGeneratorPrompt } from "../prompts/recipe-genrator"
import { ValidationResultSchema } from "../../schema/schema";
import { ShoppingListSchema } from "../../schema/schema";
import { getRecipeValidatorPrompt } from "../prompts/recipe-validator";
import { getRecipeEditorPrompt } from "../prompts/recipe-editor";
import { getShoppingListPrompt } from "../prompts/shopping-list";


export const recipeGenerator = async (state) => {
  try {
    console.log("Starting Recipe Generator");
    const model = new ChatOpenAI({
      openAIApiKey: process.env.OPENAI_API_KEY,
      modelName: "gpt-4o-mini",
    });

    const parser = StructuredOutputParser.fromZodSchema(RecipeSchema.array());

    const prompt = getRecipeGeneratorPrompt(state.userPreferences, parser);

    const response = await model.invoke([new HumanMessage(prompt)]);
    const content = response?.content;

    try {
      let cleanedContent = "";

      if (typeof response.content === "string") {
        cleanedContent = response.content
          .replace(/```(?:json)?|```/g, "")
          .trim();
      } else if (Array.isArray(response.content)) {
        cleanedContent = JSON.stringify(response.content);
      } else {
        cleanedContent = JSON.stringify(response.content);
      }

      const recipes = JSON.parse(cleanedContent);

      return { recipes };
    } catch (error) {
      console.error("Failed to generate recipes:", error);
      return { recipes: [] };
    }
  } catch (error) {
    console.error("Failed to generate recipes:", error);
    return { recipes: [] };
  }
};

// Recipe Validator Node
export const recipeValidator = async (state, config) => {
  try {
    console.log("Starting Recipe Validator");
    // Initialize LLM
    const model = new ChatOpenAI({
      openAIApiKey: process.env.OPENAI_API_KEY,
      modelName: "gpt-4o-mini",
    });

    const parser = StructuredOutputParser.fromZodSchema(
      ValidationResultSchema.array()
    );
    const prompt = getRecipeValidatorPrompt(state.userPreferences, state.recipes, parser);

    const response = await model.invoke([new HumanMessage(prompt)]);
    const content = response.content;
    try {
      let cleanedContent = "";

      if (typeof response.content === "string") {
        cleanedContent = response.content
          .replace(/```(?:json)?|```/g, "")
          .trim();
      } else if (Array.isArray(response.content)) {
        cleanedContent = JSON.stringify(response.content);
      } else {
        cleanedContent = JSON.stringify(response.content);
      }

      const validationRules = JSON.parse(cleanedContent);
      // SocketIOAdapter.emitEvent('recipe_validated', validationRules);

      state.validationRules = validationRules;

      console.log("Done with Recipe validator", validationRules);
      return { validationRules };
    } catch (error) {
      console.error("Error Cleaning content:", error);
      return { validationRules: [] };
    }
  } catch (error) {
    console.error("ERROR in RecipeValidator:", error);
  }
};

// Recipe Editor Node
export const recipeEditor = async (state, config) => {
  try {
    console.log("Starting Recipe Editor");
    const failedRules = state.validationRules?.[0]?.filter(
      (rule) => rule.status === "fail"
    );

    // Initialize LLM
    const model = new ChatOpenAI({
      openAIApiKey: process.env.OPENAI_API_KEY,
      modelName: "gpt-4o-mini",
    });

    const parser = StructuredOutputParser.fromZodSchema(RecipeSchema.array());

    const prompt = getRecipeEditorPrompt(state.recipes, failedRules, state.userPreferences, parser);

    const response = await model.invoke([new HumanMessage(prompt)]);
    try {
      let cleanedContent = "";

      if (typeof response.content === "string") {
        cleanedContent = response.content
          .replace(/```(?:json)?|```/g, "")
          .trim();
      } else if (Array.isArray(response.content)) {
        cleanedContent = JSON.stringify(response.content);
      } else {
        cleanedContent = JSON.stringify(response.content);
      }

      const editedRecipes = JSON.parse(cleanedContent);
      console.log("Done with Recipe Editor");
      // SocketIOAdapter.emitEvent('recipe_edited', editedRecipes);
      return { recipes: editedRecipes };
    } catch (error) {
      console.error("Error Cleaning content:", error);
      return { recipes: [] };
    }
  } catch (error) {
    console.log("ERROR in recipeEditor:", error);
  }
};

// Shopping List Generator Node
export const shoppingListGenerator = async (state, config) => {
  try {
    console.log("Starting Shopping List Generator");
    // Initialize LLM
    const model = new ChatOpenAI({
      openAIApiKey: process.env.OPENAI_API_KEY,
      modelName: "gpt-4o-mini",
    });

    const parser = StructuredOutputParser.fromZodSchema(
      ShoppingListSchema.array()
    );

    const prompt = getShoppingListPrompt(state.recipes ,parser);

    const response = await model.invoke([new HumanMessage(prompt)]);
    
    for await (const chunk of await llm.stream(input)) {
      console.log(chunk);
    }
    try {
      let cleanedContent = "";

      if (typeof response.content === "string") {
        cleanedContent = response.content
          .replace(/```(?:json)?|```/g, "")
          .trim();
      } else if (Array.isArray(response.content)) {
        cleanedContent = JSON.stringify(response.content);
      } else {
        cleanedContent = JSON.stringify(response.content);
      }

      const shoppingList = JSON.parse(cleanedContent);
      // SocketIOAdapter.emitEvent('recipe_validated', shoppingList);

      console.log("Done with Shopping List Generator");
      state.shoppingList = shoppingList;

      return { shoppingList };
    } catch (error) {
      console.error("Error Cleaning content:", error);
      return { shoppingList: [] };
    }
  } catch (error) {
    console.log("ERROR in shoppingListGenerator:", error);
  }
};
