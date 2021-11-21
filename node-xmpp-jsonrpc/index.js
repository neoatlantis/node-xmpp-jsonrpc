const { client, xml } = require("@xmpp/client");
const events = require("events");
const { JSONRPCServer, JSONRPCClient, JSONRPCErrorResponse } =
    require("json-rpc-2.0");

const RPCNS = "http://neoatlantis.org/json-rpc";

const ERR_TIMEOUT = xml("error", { code: 504 }, xml("timeout")); 
const ERR_BADREQUEST = xml("error", { code: 400 }, xml("bad-request"));




class XMPPRPCServer extends JSONRPCServer {

    constructor (options){
        super();
        const self = this;

        this.client = client({
            service:  options.service,
            username: options.username,
            password: options.password,
            resource: options.resource,
        });
        this.timeout = options.timeout | 30000;

        this.client.iqCallee.set(RPCNS, "query", async (ctx)=>{
            const jid_from = ctx.from.toString();

            let jsonrpc = null;
            try{
                jsonrpc = JSON.parse(ctx.element.text());
            } catch(e){
                return ERR_BADREQUEST;
            }
            
            let jsonrpc_resp = await this.receive(jsonrpc, { userID: jid_from });
            let stanza_xml = xml(
                "query",
                { xmlns: RPCNS },
                JSON.stringify(jsonrpc_resp)
            );

            return stanza_xml;

        });

        this.client.start();
    }
}






class XMPPRPCClient extends JSONRPCClient {

    constructor (options){
        super(async function(jsonRPCRequest) {
            const result = await self.client.iqCaller.request(
                xml("iq", { type: "set", to: options.peer },
                    xml(
                        "query",
                        { xmlns: RPCNS },
                        JSON.stringify(jsonRPCRequest)
                    )
                )
            );

            try{
                const result_json = JSON.parse(result.children[0].text());
                self.receive(result_json);
            } catch(e){
            }
        });


        const self = this;

        this.client = client({
            service:  options.service,
            username: options.username,
            password: options.password,
            resource: options.resource,
        });

        // Create a custom error response
        const createTimeoutJSONRPCErrorResponse = (id) =>
            createJSONRPCErrorResponse(id, 504, "Request timeout.");

        this.timeout(
            options.timeout | 30000,
            createTimeoutJSONRPCErrorResponse
        );

        this.client.start();
    }

}












module.exports = { XMPPRPCServer, XMPPRPCClient };

