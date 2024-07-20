const users = require('../Model/userModel');


async function addJsonData(userData) {
    try {
        // Extracting mandatory properties
        const firstName = userData.name.firstName;
        const lastName = userData.name.lastName;
        const age = parseInt(userData.age, 10);
        const address = JSON.stringify(userData.address);

        // Extracting remaining properties for additional_info
        const mandatoryKeys = ['name', 'age', 'address'];
        let additionalInfo = {};

        for (const key in userData) {
            if (!mandatoryKeys.includes(key)) {
                additionalInfo[key] = userData[key];
            }
        }
        
        return await users.create({
            name: `${firstName} ${lastName}`,
            age: age,
            address: address,
            additional_info:JSON.stringify(additionalInfo)
        }).then(function (users,err) {
            if (users) {
                console.log("Data successfully Inserted")
                return users
            } else {
                return err
            }
        });
    } catch (error) {
        console.log("ERROR in addJsonData: ",error)
        return new Error("ERROR in addJsonData: "+error.message)
    }
}

async function getAllUserData() {
    try {
        const usersData = await users.findAll();
        for (const user of usersData) {
            console.log(user.dataValues);
        }
        
        return usersData;
    } catch (error) {
        console.log("ERROR in getAllUserData: ",error)
        return new Error("ERROR in getAllUserData: "+error.message)
    }
}

module.exports = {addJsonData,getAllUserData}
