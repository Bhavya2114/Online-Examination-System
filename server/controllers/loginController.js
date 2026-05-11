// WRONG (Will fail because password is missing)
const user = await User.findOne({ email });

// CORRECT (You must explicitly ask for the password)
const user = await User.findOne({ email }).select('+password');


// this is incmplete code snippet. This for reference what i have to start tommorow 
// not completed and not tested yet. I will complete this code tommorow and test it.