import mongoose from "mongoose";
const useSchema = mongoose.Schema({
    
    username:{
        type:String,
        required:true,
        unique:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true,
        unique:true

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

const User = mongoose.model('User', useSchema);


export default User;
