var mongoose = require('mongoose');

var nameSchema = new mongoose.Schema({
  firstname:String,
  lastname:String
})

var sampleSchema= new mongoose.Schema({
    number: {
      type: String
    },
    name :{
      type : [nameSchema]
    }
  });









//Example var = var_name = module.exports = mongoose.model(model_name,schema_name)
var Sample=module.exports=mongoose.model('Sample',sampleSchema);
