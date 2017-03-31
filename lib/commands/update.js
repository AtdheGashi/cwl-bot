var Clapp = require('../modules/clapp-discord');
var cwl_lib = require('../cwl.js');

var cwl = new cwl_lib();

module.exports = new Clapp.Command({
    name: "update",
    desc: "Refresh info from Google Sheets",
    fn: (argv, context) => {
        cwl.gen_sheets();
        return 'Fetching data from Google Sheets. Please check back in 5 minutes.';
    }
});
