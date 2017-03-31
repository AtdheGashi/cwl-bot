var cwl_lib = require('./lib/cwl.js');

var cwl = new cwl_lib();

//cwl.gen_sheets();


cwl.get_info('WHF', (err, data) => {
    console.log(data);
});
