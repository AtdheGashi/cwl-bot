var Clapp = require('../modules/clapp-discord');
var cwl_lib = require('../cwl.js');

var cwl = new cwl_lib();

module.exports = new Clapp.Command({
    name: "info",
    desc: "info about a CWL clan",
    fn: (argv, context) => {
        clan_name = context.text.match(/\/cwl info (.*)/)[1];
        info = cwl.get_info(clan_name, (err, data) => {
             context.msg.reply(data);
        });
    }
});
