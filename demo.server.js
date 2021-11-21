const {  xml } = require("@xmpp/client");
const { XMPPRPCServer } = require("./node-xmpp-rpc");
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const xmpprpc = new XMPPRPCServer({
    service:  "xmpp://localhost",
    username: "server",
    password: "testpassword",
    resource: "xmpprpc",
});

xmpprpc.client.on("stanza", (e)=>console.log(e.toString()));

xmpprpc.addMethod("echo", ({ text })=>text);
