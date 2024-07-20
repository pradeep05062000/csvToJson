const fs = require('fs');
const path = require('path');
const {addJsonData,getAllUserData} = require('../Services/csvToJsonSrv');

// This will generate non existing json object in the jsonObj
function createObject(str,value){
    return new Promise((resolve,reject) => {
        try {
            // create array of path
            let arr = str.split('.')
            let finalObj={};
            // Reverse the arr and loop through it
            // here the object created from opposite direction
            for (const [index,key] of arr.reverse().entries()) {
                let tempObj = {}
                // if the it is arr's first key then store value in it.
                // else till created object in key
                if(index == 0){
                    tempObj[key] = value
                }else{
                    tempObj[key] = {...finalObj}
                }
                finalObj = {...tempObj}
            }
            resolve(finalObj)
            return;
        } catch (error) {
            reject(error);
        }
    })
    
}
// This function will create nested json object.
function checkPreviousObject(jsonObj, path, value) {
    return new Promise(async (resolve, reject) => {
        try {
             // Convert header to array
            let arr = path.split('.');
            // Loop through header array
            for (let i = 1; i <= arr.length; i++) {
                // create temporary path to check if this path is already present in jsonObj or not.
                let tempPath = arr.slice(0, i).join(".");
                // If path is not present, it will return present
                if (eval('jsonObj.' + tempPath) == undefined) {
                    // Decrement 1 from index, so that we can include 
                    // that undefined key while creating new json object further
                    i -= 1;
                    // final Array / final Path which will be used to create new json object
                    let finalArr = arr.slice(i, arr.length);
                    let finalPath = finalArr.join(".");
                    // this will generate further json object, which was not present in json object.
                    let generatedObj = await createObject(finalPath, value);
                    // if arr is empty then pre Path should store jsonObj directly(main json object)
                    let prePath = arr.slice(0, i).join(".") ? `jsonObj.${arr.slice(0, i).join(".")}` : jsonObj;
                    // execute the prePath and store its value in innerData
                    let innerData = eval(prePath);
                    // if main path and final path of array are same,
                    // then we can directly resolve by pass innerData and generated Object.
                    // else we need to add both data in prePath
                    if (arr.length == finalArr.length) {
                        resolve({ ...innerData, ...generatedObj });
                        return;
                    } else {
                        eval(`${prePath}=${JSON.stringify({ ...innerData, ...generatedObj })}`);
                        resolve(jsonObj);
                        return;
                    }
                }
            }
            resolve("PATH-EXISTS");
        } catch (error) {
            reject(error);
        }
    });
}



// This function will read csv file, then will convert to json and store into database.
async function convertCSVToJson(req,res) {
    try {
        const csvFilePath = process.env.CSV_FILE_PATH;
        const absolutePath = path.resolve(__dirname, csvFilePath);
        const csvData = fs.readFileSync(absolutePath, 'utf8');
        const csvArr = csvData.split('\n')
        // remove unwanted spaces
        const header = csvArr[0].split(',').map((value=>value.trim()))
        const data = csvArr.slice(1,csvArr.length)

        for (let index=0;index<data.length;index++) {
            let jsonObj = {}
            let rowArr = data[index].split(',').map((value=>value.trim()))
            
            if(header.length == rowArr.length){
                // loop thorough header and create nested object of row in json object
                for (const [i,headerPath] of header.entries()) {
                    jsonObj = await checkPreviousObject(jsonObj,headerPath,rowArr[i])
                }
            }else{
                console.log("Error header and data length does not match")
            }
            if(Object.keys(jsonObj).length){
                // pass json data to query
                const output = await addJsonData(jsonObj)
                if(output instanceof Error){
                    return res.status(400).send({error:"Unable to convert Csv To Json. Please try again!"})
                }
            }
        }

        // Fetch User data from db
        const allUserData = await getAllUserData()
        if(allUserData instanceof Error){
            console.log('Error while fetching all error ', allUserData);
            return res.status(400).send({error:"Found Error while age distribution!"})
        }else{
            let userData = allUserData.map(user => user.dataValues)
            // get the age distribution
            ageDistribution(userData)
        }
        
        return res.send({message:"Data Converted Successfully!!!"})
    } catch (error) {
        console.log("Error in convertToJson: ",error)
        return res.status(400).send({error:"Unable to convert Csv To Json. Please try again!"})
    }
}
// Function to determine the age group
function getAgeGroup(age) {
    if (age < 20) {
      return '< 20';
    } else if (age >= 20 && age <= 40) {
      return '20 to 40';
    } else if (age > 40 && age <= 60) {
      return '40 to 60';
    } else {
      return '> 60';
    }
}

function ageDistribution(userData) {
    try {
        const ageGroups = {
            '< 20': 0,
            '20 to 40': 0,
            '40 to 60': 0,
            '> 60': 0
        };
        // Count the number of people in each age group
        userData.forEach(person => {
            const ageGroup = getAgeGroup(person.age);
            ageGroups[ageGroup]++;
        });

        // Calculate the percentage distribution
        const total = userData.length;
        const ageGroupPercentages = {};

        Object.keys(ageGroups).forEach(group => {
            ageGroupPercentages[group] = (ageGroups[group] / total) * 100;
          });

        console.log('Age Group Percentages:', ageGroupPercentages);

    } catch (error) {
        console.log("error",error)
    }
}



module.exports = convertCSVToJson