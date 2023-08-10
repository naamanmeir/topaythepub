const db = require('../../db.js');
const clientEvents = require('./../../routes/router_client_events');

async function removeSystemPosts(){    
    let dbResponse = await db.dbDeletePostByUsername(77);
    sendRefreshPostsEventToAllClients();
    return; 
};

function sendRefreshPostsEventToAllClients(){
    clientEvents.sendEvents("reloadPosts");
    return;
};

removeSystemPosts();