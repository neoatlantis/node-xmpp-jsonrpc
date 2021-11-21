const { XMPPRPCClient } = require("./node-xmpp-jsonrpc");
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const xmpprpc = new XMPPRPCClient({
    service:  "xmpp://localhost",
    username: "client",
    password: "testpassword",
    resource: "xmpprpc",
    peer: "server@localhost/xmpprpc",
});

xmpprpc.client.on("online", async function (){

    console.log("online");
    xmpprpc.request("echo", { text: "hello" }).then(console.log);
    xmpprpc.request("echo2", { text: "hello" }).then(console.log);

});

xmpprpc.client.on("stanza", (e)=>console.log(e.toString()));

