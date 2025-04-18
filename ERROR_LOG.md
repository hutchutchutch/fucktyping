## "ReferenceError: process is not defined" error
The issue was in the api.ts file where it was using process.env.VITE_API_URL instead of import.meta.env.VITE_API_URL. In Vite, environment variables are accessed using import.meta.env instead of process.env.

Let's summarize what we did to fix the issue:

We identified that the app was not loading due to a "ReferenceError: process is not defined" error.
We found that the api.ts file was using process.env.VITE_API_URL which is not available in the browser environment.
We fixed the issue by changing process.env.VITE_API_URL to import.meta.env.VITE_API_URL in the api.ts file.