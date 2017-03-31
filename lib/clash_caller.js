var request = require('request');
var low = require('lowdb');
const db = new low('db.json');

db.defaults({bots: []})
  .write();

function clash_caller(){}

clash_caller.prototype.get_info = (channel_id, server_id) => {
    var channel_id_ = channel_id;
    var server_id_ = server_id;

    check_ = db.get('bots').find({
        channel_id: channel_id,
        server_id: server_id
    });
    if(typeof check_ == 'undefined'){
        db.set('bots', [{channel_id: channel_id, server_id: server_id}]).write();
    }
}

clash_caller.prototype.set_warid = (war_id) => {
    this.war_id = war_id;
}
clash_caller.prototype.call_target = (num, name) => {
    console.log(this.war_id, num, name);
}

module.exports = clash_caller;
