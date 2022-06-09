const express = require('express')
const bodyParser = require('body-parser')
const {WebhookClient} = require('dialogflow-fulfillment')
const { request } = require('http')
const { response } = require('express')

const app = express()
app.use(bodyParser.json())
const port = process.env.PORT || 3000

app.post("/dialogflow-fulfillment",(request,response)=>{
    dialogflowFulfillment(request,response)
})

app.listen(port,()=>{
    console.log(`Listening on post ${port}`)
})

const dialogflowFulfillment = (request,response) => {
    const agent = new WebhookClient({request,response})

    function a(){
        agent.add('Nguyên nhân của AIDS');
    }
    let intentMap = new Map();
    intentMap.set('getDataFromSQL', a);
    agent.handleRequest(intentMap);
}