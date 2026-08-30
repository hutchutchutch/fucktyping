import app from "./app";

// Durable Object classes must be exported from the Worker entrypoint.
export { FormSessionDO } from "./do/FormSessionDO";
export { FormAuthoringDO } from "./do/FormAuthoringDO";

export default app;
