import mongoose from "mongoose";
import { randomBytes } from "crypto";
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
    },
    isSeller:{
        type:Boolean,
        required:true,
        default:false
    },
    sellerStatus:{
        type:String,
        enum:["none","pending","approved","rejected"],
        default:"none"
    },
    sellerShop:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Shop",
        default:null
    },
    referralCode: {
        type: String,
        unique: true,
        sparse: true,
        uppercase: true,
        trim: true,
    },
    pointsBalance: {
        type: Number,
        default: 0,
        min: 0,
    },
    pointsVouchersIssued: {
        type: Number,
        default: 0,
        min: 0,
    },
    welcomeToastShownAt: {
        type: Date,
        default: null,
    }

}, {
    timestamps: true
})

userSchema.pre("validate", function assignReferralCode() {
    if (!this.referralCode) this.referralCode = randomBytes(5).toString("hex").toUpperCase();
});

const User = mongoose.model('User', userSchema);


export default User;
