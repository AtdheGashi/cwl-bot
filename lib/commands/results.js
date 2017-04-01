var Clapp = require('../modules/clapp-discord');
var cwl_lib = require('../cwl.js');
var cfg     = require('../../config.js');

var cwl = new cwl_lib();

module.exports = new Clapp.Command({
    name: "results",
    desc: "/cwl results (premiere|invite|lite|rising) week #",
    fn: (argv, context) => {
        info_ = context.text.match(/\/cwl results (premiere|invite|lite|rising|p|i|l|r) week (\d+)/);
        console.log('Got command: results, ', info_[1], info_[2]);
        out = cwl.get_results(info_[1], info_[2]);
        return out;
    }
});
