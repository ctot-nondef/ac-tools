![Test & Deploy](https://github.com/ctot-nondef/ac-tools/actions/workflows/testandpublish.yml/badge.svg) [![codecov](https://codecov.io/gh/ctot-nondef/ac-tools/branch/master/graph/badge.svg?token=SY1X0ZURBY)](https://codecov.io/gh/ctot-nondef/ac-tools) [![npm version](https://badge.fury.io/js/@nondef%2Fac-tools.svg)](https://badge.fury.io/js/@nondef%2Fac-tools)

# Axiell Data Tools

This small library was built to parse and modify [Adlib tagged](https://documentation.axiell.com/alm/en/ds_eiefadlibtagged.html) files for
import into Axiell applications through the [Axiell Designer](http://documentation.axiell.com/ALM/EN/index.html?ds_designer.html)

It is provided as is, and in no way endorsed or maintained by Axiell ALM

# Usage
Sample workflow to import a folder of CSVs and render them as a tagged Adlib file. 
```javascript
const actools = require("@nondef/ac-tools")
const fs = require('fs');

const dataFolder = './datain/';
const import_set = new actools.AdlibRecordSet("importset")

fs.readdirSync(dataFolder).forEach(file => {
    //loads the CSV as a set using the first row for column heading
    import_set.loadSetFromCSV(`${dataFolder}${file}`, null, ";");
});

import_set.set.forEach((rec) => {
  //some record manipulations
})


fs.writeFileSync("./dataout/importset.dat", import_set.jsonToAdlibDat(["IN", "bt"]))
```

For details see the [documentation](https://ctot-nondef.github.io/ac-tools/index.html)


# Building

```bash
npm install     # Installs dependencies for building the project
npm build     # builds to ./lib
npm doccument # builds the documentation to /docs
```
