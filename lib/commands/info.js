var Clapp = require('../modules/clapp-discord');
var cwl_lib = require('../cwl.js');
var cfg     = require('../../config.js');

var cwl = new cwl_lib();

module.exports = new Clapp.Command({
    name: "info",
    desc: "/cwl info (clan name)",
    fn: (argv, context) => {
        clan_name = context.text.match(/\/cwl info (.*)/)[1];
        console.log('Got command: info, ', clan_name);
        info = cwl.get_info(clan_name, (err, data) => {
             context.msg.reply(data).then((bot_response) => {
                  bot_response.delete(cfg.deleteAfterReply.time).then(msg => console.log(`Deleted message from ${msg.author}`)).catch(console.log);
             }).catch(console.log);
        });
    }
});
