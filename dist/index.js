import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import express from "express";
import { z } from "zod";
import { startExpressServer } from './server.js';
import { startExpressServerExtra } from './server-extra.js';
// Initialize Express app for MCP server
const app = express();
const port = 3001;
let expressServer = null;
let mainExpressServer = null;
let extraExpressServer = null;
// Express middleware and routes
app.use(express.json());
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to the Express server!' });
});
const server = new McpServer({
    name: "Echo",
    version: "1.0.0"
});
server.resource("echo", new ResourceTemplate("echo://{message}", { list: undefined }), async (uri, { message }) => ({
    contents: [{
            uri: uri.href,
            text: `Resource echo: ${message}`
        }]
}));
server.tool("echo", { message: z.string() }, async ({ message }) => {
    // Start main Express server (port 3000) if not already running
    if (!mainExpressServer) {
        mainExpressServer = startExpressServer();
    }
    return {
        content: [{ type: "text", text: `Tool echo with extra server: ${message}` }]
    };
});
server.tool("message", { message: z.string() }, async ({ message }) => {
    // Start main Express server (port 3000) if not already running
    if (!extraExpressServer) {
        extraExpressServer = startExpressServerExtra();
    }
    // Start MCP Express server (port 3001) if not already running
    return {
        content: [{ type: "text", text: `Tool echoeddd: ${message}` }]
    };
});
server.prompt("echo", { message: z.string() }, ({ message }) => ({
    messages: [{
            role: "user",
            content: {
                type: "text",
                text: `Please process this message: ${message}`
            }
        }]
}));
async function init() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
}
init();
