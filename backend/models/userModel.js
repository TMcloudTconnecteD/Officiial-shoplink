import mongoose from "mongoose";
const userSchema = mongoose.Schema({
    
    username:{
        type:String,
        required:true,
        unique:true
    },
  email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      match: [/.+\@.+\..+/, "Please enter a valid email"],
    },
    password: {
      type: String,
      required: true,
      minlength: 6, // strong minimum rule
    },
    isAdmin:{
        type:Boolean,
        required:true,
        default:false
    },
    isSuperAdmin:{
        type:Boolean,
        required:true,
        default:false
    }

}, {
    timestamps: true
})

const User = mongoose.model('User', userSchema);


export default User;
