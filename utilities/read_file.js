const csvtojson = require('csvtojson')

async function read_file(path, list){
    var data = await csvtojson().fromFile(path);
    if(data.length > 0){
        let keys = Object.keys(data[0]).sort()
        if(JSON.stringify(keys) != JSON.stringify(list.sort()))
            return {
                status: false,
                message: "File is in invalid format!"
            }
        return {
            status: true,
            data: data
        }
    }
    else
        return {
            status: false,
            message: "File is empty!"
        }
}

module.exports = read_file