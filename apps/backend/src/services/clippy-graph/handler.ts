import { clippyGraph } from "./agent";

// Express-style handler
export const clippyHandler = async (req, res) => {
  const { messages } = req.body; // [{role, content}, ...]
  try {
    const result = await clippyGraph.invoke({ messages });
    res.json({ response: result.messages[result.messages.length - 1] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 