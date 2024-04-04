const putPetDetails = async (event, dynamo) => {
  try {
    // Set dynamoDB table
    const table = "Pets";
    
    // Convert to JS object if using API Gateway
    if (typeof event.body === 'string') {
      event.body = JSON.parse(event.body);
    }
    
    // Check if PetID is present in path parameters
    const petIDString = event.pathParameters ? event.pathParameters.PetID : null;
    const petID = petIDString ? parseInt(petIDString, 10) : null;
    
    if (petID) { // This handles the petID = 0 case as well
      // Check if PetID exists in the table
      const existingRecord = await dynamo.get({
        TableName: table,
        Key: { PetID: petID }
      })

      if (!existingRecord.Item) {
        throw new Error('PetID does not exist: ' + petID);
      }
      
      const result = await dynamo.update({
        TableName: table,
        Key: { PetID: petID },
        UpdateExpression: 'SET #Name = :newName, #Age = :newAge, #Type = :newType',
        ExpressionAttributeNames: {
          '#Name': 'Name',
          '#Age': 'Age',
          '#Type': 'Type',
        },
        ExpressionAttributeValues: {
          ':newName': event.body.name,
          ':newAge': parseInt(event.body.age, 10),
          ':newType': event.body.type,
        },
      });
      
      // Return result
      console.log('Update Result:', result);
      return result;
    } else {
      throw new Error('Invalid PetID: ' + petID + '. Must be > 0');
    }
  } catch (error) {
    console.error('Error updating pet details:', error);
    throw error;
  }
};

export default putPetDetails;